import { NBSP } from '../types.js';
export const sv = {
    code: 'sv',
    name: 'Swedish (svenska)',
    sample: 'Han sa "vi är här" - och gick... Kursen pågår 21-26 september, 10:00-12:00. Läs mer ->',
    // ”outer ’inner’ outer”: the same mark opens and closes, at both levels.
    quotes: [
        ['”', '”'],
        ['’', '’'],
    ],
    sameMarkQuotes: true,
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '–' },
    sentenceDash: '–',
    reviewed: false,
};
export default sv;
