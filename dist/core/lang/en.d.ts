/**
 * Words that start with an apostrophe for dropped letters ('em, 'til, 'cause), and 'n' as in rock 'n'
 * roll. Before the packs this list was read for every language; the other packs list it too so that
 * their output stays what it was. A language that does not use these words should drop it, which is
 * an output change.
 */
export declare const ELISIONS_EN: readonly ['em', 'til', 'till', 'cause', 'bout', 'round', 'tis', 'twas', 'cos', 'n'];
export declare const en: {
    readonly code: 'en';
    readonly name: 'English';
    readonly sample: 'He said "we\'re here" - and left... The lab runs 21-26 September, 10:00-12:00. Read more ->';
    readonly quotes: readonly [readonly ["“", "”"], readonly ["‘", "’"]];
    readonly literary: readonly [readonly ["‘", "’"], readonly ["“", "”"]];
    readonly orphans: RegExp;
    readonly shortWords: readonly ["to", "of", "in", "on", "at", "by", "as", "or", "if", "an", "the", "and", "for"];
    readonly abbreviations: {
        readonly page: readonly ["No", "Nos", "Fig", "Figs", "Vol", "Ch", "Sec", "Art", "p", "pp"];
    };
    readonly sentenceDashLiterary: '–';
    readonly elisions: readonly ["em", "til", "till", "cause", "bout", "round", "tis", "twas", "cos", "n"];
    readonly numbers: {
        readonly group: ',';
        readonly decimal: '.';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://commission.europa.eu/system/files/2023-11/styleguide_english_dgt_en.pdf", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: "Display register uses “…” with ‘…’ inside, as CLDR gives English; British quotes (‘…’ with “…” inside) are the literary register; quoteStyle: 'guillemets' sets the former house style, «…» with „…“ inside. Digits of a number of five or more are grouped with a comma (opt-in rule number.group): the EU English Style Guide sets a hard space in running text and allows a comma for web writing, promotional material and press releases, which is what this engine is for. The separator is the pack field numbers.group (a no-break space is the EU form).";
};
