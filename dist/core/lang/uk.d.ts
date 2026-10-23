export declare const uk: {
    readonly code: 'uk';
    readonly name: 'Ukrainian (українська)';
    readonly sample: 'Він сказав: "ми тут" - і пішов... Лабораторія триває 21-26 вересня, 10:00-12:00. Докладніше ->';
    readonly quotes: readonly [readonly ["«", "»"], readonly ["„", "“"], readonly ["‚", "‘"]];
    readonly orphans: RegExp;
    readonly shortWords: readonly ["до", "на", "за", "по", "із", "від", "під", "над", "при", "без", "для", "та", "що"];
    readonly abbreviations: {
        readonly together: readonly ["т. д.", "т. п.", "т. ч."];
        readonly bind: readonly ["м", "вул", "просп", "пров", "пл", "обл", "ім", "див", "рис", "табл"];
        readonly page: readonly ["с", "ст", "ч"];
    };
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly elisions: readonly ["em", "til", "till", "cause", "bout", "round", "tis", "twas", "cos", "n"];
    readonly numbers: {
        readonly group: ' ';
        readonly decimal: ',';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://www.pravopys.net/sections/125/", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: 'The literary register keeps the display quotes; the dialogue dash (an em dash and a no-break space) is set in both registers. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a paragraph of direct speech opens with тире (Український правопис § 125, the 1993 rules as published on pravopys.net; the 2019 edition could not be read).';
};
