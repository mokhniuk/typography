/**
 * The opt-in rules (`defaultOn: false` in rules.ts): each runs only when named in `enable`.
 * Their guards err towards leaving text alone; the known limits are in docs/limits.md.
 */
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
    /(?<=[^\s(\[{“"«‘„])[ \t]+([,.;:!?)])(?![\p{L}\p{N}])/gu,
    (match: string, mark: string, offset: number, whole: string) => {
      const next = whole.charAt(offset + match.length);
      if (mark === '.' && next === '.') return match;
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
  text.replace(/(?<=[^\s(\[{!?])([!?])\1+(?![\p{L}\p{N}_])/gu, '$1');

/** Trims spaces and tabs at the end of each line; a line break and a no-break space stay. */
export const trailingSpace = (text: string): string => text.replace(/[ \t]+$/gm, '');

/** `+-` before a digit is ±. Not after a letter, a digit or another `+` (`a+-b`, `1+-5`). */
export const plusMinus = (text: string): string =>
  text.replace(/(?<![\p{L}\p{N}+])\+-(?=\d)/gu, '\u00B1');

const FRACTIONS: Record<string, string> = { '1/2': '\u00BD', '1/4': '\u00BC', '3/4': '\u00BE' };

/**
 * 1/2, 1/4 and 3/4 become ½ ¼ ¾, only as whole numbers: not 11/2, 1/20, a1/2, 1/2/2026, 5/1/2,
 * 0.1/2 or 1/2a. A short word after the fraction is bound with a no-break space, as `space.number`
 * does for a digit (its pattern cannot see a ½), so the rule keeps `½ cup` together by itself.
 */
export const fractions = (text: string): string =>
  text.replace(
    /(?<![\p{L}\p{N}/.,])(1\/2|1\/4|3\/4)(?![\p{L}\p{N}/]|[.,]\d)([ ]+(?=\p{L}{1,9}(?!\p{L})|[%°€$£]))?/gu,
    (_m, fraction: string, gap: string | undefined) =>
      `${FRACTIONS[fraction] ?? fraction}${gap ? NBSP : ''}`,
  );

/** A bare C or F is no temperature after a label: `Type 2 F`, `Vitamin C 5 C`. */
const LABEL = /(?:^|[\s(])(?:\p{L}|Type|Class|Section|Plan|Grade|Level|Group|Vitamin|Gate|Row|Part|Option|Item|Line|Page|Room|Tier|Step|Unit|Table|Figure|Fig\.|No\.|Nr\.)[ \u00A0]+$/iu;

/**
 * A number and C or F, with or without the degree sign and space (20C is not read, 20 C, 20 °C,
 * 20°C and 20° C are), becomes the number, a no-break space and °C or °F. A bare `20 C` is only read
 * when the word before the number is not a label or a single letter. Not 20 Celsius, 20 F1, 5 C.E.
 */
export const degrees = (text: string): string =>
  text.replace(
    /(?<![\p{L}\p{N}])([\u2212+\u00B1-]?\d+(?:[.,]\d+)?)(?:[ \u00A0]*(°)[ \u00A0]*|[ \u00A0]+)([CF])(?![\p{L}\p{N}]|\.\p{L})/gu,
    (match: string, number: string, sign: string | undefined, unit: string, offset: number, whole: string) => {
      if (!sign && LABEL.test(whole.slice(0, offset))) return match;
      return `${number}${NBSP}°${unit}`;
    },
  );

/** `=>` is ⇒. Not `=>>`, `==>`, `=>=` or `<=>`. */
export const implies = (text: string): string => text.replace(/(?<![=<>])=>(?![>=])/g, '\u21D2');
