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
    readonly currencySpace: true;
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly reviewed: false;
};
export default pl;
