/**
 * Phone numbers, for the opt-in rule `phone.bind`: a number is never reformatted, only kept whole.
 * The groups of an international number are joined with no-break spaces and the hyphens inside it
 * with U+2011 (a hyphen that does not break), so a line never ends in the middle of a number.
 *
 * Only a number written as an international one is touched: it opens with `+` or `00` directly
 * followed by a digit, and holds between `MIN_DIGITS` and `MAX_DIGITS` digits (E.164 allows fifteen).
 * A local number (555-1234, 044-123-45-67) is left as it is; the engine already refuses to read its
 * hyphens as a range (see `dash.range`). A run with more digits than a phone number can have is left
 * alone whole, so a number that stands against a date or another figure is not joined to it.
 */
/** U+2011, the non-breaking hyphen. */
export declare const NB_HYPHEN = "\u2011";
/** A run holds at least this many digits to be a phone number and not a figure with a sign. */
export declare const MIN_DIGITS = 7;
/** The most digits an international number has (ITU-T E.164). */
export declare const MAX_DIGITS = 15;
/** The groups of an international phone number, joined so the number cannot break. */
export declare function bindPhones(text: string): string;
