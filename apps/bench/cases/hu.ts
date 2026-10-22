import type { LangBench } from '../langs';

export const hu: LangBench = {
  code: 'hu',
  lead: 'Azt mondta',
  pairs: [
    ['„', '”'],
    ['»', '«'],
  ],
  nest: [['„', '”', '»', '«']],
  quote: { input: 'Azt mondta "ház" és elment', word: 'ház' },
  dash: 'Kő - emlék - és idő',
  range: 'a 21-26. oldal és 10:00-12:00',
  sample: 'Azt mondta "itt vagyunk" - és elment... Tart 21-26 szeptember. Tovább ->',
};
