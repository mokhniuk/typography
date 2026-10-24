import { NBSP } from '../types.js';
export const lt = {
    code: 'lt',
    name: 'Lithuanian (lietuvių)',
    sample: 'Jis pasakė "štai mes" - ir išėjo... Seminaras vyks rugsėjo 21-26 d., 10:00-12:00, t. y. šią savaitę. Skaityti daugiau ->',
    // „…“ at every level, ISG 4.2.3 ("Visi lygmenys"); a deeper quotation starts over from the same pair.
    quotes: [['„', '“']],
    // ISG 10.3.9 lists these two-part abbreviations; 10.1.5 and 10.1.8 write the parts of
    // a many-part abbreviation (t. y., t. t., š. m.) with a fixed space.
    abbreviations: {
        together: ['l. e. p.', 't. y.', 't. t.', 'š. m.', 'a. k.', 'b. k.', 'e. p.', 'A. V.'],
        bind: ['Nr', 'dr'],
        page: ['p', 'pav', 'tel'],
    },
    // ISG 10.1.4: Lithuanian institutional texts use the en dash, set with a space on each side.
    sentenceDash: '–',
    // ISG 6.4: a fixed space between the figure and %; the example 10.1.5 is "100 %".
    percentSpace: true,
    currencySpace: false,
    // ISG 6.5: a comma for the decimals, a space between groups of three digits (a fixed one, 10.1.5).
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '–' },
    reviewed: false,
};
export default lt;
