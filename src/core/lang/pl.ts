import { ELISIONS_EN } from './en';
import type { LangPack } from './pack';

export const pl = {
  code: 'pl',
  name: 'Polish (polski)',
  sample:
    'Powiedział "jesteśmy tu" - i wyszedł... Laboratorium trwa 21-26 września, 10:00-12:00. Czytaj więcej ->',
  quotes: [
    ['„', '”'],
    ['«', '»'],
  ],
  orphans: /(?<![\p{L}\p{N}])([aAiIoOuUwWzZ])[ ]+(?=\S)/gu,
  abbreviations: {
    bind: [
      'ul',
      'al',
      'pl',
      'os',
      'im',
      'godz',
      'zob',
      'np',
      'tzw',
      'tel',
      'ks',
      'św',
      'mgr',
      'inż',
    ],
    page: ['nr', 's', 'poz'],
  },
  elisions: ELISIONS_EN,
  reviewed: false,
  sources: [],
  notes: 'One-letter conjunctions and prepositions are bound to the next word.',
} as const satisfies LangPack;
