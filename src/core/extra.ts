/**
 * The opt-in rules (`defaultOn: false` in rules.ts): each runs only when named in `enable`.
 * Their guards err towards leaving text alone; the known limits are in docs/limits.md.
 */
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
