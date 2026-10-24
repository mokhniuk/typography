import { NBSP } from '../types.js';
export const el = {
    code: 'el',
    name: 'Greek (Ελληνικά)',
    sample: 'Είπε "είμαστε εδώ" - και έφυγε... Το μάθημα διαρκεί 21-26 Σεπτεμβρίου, 10:00-12:00. Διάβασε περισσότερα ->',
    // «outer “inner ‘third’ inner” outer», ISG 10.1.7 and 4.2.3 (three levels).
    quotes: [
        ['«', '»'],
        ['“', '”'],
        ['‘', '’'],
    ],
    // ISG annex A3 and 4.2.3: abbreviations that introduce a name, a number or an amount; σ. (σελίδα) before a page number.
    // The Greek abbreviations of 10.6 (π.χ., κ.λπ., κ.ο.κ.) have no inner spaces, so none is kept together.
    abbreviations: {
        bind: ['αριθ', 'βλ', 'δισ', 'εκατ', 'κ'],
        page: ['σ', 'σελ'],
    },
    // ISG 6.4: a fixed space between the figure and %.
    percentSpace: true,
    // ISG part 3, 7 (euro): the € sign follows the figure, separated by a space (30 €); read in the Greek edition.
    currencySpace: true,
    // ISG 6.5: a comma for the decimals, a fixed half space between groups of three digits.
    numbers: { group: NBSP, decimal: ',' },
    reviewed: false,
};
export default el;
