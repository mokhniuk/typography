import { NBSP } from '../types.js';
export const sl = {
    code: 'sl',
    name: 'Slovenian (slovenščina)',
    sample: 'Rekel je "gremo v gozd" - in odšel... Laboratorij deluje 21-26 septembra, 10:00-12:00, 15% popusta. Več ->',
    // „outer ‚inner‘ outer“, and the second level again at the third: ISG 10.1.6 and 4.2.3.
    quotes: [
        ['„', '“'],
        ['‚', '‘'],
        ['‚', '‘'],
    ],
    // ISG 10.1.7: the en dash is the stronger mark than a comma; the ISG itself sets it with spaces.
    sentenceDash: '–',
    sentenceDashLiterary: '–',
    // ISG 4.2.3: št. and str. keep a fixed space between them and what follows (št. UL L, str. UL C, a number).
    abbreviations: { page: ['št', 'str'] },
    // ISG 6.4 and 10.8: a fixed space between the number and %; ISG 7.3.3: between amount and EUR / the euro sign.
    percentSpace: true,
    currencySpace: true,
    // ISG 4.2.3 and 6.5: a comma for decimals, a fixed space between groups of three digits.
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '–' },
    reviewed: false,
};
export default sl;
