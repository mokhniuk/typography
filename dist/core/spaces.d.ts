import type { LangPack } from './lang/pack.js';
export declare const collapse: (text: string) => string;
/**
 * Titles stay with the name: Prof. Dr. Oksana. Written as `(?<![\p{L}\p{N}])` + TITLE, with the
 * lookbehind checked by hand after the title is found (see scan.ts).
 */
export declare const titles: (text: string) => string;
/**
 * An initial stays with the surname: K. Słoboda. Written as `(?<![\p{L}\p{N}])(\p{Lu})\.[ ]+(?=\p{Lu})`:
 * the search is for the full stop and the spaces, and the capital before the stop and what stands
 * before the capital are read by hand (see scan.ts). Each match starts at its own stop, so two never overlap.
 */
export declare const initials: (text: string) => string;
/**
 * A number stays with a short word after it (a unit, a month): 21 September, 15 people, 5 %.
 * A longer word is left free, so a chain of bound words never outgrows a narrow column. Money is
 * kept whole as well: the sign or code before the amount (`USD 5 000`, `€ 49.99`) and the digit
 * groups of an amount written in threes (`1 000 грн`, what the opt-in `number.group` does to a bare
 * number, so the two agree on an amount that is already grouped). The engine never moves or adds a sign.
 *
 * One scan over the runs of digits; at each run three things are read, in the order of the text:
 * the typed spaces before it and whether a currency sign or code ends before them (`USD 5`, `€ 49.99`:
 * the digit is found first and the spaces read back by hand, since a forward `[ ]+` would be tried from
 * every space of a run and scan to its end each time, see `association`); whether the run opens a
 * number grouped by hand; and the spaces after the number, with what follows them (`UNIT_AFTER`). Each
 * reads the text as typed: none of the three can change what another one reads, since each binds its
 * own spaces (after a sign, between digit groups, after the last digit) and a space or a no-break
 * space before a name or a group counts the same, which is what let the three passes this was become one.
 */
export declare function numberUnit(text: string): string;
/**
 * No-break space before e.V. Was `text.replace(/[ ]+(?=e\.V\.)/g, NBSP)`, whose run of spaces is tried from
 * every space and scans to its end each time (quadratic on tens of thousands of spaces). The `e.V.` is
 * found first and the spaces before it read back by hand.
 */
export declare function association(text: string): string;
export declare const copyright: (text: string) => string;
/** A typed run of spaces and no-break spaces between § or ¶ (doubled for several) and a number (any script) becomes a no-break space; `§5` is left as typed. */
export declare const section: (text: string) => string;
/**
 * A lone `&`, `+` or `=`, or the `’n’` of rock ’n’ roll (an "and" with its letters dropped, set curly
 * by the quote rule before this one runs), with a single typed space or no-break space on each side,
 * a letter before the first and a letter after the second, gets no-break spaces on both sides.
 * `2 + 2`, `x = 5`, `a == b`, `R&D` and `x+y` do not match. Matches do not overlap on the letter
 * between two operators because only the letter before and the one after (a lookahead) are read.
 */
export declare const operator: (text: string) => string;
/** One-letter words a language must not strand at the end of a line. */
export declare const orphans: (text: string, pack: LangPack) => string;
/**
 * A short word (two or three letters) travels with the word after it: `to~the shop`. On by default
 * since 0.14.0 (it was opt-in, for titles): the sources read say such a word MAY stay at a line end in
 * body text and must not in a title, and this engine's default register is display text, where a line
 * ending on "to" reads as a stumble; `disable: ['space.short-word']` restores the body-text convention.
 * Never more than two words in a row: a short word that follows one this rule has just bound stays
 * free, so a chain cannot grow into a whole line.
 */
export declare function shortWords(text: string, pack: LangPack): string;
/**
 * Whether `abbreviations` can change `text` in `lang`: a cheap test for the rule table. `bind` and
 * `page` patterns need a full stop; `together` ones need it only if every entry has one (read from
 * the pack, not assumed), otherwise the rule always runs. No pattern at all: it never changes anything.
 */
export declare const mayAbbreviate: (text: string, pack: LangPack) => boolean;
/** The parts of an abbreviation stay together, and a short one stays with what it introduces. */
export declare const abbreviations: (text: string, pack: LangPack) => string;
/**
 * A percent sign (in a language with `percentSpace`: German, French) or a euro sign after the number
 * (with `currencySpace`) stands apart from its number by a no-break space: 5 %, 49 €.
 */
export declare const unitSymbol: (text: string, pack: LangPack) => string;
/** Was `/\u0020+(?=→)/g` (quadratic on a long run of spaces, see `association`) and `/←\u0020+/g`. */
export declare const arrowSpace: (text: string) => string;
