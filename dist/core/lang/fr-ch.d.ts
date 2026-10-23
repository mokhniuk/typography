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
        readonly decimal: '.';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://www.bk.admin.ch/bk/de/home/dokumentation/sprachen/hilfsmittel-textredaktion/schreibweisungen.html", "https://vitrinelinguistique.oqlf.gouv.qc.ca/23371/la-ponctuation/tiret/le-tiret-dans-les-dialogues", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: 'Swiss French quotes: `«outer ‹inner› outer»`, without the no-break space inside that the fr pack sets, as the former ch pack set them from the Swiss Federal Chancellery Schreibweisungen (the German edition; no French Swiss guide was read). CLDR has the same marks for fr-CH. No space is set before `; ! ?` and `:`: the rule that spaces them (SPACE_BEFORE_HIGH in src/core/extra.ts) lists `fr` only, and whether Swiss French sets one is unverified. Dialogue is quoted here (no dialogueDash), unlike the fr pack: the OQLF source on dialogue dashes is cited with the fr sources, but no dialogue dash is set, and either choice is unverified for Switzerland. The no-break space before % and € is French’s (the fr pack), not checked against a Swiss guide. Digits are grouped with a no-break space (number.group) and the decimal mark is a point, as the Schreibweisungen set for federal texts (Rz. 512, 514, 543 for francs); those passages were read in the German edition, from its index and the PDF text, not on the page itself, and the pack stays reviewed: false. Everyday Swiss usage often writes the apostrophe (1’000’000); it is not used here.';
};
