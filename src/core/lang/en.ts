import type { LangPack } from './pack.ts';

/**
 * Words that start with an apostrophe for dropped letters ('em, 'til, 'cause), and 'n' as in rock 'n'
 * roll. Before the packs this list was read for every language; the other packs list it too so that
 * their output stays what it was. A language that does not use these words should drop it, which is
 * an output change.
 */
export const ELISIONS_EN = [
  'em',
  'til',
  'till',
  'cause',
  'bout',
  'round',
  'tis',
  'twas',
  'cos',
  'n',
] as const;

export const en = {
  code: 'en',
  name: 'English',
  sample:
    'He said "we\'re here" - and left... The lab runs 21-26 September, 10:00-12:00. Read more ->',
  // “outer ‘inner’ outer”, as CLDR gives English (a third level reopens with “). The former
  // house style, «outer „inner“ ‚third‘», is quoteStyle: 'guillemets', for any language.
  quotes: [
    ['“', '”'],
    ['‘', '’'],
  ],
  // Literary quotation, British English: ‘outer “inner” outer’ (a third level reopens with ‘).
  literary: [
    ['‘', '’'],
    ['“', '”'],
  ],
  orphans: /(?<![\p{L}\p{N}])([aAI])[ ]+(?=\S)/gu,
  // Short prepositions, conjunctions and the article, for the rule space.short-word
  // (titles and headings). Editorial: no style guide read gives a list for English.
  shortWords: ['to', 'of', 'in', 'on', 'at', 'by', 'as', 'or', 'if', 'an', 'the', 'and', 'for'],
  abbreviations: { page: ['No', 'Nos', 'Fig', 'Figs', 'Vol', 'Ch', 'Sec', 'Art', 'p', 'pp'] },
  sentenceDashLiterary: '–',
  elisions: ELISIONS_EN,
  numbers: { group: ',', decimal: '.' },
  // `symbol.degree` reads a bare 20 C as a temperature (its label list is English).
  bareTemperature: true,
  reviewed: false,
  sources: [
    'https://commission.europa.eu/system/files/2023-11/styleguide_english_dgt_en.pdf',
    'https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures',
  ],
  notes:
    "Display register uses “…” with ‘…’ inside, as CLDR gives English; British quotes (‘…’ with “…” inside) are the literary register; quoteStyle: 'guillemets' sets the former house style, «…» with „…“ inside. Digits of a number of five or more are grouped with a comma (opt-in rule number.group): the EU English Style Guide sets a hard space in running text and allows a comma for web writing, promotional material and press releases, which is what this engine is for. The separator is the pack field numbers.group (a no-break space is the EU form).",
} as const satisfies LangPack;
