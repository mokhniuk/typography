import { ELISIONS_EN } from './en.js';
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
    dialogueDash: { mark: '—' },
    elisions: ELISIONS_EN,
    numbers: { group: ' ', decimal: ',' },
    reviewed: false,
    sources: [
        'https://www.pravopys.net/sections/125/',
        'https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures',
    ],
    notes: 'The literary register keeps the display quotes; the dialogue dash (an em dash and a no-break space) is set in both registers. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a paragraph of direct speech opens with тире (Український правопис § 125, the 1993 rules as published on pravopys.net; the 2019 edition could not be read).',
};
