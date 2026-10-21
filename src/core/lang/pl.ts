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
  numbers: { group: ' ', decimal: ',' },
  dialogueDash: { mark: '—' },
  reviewed: false,
  sources: [
    'https://sjp.pwn.pl/poradnia/haslo/Pauza-dialogowa-a-myslnik;18816.html',
    'https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures',
  ],
  notes:
    'One-letter conjunctions and prepositions are bound to the next word. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a line of dialogue opens with the same dash as a break in the sentence, pauza or półpauza, spaced (PWN Poradnia, A. Wolański, "Pauza dialogowa a myślnik"); the engine uses the em dash it uses for a break.',
} as const satisfies LangPack;
