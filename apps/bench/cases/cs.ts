import type { LangBench } from '../langs';

export const cs: LangBench = {
  code: 'cs',
  lead: 'Řekl',
  // „…“ with ‚…‘ inside (ÚJČ); the guillemets »…« ›…‹ are allowed by the same source.
  pairs: [
    ['„', '“'],
    ['»', '«'],
  ],
  nest: [
    ['„', '“', '‚', '‘'],
    ['„', '“', '›', '‹'],
  ],
  quote: { input: 'Řekl "dům" a odešel', word: 'dům' },
  dash: 'Kámen - paměť - a čas',
  range: 'strany 21-26 a 10:00-12:00',
  sample: 'Řekl "jdeme k lesu" - a odešel... Trvá 21-26 září, 14 % sleva. Více ->',
};
