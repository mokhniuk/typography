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
  numbers: { group: ' ', decimal: '.' },
  reviewed: false,
  sources: [
    'https://www.bk.admin.ch/bk/de/home/dokumentation/sprachen/hilfsmittel-textredaktion/schreibweisungen.html',
  ],
  notes:
    'Swiss quotes: `«outer ‹inner› outer»`, without spaces inside. Digits are grouped with a no-break space (number.group): the Swiss Federal Chancellery Schreibweisungen (Rz. 512) group digits in threes with a Festabstand (no-break space). Everyday Swiss usage often writes the apostrophe (1’000’000); it is not used here (the separator is the pack field numbers.group). The Schreibweisungen page was not readable when this was written: the passage numbers (Rz. 512, 514, 543) come from its index and the PDF text, and the pack stays reviewed: false. The decimal mark is a point (Rz. 514, 543 for francs).',
} as const satisfies LangPack;
