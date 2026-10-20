import type { LangPack } from './pack';

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
  // «outer „inner“ ‚third‘».
  quotes: [
    ['«', '»'],
    ['„', '“'],
    ['‚', '‘'],
  ],
  // Literary quotation, British English: ‘outer “inner” outer’ (a third level reopens with ‘).
  literary: [
    ['‘', '’'],
    ['“', '”'],
  ],
  orphans: /(?<![\p{L}\p{N}])([aAI])[ ]+(?=\S)/gu,
  abbreviations: { page: ['No', 'Nos', 'Fig', 'Figs', 'Vol', 'Ch', 'Sec', 'Art', 'p', 'pp'] },
  sentenceDashLiterary: '–',
  elisions: ELISIONS_EN,
  reviewed: false,
  sources: [],
  notes:
    'Display register uses guillemets by house style; British quotes are the literary register.',
} as const satisfies LangPack;
