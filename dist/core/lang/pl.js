import { ELISIONS_EN } from './en.js';
export const pl = {
    code: 'pl',
    name: 'Polish (polski)',
    sample: 'Powiedział "jesteśmy tu" - i wyszedł... Laboratorium trwa 21-26 września, 10:00-12:00. Czytaj więcej ->',
    quotes: [
        ['„', '”'],
        ['«', '»'],
    ],
    orphans: /(?<![\p{L}\p{N}])([aAiIoOuUwWzZ])[ ]+(?=\S)/gu,
    // Two- and three-letter prepositions and conjunctions, for the rule space.short-word:
    // Wolański (PWN) says they may stay at a line end in body text but must travel with what they
    // belong to in a title, which is what the rule is for. The entries are editorial.
    shortWords: ['do', 'od', 'we', 'na', 'po', 'za', 'ze', 'dla', 'bez', 'pod', 'nad', 'lub', 'czy'],
    abbreviations: {
        bind: [
            'ul',
            'al',
            'pl',
            'os',
            'im',
            'godz',
            'zob',
            'np',
            'tzw',
            'tel',
            'ks',
            'św',
            'mgr',
            'inż',
        ],
        page: ['nr', 's', 'poz'],
    },
    elisions: ELISIONS_EN,
    numbers: { group: ' ', decimal: ',' },
    dialogueDash: { mark: '—' },
    reviewed: false,
    sources: [
        'https://sjp.pwn.pl/poradnia/haslo/Pauza-dialogowa-a-myslnik;18816.html',
        'https://sjp.pwn.pl/poradnia/haslo/Sieroty-na-koncu-wiersza;18684.html',
        'https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures',
    ],
    notes: 'One-letter conjunctions and prepositions are bound to the next word. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a line of dialogue opens with the same dash as a break in the sentence, pauza or półpauza, spaced (PWN Poradnia, A. Wolański, "Pauza dialogowa a myślnik"); the engine uses the em dash it uses for a break.',
};
