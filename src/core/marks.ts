import { before, isLetter } from './scan';

const SPACE_OR_OPENER = /[\s([]/;

/**
 * A straight apostrophe after a letter, or before a year's two digits (after the start, a space or an
 * opening bracket), becomes ’. One pass that opens with the literal `'`; it was two regexes that opened
 * with a lookbehind, `(?<=\p{L})'` and `(?<=^|[\s([])'(?=\d)`. The two cases cannot overlap (the
 * character before is a letter in one, a space or bracket in the other), so the second reading the
 * output of the first made no difference.
 */
export const apostrophe = (text: string): string =>
  text.replace(/'/g, (mark, offset: number, whole: string) => {
    if (isLetter(before(whole, offset))) return '’';
    const next = whole.charCodeAt(offset + 1);
    if (!(next >= 0x30 && next <= 0x39)) return mark;
    return offset === 0 || SPACE_OR_OPENER.test(whole.charAt(offset - 1)) ? '’' : mark;
  });

export const ellipsis = (text: string): string => text.replace(/\.{3}/g, '…');

export const arrows = (text: string): string => text.replace(/->/g, '→').replace(/<-/g, '←');

/** © from (c) before a year or (C), ® from (R), ™ from (TM). */
export const legal = (text: string): string =>
  text
    .replace(/\((?:c)\)(?=\s*\d{4})|\(C\)/g, '©')
    .replace(/\(R\)/g, '®')
    .replace(/\(TM\)/gi, '™');

const SPACE_OR_PAREN = /[\s(]/;

/**
 * A hyphen straight before a digit, after the start, a space or a parenthesis, is a minus sign: -5
 * becomes −5. Was `(?<=^|[\s(])-(?=\d)`, which is tried at every position; the hyphen is found first
 * and the character before it read here.
 */
export const minus = (text: string): string =>
  text.replace(/-(?=\d)/g, (hyphen, offset: number, whole: string) =>
    offset === 0 || SPACE_OR_PAREN.test(whole.charAt(offset - 1)) ? '\u2212' : hyphen,
  );

const WORD_OR_JOINER = /[\w.,-]/;

/**
 * The letter x between numbers is a multiplication sign: 1920x1080 becomes 1920×1080,
 * 3 x 4 becomes 3 × 4. Not a hex number (0x1F), and not an identifier that runs on
 * (v2x3, a.1x2).
 *
 * Both patterns used to open with a lookbehind (`(?<![\w.,-])` and `(?<=\d)`), which is tried at
 * every position. Now each is found without it and the character before the match is read here. A
 * match refused for it is left whole and the search goes on after it: every position inside such a
 * match has a digit, a separator or an x before it, so the lookbehind would have refused it too.
 */
export const multiply = (text: string): string =>
  text
    .replace(
      /(?!0[xX])(\d+(?:[.,]\d+)?)((?:x\d+(?:[.,]\d+)?)+)(?![A-Za-z]*\d)/g,
      (match, first: string, rest: string, offset: number, whole: string) =>
        offset > 0 && WORD_OR_JOINER.test(whole.charAt(offset - 1))
          ? match
          : `${first}${rest.replaceAll('x', '\u00D7')}`,
    )
    .replace(/[ ]+x[ ]+(?=\d)/g, (match, offset: number, whole: string) => {
      const prev = whole.charCodeAt(offset - 1);
      return prev >= 0x30 && prev <= 0x39 ? '\u00A0\u00D7 ' : match;
    });
