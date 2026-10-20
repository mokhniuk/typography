import { type Lang, NBSP, type Register } from './types';

export type Level = readonly [open: string, close: string];

/** Quote marks for each nesting level; a quotation nested deeper than listed starts over from the first. */
export const PROFILES: Record<Lang, readonly Level[]> = {
  // «outer „inner“ ‚third‘».
  en: [
    ['«', '»'],
    ['„', '“'],
    ['‚', '‘'],
  ],
  uk: [
    ['«', '»'],
    ['„', '“'],
    ['‚', '‘'],
  ],
  // German: »outer ›inner‹ outer«, the single guillemets inside the double ones (the other
  // German style, „outer ‚inner‘ outer“, is a literary profile that does not exist yet). A
  // third level starts over from »…«.
  de: [
    ['»', '«'],
    ['›', '‹'],
  ],
  pl: [
    ['„', '”'],
    ['«', '»'],
  ],
  // French sets a non-breaking space inside the guillemets.
  fr: [
    [`«${NBSP}`, `${NBSP}»`],
    ['“', '”'],
  ],
  ch: [
    ['«', '»'],
    ['‹', '›'],
  ],
};

// Literary quotation. British English: ‘outer “inner” outer’ (a third level reopens
// with ‘). Ukrainian quotes are the same as on display; what differs there is the
// dialogue dash (see `dialogue` in dashes.ts).
export const LITERARY: Partial<Record<Lang, readonly Level[]>> = {
  en: [
    ['‘', '’'],
    ['“', '”'],
  ],
};

/** One-letter words a language must not strand at the end of a line. */
export const ORPHANS: Partial<Record<Lang, RegExp>> = {
  en: /(?<![\p{L}\p{N}])([aAI])[ ]+(?=\S)/gu,
  pl: /(?<![\p{L}\p{N}])([aAiIoOuUwWzZ])[ ]+(?=\S)/gu,
  uk: /(?<![\p{L}\p{N}])([аАвВіІїЇйЙзЗуУоО])[ ]+(?=\S)/gu,
};

/**
 * The dash that sets off a break in the sentence, spaced. An em dash unless a language
 * says otherwise: German sets a spaced en dash, and so does British English in the
 * literary register.
 */
export const SENTENCE_DASH: Partial<Record<Lang, string>> = { de: '\u2013' };
export const SENTENCE_DASH_LITERARY: Partial<Record<Lang, string>> = {
  en: '\u2013',
  de: '\u2013',
};

/**
 * Abbreviations whose parts must not be split by a line break. Short lists, not yet
 * read by a native speaker: add to them only from a style guide.
 *  - `together`: the parts of one abbreviation (z. B.);
 *  - `bind`: an abbreviation that stays with the word or number after it (Nr. 5, ul. Marszałkowska);
 *  - `page`: one that stays with a number only (S. 12).
 */
export type Abbreviations = {
  together?: readonly string[];
  bind?: readonly string[];
  page?: readonly string[];
};
export const ABBREVIATIONS: Partial<Record<Lang, Abbreviations>> = {
  en: { page: ['No', 'Nos', 'Fig', 'Figs', 'Vol', 'Ch', 'Sec', 'Art', 'p', 'pp'] },
  de: {
    together: ['z. B.', 'd. h.', 'u. a.', 'u. U.', 'i. d. R.', 'v. a.', 's. o.', 's. u.'],
    bind: ['Nr', 'Abb', 'Tab', 'Tel', 'Bd', 'Hrsg', 'vgl', 'ca'],
    page: ['S'],
  },
  uk: {
    together: ['т. д.', 'т. п.', 'т. ч.'],
    bind: ['м', 'вул', 'просп', 'пров', 'пл', 'обл', 'ім', 'див', 'рис', 'табл'],
    page: ['с', 'ст', 'ч'],
  },
  pl: {
    bind: [
      'ul',
      'al',
      'pl',
      'os',
      'im',
      'godz',
      'zob',
      'np',
      'tzw',
      'tel',
      'ks',
      'św',
      'mgr',
      'inż',
    ],
    page: ['nr', 's', 'poz'],
  },
};

/** Every language that has a profile. */
export const LANGS = Object.keys(PROFILES) as readonly Lang[];

export const REGISTERS: readonly Register[] = ['display', 'literary'];
