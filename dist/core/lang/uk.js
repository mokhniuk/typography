import { ELISIONS_EN } from './elisions.js';
export const uk = {
    code: 'uk',
    name: 'Ukrainian (українська)',
    sample: 'Він сказав: "ми тут" - і пішов... Лабораторія триває 21-26 вересня, 10:00-12:00. Докладніше ->',
    quotes: [
        ['«', '»'],
        ['„', '“'],
        ['‚', '‘'],
    ],
    orphans: /(?<![\p{L}\p{N}])([аАвВіІїЇйЙзЗуУоО])[ ]+(?=\S)/gu,
    // Two- and three-letter prepositions and conjunctions, for the rule space.short-word
    // (titles and headings). Editorial, as the orphan letters are.
    shortWords: ['до', 'на', 'за', 'по', 'із', 'від', 'під', 'над', 'при', 'без', 'для', 'та', 'що'],
    abbreviations: {
        together: ['т. д.', 'т. п.', 'т. ч.'],
        bind: ['м', 'вул', 'просп', 'пров', 'пл', 'обл', 'ім', 'див', 'рис', 'табл'],
        page: ['с', 'ст', 'ч'],
    },
    // CLDR 48 uk currency pattern "#,##0.00 ¤": a no-break space between the amount and the sign.
    // No percentSpace: CLDR's uk percent pattern is "#,##0%", and Pravopys 2019 says nothing on it.
    currencySpace: true,
    dialogueDash: { mark: '—' },
    elisions: ELISIONS_EN,
    numbers: { group: ' ', decimal: ',' },
    reviewed: false,
};
export default uk;
