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

const ARROW = /<-|->/g;
const WORD = /[\p{L}\p{N}]/u;

/**
 * -> and <- become → and ←. Not the end of an HTML comment or a long arrow (`-->`), not a
 * double-headed one (`<->`, `<-->`), and not a comparison with a negative number (`x<-1`: a letter or
 * digit before, a digit after).
 */
export const arrows = (text: string): string =>
  text.replace(ARROW, (arrow, offset: number, whole: string) => {
    const before = whole.charAt(offset - 1);
    const after = whole.charAt(offset + 2);
    if (arrow === '->') return before === '-' || before === '<' ? arrow : '→';
    if (after === '-' || after === '>') return arrow;
    return after >= '0' && after <= '9' && WORD.test(before) ? arrow : '←';
  });

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

/** The pattern of numbers joined by x, with the lookbehind that keeps it off the tail of an identifier or a longer number. */
const JOINED = /(?<![\w.,-])(?!0[xX])(\d+(?:[.,]\d+)?)((?:x\d+(?:[.,]\d+)?)+)(?![A-Za-z]*\d)/g;
/** The same without the lookbehind, which `multiply` checks by hand. Derived, so the two cannot drift apart. */
const JOINED_FORWARD = new RegExp(JOINED.source.replace('(?<![\\w.,-])', ''), 'g');
/**
 * A run of this many digits, x, dots and commas is where the forward pattern would be tried from every
 * position inside it (the lookbehind refused those in one step), which is quadratic on a very long run
 * of digits or of `1x`. Such a text takes the original pattern.
 */
const LONG_RUN = /[\dx.,]{48}/;

const multiplyJoined = (text: string): string =>
  LONG_RUN.test(text)
    ? text.replace(
        JOINED,
        (_m, first: string, rest: string) => `${first}${rest.replaceAll('x', '\u00D7')}`,
      )
    : text.replace(
        JOINED_FORWARD,
        (match, first: string, rest: string, offset: number, whole: string) =>
          offset > 0 && WORD_OR_JOINER.test(whole.charAt(offset - 1))
            ? match
            : `${first}${rest.replaceAll('x', '\u00D7')}`,
      );

const SPACED_X = /x[ ]+(?=\d)/g;

/**
 * Spaces, an x and spaces between digits: `(?<=\d)[ ]+x[ ]+(?=\d)`, which is tried at every position
 * and, found without its lookbehind, is quadratic on a long run of spaces. The x and its trailing
 * spaces are found, and the spaces before the x and the digit before them are read by hand (each
 * space belongs to one x, so the walk back is linear in all).
 */
function multiplySpaced(text: string): string {
  SPACED_X.lastIndex = 0;
  let out = '';
  let from = 0;
  for (let m = SPACED_X.exec(text); m; m = SPACED_X.exec(text)) {
    let start = m.index;
    while (start > from && text.charCodeAt(start - 1) === 0x20) start--;
    const prev = text.charCodeAt(start - 1);
    if (start < m.index && start > 0 && prev >= 0x30 && prev <= 0x39) {
      out += `${text.slice(from, start)}\u00A0\u00D7 `;
      from = m.index + m[0].length;
    }
  }
  SPACED_X.lastIndex = 0;
  return from === 0 ? text : out + text.slice(from);
}

/**
 * The letter x between numbers is a multiplication sign: 1920x1080 becomes 1920×1080,
 * 3 x 4 becomes 3 × 4. Not a hex number (0x1F), and not an identifier that runs on
 * (v2x3, a.1x2).
 *
 * Both patterns used to open with a lookbehind (`(?<![\w.,-])` and `(?<=\d)`), which is tried at
 * every position (20 ms per MB). Now each is found without it and the character before the match is
 * read by hand. A match refused for it is left whole and the search goes on after it: every position
 * inside such a match has a digit, a separator or an x before it, so the lookbehind would have refused
 * it too.
 */
export const multiply = (text: string): string => multiplySpaced(multiplyJoined(text));
