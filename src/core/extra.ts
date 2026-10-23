/**
 * The opt-in rules (`defaultOn: false` in rules.ts): each runs only when named in `enable`.
 * Their guards err towards leaving text alone; the known limits are in docs/limits.md.
 */
import { before, isLetterOrNumber } from './scan.ts';
import type { Lang } from './types.ts';
import { NBSP } from './types.ts';

/** Languages that set a space before `: ; ! ?` (French): the space is correct there, not a fault. */
const SPACE_BEFORE_HIGH = new Set<Lang>(['fr']);

/** A space or tab straight before one of the marks `beforePunctuation` pulls back. */
const SPACE_THEN_MARK = /[ \t][,.;:!?)]/g;
/** What may not stand before the spaces: a space of any kind, or an opening bracket or quote. */
const NOT_BEFORE_SPACES = /[\s([{“"«‘„]/;

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
export function beforePunctuation(text: string, lang: Lang): string {
  let out = '';
  let from = 0;
  SPACE_THEN_MARK.lastIndex = 0;
  for (let m = SPACE_THEN_MARK.exec(text); m; m = SPACE_THEN_MARK.exec(text)) {
    let offset = m.index;
    while (
      offset > from &&
      (text.charCodeAt(offset - 1) === 0x20 || text.charCodeAt(offset - 1) === 0x09)
    )
      offset--;
    if (offset === 0 || NOT_BEFORE_SPACES.test(text.charAt(offset - 1))) continue;
    const mark = text.charAt(m.index + 1);
    const match = text.slice(offset, m.index + 2);
    if (keepSpace(match, mark, lang, offset, text)) continue;
    out += text.slice(from, offset) + mark;
    from = m.index + 2;
  }
  SPACE_THEN_MARK.lastIndex = 0;
  return from === 0 ? text : out + text.slice(from);
}

/** Whether the space(s) before `mark` stay (`match` is the spaces and the mark, at `offset` of `whole`). */
function keepSpace(
  match: string,
  mark: string,
  lang: Lang,
  offset: number,
  whole: string,
): boolean {
  const next = whole.charAt(offset + match.length);
  // A mark that a letter or digit follows is the start of a word or number (.5, .gitignore, 3 ,5), except
  // a comma before a letter (`Hello ,world`), which `space.after-comma` spaces right after.
  if (/[\p{L}\p{N}]/u.test(next) && !(mark === ',' && /\p{L}/u.test(next))) return true;
  // `![` opens a Markdown image: the space before it is not a space before punctuation.
  if (mark === '!' && next === '[') return true;
  // A dot followed by spaces and another dot is a spaced ellipsis (`Wait . . . what`).
  if (mark === '.' && /^[ \t]*\./.test(whole.slice(offset + match.length))) return true;
  // A dot is not pulled against a dot on either side: that would make a ... after `ellipsis` ran.
  if (mark === '.' && (next === '.' || whole.charAt(offset - 1) === '.')) return true;
  if ((mark === ':' || mark === ';') && /[-)(/|\\'*]/.test(next)) return true;
  if (
    mark === ':' &&
    /\d/.test(whole.charAt(offset - 1)) &&
    /^[ \t]*\d/.test(whole.slice(offset + match.length))
  ) {
    return true;
  }
  if ((mark === '!' || mark === '?') && next === '=') return true;
  if (mark === '?' && (next === '?' || next === '.')) return true;
  return SPACE_BEFORE_HIGH.has(lang) && /[:;!?]/.test(mark);
}

/** Adds a space after a comma that a letter follows directly (`a,b`). Digits (`1,5`) are left alone. */
export const afterComma = (text: string): string => text.replace(/,(?=\p{L})/gu, ', ');

const MARK_RUN = /!{2,}|\?{2,}/g;
const NOT_BEFORE_MARKS = /[\s([{!?]/;
const WORD_AFTER = /[\p{L}\p{N}_]/uy;

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
export function doubleMarks(text: string): string {
  let out = '';
  let from = 0;
  MARK_RUN.lastIndex = 0;
  for (let m = MARK_RUN.exec(text); m; m = MARK_RUN.exec(text)) {
    const start = m.index;
    const end = start + m[0].length;
    if (start === 0 || NOT_BEFORE_MARKS.test(text.charAt(start - 1))) continue;
    WORD_AFTER.lastIndex = end;
    if (WORD_AFTER.test(text)) continue;
    out += text.slice(from, start) + text.charAt(start);
    from = end;
  }
  MARK_RUN.lastIndex = 0;
  return from === 0 ? text : out + text.slice(from);
}

const LINE_END = /[\n\r\u2028\u2029]/g;

/**
 * Trims spaces and tabs at the end of each line; a line break and a no-break space stay. Was
 * `text.replace(/[ \t]+$/gm, '')`, which is tried from every space of a long run and scans to the end of
 * it each time (quadratic on tens of thousands of spaces before a letter). The line ends (`$` in
 * multiline mode: a line feed, a carriage return, U+2028, U+2029, or the end of the text) are found
 * first, and the spaces and tabs before each are read back by hand, so each space is read once.
 */
export function trailingSpace(text: string): string {
  let out = '';
  let from = 0;
  const trim = (end: number) => {
    let start = end;
    for (
      let c = text.charCodeAt(start - 1);
      start > from && (c === 0x20 || c === 0x09);
      c = text.charCodeAt(start - 1)
    )
      start--;
    if (start < end) {
      out += text.slice(from, start);
      from = end;
    }
  };
  LINE_END.lastIndex = 0;
  for (let m = LINE_END.exec(text); m; m = LINE_END.exec(text)) trim(m.index);
  trim(text.length);
  return from === 0 ? text : out + text.slice(from);
}

/**
 * `+-` before a digit is ±. Not after a letter, a digit or another `+` (`a+-b`, `1+-5`). Was
 * `(?<![\p{L}\p{N}+])\+-(?=\d)`, tried at every position; the `+-` is found first and what stands before it read by hand.
 */
export const plusMinus = (text: string): string =>
  text.replace(/\+-(?=\d)/g, (match, offset: number, whole: string) => {
    const prev = before(whole, offset);
    return prev === '+' || isLetterOrNumber(prev) ? match : '\u00B1';
  });

const FRACTIONS: Record<string, string> = { '1/2': '\u00BD', '1/4': '\u00BC', '3/4': '\u00BE' };

const FRACTION_BEHIND = /[/.,]/;

/**
 * 1/2, 1/4 and 3/4 become ½ ¼ ¾, only as whole numbers: not 11/2, 1/20, a1/2, 1/2/2026, 5/1/2,
 * 0.1/2 or 1/2a. A short word after the fraction is bound with a no-break space, as `space.number`
 * does for a digit (its pattern cannot see a ½), so the rule keeps `½ cup` together by itself.
 */
export const fractions = (text: string): string =>
  // The pattern was `(?<![\p{L}\p{N}/.,])` + this, tried at every position; the lookbehind is read by hand.
  text.replace(
    /(1\/2|1\/4|3\/4)(?![\p{L}\p{N}/"]|[.,]\d)([ ]+(?=\p{L}{1,9}(?!\p{L})|[%°€$£]))?/gu,
    (match, fraction: string, gap: string | undefined, offset: number, whole: string) => {
      const prev = before(whole, offset);
      return isLetterOrNumber(prev) || FRACTION_BEHIND.test(prev)
        ? match
        : `${FRACTIONS[fraction] ?? fraction}${gap ? NBSP : ''}`;
    },
  );

/** A bare C or F is no temperature after a label: `Type 2 F`, `Vitamin C 5 C`. The label ends the text it is tested on. */
const LABEL =
  /(?:^|[\s(])(?:\p{L}|Type|Class|Section|Plan|Grade|Level|Group|Vitamin|Gate|Row|Part|Option|Item|Line|Page|Room|Tier|Step|Unit|Table|Figure|Fig\.|No\.|Nr\.)$/iu;
/** How much text before the spaces `LABEL` needs: the longest label (`Section`, `Vitamin`: 7) and the character before it. */
const LABEL_REACH = 10;

/** The number and its unit, as the original pattern without its leading `(?<![\p{L}\p{N}])` (read by hand, see `degrees`). */
const DEGREE = /([−+±-]?\d+(?:[.,]\d+)?)(?:[  ]*(°)[  ]*|[  ]+)([CF])(?![\p{L}\p{N}]|\.\p{L})/uy;
const DIGITS = /\d+/g;

const isGap = (code: number): boolean => code === 0x20 || code === 0xa0;
const isSign = (code: number): boolean =>
  code === 0x2212 || code === 0x2b || code === 0xb1 || code === 0x2d;

/** Index of the first space (U+0020, U+00A0) of the run that ends just before `at`. */
function gapStart(text: string, at: number): number {
  let start = at;
  while (start > 0 && isGap(text.charCodeAt(start - 1))) start--;
  return start;
}

/**
 * Whether the number at `at` follows a bare label (`Type 2 C`, `Vitamin C 5 C`) and is not itself the
 * next temperature after a unit (`20 C 20 F`). These were `LABEL.test(before)` and
 * `/(?:\d[  ]+|°[  ]*)[CF][  ]+$/.test(before)` on `before = whole.slice(0, offset)`, which
 * reads the whole text before every match (quadratic on many numbers). Both end in spaces right before
 * the number, so they are read backwards from it: the length of the spaces and of a label, not of the text.
 */
function afterLabel(text: string, at: number): boolean {
  const end = gapStart(text, at);
  if (end === at) return false;
  const unit = text.charCodeAt(end - 1);
  if (unit === 0x43 || unit === 0x46) {
    const start = gapStart(text, end - 1);
    const prev = text.charCodeAt(start - 1);
    if ((start < end - 1 && prev >= 0x30 && prev <= 0x39) || prev === 0xb0) return false;
  }
  return LABEL.test(text.slice(Math.max(0, end - LABEL_REACH), end));
}

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
export function degrees(text: string, lang: Lang = 'en'): string {
  let out = '';
  let from = 0;
  const attempt = (at: number): RegExpExecArray | null => {
    if (isLetterOrNumber(before(text, at))) return null;
    DEGREE.lastIndex = at;
    return DEGREE.exec(text);
  };
  DIGITS.lastIndex = 0;
  for (let run = DIGITS.exec(text); run; run = DIGITS.exec(text)) {
    const digit = run.index;
    const signed = digit > from && isSign(text.charCodeAt(digit - 1)) ? attempt(digit - 1) : null;
    const m = signed ?? attempt(digit);
    if (!m) continue;
    const start = m.index;
    const end = start + m[0].length;
    DIGITS.lastIndex = end;
    // The label list is English: another language needs the degree sign to be read as a temperature.
    if (!m[2] && (lang !== 'en' || afterLabel(text, start))) continue;
    out += `${text.slice(from, start)}${m[1] ?? ''}${NBSP}°${m[3] ?? ''}`;
    from = end;
  }
  DIGITS.lastIndex = 0;
  return from === 0 ? text : out + text.slice(from);
}

/** `=>` is ⇒. Not `=>>`, `==>`, `=>=` or `<=>`. */
export const implies = (text: string): string =>
  // Was `(?<![=<>])=>(?![>=])`, tried at every position; the `=>` is found first and the character before it read by hand.
  text.replace(/=>(?![>=])/g, (match, offset: number, whole: string) =>
    offset > 0 && /[=<>]/.test(whole.charAt(offset - 1)) ? match : '\u21D2',
  );
