import type { LangBench } from '../langs';

// „…“ at every level (ISG 4.2.3 and 10.1.7, Bulgarian); no other pair is allowed by the sources read.
export const bg: LangBench = {
  code: 'bg',
  lead: 'Той каза',
  pairs: [['„', '“']],
  nest: [['„', '“', '„', '“']],
  quote: { input: 'Той каза "камък" и си тръгна', word: 'камък' },
  dash: 'Камък - спомен - и време',
  range: 'страници 21-26 и 10:00-12:00',
  sample:
    'Той каза "тук сме" - и си тръгна... Продължава 21-26 септември, 10:00-12:00, 5% отстъпка. Още ->',
};
