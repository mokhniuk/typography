import { ABBREVIATIONS, type Abbreviations, ORPHANS } from './profiles';
import { type Lang, NBSP } from './types';

export const collapse = (text: string): string => text.replace(/ {2,}/g, ' ');

/** Titles stay with the name: Prof. Dr. Oksana. */
export const titles = (text: string): string =>
  text.replace(
    /(?<![\p{L}\p{N}])(Prof|Dr|Mr|Mrs|Ms|Mx|St|Hon|Rev|Sr|Jr)\.[ ]+(?=\p{L})/gu,
    `$1.${NBSP}`,
  );

/** An initial stays with the surname: K. Słoboda. */
export const initials = (text: string): string =>
  text.replace(/(?<![\p{L}\p{N}])(\p{Lu})\.[ ]+(?=\p{Lu})/gu, `$1.${NBSP}`);

/**
 * A number stays with a short word after it (a unit, a month): 21 September, 15 people, 5 %.
 * A longer word is left free, so a chain of bound words never outgrows a narrow column.
 */
export const numberUnit = (text: string): string =>
  text.replace(/(\d)[ ]+(?=[\p{L}]{1,9}(?![\p{L}])|[%°€$£])/gu, `$1${NBSP}`);

export const association = (text: string): string => text.replace(/[ ]+(?=e\.V\.)/g, NBSP);

export const copyright = (text: string): string => text.replace(/©[ ]+(?=\d)/g, `©${NBSP}`);

/** One-letter words a language must not strand at the end of a line. */
export const orphans = (text: string, lang: Lang): string => {
  const pattern = ORPHANS[lang];
  return pattern ? text.replace(pattern, `$1${NBSP}`) : text;
};

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const abbreviationPatterns = new Map<
  Lang,
  { together: RegExp | null; bind: RegExp | null; page: RegExp | null }
>();

function patternsFor(lang: Lang) {
  const cached = abbreviationPatterns.get(lang);
  if (cached) return cached;
  const list: Abbreviations = ABBREVIATIONS[lang] ?? {};
  const names = (words: readonly string[] | undefined) =>
    words?.length ? words.map(escapeRegex).join('|') : null;
  const together = list.together?.length
    ? new RegExp(
        `(?<![\\p{L}\\p{N}])(?:${list.together.map((a) => escapeRegex(a).replace(/ /g, '[ ]+')).join('|')})(?![\\p{L}])`,
        'gu',
      )
    : null;
  const bind = names(list.bind);
  const page = names(list.page);
  const made = {
    together,
    bind: bind ? new RegExp(`(?<![\\p{L}\\p{N}])(?:${bind})\\.[ ]+(?=[\\p{L}\\p{N}])`, 'gu') : null,
    page: page ? new RegExp(`(?<![\\p{L}\\p{N}])(?:${page})\\.[ ]+(?=\\d)`, 'gu') : null,
  };
  abbreviationPatterns.set(lang, made);
  return made;
}

/** The parts of an abbreviation stay together, and a short one stays with what it introduces. */
export const abbreviations = (text: string, lang: Lang): string => {
  const { together, bind, page } = patternsFor(lang);
  let out = text;
  if (together) out = out.replace(together, (m) => m.replace(/[ ]+/g, NBSP));
  if (bind) out = out.replace(bind, (m) => m.replace(/[ ]+$/, NBSP));
  if (page) out = out.replace(page, (m) => m.replace(/[ ]+$/, NBSP));
  return out;
};

/** In German and French a percent or euro sign stands apart from its number by a no-break space: 5 %, 49 €. */
export const unitSymbol = (text: string, lang: Lang): string =>
  lang === 'de' || lang === 'fr' ? text.replace(/(?<=\d)(?=[%€])/g, NBSP) : text;

/** An arrow stays with the word it points from or to: «Read more →», «← Back». */
export const arrowSpace = (text: string): string =>
  text.replace(/\u0020+(?=→)/g, NBSP).replace(/(?<=←)\u0020+/g, NBSP);
