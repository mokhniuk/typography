import type { LangBench } from '../langs';

// „…” then ‚…’, the second again at the third level (Međuinstitucijski stilski priručnik, ISG 10.1.8).
export const hr: LangBench = {
  code: 'hr',
  lead: 'Rekao je',
  pairs: [
    ['„', '”'],
    ['‚', '’'],
  ],
  nest: [['„', '”', '‚', '’']],
  quote: { input: 'Rekao je "kamen" i otišao', word: 'kamen' },
  dash: 'Kamen - sjećanje - i vrijeme',
  range: 'stranice 21-26 i 10:00-12:00',
  sample:
    'Rekao je "ovdje smo" - i otišao... Traje 21-26. rujna, 10:00-12:00, popust 15%. Više ->',
};
