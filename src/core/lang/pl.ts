import { ELISIONS_EN } from './elisions.ts';
import type { LangPack } from './pack.ts';

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
  // Two- and three-letter prepositions and conjunctions, for the rule space.short-word:
  // Wolański (PWN) says they may stay at a line end in body text but must travel with what they
  // belong to in a title, which is what the rule is for. The entries are editorial.
  shortWords: ['do', 'od', 'we', 'na', 'po', 'za', 'ze', 'dla', 'bez', 'pod', 'nad', 'lub', 'czy'],
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
  // CLDR 48 pl currency pattern "#,##0.00 ¤": a no-break space between the amount and the sign.
  // No percentSpace: PWN writes 50% (a space is allowed since 2020, not preferred); CLDR "#,##0%".
  currencySpace: true,
  dialogueDash: { mark: '—' },
  reviewed: false,
} as const satisfies LangPack;

export default pl;
