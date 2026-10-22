import type { LangBench } from '../langs';

// „…“ then ‚…‘, the second again at the third level (Medinstitucionalni slogovni priročnik, ISG 10.1.6).
export const sl: LangBench = {
  code: 'sl',
  lead: 'Rekel je',
  pairs: [
    ['„', '“'],
    ['‚', '‘'],
  ],
  nest: [['„', '“', '‚', '‘']],
  quote: { input: 'Rekel je "kamen" in odšel', word: 'kamen' },
  dash: 'Kamen - spomin - in čas',
  range: 'strani 21-26 in 10:00-12:00',
  sample:
    'Rekel je "tukaj smo" - in odšel... Traja 21-26 septembra, 10:00-12:00, 15% popusta. Več ->',
};
