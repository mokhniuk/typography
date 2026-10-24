import { NBSP } from '../types.js';
export const bg = {
    code: 'bg',
    name: 'Bulgarian (български)',
    sample: 'Той каза "тръгваме към гората" - и си тръгна... Лабораторията работи 21-26 септември, 10:00-12:00, 5% отстъпка. Още ->',
    // „…“ at every level, ISG 4.2.3 and 10.1.7.
    quotes: [['„', '“']],
    // ISG 4.2.3 keeps стр. (page) with its number by a fixed space; the other abbreviations of 10.4.2 carry no such rule.
    abbreviations: { page: ['стр'] },
    // ISG 6.4: a fixed space between the figure and %; ISG 7.3.3: between the amount and the euro sign.
    percentSpace: true,
    currencySpace: true,
    // ISG 4.2.3 and 6.5: a comma for decimals, a fixed space between groups of three digits.
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '—' },
    reviewed: false,
};
export default bg;
