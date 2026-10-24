import type { LangPack } from './pack.js';
export type { Abbreviations, LangPack, Level, NumberFormat } from './pack.js';
/**
 * The single registry of languages: add a pack here and the language exists everywhere
 * (`Lang`, `LANGS`, the command line, the rehype plugin, the playground, the docs).
 */
export declare const PACKS: readonly [{
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
    readonly bareTemperature: true;
    readonly reviewed: false;
}, {
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
}, {
    readonly code: 'de';
    readonly name: 'German (Deutsch)';
    readonly sample: 'Er sagte "wir sind da" - und ging... Das Labor läuft 21-26 September, 10:00-12:00. Mehr lesen ->';
    readonly quotes: readonly [readonly ["»", "«"], readonly ["›", "‹"]];
    readonly turnedPairs: readonly [readonly ["»", "«"], readonly ["›", "‹"]];
    readonly abbreviations: {
        readonly together: readonly ["z. B.", "d. h.", "u. a.", "u. U.", "i. d. R.", "v. a.", "s. o.", "s. u."];
        readonly bind: readonly ["Nr", "Abb", "Tab", "Tel", "Bd", "Hrsg", "vgl", "ca"];
        readonly page: readonly ["S"];
    };
    readonly sentenceDash: '–';
    readonly sentenceDashLiterary: '–';
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly elisions: readonly ["em", "til", "till", "cause", "bout", "round", "tis", "twas", "cos", "n"];
    readonly numbers: {
        readonly group: ' ';
        readonly decimal: ',';
    };
    readonly reviewed: false;
}, {
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
}, {
    readonly code: 'fr';
    readonly name: 'French (français)';
    readonly sample: 'Il a dit "nous voilà" - et il est parti... Le labo dure 21-26 septembre, 10:00-12:00. Lire la suite ->';
    readonly quotes: readonly [readonly ["« ", " »"], readonly ["“", "”"]];
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly highPunctuation: {
        readonly colon: " ";
        readonly others: ' ';
    };
    readonly elisions: readonly ["em", "til", "till", "cause", "bout", "round", "tis", "twas", "cos", "n"];
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly reviewed: false;
}, {
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
}, {
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
}, {
    readonly code: 'cs';
    readonly name: 'Czech (čeština)';
    readonly sample: 'Řekl "jdeme k lesu" - a odešel... Laboratoř běží 21-26 září, 10:00-12:00, 14% sleva. Více ->';
    readonly quotes: readonly [readonly ["„", "“"], readonly ["‚", "‘"]];
    readonly orphans: RegExp;
    readonly shortWords: readonly ["do", "od", "ve", "na", "se", "za", "po", "pro", "při", "nad", "pod", "bez"];
    readonly sentenceDash: '–';
    readonly sentenceDashLiterary: '–';
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '–';
    };
    readonly reviewed: false;
}, {
    readonly code: 'sk';
    readonly name: 'Slovak (slovenčina)';
    readonly sample: 'Povedal "ideme k lesu" - a odišiel... Laboratórium beží 21-26 septembra, 10:00-12:00. Viac ->';
    readonly quotes: readonly [readonly ["„", "“"], readonly ["‚", "‘"]];
    readonly orphans: RegExp;
    readonly shortWords: readonly ["do", "od", "vo", "na", "so", "za", "po", "pre", "pri", "nad", "pod", "bez"];
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '–';
    };
    readonly sentenceDash: '–';
    readonly reviewed: false;
}, {
    readonly code: 'nl';
    readonly name: 'Dutch (Nederlands)';
    readonly sample: 'Hij zei "ik zie \'t huis en zo\'n boom" - en ging... Het lab loopt 21-26 september, 10:00-12:00. Meer ->';
    readonly quotes: readonly [readonly ["“", "”"], readonly ["‘", "’"]];
    readonly elisions: readonly ["s", "m", "t"];
    readonly reviewed: false;
}, {
    readonly code: 'sv';
    readonly name: 'Swedish (svenska)';
    readonly sample: 'Han sa "vi är här" - och gick... Kursen pågår 21-26 september, 10:00-12:00. Läs mer ->';
    readonly quotes: readonly [readonly ["”", "”"], readonly ["’", "’"]];
    readonly sameMarkQuotes: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '–';
    };
    readonly sentenceDash: '–';
    readonly reviewed: false;
}, {
    readonly code: 'ro';
    readonly name: 'Romanian (română)';
    readonly sample: 'A spus "suntem aici" - și a plecat... Cursul este între 21-26 septembrie, 10:00-12:00. Citește mai mult ->';
    readonly quotes: readonly [readonly ["„", "”"], readonly ["«", "»"]];
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '–';
    };
    readonly sentenceDash: '–';
    readonly reviewed: false;
}, {
    readonly code: 'hu';
    readonly name: 'Hungarian (magyar)';
    readonly sample: 'Azt mondta "itt vagyunk" - és elment... A tábor szeptember 21-26., 10:00-12:00. Tovább ->';
    readonly quotes: readonly [readonly ["„", "”"], readonly ["»", "«"], readonly ["’", "’"]];
    readonly turnedPairs: readonly [readonly ["»", "«"]];
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '–';
    };
    readonly sentenceDash: '–';
    readonly reviewed: false;
}, {
    readonly code: 'es';
    readonly name: 'Spanish (español)';
    readonly sample: '¿Dijo "ya estamos aquí" - y se fue...? El laboratorio dura 21-26 de septiembre, 10:00-12:00. Leer más ->';
    readonly quotes: readonly [readonly ["«", "»"], readonly ["“", "”"], readonly ["‘", "’"]];
    readonly openers: '¿¡';
    readonly abbreviations: {
        readonly together: readonly ["EE. UU.", "JJ. OO.", "a. m.", "p. m.", "N. B."];
        readonly bind: readonly ["Sr"];
        readonly page: readonly ["p", "pp"];
    };
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '—';
        readonly attached: true;
    };
    readonly reviewed: false;
}, {
    readonly code: 'it';
    readonly name: 'Italian (italiano)';
    readonly sample: 'Disse "siamo qui" - e uscì... Il laboratorio dura 21-26 settembre, 10:00-12:00. Leggi di più ->';
    readonly quotes: readonly [readonly ["«", "»"], readonly ["“", "”"], readonly ["‘", "’"]];
    readonly abbreviations: {
        readonly together: readonly ["p. es.", "ad es.", "op. cit."];
        readonly page: readonly ["n", "pag", "pagg", "art", "par", "parr", "vol", "voll"];
    };
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly truncations: readonly ["da", "di", "fa", "sta", "va", "po", "be", "mo", "pie", "que"];
    readonly reviewed: false;
}, {
    readonly code: 'pt';
    readonly name: 'Portuguese (português)';
    readonly sample: 'Ele disse "estamos aqui" - e saiu... O laboratório dura 21-26 de setembro, 10:00-12:00. Ler mais ->';
    readonly quotes: readonly [readonly ["«", "»"], readonly ["“", "”"], readonly ["‘", "’"]];
    readonly abbreviations: {
        readonly together: readonly ["p. ex.", "a. C.", "d. C.", "N. B.", "P. S.", "S. A.", "S. M."];
        readonly bind: readonly ["Av"];
        readonly page: readonly ["p", "cap", "fig", "vol"];
    };
    readonly percentSpace: true;
    readonly currencySpace: false;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly reviewed: false;
}, {
    readonly code: 'ga';
    readonly name: 'Irish (Gaeilge)';
    readonly sample: 'Dúirt sé "tá mé anseo" - agus d\'imigh sé... Mairfidh an obair 21-26 Meán Fómhair, 10:00-12:00. Léigh tuilleadh ->';
    readonly quotes: readonly [readonly ["‘", "’"], readonly ["“", "”"], readonly ["‘", "’"]];
    readonly percentSpace: true;
    readonly currencySpace: false;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: '.';
    };
    readonly reviewed: false;
}, {
    readonly code: 'mt';
    readonly name: 'Maltese (Malti)';
    readonly sample: 'Qal "jien hawn" - u telaq... Ix-xogħol idum 21-26 Settembru, 10:00-12:00. Aqra aktar ->';
    readonly quotes: readonly [readonly ["“", "”"], readonly ["‘", "’"]];
    readonly abbreviations: {
        readonly page: readonly ["p", "pp"];
        readonly bare: readonly ["Nru"];
    };
    readonly percentSpace: true;
    readonly currencySpace: false;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: '.';
    };
    readonly truncations: readonly ["ta", "ma"];
    readonly reviewed: false;
}, {
    readonly code: 'bg';
    readonly name: 'Bulgarian (български)';
    readonly sample: 'Той каза "тръгваме към гората" - и си тръгна... Лабораторията работи 21-26 септември, 10:00-12:00, 5% отстъпка. Още ->';
    readonly quotes: readonly [readonly ["„", "“"]];
    readonly abbreviations: {
        readonly page: readonly ["стр"];
    };
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly reviewed: false;
}, {
    readonly code: 'hr';
    readonly name: 'Croatian (hrvatski)';
    readonly sample: 'Rekao je "idemo u šumu" - i otišao... Laboratorij radi 21-26. rujna, 10:00-12:00, popust 15%. Više ->';
    readonly quotes: readonly [readonly ["„", "”"], readonly ["‚", "’"], readonly ["‚", "’"]];
    readonly abbreviations: {
        readonly page: readonly ["br", "str"];
    };
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '–';
    };
    readonly sentenceDash: '–';
    readonly reviewed: false;
}, {
    readonly code: 'sl';
    readonly name: 'Slovenian (slovenščina)';
    readonly sample: 'Rekel je "gremo v gozd" - in odšel... Laboratorij deluje 21-26 septembra, 10:00-12:00, 15% popusta. Več ->';
    readonly quotes: readonly [readonly ["„", "“"], readonly ["‚", "‘"], readonly ["‚", "‘"]];
    readonly sentenceDash: '–';
    readonly sentenceDashLiterary: '–';
    readonly abbreviations: {
        readonly page: readonly ["št", "str"];
    };
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '–';
    };
    readonly reviewed: false;
}, {
    readonly code: 'lt';
    readonly name: 'Lithuanian (lietuvių)';
    readonly sample: 'Jis pasakė "štai mes" - ir išėjo... Seminaras vyks rugsėjo 21-26 d., 10:00-12:00, t. y. šią savaitę. Skaityti daugiau ->';
    readonly quotes: readonly [readonly ["„", "“"]];
    readonly abbreviations: {
        readonly together: readonly ["l. e. p.", "t. y.", "t. t.", "š. m.", "a. k.", "b. k.", "e. p.", "A. V."];
        readonly bind: readonly ["Nr", "dr"];
        readonly page: readonly ["p", "pav", "tel"];
    };
    readonly sentenceDash: '–';
    readonly percentSpace: true;
    readonly currencySpace: false;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '–';
    };
    readonly reviewed: false;
}, {
    readonly code: 'lv';
    readonly name: 'Latvian (latviešu)';
    readonly sample: 'Viņš teica "mēs esam šeit" - un aizgāja... Seminārs notiks 21-26. septembrī, 10:00-12:00, t. i. šonedēļ. Lasīt vairāk ->';
    readonly quotes: readonly [readonly ["“", "”"]];
    readonly abbreviations: {
        readonly together: readonly ["u. tml.", "u. c.", "t. i.", "š. g.", "v. i.", "z. v.", "P. S."];
        readonly bind: readonly ["Nr"];
    };
    readonly sentenceDash: '–';
    readonly percentSpace: true;
    readonly currencySpace: false;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly reviewed: false;
}, {
    readonly code: 'et';
    readonly name: 'Estonian (eesti)';
    readonly sample: 'Ta ütles "me oleme siin" - ja läks... Seminar kestab 21-26 septembrini, 10:00-12:00, 5% rohkem. Loe edasi ->';
    readonly quotes: readonly [readonly ["„", "“"]];
    readonly sentenceDash: '–';
    readonly abbreviations: {
        readonly bare: readonly ["nr", "lk"];
    };
    readonly percentSpace: true;
    readonly currencySpace: false;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly reviewed: false;
}, {
    readonly code: 'da';
    readonly name: 'Danish (dansk)';
    readonly sample: 'Hun sagde "vi er her" - og gik... Kurset løber 21-26 september, fra kl. 10.00. Læs mere ->';
    readonly quotes: readonly [readonly ["»", "«"]];
    readonly turnedPairs: readonly [readonly ["»", "«"]];
    readonly abbreviations: {
        readonly bind: readonly ["nr", "stk", "kl", "mio", "mia"];
        readonly page: readonly ["s"];
    };
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly reviewed: false;
}, {
    readonly code: 'fi';
    readonly name: 'Finnish (suomi)';
    readonly sample: 'Hän sanoi "olemme täällä" - ja lähti... Kurssi kestää 21-26 syyskuuta, 10:00-12:00. Lue lisää ->';
    readonly quotes: readonly [readonly ["”", "”"], readonly ["’", "’"]];
    readonly sameMarkQuotes: true;
    readonly abbreviations: {
        readonly bind: readonly ["p", "v", "mrd"];
        readonly page: readonly ["s"];
        readonly bare: readonly ["klo", "nro"];
    };
    readonly sentenceDash: '–';
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly dialogueDash: {
        readonly mark: '–';
    };
    readonly reviewed: false;
}, {
    readonly code: 'el';
    readonly name: 'Greek (Ελληνικά)';
    readonly sample: 'Είπε "είμαστε εδώ" - και έφυγε... Το μάθημα διαρκεί 21-26 Σεπτεμβρίου, 10:00-12:00. Διάβασε περισσότερα ->';
    readonly quotes: readonly [readonly ["«", "»"], readonly ["“", "”"], readonly ["‘", "’"]];
    readonly abbreviations: {
        readonly bind: readonly ["αριθ", "βλ", "δισ", "εκατ", "κ"];
        readonly page: readonly ["σ", "σελ"];
    };
    readonly percentSpace: true;
    readonly currencySpace: true;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly reviewed: false;
}];
/** Every language code, derived from the packs. */
export type Lang = (typeof PACKS)[number]['code'];
/** A pack by language code. */
export declare const PACK: Readonly<Record<Lang, LangPack>>;
