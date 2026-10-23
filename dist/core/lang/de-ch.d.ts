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
        readonly decimal: ',.';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://www.bk.admin.ch/dam/de/sd-web/YVHazXZRkqKn/schreibweisungen.pdf (Schweizerische Bundeskanzlei, Schreibweisungen, 2nd ed. 2013, corrected 2015, read in full as PDF text: Rz. 202-206 Anführungszeichen, 251 Festabstand, 512-514 Zahlen, 539-543 Geldbeträge, 554-555 Prozent)", "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-numbers-full/main/de-CH/numbers.json (CLDR 48, cldr-numbers-full 48.2.3: currency pattern \"¤ #,##0.00\" with U+00A0, the sign first; percent pattern \"#,##0%\", no space)", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: string;
};
export default deCH;
