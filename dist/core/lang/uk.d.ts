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
    readonly currencySpace: true;
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly elisions: readonly ["em", "til", "till", "cause", "bout", "round", "tis", "twas", "cos", "n"];
    readonly numbers: {
        readonly group: ' ';
        readonly decimal: ',';
    };
    readonly reviewed: false;
};
export default uk;
