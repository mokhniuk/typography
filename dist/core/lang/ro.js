import { NBSP } from '../types.js';
export const ro = {
    code: 'ro',
    name: 'Romanian (română)',
    sample: 'A spus "suntem aici" - și a plecat... Cursul este între 21-26 septembrie, 10:00-12:00. Citește mai mult ->',
    // „outer «inner» outer”; a third level starts over from „…”.
    quotes: [
        ['„', '”'],
        ['«', '»'],
    ],
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '–' },
    sentenceDash: '–',
    reviewed: false,
};
export default ro;
