import type { LangBench } from '../langs';

export const ro: LangBench = {
  code: 'ro',
  lead: 'A spus',
  pairs: [
    ['„', '”'],
    ['«', '»'],
  ],
  nest: [['„', '”', '«', '»']],
  quote: { input: 'A spus "casă" și a plecat', word: 'casă' },
  dash: 'Piatra - memoria - și timpul',
  range: 'paginile 21-26 și 10:00-12:00',
  sample: 'A spus "suntem aici" - și a plecat... Durează 21-26 septembrie. Mai mult ->',
};
