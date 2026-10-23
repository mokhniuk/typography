export declare const deCH: {
    readonly code: 'de-CH';
    readonly name: 'German (Switzerland)';
    readonly sample: 'Er sagte "wir sind da" - und ging... Das Labor läuft 21-26 September, 10:00-12:00. Mehr lesen ->';
    readonly quotes: readonly [readonly ["«", "»"], readonly ["‹", "›"]];
    readonly abbreviations: {
        readonly together: readonly ["z. B.", "d. h.", "u. a.", "u. U.", "i. d. R.", "v. a.", "s. o.", "s. u."];
        readonly bind: readonly ["Nr", "Abb", "Tab", "Tel", "Bd", "Hrsg", "vgl", "ca"];
        readonly page: readonly ["S"];
    };
    readonly sentenceDash: "–";
    readonly sentenceDashLiterary: "–";
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly elisions: readonly ["em", "til", "till", "cause", "bout", "round", "tis", "twas", "cos", "n"];
    readonly numbers: {
        readonly group: " ";
        readonly decimal: '.';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://www.bk.admin.ch/bk/de/home/dokumentation/sprachen/hilfsmittel-textredaktion/schreibweisungen.html", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: 'Swiss German quotes: `«outer ‹inner› outer»`, without spaces inside, as the Swiss Federal Chancellery Schreibweisungen set them. CLDR gives `„…“` and `‚…‘` for de-CH, so the choice stays disputed (resources/sources.md). Germany’s turned `»…«` is not read here. The abbreviation lists, the spaced en dash and the no-break space before % and € are German’s (the de pack), not checked against a Swiss guide. Digits are grouped with a no-break space (number.group): the Schreibweisungen (Rz. 512) group digits in threes with a Festabstand (no-break space). Everyday Swiss usage often writes the apostrophe (1’000’000); it is not used here (the separator is the pack field numbers.group). The decimal mark is a point (Rz. 514, 543 for francs). The Schreibweisungen page was not readable when this was written: the passage numbers (Rz. 512, 514, 543) come from its index and the PDF text, and the pack stays reviewed: false.';
};
