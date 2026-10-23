import { typesetBlock } from '../core/typography.js';
/** Stands for a piece of inline syntax while a paragraph's text is typeset. */
const UNIT = '￼';
const INLINE = new RegExp([
    // A backslash escape: `\-` must not become a dash, nor `\"` a quotation.
    '\\\\[!-/:-@\\[-`{-~]',
    // A code span: a run of backticks, anything, the same run.
    '(`+)[\\s\\S]*?[^`]\\1(?!`)',
    // A raw inline tag, an autolink or a comment.
    '<\\/?[A-Za-z][^<>]*>|<!--[\\s\\S]*?-->',
    // The target of a link or an image, `](url "title")`, a reference `][id]`, a footnote `[^1]`.
    '\\]\\((?:[^()\\\\]|\\\\.|\\([^()]*\\))*\\)',
    '\\]\\[[^\\]]*\\]',
    '\\[\\^[^\\]]+\\]',
    // An entity.
    '&(?:#[xX]?[0-9A-Fa-f]+|[A-Za-z][A-Za-z0-9]*);',
].join('|'), 'g');
const FENCE = /^\s{0,3}(`{3,}|~{3,})/;
const BREAK = /^\s{0,3}(?:([-*_=])(?:\s*\1){2,})\s*$/;
const TABLE_RULE = /^\s*\|?\s*:?-+:?\s*(?:\|\s*:?-+:?\s*)*\|?\s*$/;
const DEFINITION = /^\s{0,3}\[[^\]]+\]:\s/;
const INDENTED = /^(?: {4}|\t)/;
/** A raw block that runs to its closing tag, blank lines included (CommonMark's first kind of HTML block). */
const RAW_TO_CLOSING = /^\s{0,3}<(pre|script|style|textarea)(?:\s|>|$)/i;
/** The first line of a raw HTML block: a comment, a block-level tag, or a line that is one tag and nothing else. */
const HTML_BLOCK = /^\s{0,3}(?:<!--|<\/?(?:address|article|aside|blockquote|details|dialog|div|dl|fieldset|figcaption|figure|footer|form|h[1-6]|header|hr|iframe|li|main|nav|ol|p|pre|script|section|style|summary|table|tbody|td|tfoot|th|thead|tr|ul)(?:\s|\/?>|$)|<[A-Za-z][^<>]*>\s*$)/i;
/** What opens a line before its text: quote marks, a list marker, a task box, a heading. */
const PREFIX = /^(\s{0,3}(?:>[ \t]?)*[ \t]*(?:(?:[-*+]|\d{1,9}[.)])[ \t]+(?:\[[ xX]\][ \t]+)?|#{1,6}[ \t]+)?)/;
const OPENS_BLOCK = /(?:[-*+]|\d{1,9}[.)]|#{1,6})[ \t]+(?:\[[ xX]\][ \t]+)?$/;
function setParagraph(entries, options) {
    const original = entries.map((e) => e.prefix + e.content + e.tail + e.eol).join('');
    const units = [];
    const joined = entries
        .map((e) => e.content.replace(INLINE, (unit) => {
        units.push(unit);
        return UNIT;
    }))
        .join('\n');
    if (!/\S/.test(joined.replaceAll(UNIT, '')))
        return original;
    const { text: formatted, keep } = typesetBlock(joined, options);
    if (formatted === joined)
        return original;
    const lines = formatted.split('\n');
    const slots = formatted.split(UNIT).length - 1;
    // A rule that lost or added a placeholder or a line cannot be mapped back: keep the paragraph as it came.
    if (lines.length !== entries.length || slots !== units.length)
        return original;
    keep();
    let next = 0;
    return lines
        .map((line, i) => {
        const e = entries[i];
        const restored = line.replace(/￼/g, () => units[next++] ?? '');
        return `${e?.prefix ?? ''}${restored}${e?.tail ?? ''}${e?.eol ?? ''}`;
    })
        .join('');
}
/** The mode body: `options.lang` is a pack (the package entry resolves a code first). */
export function typesetMarkdown(markdown, options) {
    const parts = markdown.split(/(\r?\n)/);
    let out = '';
    let paragraph = [];
    let open = true;
    const flush = () => {
        if (paragraph.length)
            out += setParagraph(paragraph, options);
        paragraph = [];
        open = true;
    };
    let fence = null;
    let htmlBlock = false;
    /** Inside a `pre`, `script`, `style` or `textarea` block: the closing tag that ends it. */
    let rawEnd = null;
    // Front matter opens with `---` on the first line, goes straight on (no blank line) and closes
    // with `---` or `...`; a `---` with none of that is a thematic break.
    const lines = parts.filter((_, k) => k % 2 === 0);
    let frontMatter = lines[0]?.trim() === '---' &&
        /\S/.test(lines[1] ?? '') &&
        lines.slice(1).some((line) => /^(?:---|\.\.\.)\s*$/.test(line));
    for (let i = 0; i < parts.length; i += 2) {
        const text = parts[i] ?? '';
        const eol = parts[i + 1] ?? '';
        const verbatim = () => {
            if (frontMatter) {
                if (i > 0 && /^(?:---|\.\.\.)\s*$/.test(text))
                    frontMatter = false;
                return true;
            }
            if (fence) {
                const mark = FENCE.exec(text)?.[1];
                if (mark &&
                    mark[0] === fence[0] &&
                    mark.length >= fence.length &&
                    !/\S/.test(text.replace(FENCE, ''))) {
                    fence = null;
                }
                return true;
            }
            if (htmlBlock) {
                if (rawEnd ? rawEnd.test(text) : !/\S/.test(text)) {
                    htmlBlock = false;
                    rawEnd = null;
                }
                return true;
            }
            const raw = RAW_TO_CLOSING.exec(text);
            if (raw) {
                rawEnd = new RegExp(`</${raw[1]}\\s*>`, 'i');
                htmlBlock = !rawEnd.test(text);
                if (!htmlBlock)
                    rawEnd = null;
                return true;
            }
            if (HTML_BLOCK.test(text)) {
                htmlBlock = true;
                return true;
            }
            const opens = FENCE.exec(text);
            if (opens) {
                fence = opens[1] ?? null;
                return true;
            }
            return (!/\S/.test(text) ||
                BREAK.test(text) ||
                (text.includes('-') && TABLE_RULE.test(text) && /[|]/.test(text)) ||
                DEFINITION.test(text) ||
                (INDENTED.test(text) && paragraph.length === 0));
        };
        if (verbatim()) {
            flush();
            out += text + eol;
            continue;
        }
        const prefix = PREFIX.exec(text)?.[1] ?? '';
        const body = text.slice(prefix.length);
        const content = body.replace(/\s+$/, '');
        const tail = body.slice(content.length);
        // A list marker or a heading starts a paragraph of its own; a heading is only ever one line.
        if (OPENS_BLOCK.test(prefix) || !open)
            flush();
        paragraph.push({ prefix, content, tail, eol });
        open = !/#{1,6}[ \t]+$/.test(prefix);
    }
    flush();
    return out;
}
