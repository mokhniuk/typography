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
 * A Ukrainian dialogue line opens with a dash and a non-breaking space:
 * «— Привіт, — сказав він.» A hyphen, en dash or em dash followed by a space at the
 * very start of the text is taken for it. Only the start: a dash after a line
 * break is as likely a list marker.
 */
export function dialogue(text: string): string {
  return text.replace(/^[-–—][ \u00A0]+(?=[\p{L}\p{N}«„“"‘'(])/u, `—${NBSP}`);
}

/** A hyphen, double hyphen or en dash between two numbers is a range: an unspaced en dash. */
export function dashRange(text: string): string {
  return (
    text
      // A time span: 10:00-12:00 and 10:00 – 12:00 are ranges.
      .replace(/(\d{1,2}:\d{2})[ \u00A0]*(?:--|[-–])[ \u00A0]*(?=\d{1,2}:\d{2})/g, '$1–')
      // A range between numbers, spaced or not; a chain (a date, a phone number) is left alone.
      .replace(
        /(?<![\d:–-])(\d+)([ \u00A0]*(?:--|[-–])[ \u00A0]*)(\d+)(?![\d:–-])/g,
        (match, a: string, gap: string, b: string, offset: number, whole: string) =>
          isNumericRange(a, b, whole.slice(Math.max(0, offset - 20), offset), gap) ? `${a}–${b}` : match,
      )
  );
}

/** A spaced hyphen or dash, or a double hyphen, is a break in the sentence: non-breaking space, `dash`, space. */
export function dashSentence(text: string, dash = '—'): string {
  return text
    .replace(/[ \u00A0]+(?:--|[-–—])[ \u00A0]+/g, `${NBSP}${dash} `)
    .replace(/(?<=\S)--(?=\S)/g, `${NBSP}${dash} `);
}
