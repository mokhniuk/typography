import { NBSP } from '../types.js';
export const et = {
    code: 'et',
    name: 'Estonian (eesti)',
    sample: 'Ta ütles "me oleme siin" - ja läks... Seminar kestab 21-26 septembrini, 10:00-12:00, 5% rohkem. Loe edasi ->',
    // „…“ (U+201E, U+201C) at every level: ISG 4.2.3, 5.10 ("Jutumärke võib panna topelt") and 10.1.6.
    quotes: [['„', '“']],
    // ISG 10.1.7: the dash of ELT texts is the en dash (U+2013); the ISG examples (10.7) set it with spaces.
    sentenceDash: '–',
    // ISG 4.2.3: a fixed space after nr and lk, written without a full stop ("nr• ELT L•", "lk• ELT C•").
    abbreviations: { bare: ['nr', 'lk'] },
    // ISG 6.4: a fixed space between the figure and %.
    percentSpace: true,
    currencySpace: false,
    // ISG 6.5: a comma for the decimals; groups of three, a space, from five digits (and 4.2.3: a no-break space).
    numbers: { group: NBSP, decimal: ',' },
    reviewed: false,
};
export default et;
