import { NBSP } from '../types.js';
export const pt = {
    code: 'pt',
    name: 'Portuguese (português)',
    sample: 'Ele disse "estamos aqui" - e saiu... O laboratório dura 21-26 de setembro, 10:00-12:00. Ler mais ->',
    // European Portuguese: «nível 1 “nível 2 ‘nível 3’ nível 2” nível 1», ISG 4.2.3.
    quotes: [
        ['«', '»'],
        ['“', '”'],
        ['‘', '’'],
    ],
    // Abbreviations of ISG annex A3 written in two parts (p. ex., a. C.) and the ones that introduce
    // a number (p. 12, fig. 3); the ISG shows p. with a fixed space (4.2.3: p.• JO C).
    abbreviations: {
        together: ['p. ex.', 'a. C.', 'd. C.', 'N. B.', 'P. S.', 'S. A.', 'S. M.'],
        bind: ['Av'],
        page: ['p', 'cap', 'fig', 'vol'],
    },
    // ISG 6.4 (common to all languages) and A3 (15 % da produção): a fixed space before %.
    percentSpace: true,
    currencySpace: false,
    // ISG 6.5: a comma for the decimals, a space between groups of three digits.
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '—' },
    reviewed: false,
};
export default pt;
