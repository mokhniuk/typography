/**
 * Typography for running text, kept apart from React so it can be tested.
 *
 * Source texts stay plain strings, the way the organisers write them: curly or
 * straight quotes, hyphens for dashes, nothing marked up. Two things happen to
 * them on the way to the page, and both live here:
 *
 *  - `typographic` applies the house rules below, in one pass; each rule has an id
 *    (see RULES in rules.ts) so it can be switched off (`disable`) or reported
 *    (`explain`);
 *  - `splitHangs` finds the opening punctuation that should hang in the margin
 *    when it starts a line, so the first letter lines up with the rest of the
 *    lines (see `hangPunctuation` in ../dom for the measuring).
 *
 * The rules `typographic` applies, and what it deliberately leaves alone:
 *
 *  - Quotation, by language and by level (see `quotes` on the pack): «…» with „…“ inside it
 *    for English and Ukrainian, »…« with ›…‹ inside for German, „…” with «…» for
 *    Polish, and so on. Source quotes may be curly,
 *    German-low, straight, or already «…».
 *  - Dashes: a spaced hyphen, en dash or em dash, or a double hyphen, is a break
 *    in the sentence and becomes a spaced em dash, with the space before it
 *    non-breaking so a line never starts with it. A hyphen or en dash between
 *    two numbers, spaced or not, is a range and becomes an unspaced en dash
 *    (21–26, 10:00–12:00); ascending numbers only, and not identifiers, partial
 *    dates (2026-10) or phone numbers. Not automated, because
 *    a program cannot tell East-West (en dash) from one-week (hyphen): pairs of
 *    equals are fixed in the text itself.
 *  - Registers (see Register): `display` is all of the above. `literary` changes the
 *    quotation of English to British, ‘outer “inner” outer’, and sets a Ukrainian
 *    dialogue line, opened by a dash, with an em dash and a non-breaking space. Other
 *    languages keep their display rules. Write a quotation in double quotes in the
 *    source: a plural possessive inside a single-quoted one (‘the dogs’ bone’) is
 *    read as the end of the quotation.
 *  - The typographic apostrophe ’, the ellipsis …, arrows → ←, and © ® ™ from
 *    (c) before a year, (C), (R) and (TM).
 *  - Non-breaking spaces where a break reads badly: after titles and initials
 *    (Prof. Dr. K. Słoboda), between a number and a short word after it (21
 *    September, 15 people, 5 %; a longer word stays free, so a chain of bound words
 *    never outgrows a narrow column), before «e.V.», after ©, and after one-letter
 *    words that a language must not strand at a line end.
 *  - An arrow keeps a non-breaking space against the word it belongs to («Read more →»,
 *    «← Back»), so it never wraps onto a line of its own.
 *  - Runs of spaces collapse to one.
 *  - Left alone: web addresses, emails and `code spans` come back exactly as written
 *    (so `12-15` in a path and `->` in a command survive), and a leading apostrophe
 *    on a year (’90s) does not stop a quotation from pairing.
 *
 * Hanging covers opening marks at the start of a line and closing marks at its
 * end (see `hangPieces` and `hangPunctuation` in ../dom).
 */
import { diff } from './diff.js';
import { DEFAULT_RULES, selectRules } from './rules.js';
import { shield } from './zones.js';
/**
 * `after`, with every change that brought in an avoided character undone. The text is compared with
 * the same word-level diff `explain` uses, so a "change" here is one stretch a rule rewrote: the
 * stretch is kept as it was typed if what arrived holds a character of `avoided`.
 *
 * A rule whose changes belong together (`Rule.avoidWhole`, the quotation rule: its opening and
 * closing mark are two changes and half a converted quotation is worse than none) is handled by
 * `typographic`, which drops all of them together.
 */
export function keepAvoided(before, after, avoided) {
    let out = '';
    let from = '';
    let to = '';
    const settle = () => {
        out += [...to].some((ch) => avoided.has(ch)) ? from : to;
        from = '';
        to = '';
    };
    for (const run of diff(before, after)) {
        if (run.kind === 'same') {
            settle();
            out += run.text;
        }
        else if (run.kind === 'del')
            from += run.text;
        else
            to += run.text;
    }
    settle();
    return out;
}
/** Pairs each stretch that left with the stretch that arrived in its place. */
function changesOf(rule, runs) {
    const out = [];
    let open = null;
    for (const run of runs) {
        if (run.kind === 'same') {
            open = null;
        }
        else {
            if (!open) {
                open = { rule, from: '', to: '' };
                out.push(open);
            }
            if (run.kind === 'del')
                open.from += run.text;
            else
                open.to += run.text;
        }
    }
    return out;
}
/** Thrown where a pack-only function is given a language code (or nothing) instead of a pack. */
function notAPack() {
    throw new Error('lang is a language pack here: import one from @mokhniuk/typography/lang/<code>');
}
/**
 * Applies the house rules (see the header) to a plain string, in the language of `pack`. Running it
 * again on its own output changes nothing, in every language (German reads its own »…« and ›…‹ by
 * where each mark stands, see `turnedPairs` on the pack and quotes.ts).
 *
 * This is the engine's own entry, which takes a pack and never loads one: it imports nothing from
 * `lang/index.ts`. The public `typographic` (resolve.ts) also takes a language code and resolves it.
 */
export function typographic(text, pack, { register = 'display', quoteStyle = 'language', blockStart = true, disable, enable, rules: custom, onChange, avoid, } = {}) {
    if (typeof pack !== 'object' || pack === null)
        notAPack();
    const rules = disable?.length || enable?.length || custom
        ? selectRules({ rules: custom, disable, enable })
        : DEFAULT_RULES;
    const context = { lang: pack.code, pack, register, quoteStyle, blockStart };
    const avoided = avoid ? new Set([...avoid]) : null;
    const [shielded, restore] = shield(text);
    let out = shielded;
    for (const rule of rules) {
        if (rule.when && !rule.when(out, context))
            continue;
        const applied = rule.apply(out, context);
        let next = applied;
        if (avoided && applied !== out) {
            next = keepAvoided(out, applied, avoided);
            // A rule whose changes belong together is all or nothing: if one had to be dropped, the text
            // keeps every one of them as it was typed (a quotation with one mark converted is worse).
            if (rule.avoidWhole && next !== applied)
                next = out;
        }
        if (onChange && next !== out) {
            for (const change of changesOf(rule.id, diff(out, next)))
                onChange(change);
        }
        out = next;
    }
    return restore(out);
}
/** The typeset text and every change that was made to it, with the rule that made it. */
export function explain(text, pack, options = {}) {
    const changes = [];
    const output = typographic(text, pack, { ...options, onChange: (c) => changes.push(c) });
    return { output, changes };
}
/**
 * Typesets one block of text for a mode. Its changes are held back until `keep()`,
 * so a block the mode throws away (it cannot map the result back onto its markup)
 * reports nothing. Every option goes on to `typographic` as it is, so a new one needs no change here.
 */
export function typesetBlock(joined, options) {
    const found = [];
    const { onChange } = options;
    const text = typographic(joined, options.lang, {
        ...options,
        blockStart: true,
        onChange: onChange ? (change) => found.push(change) : undefined,
    });
    return {
        text,
        keep: () => {
            for (const change of found)
                onChange?.(change);
        },
    };
}
