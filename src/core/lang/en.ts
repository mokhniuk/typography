import { ELISIONS_EN } from './elisions.ts';
import type { LangPack } from './pack.ts';

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
} as const satisfies LangPack;

export default en;
