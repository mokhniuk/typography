import { NBSP } from '../types.js';
export const fi = {
    code: 'fi',
    name: 'Finnish (suomi)',
    sample: 'Hän sanoi "olemme täällä" - ja lähti... Kurssi kestää 21-26 syyskuuta, 10:00-12:00. Lue lisää ->',
    // ”outer ’inner’ outer”: the same mark opens and closes, at both levels (ISG 4.2.3, 10.4.5; Kotus).
    quotes: [
        ['”', '”'],
        ['’', '’'],
    ],
    sameMarkQuotes: true,
    // ISG 10.7.1: p. (puhelin) and v. (vuonna) before a number, mrd. before the noun; 4.2.3 and 10.7.1: s. before a number.
    // ISG 10.7.1 lists klo and nro without a period; 4.2.3 sets a fixed space after nro.
    abbreviations: {
        bind: ['p', 'v', 'mrd'],
        page: ['s'],
        bare: ['klo', 'nro'],
    },
    // ISG 6.4 and 10.4.8: a spaced short dash for a break in the sentence (the long dash is the list dash).
    sentenceDash: '–',
    // ISG 6.4: a fixed space between the figure and %.
    percentSpace: true,
    // ISG part 3, 7 (euro): the € sign follows the figure, separated by a fixed space (30 €); read in the Finnish edition.
    currencySpace: true,
    // ISG 6.5 and 10.2.1: a comma for the decimals, a thin fixed space between groups of three digits.
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '–' },
    reviewed: false,
};
export default fi;
