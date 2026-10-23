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
    sources: [
        'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0013.01/DOC_1 (Väljaannete stiilijuhend, Estonian PDF of 19 April 2022, read as text with pdfjs: 4.2.3 teksti ettevalmistamine (jutumärgid, liikumatud sõnavahed, numbrid), 5.10 tsitaadid, 6.4 kirjavahemärgid ja sõnavahe, 6.5 kirjavahemärgid arvudes, 10.1.6 jutumärgid, 10.1.7 mõtte- ja sidekriips, 10.7 mitmesugust, lisa A3 lühendid ja sümbolid)',
        'https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: et „…“ at all three levels)',
    ],
    notes: [
        'Quotation: the ISG (4.2.3, 5.10, 10.1.6) and the Publications Office table write „…“ at every level, so a quotation inside a quotation is „…„…“…“ here (5.10: "Jutumärke võib panna topelt"). ‚…‘ for the inner level was suggested to this pack and was not found in the ISG, so it is not set. The Eesti Keele Instituut (Õigekeelsussõnaraamat, Eesti keele käsiraamat) was not opened, so nothing says whether the national norm differs.',
        'Dash: ISG 10.1.7 names the en dash (U+2013) as the dash of ELT texts and does not give the spacing; its examples in 10.7 (tähtaeg – ajavahemik) set it with a space on each side, as the engine does.',
        'Numbers: ISG 6.5 gives a comma for decimals and a space between groups of three digits for numbers of five digits or more, counted from the right; 4.2.3 says the space is a no-break one and that codes, postal codes and years (1961. aastal, lk 2064) are not grouped; the engine groups from five digits, which is the same threshold.',
        'Known engine gap, not a pack field: the omission mark [---] that the ISG writes in quotations (5.10, 10.1.6) is rewritten by the dash rules to [ – -] in every language; et.test.ts holds a test marked failing for it.',
        'Abbreviations: the ISG sets a fixed space after nr and lk (4.2.3: "nr• ELT L•", "lk• ELT C•"), written without a full stop; the pack binds them to a number after them (the bare list: nr 5, lk 12; matched in lower case only). The ISG examples bind them to a publication name too (nr ELT L); that is not done, a bare abbreviation stays with a number only. The other abbreviations of annex A3 (s.o, k.a, v.a, n-ö, et al.) are written without a space inside. Not implemented, not verified: no orphans: the ISG gives no list of one-letter words to keep off the end of a line. No elisions read. The ISG shows € only as the code EUR, so the pack sets percentSpace and not currencySpace (49€ stays 49€).',
    ].join(' '),
};
export default et;
