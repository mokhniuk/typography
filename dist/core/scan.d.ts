/**
 * Helpers for rules that look behind a match by hand.
 *
 * A regex that opens with a lookbehind (`(?<![\p{L}\p{N}])…`) is tried at every position, and with
 * the `u` flag that costs ~25 ms per megabyte. The same rule written as a forward regex that opens
 * with a literal (`Dr\.[ ]+…`) skips to the literal at memchr speed, and checks what stands before
 * the match here, for the few places where the literal occurs. These helpers read the text before an
 * index the way a `u`-flag lookbehind does: a surrogate pair is one code point.
 */
/** The code point that ends just before `index` (a surrogate pair is one), or `''` at the start. */
export declare function before(text: string, index: number): string;
/** `\p{L}` on one code point, as a lookbehind reads it (`''` is not a letter). */
export declare function isLetter(codePoint: string): boolean;
/** `[\p{L}\p{N}]` on one code point, as a lookbehind reads it (`''` is neither). */
export declare function isLetterOrNumber(codePoint: string): boolean;
/**
 * Replaces each match of the global forward regex `re` whose lookbehind condition `behind(text, index)`
 * holds, by `replace(match)`; the rest stay. This is `text.replace(/(?<=…)re/g, …)` for a lookbehind
 * written as code. A match that fails the condition is skipped by one character and the search goes
 * on from there, which is what the engine does after a failed lookbehind (so a later match that
 * starts inside the rejected one is still found). `re` must not match the empty string.
 */
export declare function replaceBehind(text: string, re: RegExp, behind: (text: string, index: number) => boolean, replace: (match: RegExpExecArray) => string): string;
