import { NBSP } from '../types.js';
export const cs = {
    code: 'cs',
    name: 'Czech (čeština)',
    sample: 'Řekl "jdeme k lesu" - a odešel... Laboratoř běží 21-26 září, 10:00-12:00, 14% sleva. Více ->',
    // „outer ‚inner‘ outer“: low-high marks, the same shapes as German „…“ and not turned guillemets.
    quotes: [
        ['„', '“'],
        ['‚', '‘'],
    ],
    // k, s, v, z (non-syllabic prepositions), o, u (syllabic prepositions), a, i (conjunctions); both cases.
    orphans: /(?<![\p{L}\p{N}])([kKsSvVzZoOuUaAiI])[ ]+(?=\S)/gu,
    // Two- and three-letter prepositions, for the rule space.short-word:
    // the příručka and the Jazyková poradna both say such a word MAY stay at a line end in body text.
    shortWords: ['do', 'od', 've', 'na', 'se', 'za', 'po', 'pro', 'při', 'nad', 'pod', 'bez'],
    sentenceDash: '–',
    sentenceDashLiterary: '–',
    percentSpace: true,
    // Internetová jazyková příručka, line breaks (id 880): 250 € with a fixed space; money (id 786): 100 Kč, a space.
    currencySpace: true,
    numbers: { group: NBSP, decimal: ',' },
    dialogueDash: { mark: '–' },
    reviewed: false,
    sources: [
        'https://prirucka.ujc.cas.cz/?id=165',
        'https://prirucka.ujc.cas.cz/?slovo=uvozovky',
        'https://prirucka.ujc.cas.cz/?id=880',
        'https://prirucka.ujc.cas.cz/?slovo=procento',
        'https://prirucka.ujc.cas.cz/?slovo=poml%C4%8Dka',
        'https://en.wikipedia.org/wiki/Quotation_mark',
    ],
    notes: 'Quotes: „…“ with ‚…‘ inside (Internetová jazyková příručka, ÚJČ AV ČR, the recommended basic form); ' +
        'the guillemets »…« and ›…‹ are allowed by the same page and are not set. ' +
        'One-letter words: the příručka bars a line break after k, s, v, z, o, u, a, i; it names the words, not their capital forms, so the capitals are bound by the same reasoning (not stated, not verified). ' +
        '% and currency: the příručka writes a space between number and symbol (14 %) and bars a line break there; a currency sign other than € (Kč) is bound by the number-unit rule, not by this pack. ' +
        'Sentence dash: the příručka sets a spaced pomlčka (–). ' +
        'Number format: group by three with a space, decimal comma (příručka, ?slovo=procento); carried only, the engine does not read it yet. ' +
        'Not implemented, not verified: the EU Interinstitutional Style Guide could not be read (its pages are scripted and gave no text), so none of its Czech rules were used; no abbreviation list (no list was read). ' +
        'Dialogue: quotes are the main form, but a pomlčka at the start of a line may open direct speech (Internetová jazyková příručka, "Pomlčka" and "Uvozovky").',
};
export default cs;
