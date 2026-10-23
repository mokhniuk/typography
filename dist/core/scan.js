/**
 * Helpers for rules that look behind a match by hand.
 *
 * A regex that opens with a lookbehind (`(?<![\p{L}\p{N}])…`) is tried at every position, and with
 * the `u` flag that costs ~25 ms per megabyte. The same rule written as a forward regex that opens
 * with a literal (`Dr\.[ ]+…`) skips to the literal at memchr speed, and checks what stands before
 * the match here, for the few places where the literal occurs. These helpers read the text before an
 * index the way a `u`-flag lookbehind does: a surrogate pair is one code point.
 */
const LETTER = /\p{L}/u;
const LETTER_OR_NUMBER = /[\p{L}\p{N}]/u;
/**
 * Whether this engine's `u`-flag lookbehind sees a letter outside the BMP. JavaScriptCore (Bun,
 * Safari) does not: `/(?<=\p{L})x/u.test('\u{1D51E}x')` is false there though `\p{L}` matches 𝔞, so a
 * rule written with `(?<![\p{L}\p{N}])` treats a mathematical letter, a CJK extension ideograph or a
 * Deseret letter as no letter at all. These helpers stand in for that lookbehind, and give the answer
 * the original regex gives on the same engine: where the lookbehind is blind to such a character, so
 * are they. (V8 and spec-correct engines see it, and so do they.)
 */
const LOOKBEHIND_SEES_ASTRAL = /(?<=\p{L})x/u.test('\u{1D51E}x');
/** The code point that ends just before `index` (a surrogate pair is one), or `''` at the start. */
export function before(text, index) {
    if (index <= 0)
        return '';
    const low = text.charCodeAt(index - 1);
    if (low >= 0xdc00 && low <= 0xdfff && index >= 2) {
        const high = text.charCodeAt(index - 2);
        if (high >= 0xd800 && high <= 0xdbff)
            return text.slice(index - 2, index);
    }
    return text.charAt(index - 1);
}
/** `\p{L}` on one code point, as a lookbehind reads it (`''` is not a letter). */
export function isLetter(codePoint) {
    if (codePoint === '')
        return false;
    const code = codePoint.charCodeAt(0);
    if (code < 0x80)
        return ((code | 0x20) - 0x61) >>> 0 < 26;
    if (codePoint.length > 1 && !LOOKBEHIND_SEES_ASTRAL)
        return false;
    return LETTER.test(codePoint);
}
/** `[\p{L}\p{N}]` on one code point, as a lookbehind reads it (`''` is neither). */
export function isLetterOrNumber(codePoint) {
    if (codePoint === '')
        return false;
    const code = codePoint.charCodeAt(0);
    if (code < 0x80)
        return ((code | 0x20) - 0x61) >>> 0 < 26 || (code >= 0x30 && code <= 0x39);
    if (codePoint.length > 1 && !LOOKBEHIND_SEES_ASTRAL)
        return false;
    return LETTER_OR_NUMBER.test(codePoint);
}
/**
 * Replaces each match of the global forward regex `re` whose lookbehind condition `behind(text, index)`
 * holds, by `replace(match)`; the rest stay. This is `text.replace(/(?<=…)re/g, …)` for a lookbehind
 * written as code. A match that fails the condition is skipped by one character and the search goes
 * on from there, which is what the engine does after a failed lookbehind (so a later match that
 * starts inside the rejected one is still found). `re` must not match the empty string.
 */
export function replaceBehind(text, re, behind, replace) {
    re.lastIndex = 0;
    let out = '';
    let from = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
        if (behind(text, m.index)) {
            out += text.slice(from, m.index) + replace(m);
            from = m.index + m[0].length;
        }
        else {
            // One code point on in a `u` regex (an index inside a pair would be read from the pair's start), one unit otherwise.
            re.lastIndex = m.index + (re.unicode && (m[0].codePointAt(0) ?? 0) > 0xffff ? 2 : 1);
        }
    }
    re.lastIndex = 0;
    return from === 0 ? text : out + text.slice(from);
}
