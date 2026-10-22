import type { LangBench } from '../langs';

export const pl: LangBench = {
  code: 'pl',
  lead: 'Powiedział',
  pairs: [
    ['„', '”'],
    ['«', '»'],
  ],
  nest: [['„', '”', '«', '»']],
  quote: { input: 'Powiedział "dom" i wyszedł', word: 'dom' },
  dash: 'Kamień - pamięć - i czas',
  range: 'strony 21-26 i 10:00-12:00',
  sample: 'Powiedział "jesteśmy tu" - i wyszedł... Trwa 21-26 września, ul. Długa 5. Więcej ->',
};
