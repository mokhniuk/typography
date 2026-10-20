import { NBSP } from '../types';
import type { LangPack } from './pack';

export const ro = {
  code: 'ro',
  name: 'Romanian (română)',
  sample:
    'A spus "suntem aici" - și a plecat... Cursul este între 21-26 septembrie, 10:00-12:00. Citește mai mult ->',
  // „outer «inner» outer”; a third level starts over from „…”.
  quotes: [
    ['„', '”'],
    ['«', '»'],
  ],
  numbers: { group: NBSP, decimal: ',' },
  reviewed: false,
  sources: [
    'https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages',
    'https://commission.europa.eu/resources/europa-web-guide/design-content-and-development/content/web-writing-guidelines/dates-numbers-and-symbols_en',
  ],
  notes:
    'Quotes: „…” with «…» inside, the third level „…” again (EU Publications Office table). The Academy (Îndreptar, DOOM) text could not be read, so the national authority is not cited. Numbers: a no-break space groups thousands and the decimal mark is a comma (Commission web-writing guide). Not implemented, not verified: % and currency spacing, abbreviations, one-letter words, the sentence dash.',
} as const satisfies LangPack;
