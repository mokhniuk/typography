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
};
export default cs;
