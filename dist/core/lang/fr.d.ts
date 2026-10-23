export declare const fr: {
    readonly code: 'fr';
    readonly name: 'French (français)';
    readonly sample: 'Il a dit "nous voilà" - et il est parti... Le labo dure 21-26 septembre, 10:00-12:00. Lire la suite ->';
    readonly quotes: readonly [readonly ["« ", " »"], readonly ["“", "”"]];
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly spaceBeforeHigh: true;
    readonly elisions: readonly ["em", "til", "till", "cause", "bout", "round", "tis", "twas", "cos", "n"];
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://vitrinelinguistique.oqlf.gouv.qc.ca/23371/la-ponctuation/tiret/le-tiret-dans-les-dialogues", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: 'A no-break space is set inside the guillemets. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a dash marks each change of speaker, with a no-break space after an opening dash (OQLF Vitrine linguistique, "Le tiret dans les dialogues" and its spacing table); the OQLF accepts the em and the en dash, the engine uses the em dash.';
};
export default fr;
