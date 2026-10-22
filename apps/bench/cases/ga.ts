import type { LangBench } from '../langs';

// ‘…’ then “…” (Publications Office table; the Irish ISG could not be read); “…” then ‘…’ is the
// order Wikipedia gives, so a check accepts both.
export const ga: LangBench = {
  code: 'ga',
  lead: 'Dúirt sé',
  pairs: [
    ['‘', '’'],
    ['“', '”'],
  ],
  nest: [
    ['‘', '’', '“', '”'],
    ['“', '”', '‘', '’'],
  ],
  quote: { input: 'Dúirt sé "teach" agus d\'imigh', word: 'teach' },
  dash: 'Cloch - cuimhne - agus am',
  range: 'leathanaigh 21-26 agus 10:00-12:00',
  sample:
    'Dúirt sé "tá mé anseo" - agus d\'imigh sé... Mairfidh sé 21-26 Meán Fómhair, b\'fhéidir 5% m\'athair. Léigh tuilleadh ->',
};
