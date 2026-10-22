import type { LangBench } from '../langs';

export const de: LangBench = {
  code: 'de',
  lead: 'Er sagte',
  pairs: [
    ['„', '“'],
    ['»', '«'],
  ],
  nest: [
    ['„', '“', '‚', '‘'],
    ['»', '«', '›', '‹'],
  ],
  quote: { input: 'Er sagte "Haus" und ging', word: 'Haus' },
  dash: 'Stein - Gedächtnis - und Zeit',
  range: 'Seiten 21-26 und 10:00-12:00',
  sample: 'Er sagte "wir sind da" - und ging... Es läuft 21-26 September, z. B. 5% mehr. Mehr ->',
};
