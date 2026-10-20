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
/**
 * The range between two numbers, found from the LAST digit of the first one: the original pattern was
 * `(?<![\d:–-])(\d+)([ \u00A0]*(?:--|[-–])[ \u00A0]*)(\d+)(?![\d:–-])`, whose lookbehind is tried at every
 * position. Without it `(\d+)` would be tried from every digit of a long number (quadratic); starting at
 * the last digit costs one step at each of the others.
 */
const NUMBER_RANGE = /(\d)([ \u00A0]*(?:--|[-–])[ \u00A0]*)(\d+)(?![\d:–-])/g;
const NOT_BEFORE_RANGE = /[\d:–-]/;

const isDigit = (code: number): boolean => code >= 0x30 && code <= 0x39;

/**
 * A range between numbers, spaced or not; a chain (a date, a phone number) is left alone. The first
 * number starts where its run of digits does, and the character before that is the lookbehind of the
 * original pattern, read here. A match it refuses is retried from the next character, as the engine
 * would, so a second number that has a space before it still starts a range of its own.
 */
function numberRanges(text: string): string {
  NUMBER_RANGE.lastIndex = 0;
  let out = '';
  let from = 0;
  for (let m = NUMBER_RANGE.exec(text); m; m = NUMBER_RANGE.exec(text)) {
    const last = m.index;
    let start = last;
    while (start > 0 && isDigit(text.charCodeAt(start - 1))) start--;
    if (start > 0 && NOT_BEFORE_RANGE.test(text.charAt(start - 1))) {
      NUMBER_RANGE.lastIndex = last + 1;
      continue;
    }
    const a = text.slice(start, last + 1);
    const gap = m[2] ?? '';
    const b = m[3] ?? '';
    const end = last + m[0].length;
    if (
      !insideGroups(text, start, end) &&
      isNumericRange(a, b, text.slice(Math.max(0, start - 20), start), gap)
    ) {
      out += `${text.slice(from, start)}${a}–${b}`;
      from = end;
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
