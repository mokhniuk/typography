import { NBSP } from '../types.js';
export const es = {
    code: 'es',
    name: 'Spanish (español)',
    sample: '¿Dijo "ya estamos aquí" - y se fue...? El laboratorio dura 21-26 de septiembre, 10:00-12:00. Leer más ->',
    // «outer “inner ‘third’ inner” outer», ISG 10.1.12.
    quotes: [
        ['«', '»'],
        ['“', '”'],
        ['‘', '’'],
    ],
    // ¿ and ¡ may stand right before an opening mark: ¿«Qué»?
    openers: '¿¡',
    // ISG 10.4: an abbreviation is never split at the end of a line; the examples it gives are listed.
    abbreviations: {
        together: ['EE. UU.', 'JJ. OO.', 'a. m.', 'p. m.', 'N. B.'],
        bind: ['Sr'],
        page: ['p', 'pp'],
    },
    // ISG 10.3.1.4: a fixed space between the figure and % ; ISG 7.3.3: between the figure and the code EUR.
    percentSpace: true,
    currencySpace: true,
    // ISG 6.5: a comma for the decimals, a fixed space between groups of three digits.
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '—', attached: true },
    reviewed: false,
    sources: [
        'https://www.rae.es/ortograf%C3%ADa/otros-usos-de-la-raya',
        'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0002.03/DOC_1 (Libro de estilo interinstitucional, PDF of 19 April 2022: 4.2.3 niveles de comillas, 6.4 espaciado de los signos de puntuación, 6.5 puntuación en las cifras, 7.3.3 referencias monetarias, 10.1.8 raya, 10.1.11 interrogación y exclamación, 10.1.12 comillas, 10.3.1.4 tantos por ciento, 10.4 abreviaturas)',
        'https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: es «…» “…” ‘…’)',
        'https://es.wikipedia.org/wiki/Comillas (cross-check only: it reports the RAE order «…“…‘…’…”…» and the Mexican Academy order “…‘…«…»…’…”; the RAE pages themselves, rae.es, answered 403 and were not read)',
    ],
    notes: [
        'Dialogue: the raya opens each turn and is written attached to it, with no space (RAE/ASALE, Ortografía 2010, § 3.4.7.2.1). Words of the narrator inside the turn take a raya on each side, attached inside; the engine spaces them (see the paired-dash gap).',
        "Quotation: «…» then “…” then ‘…’ is the order of the Libro de estilo interinstitucional (10.1.12), which it takes from the RAE; the Mexican Academy recommends the reverse for the Americas (“…‘…«…»…’…”), and “…” first is common in Latin America. The option quoteStyle: 'us' gives “…” with ‘…’ inside.",
        'Not implemented, not verified: the double raya of 10.1.8 is written attached to the text it encloses (—inciso—) and spaced from the text outside, but the engine sets a spaced dash on both sides (x — y), so a Spanish aside comes out spaced inside; a dialogue line opening with a spaced hyphen or dash becomes an attached raya (—Hola), set from the RAE above; the ISG gives no list of one-letter words to keep off the end of a line, so there are no orphans; the ISG shows the € symbol only in graphics and press releases (7.3.3) and puts a fixed space before the code EUR, so the space before € here follows the code.',
        'Numbers: ISG 6.5 prescribes a comma and a fixed space; secondary articles report that the 2005 RAE dictionary of doubts and Latin American usage differ on the % space and on the decimal point; none of that was read at its source.',
        'The abbreviation lists are only those the ISG itself gives as examples of a non-split abbreviation (10.4 and the fixed-space list in 4.2.3); the ordinals n.º and D.ª are not covered.',
    ].join(' '),
};
