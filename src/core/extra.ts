/**
 * The opt-in rules (`defaultOn: false` in rules.ts): each runs only when named in `enable`.
 * Their guards err towards leaving text alone; the known limits are in docs/limits.md.
 */
import { before, isLetterOrNumber } from './scan';
import { NBSP } from './types';
import type { Lang } from './types';

/** Languages that set a space before `: ; ! ?` (French): the space is correct there, not a fault. */
const SPACE_BEFORE_HIGH = new Set<Lang>(['fr']);

/**
 * Removes a space before , . ; : ! ? ). Not at a line start, not before an ellipsis, a decimal
 * (` .5`), a file extension (` .gitignore`), `!=` or `??`, not a spaced time or ratio (`10 : 30`),
 * not an emoticon (` :)`, ` ;-)`), and not before `: ; ! ?` in French.
 */
export function beforePunctuation(text: string, lang: Lang): string {
  return text.replace(
    /(?<=[^\s(\[{“"«‘„])[ \t]+([,.;:!?)])/gu,
    (match: string, mark: string, offset: number, whole: string) => {
      const next = whole.charAt(offset + match.length);
      // A mark that a letter or digit follows is the start of a word or number (.5, .gitignore, 3 ,5), except
      // a comma before a letter (`Hello ,world`), which `space.after-comma` spaces right after.
      if (/[\p{L}\p{N}]/u.test(next) && !(mark === ',' && /\p{L}/u.test(next))) return match;
      // `![` opens a Markdown image: the space before it is not a space before punctuation.
      if (mark === '!' && next === '[') return match;
      // A dot followed by spaces and another dot is a spaced ellipsis (`Wait . . . what`).
      if (mark === '.' && /^[ \t]*\./.test(whole.slice(offset + match.length))) return match;
      // A dot is not pulled against a dot on either side: that would make a ... after `ellipsis` ran.
      if (mark === '.' && (next === '.' || whole.charAt(offset - 1) === '.')) return match;
      if ((mark === ':' || mark === ';') && /[-)(/|\\'*]/.test(next)) return match;
      if (mark === ':' && /\d/.test(whole.charAt(offset - 1)) && /^[ \t]*\d/.test(whole.slice(offset + match.length))) {
        return match;
      }
      if ((mark === '!' || mark === '?') && next === '=') return match;
      if (mark === '?' && (next === '?' || next === '.')) return match;
      if (SPACE_BEFORE_HIGH.has(lang) && /[:;!?]/.test(mark)) return match;
      return mark;
    },
  );
}

/** Adds a space after a comma that a letter follows directly (`a,b`). Digits (`1,5`) are left alone. */
export const afterComma = (text: string): string => text.replace(/,(?=\p{L})/gu, ', ');

/**
 * A run of ! or ? becomes one mark. Only a run attached to the word before it, and not followed
 * by a letter or digit: `a ?? b`, `!!x` and `(!!y)` are left. `?!` and `!?` are two marks and stay.
 */
export const doubleMarks = (text: string): string =>
  text.replace(/(?<=[^\s(\[{!?])([!?])\1+(?!\1)(?![\p{L}\p{N}_])/gu, '$1');

/** Trims spaces and tabs at the end of each line; a line break and a no-break space stay. */
export const trailingSpace = (text: string): string => text.replace(/[ \t]+$/gm, '');

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

/** A bare C or F is no temperature after a label: `Type 2 F`, `Vitamin C 5 C`. */
const LABEL = /(?:^|[\s(])(?:\p{L}|Type|Class|Section|Plan|Grade|Level|Group|Vitamin|Gate|Row|Part|Option|Item|Line|Page|Room|Tier|Step|Unit|Table|Figure|Fig\.|No\.|Nr\.)[ \u00A0]+$/iu;

/**
 * A number and C or F, with or without the degree sign and space (20C is not read, 20 C, 20 °C,
 * 20°C and 20° C are; a bare 20 C only in English), becomes the number, a no-break space and °C or °F. A bare `20 C` is only read
 * when the word before the number is not a label or a single letter. Not 20 Celsius, 20 F1, 5 C.E.
 */
export const degrees = (text: string, lang: Lang = 'en'): string =>
  text.replace(
    /(?<![\p{L}\p{N}])([\u2212+\u00B1-]?\d+(?:[.,]\d+)?)(?:[ \u00A0]*(°)[ \u00A0]*|[ \u00A0]+)([CF])(?![\p{L}\p{N}]|\.\p{L})/gu,
    (match: string, number: string, sign: string | undefined, unit: string, offset: number, whole: string) => {
      const before = whole.slice(0, offset);
      // A C or F that is itself the unit of the number before it (`20 C 20 F`) is no label.
      const afterUnit = /(?:\d[ \u00A0]+|°[ \u00A0]*)[CF][ \u00A0]+$/.test(before);
      // The label list is English: another language needs the degree sign to be read as a temperature.
      if (!sign && lang !== 'en') return match;
      if (!sign && !afterUnit && LABEL.test(before)) return match;
      return `${number}${NBSP}°${unit}`;
    },
  );

/** `=>` is ⇒. Not `=>>`, `==>`, `=>=` or `<=>`. */
export const implies = (text: string): string =>
  // Was `(?<![=<>])=>(?![>=])`, tried at every position; the `=>` is found first and the character before it read by hand.
  text.replace(/=>(?![>=])/g, (match, offset: number, whole: string) =>
    offset > 0 && /[=<>]/.test(whole.charAt(offset - 1)) ? match : '\u21D2',
  );
