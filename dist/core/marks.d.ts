/**
 * A straight apostrophe after a letter, or before a year's two digits (after the start, a space or an
 * opening bracket), becomes ’. One pass that opens with the literal `'`; it was two regexes that opened
 * with a lookbehind, `(?<=\p{L})'` and `(?<=^|[\s([])'(?=\d)`. The two cases cannot overlap (the
 * character before is a letter in one, a space or bracket in the other), so the second reading the
 * output of the first made no difference.
 */
export declare const apostrophe: (text: string) => string;
export declare const ellipsis: (text: string) => string;
/**
 * -> and <- become → and ←. Not the end of an HTML comment or a long arrow (`-->`), not a
 * double-headed one (`<->`, `<-->`), and not a comparison with a negative number (`x<-1`: a letter or
 * digit before, a digit after).
 */
export declare const arrows: (text: string) => string;
/** © from (c) before a year or (C), ® from (R), ™ from (TM). */
export declare const legal: (text: string) => string;
/**
 * A hyphen straight before a digit, after the start, a space or a parenthesis, is a minus sign: -5
 * becomes −5. Was `(?<=^|[\s(])-(?=\d)`, which is tried at every position; the hyphen is found first
 * and the character before it read here.
 */
export declare const minus: (text: string) => string;
/**
 * The letter x between numbers is a multiplication sign: 1920x1080 becomes 1920×1080,
 * 3 x 4 becomes 3 × 4 with a no-break space on each side of the sign, so the product stays on one
 * line. Not a hex number (0x1F), and not an identifier that runs on (v2x3, a.1x2).
 *
 * Both patterns used to open with a lookbehind (`(?<![\w.,-])` and `(?<=\d)`), which is tried at
 * every position (20 ms per MB). Now each is found without it and the character before the match is
 * read by hand. A match refused for it is left whole and the search goes on after it: every position
 * inside such a match has a digit, a separator or an x before it, so the lookbehind would have refused
 * it too.
 */
export declare const multiply: (text: string) => string;
