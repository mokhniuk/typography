import { NBSP, typesetBlock } from '../core/index.js';
import { BLOCK, RAW_BLOCK, RAW_INLINE } from '../shared/elements.js';
/** Stands for an inline element while a block's text is typeset. */
const UNIT = '\uFFFC';
/** Stands for an entity that is kept as it was. */
const ENTITY = '\uE004';
/**
 * The tokens of `seen`, one at a time from `from`: what the pattern
 * `<!--[\s\S]*?-->|<![^>]*>|<\?[\s\S]*?\?>|<(\/?)([A-Za-z][^\s/>]*)((?:"[^"]*"|'[^']*'|[^'">])*)>`
 * finds, written out by hand. The pattern's attribute part read from each `<` to the end of its
 * attributes, and on `<a <a <a ... ">` it read up to the lone quote and failed from every `<`
 * (quadratic). Where that part ends from a given position does not depend on the `<` it started
 * from, so it is worked out once per position and remembered.
 */
function tokenizer(seen) {
    // ends[i]: unknown (-2), no `>` reachable (-1), or the `>` the attribute part reaches from i.
    const ends = new Int32Array(seen.length + 1).fill(-2);
    const path = [];
    /** The `>` that closes attributes read from `start`, or -1: quoted values may hold `>` and `<`, a lone quote fails. */
    const attributesEnd = (start) => {
        let j = start;
        let found = -1;
        for (;;) {
            const known = ends[j] ?? -1;
            if (known !== -2) {
                found = known;
                break;
            }
            const c = seen[j];
            if (c === undefined)
                break;
            if (c === '>') {
                found = j;
                break;
            }
            path.push(j);
            if (c === '"' || c === "'") {
                const close = seen.indexOf(c, j + 1);
                if (close < 0)
                    break;
                j = close + 1;
            }
            else
                j++;
        }
        for (const at of path)
            ends[at] = found;
        ends[j] = found;
        path.length = 0;
        return found;
    };
    let run = { low: 0, end: 0, best: -1 };
    return (from) => {
        for (let at = seen.indexOf('<', from); at >= 0; at = seen.indexOf('<', at + 1)) {
            const next = seen[at + 1];
            if (next === '!') {
                const end = seen.startsWith('--', at + 2) ? seen.indexOf('-->', at + 4) : -1;
                if (end >= 0)
                    return { index: at, raw: seen.slice(at, end + 3), closing: '', name: '', rest: '' };
                const close = seen.indexOf('>', at + 2);
                if (close >= 0)
                    return { index: at, raw: seen.slice(at, close + 1), closing: '', name: '', rest: '' };
                continue;
            }
            if (next === '?') {
                const end = seen.indexOf('?>', at + 2);
                if (end >= 0)
                    return { index: at, raw: seen.slice(at, end + 2), closing: '', name: '', rest: '' };
                continue;
            }
            const closing = next === '/' ? '/' : '';
            const nameStart = at + 1 + closing.length;
            if (!/[A-Za-z]/.test(seen[nameStart] ?? ''))
                continue;
            // Every `<` inside one run of name characters (`<a<a<a...`) has the same name end and gives
            // the name back towards the same attribute ends, so the run is read once: its end, and the
            // last place in it from which the attributes close (the pattern gives the name back one
            // character at a time until they do).
            if (!(nameStart >= run.low && nameStart < run.end)) {
                let end = nameStart + 1;
                while (end < seen.length && !/[\s/>]/.test(seen[end] ?? ''))
                    end++;
                let best = -1;
                for (let e = end; e > nameStart; e--)
                    if (attributesEnd(e) >= 0) {
                        best = e;
                        break;
                    }
                run = { low: nameStart, end, best };
            }
            if (run.best > nameStart) {
                const close = attributesEnd(run.best);
                return {
                    index: at,
                    raw: seen.slice(at, close + 1),
                    closing,
                    name: seen.slice(nameStart, run.best),
                    rest: seen.slice(run.best, close),
                };
            }
        }
        return null;
    };
}
const NAMED = {
    quot: '"',
    apos: "'",
    amp: '&',
    lt: '<',
    gt: '>',
    nbsp: NBSP,
    ndash: '–',
    mdash: '—',
    hellip: '…',
    laquo: '«',
    raquo: '»',
    ldquo: '“',
    rdquo: '”',
    lsquo: '‘',
    rsquo: '’',
    bdquo: '„',
    sbquo: '‚',
    lsaquo: '‹',
    rsaquo: '›',
    // Printable signs the rules act on or bind to (5 €, 20 °C, © 2026): read as the character and,
    // in a block that changes, written as it.
    euro: '€',
    copy: '©',
    reg: '®',
    trade: '™',
    deg: '°',
    times: '×',
    minus: '−',
    plusmn: '±',
    sect: '§',
    para: '¶',
    frac12: '½',
    frac14: '¼',
    frac34: '¾',
};
/** A character that is invisible or a control: a numeric reference to one is kept as written. */
function isInvisible(code) {
    return (code < 0x20 ||
        (code >= 0x7f && code <= 0x9f) ||
        code === 0xad ||
        (code >= 0x200b && code <= 0x200f) ||
        (code >= 0x2028 && code <= 0x202e) ||
        (code >= 0x2060 && code <= 0x2064) ||
        code === 0xfeff);
}
function decode(text, kept) {
    return text.replace(/&(#[xX][0-9a-fA-F]+|#\d+|[A-Za-z][A-Za-z0-9]*);/g, (entity, body) => {
        if (body.startsWith('#')) {
            const code = /^#[xX]/.test(body)
                ? Number.parseInt(body.slice(2), 16)
                : Number.parseInt(body.slice(1), 10);
            const valid = code > 0 && code <= 0x10ffff && !(code >= 0xd800 && code <= 0xdfff);
            if (valid && !isInvisible(code))
                return String.fromCodePoint(code);
        }
        else if (NAMED[body] !== undefined) {
            return NAMED[body];
        }
        kept.push(entity);
        return ENTITY;
    });
}
function encode(text, nbsp) {
    const escaped = text
        // Any `&` before a no-break space is escaped (`&nbsp;` in the default mode), so `&&nbsp;` is never written; `space.operator` is what puts one there.
        // The same pattern also escapes an `&` before an ASCII letter or `#`, which would otherwise read as the start of an entity (pre-existing).
        .replace(/&(?=[#A-Za-z\u00a0])/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;');
    return nbsp === 'entity' ? escaped.replaceAll(NBSP, '&nbsp;') : escaped;
}
function setRun(run, options, nbsp) {
    const original = run.map((p) => ('text' in p ? p.text : p.unit)).join('');
    const units = run.filter((p) => 'unit' in p).map((p) => p.unit);
    const kept = [];
    const breaks = [];
    const joined = run
        .map((p) => 'unit' in p
        ? UNIT
        : decode(p.text, kept).replace(/[ \t]*\r?\n[ \t\r\n]*/g, (gap) => {
            breaks.push(gap);
            return '\n';
        }))
        .join('');
    // Nothing to typeset between two tags.
    if (!/\S/.test(joined.replaceAll(UNIT, '')))
        return original;
    const { text: formatted, keep } = typesetBlock(joined, options);
    if (formatted === joined)
        return original;
    const pieces = formatted.split(UNIT);
    // A rule that lost or added a placeholder cannot be mapped back: keep the block as it came.
    if (pieces.length !== units.length + 1 ||
        (formatted.match(/\n/g) ?? []).length !== breaks.length ||
        (formatted.match(new RegExp(ENTITY, 'g')) ?? []).length !== kept.length) {
        return original;
    }
    keep();
    let at = 0;
    let key = 0;
    return pieces
        .map((piece, i) => `${encode(piece, nbsp)}${units[i] ?? ''}`)
        .join('')
        .replace(/\n/g, () => breaks[at++] ?? '\n')
        .replace(new RegExp(ENTITY, 'g'), () => kept[key++] ?? '');
}
export function typesetHtml(html, options = {}) {
    let out = '';
    let run = [];
    const flush = () => {
        if (run.length)
            out += setRun(run, options, options.nbsp ?? 'entity');
        run = [];
    };
    let pos = 0;
    // Every token ends at a `>`, so a `<` after the last one cannot open a tag. The pattern would read to
    // the end of the input from each such `<` (quadratic on `<a <a <a ...`): it is shown the input only
    // up to the last `>`, and what follows is text. Positions are the same in both strings.
    const seen = html.slice(0, html.lastIndexOf('>') + 1);
    const next = tokenizer(seen);
    for (let m = next(0); m; m = next(pos)) {
        if (m.index > pos)
            run.push({ text: html.slice(pos, m.index) });
        pos = m.index + m.raw.length;
        const { raw, closing, name, rest } = m;
        if (!name) {
            // A comment, a doctype or a processing instruction.
            if (raw.startsWith('<!--')) {
                run.push({ unit: raw });
            }
            else {
                flush();
                out += raw;
            }
            continue;
        }
        const tag = name.toLowerCase();
        const opaque = !closing && !rest.endsWith('/') && (RAW_BLOCK.has(tag) || RAW_INLINE.has(tag));
        if (opaque) {
            // Everything up to the matching close tag is not ours; no close tag means the rest of the document.
            const end = new RegExp(`</${tag}\\s*>`, 'i').exec(html.slice(pos));
            const stop = end ? pos + end.index + end[0].length : html.length;
            const chunk = html.slice(m.index, stop);
            pos = stop;
            if (RAW_BLOCK.has(tag)) {
                flush();
                out += chunk;
            }
            else {
                run.push({ unit: chunk });
            }
        }
        else if (BLOCK.has(tag)) {
            flush();
            out += raw;
        }
        else {
            run.push({ unit: raw });
        }
    }
    if (pos < html.length)
        run.push({ text: html.slice(pos) });
    flush();
    return out;
}
