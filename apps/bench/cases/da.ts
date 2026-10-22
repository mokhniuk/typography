import type { LangBench } from '../langs';

// »…« at every level (Vejledning i Udformning af EU-Publikationer 4.2.3, 10.1); „…“ is the other convention.
export const da: LangBench = {
  code: 'da',
  lead: 'Hun sagde',
  pairs: [
    ['»', '«'],
    ['„', '“'],
  ],
  nest: [
    ['»', '«', '»', '«'],
    ['„', '“', '‚', '‘'],
  ],
  quote: { input: 'Hun sagde "hus" og gik', word: 'hus' },
  dash: 'Sten - hukommelse - og tid',
  range: 'side 21-26 og 10:00-12:00',
  sample:
    'Hun sagde "vi er her" - og gik... Det løber 21-26 september, 5% mere, se s. 50. Læs mere ->',
};
