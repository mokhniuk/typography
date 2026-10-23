export declare const frCH: {
    readonly code: 'fr-CH';
    readonly name: 'French (Switzerland)';
    readonly sample: 'Il a dit "nous sommes là" - et il est parti... Le labo fonctionne du 21-26 septembre, 10:00-12:00. Lire la suite ->';
    readonly quotes: readonly [readonly ["«", "»"], readonly ["‹", "›"]];
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly elisions: readonly ["em", "til", "till", "cause", "bout", "round", "tis", "twas", "cos", "n"];
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',.';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://www.bk.admin.ch/dam/fr/sd-web/t4P98Y1Vnyz-/objekt_55266.pdf (Chancellerie fédérale, Instructions sur la présentation des textes officiels en français, May 2016, read in full as PDF text: ch. 2 unités monétaires, ch. 4 nombres and note 4, ch. 5 espaces insécables)", "https://www.bk.admin.ch/dam/de/sd-web/YVHazXZRkqKn/schreibweisungen.pdf (Schweizerische Bundeskanzlei, Schreibweisungen, the German edition, 2013/2015: Rz. 202-203 quotation marks)", "https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-numbers-full/main/fr-CH/numbers.json (CLDR 48, cldr-numbers-full 48.2.3: currency pattern \"#,##0.00 ¤\" with U+00A0; percent pattern \"#,##0%\", no space)", "https://vitrinelinguistique.oqlf.gouv.qc.ca/23371/la-ponctuation/tiret/le-tiret-dans-les-dialogues", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: string;
};
export default frCH;
