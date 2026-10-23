import { NBSP } from '../types.js';
import { de } from './de.js';
const SCHREIBWEISUNGEN = 'https://www.bk.admin.ch/bk/de/home/dokumentation/sprachen/hilfsmittel-textredaktion/schreibweisungen.html';
export const deCH = {
    code: 'de-CH',
    name: 'German (Switzerland)',
    sample: 'Er sagte "wir sind da" - und ging... Das Labor läuft 21-26 September, 10:00-12:00. Mehr lesen ->',
    // «outer ‹inner› outer», no space inside: the Swiss guillemets, not Germany's turned »…«.
    quotes: [
        ['«', '»'],
        ['‹', '›'],
    ],
    abbreviations: de.abbreviations,
    sentenceDash: de.sentenceDash,
    sentenceDashLiterary: de.sentenceDashLiterary,
    percentSpace: de.percentSpace,
    currencySpace: de.currencySpace,
    elisions: de.elisions,
    numbers: { group: NBSP, decimal: '.' },
    reviewed: false,
    sources: [SCHREIBWEISUNGEN, ...de.sources],
    notes: 'Swiss German quotes: `«outer ‹inner› outer»`, without spaces inside, as the Swiss Federal Chancellery Schreibweisungen set them. CLDR gives `„…“` and `‚…‘` for de-CH, so the choice stays disputed (resources/sources.md). Germany’s turned `»…«` is not read here. The abbreviation lists, the spaced en dash and the no-break space before % and € are German’s (the de pack), not checked against a Swiss guide. Digits are grouped with a no-break space (number.group): the Schreibweisungen (Rz. 512) group digits in threes with a Festabstand (no-break space). Everyday Swiss usage often writes the apostrophe (1’000’000); it is not used here (the separator is the pack field numbers.group). The decimal mark is a point (Rz. 514, 543 for francs). The Schreibweisungen page was not readable when this was written: the passage numbers (Rz. 512, 514, 543) come from its index and the PDF text, and the pack stays reviewed: false.',
};
export default deCH;
