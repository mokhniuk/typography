import type { LangPack } from './lang/pack.js';
/** A run of digits is grouped only when it has at least this many (so 2026 and 9999 stay whole). */
export declare const GROUP_MIN_DIGITS = 5;
/**
 * `run` (digits only) in threes from the right, joined by `separator`. Was
 * `run.replace(/\B(?=(?:\d{3})+$)/g, separator)`, whose lookahead reads to the end of the run at every
 * position (quadratic on a long run of digits).
 */
export declare function groupDigits(run: string, separator: string): string;
/** Groups the digits of every integer of five or more digits in threes from the right, with the separator of the pack. */
export declare function groupNumbers(text: string, pack: LangPack): string;
