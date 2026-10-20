import { NBSP } from './types';

/**
 * Whether `a`-`b` is a range of numbers rather than an identifier, a partial date
 * or a phone number: ascending, no leading zeros, not a year and a month (2026-10),
 * not an unspaced three and four digits (555-1234, a local phone number), and not
 * part of a number that began with a plus sign.
 */
function isNumericRange(a: string, b: string, before: string, gap: string): boolean {
  if (a.length > 4 || b.length > 4) return false;
  if (a.length === 3 && b.length === 4 && !/\s|\u00A0/.test(gap)) return false;
  if (/^0\d/.test(a) || /^0\d/.test(b)) return false;
  if (Number(a) >= Number(b)) return false;
  if (a.length === 4 && b.length === 2 && Number(b) <= 12) return false;
  return !/\+[\d\s()./-]*$/.test(before);
}

/**
 * Whether the digits at `[start, end)` are the tail and head of two grouped numbers (12,100 - 150,000 or
 * 12\u00A0100 - 150\u00A0000), not two numbers of their own: the first is preceded by a digit and a
 * group separator, the second is followed by one and three digits.
 */
function insideGroups(whole: string, start: number, end: number): boolean {
  return /\d[,\u00A0]$/.test(whole.slice(Math.max(0, start - 2), start)) || /^[,\u00A0]\d{3}(?!\d)/.test(whole.slice(end));
}

/**
 * A Ukrainian dialogue line opens with a dash and a non-breaking space:
 * «— Привіт, — сказав він.» A hyphen, en dash or em dash followed by a space at the
 * very start of the text is taken for it. Only the start: a dash after a line
 * break is as likely a list marker.
 */
export function dialogue(text: string): string {
  return text.replace(/^[-–—][ \u00A0]+(?=[\p{L}\p{N}«„“"‘'(])/u, `—${NBSP}`);
}

const TIME_RANGE = /(\d{1,2}:\d{2})[ \u00A0]*(?:--|[-–])[ \u00A0]*(?=\d{1,2}:\d{2})/g;
const NUMBER_RANGE = /(\d+)([ \u00A0]*(?:--|[-–])[ \u00A0]*)(\d+)(?![\d:–-])/g;
const NOT_BEFORE_RANGE = /[\d:–-]/;

/**
 * A range between numbers, spaced or not; a chain (a date, a phone number) is left alone. The pattern
 * used to open with `(?<![\d:–-])`, tried at every position; it is now found without it and the
 * character before the first number is read here. A match refused for it is retried from the end of
 * its first number: every start inside that number has a digit before it, so the lookbehind would
 * have refused it too, and the engine reaches the gap and the second number next, as it did.
 */
function numberRanges(text: string): string {
  NUMBER_RANGE.lastIndex = 0;
  let out = '';
  let from = 0;
  for (let m = NUMBER_RANGE.exec(text); m; m = NUMBER_RANGE.exec(text)) {
    const [match, a = '', gap = '', b = ''] = m;
    const offset = m.index;
    if (offset > 0 && NOT_BEFORE_RANGE.test(text.charAt(offset - 1))) {
      NUMBER_RANGE.lastIndex = offset + a.length;
      continue;
    }
    if (
      !insideGroups(text, offset, offset + match.length) &&
      isNumericRange(a, b, text.slice(Math.max(0, offset - 20), offset), gap)
    ) {
      out += `${text.slice(from, offset)}${a}–${b}`;
      from = offset + match.length;
    }
  }
  NUMBER_RANGE.lastIndex = 0;
  return from === 0 ? text : out + text.slice(from);
}

/** A hyphen, double hyphen or en dash between two numbers is a range: an unspaced en dash. */
export function dashRange(text: string): string {
  // A time span: 10:00-12:00 and 10:00 – 12:00 are ranges.
  return numberRanges(text.replace(TIME_RANGE, '$1–'));
}

/** A spaced hyphen or dash, or a double hyphen, is a break in the sentence: non-breaking space, `dash`, space. */
export function dashSentence(text: string, dash = '—'): string {
  return text
    .replace(/[ \u00A0]+(?:--|[-–—])[ \u00A0]+/g, `${NBSP}${dash} `)
    // Not a double hyphen that is the whole of a quotation («--»): its space would sit inside the marks
    // and a second pass would read it as the space of a French mark.
    // A run of three or more hyphens is no double hyphen (the omission mark [---], a rule): left whole.
    // Written as `(?<=[^\s\-–—])--(?=[^\s\-–—])`; the lookbehind, tried at every position, is read here
    // after the `--` is found. A refused `--` is left whole: its second hyphen has a hyphen before it.
    .replace(/--(?=[^\s\-–—])/g, (match, offset: number, whole: string) =>
      offset === 0 ||
      /[\s\-–—]/.test(whole.charAt(offset - 1)) ||
      (/[«„“‘‚‹»›"']/.test(whole.charAt(offset - 1)) && /[»“”’‘«‹›"']/.test(whole.charAt(offset + 2)))
        ? match
        : `${NBSP}${dash} `,
    );
}
