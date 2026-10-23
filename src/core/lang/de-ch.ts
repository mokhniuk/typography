import { NBSP } from '../types.ts';
import { de } from './de.ts';
import type { LangPack } from './pack.ts';

const SCHREIBWEISUNGEN =
  'https://www.bk.admin.ch/dam/de/sd-web/YVHazXZRkqKn/schreibweisungen.pdf (Schweizerische Bundeskanzlei, Schreibweisungen, 2nd ed. 2013, corrected 2015, read in full as PDF text: Rz. 202-206 Anführungszeichen, 251 Festabstand, 512-514 Zahlen, 539-543 Geldbeträge, 554-555 Prozent)';
const CLDR_DE_CH =
  'https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-numbers-full/main/de-CH/numbers.json (CLDR 48, cldr-numbers-full 48.2.3: currency pattern "¤ #,##0.00" with U+00A0, the sign first; percent pattern "#,##0%", no space)';

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
  sources: [SCHREIBWEISUNGEN, CLDR_DE_CH, ...de.sources],
  notes: [
    'Read from the Swiss Federal Chancellery Schreibweisungen (2nd ed. 2013, corrected 2015), the official PDF read in full as text (Rz. 202-206, 251, 512-514, 539-555); the pack stays reviewed: false (no native reader).',
    'Quotes: `«outer ‹inner› outer»`, without spaces inside (Rz. 202, 203; Rz. 202 rejects Germany’s turned `»…«` for official texts and Rz. 206 does not recommend `„…“`). CLDR gives `„…“` and `‚…‘` for de-CH, so the choice stays disputed (resources/sources.md); the Schreibweisungen bind official texts only.',
    'Numbers: digits are grouped in threes with a Festabstand (no-break space) from five digits up (number.group; Rz. 512; a four-digit number is not split, and Rz. 513’s grouping of four digits in a table of larger numbers is not seen by a text engine). The apostrophe (1’000’000) "sollte nicht mehr angewendet werden" (Rz. 512), so it is not used. The decimal mark is a comma (Rz. 514: 4,16 Millionen), and in a money amount the point separates francs and rappen (Rz. 514, 543: Fr. 327.65). A point or a comma never groups digits in Swiss federal texts ("Nicht korrekt ist die Gliederung mit Punkten oder Kommas", Rz. 512), so number.group reads both as decimal marks (numbers.decimal ",.") and groups the whole part: 1234567,50 and Fr. 1234567.50 become 1 234 567,50 and Fr. 1 234 567.50.',
    'Percent and currency: a Festabstand between a figure and % or ‰ (Rz. 554) and between a figure and a currency unit or sign (Rz. 539, 540: 20 Franken, € 64.15), so percentSpace and currencySpace are set. CLDR 48 disagrees on %: its de-CH percent pattern is "#,##0%" without a space; the Chancellery is followed here. Not done: Rz. 555 writes a compound without the space (6%-Anteil), the engine sets one; Rz. 540 recommends a Festabstand after a prefixed Fr. or € (Fr. 327.65), the engine binds only a sign it knows (€, CHF), not Fr.',
    'The abbreviation lists and the spaced en dash are German’s (the de pack), not checked against the Schreibweisungen.',
  ].join(' '),
} as const satisfies LangPack;

export default deCH;
