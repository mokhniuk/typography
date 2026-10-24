import { NBSP } from '../types.ts';
import { de } from './de.ts';
import type { LangPack } from './pack.ts';

export const deCH = {
  code: 'de-CH',
  name: 'German (Switzerland)',
  sample:
    'Er sagte "wir sind da" - und ging... Das Labor läuft 21-26 September, 10:00-12:00. Mehr lesen ->',
  // «outer ‹inner› outer», no space inside: the Swiss guillemets, not Germany's turned »…«.
  quotes: [
    ['«', '»'],
    ['‹', '›'],
  ],
  abbreviations: de.abbreviations,
  sentenceDash: de.sentenceDash,
  sentenceDashLiterary: de.sentenceDashLiterary,
  // Schreibweisungen Rz. 554 and 539-540: a Festabstand between a figure and %, ‰ or a currency.
  percentSpace: true,
  currencySpace: true,
  elisions: de.elisions,
  // Rz. 512: groups of three with a Festabstand, never the apostrophe, a point or a comma; Rz. 514:
  // a decimal comma, and the point between francs and rappen (Rz. 543: Fr. 327.65), so both are decimal marks.
  numbers: { group: NBSP, decimal: ',.' },
  reviewed: false,
} as const satisfies LangPack;

export default deCH;
