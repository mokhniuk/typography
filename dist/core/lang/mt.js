import { NBSP } from '../types.js';
export const mt = {
    code: 'mt',
    name: 'Maltese (Malti)',
    sample: 'Qal "jien hawn" - u telaq... Ix-xogħol idum 21-26 Settembru, 10:00-12:00. Aqra aktar ->',
    // “level 1 ‘level 2’ level 1”: ISG 4.2.3, "further levels are repetitions of levels 1 and 2".
    quotes: [
        ['“', '”'],
        ['‘', '’'],
    ],
    // ISG 4.2.3 and 6.4: p. and pp. before a page number are followed by a fixed space (p.• ĠU C).
    abbreviations: { page: ['p', 'pp'], bare: ['Nru'] },
    // ISG 6.4 table: a fixed space before %.
    percentSpace: true,
    currencySpace: false,
    // ISG 6.5: in Maltese, English and Irish publications a point separates the decimals; a space
    // (not a comma) marks the thousands.
    numbers: { group: NBSP, decimal: '.' },
    // Wiktionary (English edition, Maltese entries ta' and ma'), a community dictionary: low authority.
    truncations: ['ta', 'ma'],
    reviewed: false,
};
export default mt;
