export declare const pl: {
    readonly code: 'pl';
    readonly name: 'Polish (polski)';
    readonly sample: 'Powiedział "jesteśmy tu" - i wyszedł... Laboratorium trwa 21-26 września, 10:00-12:00. Czytaj więcej ->';
    readonly quotes: readonly [readonly ["„", "”"], readonly ["«", "»"]];
    readonly orphans: RegExp;
    readonly shortWords: readonly ["do", "od", "we", "na", "po", "za", "ze", "dla", "bez", "pod", "nad", "lub", "czy"];
    readonly abbreviations: {
        readonly bind: readonly ["ul", "al", "pl", "os", "im", "godz", "zob", "np", "tzw", "tel", "ks", "św", "mgr", "inż"];
        readonly page: readonly ["nr", "s", "poz"];
    };
    readonly elisions: readonly ["em", "til", "till", "cause", "bout", "round", "tis", "twas", "cos", "n"];
    readonly numbers: {
        readonly group: ' ';
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://sjp.pwn.pl/poradnia/haslo/Pauza-dialogowa-a-myslnik;18816.html", "https://sjp.pwn.pl/poradnia/haslo/Sieroty-na-koncu-wiersza;18684.html", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: 'One-letter conjunctions and prepositions are bound to the next word. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a line of dialogue opens with the same dash as a break in the sentence, pauza or półpauza, spaced (PWN Poradnia, A. Wolański, "Pauza dialogowa a myślnik"); the engine uses the em dash it uses for a break.';
};
