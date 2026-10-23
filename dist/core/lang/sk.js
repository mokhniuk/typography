import { NBSP } from '../types.js';
export const sk = {
    code: 'sk',
    name: 'Slovak (slovenčina)',
    sample: 'Povedal "ideme k lesu" - a odišiel... Laboratórium beží 21-26 septembra, 10:00-12:00. Viac ->',
    // „outer ‚inner‘ outer“: low-high marks, the same shapes as German „…“ and not turned guillemets.
    quotes: [
        ['„', '“'],
        ['‚', '‘'],
    ],
    // v, k, s, u, z (prepositions), o, a, i; both cases. Editorial convention from secondary sources
    // (tvorim.net and sk.wikibooks name the words, grafeon.sk states the class); no Slovak authority could be read, so this is not a verified list.
    orphans: /(?<![\p{L}\p{N}])([kKsSvVzZoOuUaAiI])[ ]+(?=\S)/gu,
    // Two- and three-letter prepositions, for the rule space.short-word.
    // Editorial, like the orphan list: no Slovak authority could be read.
    shortWords: ['do', 'od', 'vo', 'na', 'so', 'za', 'po', 'pre', 'pri', 'nad', 'pod', 'bez'],
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '–' },
    sentenceDash: '–',
    reviewed: false,
    sources: [
        'https://www.juls.savba.sk/ediela/psp2000/psp.pdf',
        'https://www.teraz.sk/slovencina/slovencina-ako-pouzivat-slovenske/348361-clanok.html',
        'https://touchit.sk/jazykove-okienko-ako-je-to-s-pisanim-cisloviek/127957/',
        'https://tvorim.net/typografia/72-pisanie-zaverecnych-prac-a-tvorba-casopisov',
        'https://sk.wikibooks.org/wiki/Pomoc:Štylistická_príručka',
        'https://en.wikipedia.org/wiki/Quotation_mark',
    ],
    notes: 'Quotes: „…“ with ‚…‘ inside. Read from a TASR language column that cites Pravidlá slovenského pravopisu (2000, s. 107 – 108) and gives „…“ and the single ‚…‘ for a quotation inside one; ' +
        'the Pravidlá themselves (juls.savba.sk PDF) could not be read, and the Wikipedia table lists »…« and ›…‹ as the alternative, which is not set. ' +
        'Number format: groups of three digits separated by a space, decimal comma (a column by an expert of Jazykovedný ústav Ľ. Štúra, touchit.sk, citing the Pravidlá 2013); read by the opt-in rule number.group. ' +
        'Not implemented, not verified: the EU Interinstitutional Style Guide could not be read (its pages are scripted and gave no text); ' +
        'an authority for the one-letter words at line end (see below: the list is set, but only from secondary sources); ' +
        'a space before % (a secondary overview says Slovak writes 50 %, not confirmed against the Pravidlá; a space already written is still kept with its number by the number-unit rule); ' +
        'abbreviations. ' +
        'One-letter words at line end (v, k, s, u, z, o, a, i, both cases) are bound to the next word as an editorial convention, not a verified rule: a typography article (tvorim.net, 2008) and a Slovak wikibook style guide name the words, and a design studio page (grafeon.sk) states the class without letters; the Slovak authority pages (jazykovaporadna.sme.sk, the Pravidlá PDF) could not be read. Two-letter words are not bound. ' +
        'Dialogue and the sentence dash: dashes are the newer alternative to quotes for direct speech, spaced, with one before the attribution (Pravidlá slovenského pravopisu, 3rd ed., 2000, úvodzovky and pomlčka 10).',
};
