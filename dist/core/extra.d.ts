import type { Lang } from './types.js';
/**
 * Removes a space before , . ; : ! ? ). Not at a line start, not before an ellipsis, a decimal
 * (` .5`), a file extension (` .gitignore`), `!=` or `??`, not a spaced time or ratio (`10 : 30`),
 * not an emoticon (` :)`, ` ;-)`), and not before `: ; ! ?` in French.
 *
 * Was `text.replace(/(?<=[^\s(\[{“"«‘„])[ \t]+([,.;:!?)])/gu, …)`: a lookbehind opening the pattern is
 * tried at every position (16 to 20 ms per MB). The pair "space, mark" is found first, the run of
 * spaces and tabs before it read back by hand (to the end of the last match at most), and the
 * lookbehind read at the start of that run. The run is the whole of a maximal run of spaces and tabs:
 * the engine tried the lookbehind at each of its spaces, and it refuses all but the first (a space
 * stands before). A match it leaves alone is consumed whole, as `replace` does.
 */
export declare function beforePunctuation(text: string, lang: Lang): string;
/** Adds a space after a comma that a letter follows directly (`a,b`). Digits (`1,5`) are left alone. */
export declare const afterComma: (text: string) => string;
/**
 * A run of ! or ? becomes one mark. Only a run attached to the word before it, and not followed
 * by a letter or digit: `a ?? b`, `!!x` and `(!!y)` are left. `?!` and `!?` are two marks and stay.
 *
 * Was `text.replace(/(?<=[^\s(\[{!?])([!?])\1+(?!\1)(?![\p{L}\p{N}_])/gu, '$1')`, whose lookbehind is
 * tried at every position (16 to 20 ms per MB), and which written forward (`!!+` tried from every
 * mark of a run) is quadratic on a long run of `!`. Here the maximal runs are found (the lookbehind
 * refuses every start inside a run, a `!` or `?` stands before it), then the character before the
 * run and the one after it are read: neither the lookbehind nor the lookahead can be met by
 * backtracking into a shorter run, because the next character would be the mark.
 */
export declare function doubleMarks(text: string): string;
/**
 * Trims spaces and tabs at the end of each line; a line break and a no-break space stay. Was
 * `text.replace(/[ \t]+$/gm, '')`, which is tried from every space of a long run and scans to the end of
 * it each time (quadratic on tens of thousands of spaces before a letter). The line ends (`$` in
 * multiline mode: a line feed, a carriage return, U+2028, U+2029, or the end of the text) are found
 * first, and the spaces and tabs before each are read back by hand, so each space is read once.
 */
export declare function trailingSpace(text: string): string;
/**
 * `+-` before a digit is ±. Not after a letter, a digit or another `+` (`a+-b`, `1+-5`). Was
 * `(?<![\p{L}\p{N}+])\+-(?=\d)`, tried at every position; the `+-` is found first and what stands before it read by hand.
 */
export declare const plusMinus: (text: string) => string;
/**
 * 1/2, 1/4 and 3/4 become ½ ¼ ¾, only as whole numbers: not 11/2, 1/20, a1/2, 1/2/2026, 5/1/2,
 * 0.1/2 or 1/2a. A short word after the fraction is bound with a no-break space, as `space.number`
 * does for a digit (its pattern cannot see a ½), so the rule keeps `½ cup` together by itself.
 */
export declare const fractions: (text: string) => string;
/**
 * A number and C or F, with or without the degree sign and space (20C is not read, 20 C, 20 °C,
 * 20°C and 20° C are; a bare 20 C only in English), becomes the number, a no-break space and °C or °F. A bare `20 C` is only read
 * when the word before the number is not a label or a single letter. Not 20 Celsius, 20 F1, 5 C.E.
 *
 * The original pattern opened with `(?<![\p{L}\p{N}])`, tried at every position, and the same pattern
 * without it is quadratic on a long run of digits (tried from every digit, each scanning the run). A
 * number can only start at a digit that no digit precedes (the lookbehind refuses the rest: a digit is a
 * \p{N}) or at a sign right before one, so the digit runs are found with `\d+` and the pattern is run
 * sticky from there: the signed start first, then the plain one at the digit, as the engine would try
 * them in turn. What stands before is read by hand (scan.ts). A match that is found but left alone
 * (a label, another language) is skipped whole, as `replace` does.
 */
export declare function degrees(text: string, lang?: Lang): string;
/** `=>` is ⇒. Not `=>>`, `==>`, `=>=` or `<=>`. */
export declare const implies: (text: string) => string;
