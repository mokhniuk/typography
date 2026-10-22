import type { LangBench } from '../langs';

export const en: LangBench = {
  code: 'en',
  lead: 'He said',
  pairs: [
    ['“', '”'],
    ['‘', '’'],
  ],
  nest: [
    ['“', '”', '‘', '’'],
    ['‘', '’', '“', '”'],
  ],
  quote: { input: 'He said "stone" and left', word: 'stone' },
  dash: 'Stone - memory - and time',
  range: 'pages 21-26 and 10:00-12:00',
  sample:
    'He said "we\'re here" - and left... It runs 21-26 September, 10:00-12:00 (c) 2026. Read more ->',
};
