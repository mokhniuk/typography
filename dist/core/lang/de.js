import { ELISIONS_EN } from './elisions.js';
export const de = {
    code: 'de',
    name: 'German (Deutsch)',
    sample: 'Er sagte "wir sind da" - und ging... Das Labor läuft 21-26 September, 10:00-12:00. Mehr lesen ->',
    // »outer ›inner‹ outer«, the single guillemets inside the double ones. A third level starts over from »…«.
    quotes: [
        ['»', '«'],
        ['›', '‹'],
    ],
    turnedPairs: [
        ['»', '«'],
        ['›', '‹'],
    ],
    abbreviations: {
        together: ['z. B.', 'd. h.', 'u. a.', 'u. U.', 'i. d. R.', 'v. a.', 's. o.', 's. u.'],
        bind: ['Nr', 'Abb', 'Tab', 'Tel', 'Bd', 'Hrsg', 'vgl', 'ca'],
        page: ['S'],
    },
    sentenceDash: '–',
    sentenceDashLiterary: '–',
    percentSpace: true,
    currencySpace: true,
    elisions: ELISIONS_EN,
    numbers: { group: ' ', decimal: ',' },
    reviewed: false,
};
export default de;
