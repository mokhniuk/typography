import { ELISIONS_EN } from './en';
import type { LangPack } from './pack';

export const ch = {
  code: 'ch',
  name: 'Swiss (Schweiz)',
  sample:
    'Er sagte "wir sind da" - und ging... Das Labor läuft 21-26 September, 10:00-12:00. Mehr lesen ->',
  quotes: [
    ['«', '»'],
    ['‹', '›'],
  ],
  elisions: ELISIONS_EN,
  reviewed: false,
  sources: [],
  notes: 'Swiss quotes: «outer ‹inner› outer», without spaces inside.',
} as const satisfies LangPack;
