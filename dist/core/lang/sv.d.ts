export declare const sv: {
    readonly code: 'sv';
    readonly name: 'Swedish (svenska)';
    readonly sample: 'Han sa "vi är här" - och gick... Kursen pågår 21-26 september, 10:00-12:00. Läs mer ->';
    readonly quotes: readonly [readonly ["”", "”"], readonly ["’", "’"]];
    readonly sameMarkQuotes: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '–';
    };
    readonly sentenceDash: '–';
    readonly reviewed: false;
    readonly sources: readonly ["https://frageladan.isof.se/visasvar.py?svar=52014", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages", "https://frageladan.isof.se/visasvar.py?svar=46237", "https://commission.europa.eu/resources/europa-web-guide/design-content-and-development/content/web-writing-guidelines/dates-numbers-and-symbols_en"];
    readonly notes: 'Quotes: ”…” with ’…’ inside (EU Publications Office table; Frågelådan, Institutet för språk och folkminnen, says an inner quotation takes single marks). The same mark opens and closes, so a quotation is read by where each mark stands, not by pairing. The alternative »…» (same mark both sides) is not implemented. Numbers: a no-break space groups thousands and the decimal mark is a comma (Commission web-writing guide, which names no Swedish rule beyond "all other languages"). Not implemented, not verified: % and currency spacing, abbreviations, one-letter words, the sentence dash; the Interinstitutional Style Guide chapters and Svenska skrivregler could not be read. Dialogue and the sentence dash: a tankstreck on a new line opens each turn, common in news and fiction (Isof Frågelådan, "Kan man markera anföring med tankstreck?"); the tankstreck is the en dash.';
};
