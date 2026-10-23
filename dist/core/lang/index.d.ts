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
    readonly reviewed: false;
    readonly sources: readonly ["https://commission.europa.eu/system/files/2023-11/styleguide_english_dgt_en.pdf", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: "Display register uses “…” with ‘…’ inside, as CLDR gives English; British quotes (‘…’ with “…” inside) are the literary register; quoteStyle: 'guillemets' sets the former house style, «…» with „…“ inside. Digits of a number of five or more are grouped with a comma (opt-in rule number.group): the EU English Style Guide sets a hard space in running text and allows a comma for web writing, promotional material and press releases, which is what this engine is for. The separator is the pack field numbers.group (a no-break space is the EU form).";
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
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly elisions: readonly ["em", "til", "till", "cause", "bout", "round", "tis", "twas", "cos", "n"];
    readonly numbers: {
        readonly group: ' ';
        readonly decimal: ',';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://www.pravopys.net/sections/125/", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: 'The literary register keeps the display quotes; the dialogue dash (an em dash and a no-break space) is set in both registers. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a paragraph of direct speech opens with тире (Український правопис § 125, the 1993 rules as published on pravopys.net; the 2019 edition could not be read).';
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
    readonly sources: readonly ["https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: 'The other German style, `„outer ‚inner‘ outer“`, is a literary profile that does not exist yet. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; a point is not used for thousands. The decimal mark is a comma.';
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
    readonly dialogueDash: {
        readonly mark: '—';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://sjp.pwn.pl/poradnia/haslo/Pauza-dialogowa-a-myslnik;18816.html", "https://sjp.pwn.pl/poradnia/haslo/Sieroty-na-koncu-wiersza;18684.html", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: 'One-letter conjunctions and prepositions are bound to the next word. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a line of dialogue opens with the same dash as a break in the sentence, pauza or półpauza, spaced (PWN Poradnia, A. Wolański, "Pauza dialogowa a myślnik"); the engine uses the em dash it uses for a break.';
}, {
    readonly code: 'fr';
    readonly name: 'French (français)';
    readonly sample: 'Il a dit "nous voilà" - et il est parti... Le labo dure 21-26 septembre, 10:00-12:00. Lire la suite ->';
    readonly quotes: readonly [readonly ["« ", " »"], readonly ["“", "”"]];
    readonly percentSpace: true;
    readonly currencySpace: true;
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
        readonly decimal: '.';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://www.bk.admin.ch/bk/de/home/dokumentation/sprachen/hilfsmittel-textredaktion/schreibweisungen.html", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: 'Swiss German quotes: `«outer ‹inner› outer»`, without spaces inside, as the Swiss Federal Chancellery Schreibweisungen set them. CLDR gives `„…“` and `‚…‘` for de-CH, so the choice stays disputed (resources/sources.md). Germany’s turned `»…«` is not read here. The abbreviation lists, the spaced en dash and the no-break space before % and € are German’s (the de pack), not checked against a Swiss guide. Digits are grouped with a no-break space (number.group): the Schreibweisungen (Rz. 512) group digits in threes with a Festabstand (no-break space). Everyday Swiss usage often writes the apostrophe (1’000’000); it is not used here (the separator is the pack field numbers.group). The decimal mark is a point (Rz. 514, 543 for francs). The Schreibweisungen page was not readable when this was written: the passage numbers (Rz. 512, 514, 543) come from its index and the PDF text, and the pack stays reviewed: false.';
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
        readonly decimal: '.';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://www.bk.admin.ch/bk/de/home/dokumentation/sprachen/hilfsmittel-textredaktion/schreibweisungen.html", "https://vitrinelinguistique.oqlf.gouv.qc.ca/23371/la-ponctuation/tiret/le-tiret-dans-les-dialogues", "https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures"];
    readonly notes: 'Swiss French quotes: `«outer ‹inner› outer»`, without the no-break space inside that the fr pack sets, as the former ch pack set them from the Swiss Federal Chancellery Schreibweisungen (the German edition; no French Swiss guide was read). CLDR has the same marks for fr-CH. No space is set before `; ! ?` and `:`: the rule that spaces them (SPACE_BEFORE_HIGH in src/core/extra.ts) lists `fr` only, and whether Swiss French sets one is unverified. Dialogue is quoted here (no dialogueDash), unlike the fr pack: the OQLF source on dialogue dashes is cited with the fr sources, but no dialogue dash is set, and either choice is unverified for Switzerland. The no-break space before % and € is French’s (the fr pack), not checked against a Swiss guide. Digits are grouped with a no-break space (number.group) and the decimal mark is a point, as the Schreibweisungen set for federal texts (Rz. 512, 514, 543 for francs); those passages were read in the German edition, from its index and the PDF text, not on the page itself, and the pack stays reviewed: false. Everyday Swiss usage often writes the apostrophe (1’000’000); it is not used here.';
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
    readonly sources: readonly ["https://prirucka.ujc.cas.cz/?id=165", "https://prirucka.ujc.cas.cz/?slovo=uvozovky", "https://prirucka.ujc.cas.cz/?id=880", "https://prirucka.ujc.cas.cz/?slovo=procento", "https://prirucka.ujc.cas.cz/?slovo=poml%C4%8Dka", "https://en.wikipedia.org/wiki/Quotation_mark"];
    readonly notes: string;
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
    readonly sources: readonly ["https://www.juls.savba.sk/ediela/psp2000/psp.pdf", "https://www.teraz.sk/slovencina/slovencina-ako-pouzivat-slovenske/348361-clanok.html", "https://touchit.sk/jazykove-okienko-ako-je-to-s-pisanim-cisloviek/127957/", "https://tvorim.net/typografia/72-pisanie-zaverecnych-prac-a-tvorba-casopisov", "https://sk.wikibooks.org/wiki/Pomoc:Štylistická_príručka", "https://en.wikipedia.org/wiki/Quotation_mark"];
    readonly notes: string;
}, {
    readonly code: 'nl';
    readonly name: 'Dutch (Nederlands)';
    readonly sample: 'Hij zei "ik zie \'t huis en zo\'n boom" - en ging... Het lab loopt 21-26 september, 10:00-12:00. Meer ->';
    readonly quotes: readonly [readonly ["“", "”"], readonly ["‘", "’"]];
    readonly elisions: readonly ["s", "m", "t"];
    readonly reviewed: false;
    readonly sources: readonly ["https://taaladvies.net/dubbele-of-enkele-aanhalingstekens-bij-een-citaat/", "https://nl.wikipedia.org/wiki/Aanhalingsteken", "https://nl.wikipedia.org/wiki/Apostrof_in_de_Nederlandse_spelling", "https://www.vlaanderen.be/team-taaladvies/taaladviezen/apostrof-taalkundige-term-gebruik", "https://www.vlaanderen.be/team-taaladvies/taaladviezen/procentteken-spatie", "https://en.wikipedia.org/wiki/Quotation_mark"];
    readonly notes: string;
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
    readonly sources: readonly ["https://frageladan.isof.se/visasvar.py?svar=52014", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages", "https://frageladan.isof.se/visasvar.py?svar=46237", "https://commission.europa.eu/resources/europa-web-guide/design-content-and-development/content/web-writing-guidelines/dates-numbers-and-symbols_en"];
    readonly notes: 'Quotes: ”…” with ’…’ inside (EU Publications Office table; Frågelådan, Institutet för språk och folkminnen, says an inner quotation takes single marks). The same mark opens and closes, so a quotation is read by where each mark stands, not by pairing. The alternative »…» (same mark both sides) is not implemented. Numbers: a no-break space groups thousands and the decimal mark is a comma (Commission web-writing guide, which names no Swedish rule beyond "all other languages"). Not implemented, not verified: % and currency spacing, abbreviations, one-letter words, the sentence dash; the Interinstitutional Style Guide chapters and Svenska skrivregler could not be read. Dialogue and the sentence dash: a tankstreck on a new line opens each turn, common in news and fiction (Isof Frågelådan, "Kan man markera anföring med tankstreck?"); the tankstreck is the en dash.';
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
    readonly sources: readonly ["https://dexonline.ro/article/09._Linia_de_dialog_%C8%99i_de_pauz%C4%83", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages", "https://commission.europa.eu/resources/europa-web-guide/design-content-and-development/content/web-writing-guidelines/dates-numbers-and-symbols_en"];
    readonly notes: 'Quotes: „…” with «…» inside, the third level „…” again (EU Publications Office table). The Academy (Îndreptar, DOOM) text could not be read, so the national authority is not cited. Numbers: a no-break space groups thousands and the decimal mark is a comma (Commission web-writing guide). Not implemented, not verified: % and currency spacing, abbreviations, one-letter words, the sentence dash. Dialogue and the sentence dash: the linia de dialog opens each turn and a spaced linie de pauză sets off the words of the author (Îndreptarul ortografic, 5th ed., §§ 275–281, on dexonline); a dash together with quotation marks is called wrong. The examples show the en dash.';
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
    readonly sources: readonly ["https://helyesiras.mta.hu/helyesiras/default/akh12", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages", "https://folyoirat.ludovika.hu/index.php/hadmernok/libraryFiles/downloadPublic/145", "https://commission.europa.eu/resources/europa-web-guide/design-content-and-development/content/web-writing-guidelines/dates-numbers-and-symbols_en"];
    readonly notes: 'Quotes: „…” with »…« inside and ’…’ at the third level (EU Publications Office table); a Hungarian journal guide that follows A magyar helyesírás szabályai, 12th ed., gives `„idézet »belső idézet« idézet vége”`. The MTA rules themselves could not be read. Numbers: a no-break space groups thousands and the decimal mark is a comma (Commission web-writing guide). Not implemented, not verified: % and currency spacing, abbreviations, one-letter words, the sentence dash. Dialogue and the sentence dash: fiction marks dialogue with a gondolatjel, not quotes, and a spaced gondolatjel sets off the attribution (A magyar helyesírás szabályai, 12th ed., rule 259); the rules set the en dash.';
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
    readonly sources: readonly ["https://www.rae.es/ortograf%C3%ADa/otros-usos-de-la-raya", "https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0002.03/DOC_1 (Libro de estilo interinstitucional, PDF of 19 April 2022: 4.2.3 niveles de comillas, 6.4 espaciado de los signos de puntuación, 6.5 puntuación en las cifras, 7.3.3 referencias monetarias, 10.1.8 raya, 10.1.11 interrogación y exclamación, 10.1.12 comillas, 10.3.1.4 tantos por ciento, 10.4 abreviaturas)", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: es «…» “…” ‘…’)", "https://es.wikipedia.org/wiki/Comillas (cross-check only: it reports the RAE order «…“…‘…’…”…» and the Mexican Academy order “…‘…«…»…’…”; the RAE pages themselves, rae.es, answered 403 and were not read)"];
    readonly notes: string;
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
    readonly reviewed: false;
    readonly sources: readonly ["https://www.treccani.it/magazine/lingua_italiana/articoli/scritto_e_parlato/punteggiatura9.html", "https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0021.01/DOC_1 (Manuale interistituzionale di convenzioni redazionali, PDF of 19 April 2022: 4.2.3 livelli di virgolette, apostrofo and spazi fissi, 6.4 spaziatura dei segni d’interpunzione, 6.5 interpunzione nelle cifre, 10.1.7 virgolette, 10.1.10 lineetta, allegato A3 abbreviazioni)", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: it «…» “…” ‘…’)", "https://www.treccani.it/enciclopedia/virgolette_(Enciclopedia-dell'Italiano)/ (Enciclopedia dell’italiano: virgolette basse, alte, singole; the usual order is bassa for the first quotation and alta for those inside)", "https://www.treccani.it/enciclopedia/apostrofo_(Enciclopedia-dell'Italiano)/ (Enciclopedia dell’italiano: apostrofo for elision l’amica, truncation po’, dropped digits of a year ’48)", "https://en.wikipedia.org/wiki/Quotation_mark (cross-check only: Italian «…» “…”)"];
    readonly notes: string;
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
    readonly sources: readonly ["https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/travessao-no-discurso-directo/8747", "https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0008.01/DOC_1 (Código de Redação Interinstitucional, Portuguese of Portugal, PDF of 19 April 2022: 4.2.3 níveis de aspas and espaço protegido, 6.4 espaçamento dos sinais de pontuação, 6.5 pontuação nos números, 10.4.8 travessão, 10.4.10 aspas, anexo A3 abreviaturas)", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: pt «…» “…” ‘…’)", "https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/o-uso-das-aspas--e-/13051 (Ciberdúvidas da Língua Portuguesa: «…» for quotation, “…” for a quotation inside a transcription, ‘…’ for a third level; example `«O chefe disse ao seu subordinado: “Disfarce quando ouvir a palavra ‘relatório’, combinado?”»`)", "https://pt.wikipedia.org/wiki/Aspas (cross-check only: Portugal «…», Brazil “…” ‘…’)"];
    readonly notes: string;
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
    readonly sources: readonly ["https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: ga ‘…’ “…” ‘…’)", "https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0015.01/DOC_1 (Interinstitutional Style Guide, Maltese edition, PDF of 19 April 2022: 6.4 spacing table with %, 6.5 \"in Maltese, English and Irish publications a point separates whole numbers from decimals\" and a space marks thousands, 7 euro: \"the same rule applies in English and Irish\"; it is evidence about Irish only through those statements)", "https://knowledge-centre-translation-interpretation.ec.europa.eu/en/content/guidelines-translating-eu-documents-irish (Knowledge Centre for Translation and Interpretation: points to the Irish ISG at style-guide.europa.eu/ga and to the An Gúm and Foras na Gaeilge guides; their text was not read)", "https://en.wikipedia.org/wiki/Quotation_mark (cross-check only: lists Irish with “…” first and ‘…’ inside, the opposite of the Publications Office table)"];
    readonly notes: string;
}, {
    readonly code: 'mt';
    readonly name: 'Maltese (Malti)';
    readonly sample: 'Qal "jien hawn" - u telaq... Ix-xogħol idum 21-26 Settembru, 10:00-12:00. Aqra aktar ->';
    readonly quotes: readonly [readonly ["“", "”"], readonly ["‘", "’"]];
    readonly abbreviations: {
        readonly page: readonly ["p", "pp"];
    };
    readonly percentSpace: true;
    readonly currencySpace: false;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: '.';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0015.01/DOC_1 (Il-Gwida tal-Istil Interistituzzjonali, PDF of 19 April 2022: 4.2.3 virgoletti, apostrofu and spazji fissi, 5.10 kwotazzjonijiet, 6.4 sinjali tal-punteġġatura u l-ispazji, 6.5 punteġġatura fiċ-ċifri, 7 euro)", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: mt “…” ‘…’ “…”)", "https://en.wikipedia.org/wiki/Quotation_mark (cross-check only: Maltese “…” ‘…’)"];
    readonly notes: string;
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
    readonly sources: readonly ["https://ibl.bas.bg/ezikovispravki/vaprosi/pri-tsitirane-i-pryaka-rech-10/2266", "https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0011.01/DOC_1 (Междуинституционално ръководство за оформяне на текстове, Bulgarian ISG, PDF of 19 April 2022: 4.2.3 кавички and числа and неделими интервали, 6.4 разстояние между знаците, 6.5 изписване на числата, 7.3.3 парични единици, 10.1.7 кавички, 10.1.8 тире, 10.4.2 съкращения)"];
    readonly notes: string;
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
    readonly sources: readonly ["https://pravopis.hr/pravilo/pravopisni-znakovi-u-upravnome-govoru/72/", "https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0023.01/DOC_1 (Međuinstitucijski stilski priručnik, Croatian ISG, PDF of 19 April 2022: 4.2.3 navodnici, 6.4 interpunkcija i razmaci, 6.5 interpunkcija unutar brojeva, 7.3.3 pravila pisanja monetarnih jedinica, 10.1.8 navodnici, 10.1.10 crtica, 10.1.12 nedjeljivi razmaci, 10.7 kratice)"];
    readonly notes: string;
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
    readonly sources: readonly ["https://www.fran.si/134/slovenski-pravopis/datoteke/Pravopis_Pravila.pdf", "https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0010.01/DOC_1 (Medinstitucionalni slogovni priročnik, Slovenian ISG, PDF of 19 April 2022: 4.2.3 narekovaji, števila and nedeljivi presledki, 6.4 ločila in presledki, 6.5 postavljanje ločil v številih, 7.3.3 denarne enote, 10.1.6 narekovaj, 10.1.7 pomišljaj, 10.8 razno)"];
    readonly notes: string;
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
    readonly sources: readonly ["https://emokykla.lt/upload/files/2024/07/08/liet-k-skyryba.pdf", "https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0012.01/DOC_1 (Leidinių rengimo vadovas, Lithuanian PDF of 19 April 2022, read as text with pdfjs: 4.2.3 teksto rengimas (kabutės, apsaugotieji tarpai, skaičiai), 6.4 skyrybos ženklai ir tarpai, 6.5 skaitmenų skyryba, 10.1.4 brūkšnys, 10.1.5 brūkšnelis, 10.1.7 kabutės, 10.1.8 tarpas, 10.3.9 sutrumpinimai ir santrumpos)", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: lt „…“ at all three levels)"];
    readonly notes: string;
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
    readonly sources: readonly ["https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0024.01/DOC_1 (Publikāciju noformēšanas rokasgrāmata, Latvian PDF of 19 April 2022, read as text with pdfjs: 4.2.3 teksta sagatavošana (pēdiņas, saistītās atstarpes, skaitļi), 6.4 interpunkcijas zīmes un atstarpes, 6.5 interpunkcija skaitļos, 10.1.6 pēdiņas, 10.1.7 domuzīme, 10.7 saīsinājumi, simboli un akronīmi)", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: lv “…” at all three levels)"];
    readonly notes: string;
}, {
    readonly code: 'et';
    readonly name: 'Estonian (eesti)';
    readonly sample: 'Ta ütles "me oleme siin" - ja läks... Seminar kestab 21-26 septembrini, 10:00-12:00, 5% rohkem. Loe edasi ->';
    readonly quotes: readonly [readonly ["„", "“"]];
    readonly sentenceDash: '–';
    readonly percentSpace: true;
    readonly currencySpace: false;
    readonly numbers: {
        readonly group: " ";
        readonly decimal: ',';
    };
    readonly reviewed: false;
    readonly sources: readonly ["https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0013.01/DOC_1 (Väljaannete stiilijuhend, Estonian PDF of 19 April 2022, read as text with pdfjs: 4.2.3 teksti ettevalmistamine (jutumärgid, liikumatud sõnavahed, numbrid), 5.10 tsitaadid, 6.4 kirjavahemärgid ja sõnavahe, 6.5 kirjavahemärgid arvudes, 10.1.6 jutumärgid, 10.1.7 mõtte- ja sidekriips, 10.7 mitmesugust, lisa A3 lühendid ja sümbolid)", "https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: et „…“ at all three levels)"];
    readonly notes: string;
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
    readonly sources: readonly ["https://ro.dsn.dk/?paragraf=59&type=rulesearch", "https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0022.01/DOC_1 (Vejledning i Udformning af EU-Publikationer, PDF of 19 April 2022: 4.2.3 anførselstegn og tal, 6.4 mellemrum i forbindelse med tegnsætning, 6.5 tegnsætning i tal, 10.1 diverse regler, 10.2 tal og datoer, bilag A3 forkortelser)"];
    readonly notes: string;
}, {
    readonly code: 'fi';
    readonly name: 'Finnish (suomi)';
    readonly sample: 'Hän sanoi "olemme täällä" - ja lähti... Kurssi kestää 21-26 syyskuuta, 10:00-12:00. Lue lisää ->';
    readonly quotes: readonly [readonly ["”", "”"], readonly ["’", "’"]];
    readonly sameMarkQuotes: true;
    readonly abbreviations: {
        readonly bind: readonly ["p", "v", "mrd"];
        readonly page: readonly ["s"];
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
    readonly sources: readonly ["https://kielitoimistonohjepankki.fi/ohje/lainausmerkit-ja-vuorosanaviiva/", "https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0017.01/DOC_1 (Toimielinten yhteiset tekstinlaadinnan ohjeet, PDF of 19 April 2022: 4.2.3 tekstin valmistelu, 6.4 välilyönnit välimerkkien yhteydessä, 6.5 välit ja välimerkit numeroissa, 10.2.1 numerot, 10.4.5 lainausmerkit, 10.4.8 ajatusviiva, 10.7.1 lyhenteet)", "https://kotus.fi/joudutko-lainaamaan-kieli-keskella-suuta/ (Kotus: an inner quotation takes puolilainausmerkit ’…’, the same character as the apostrophe)", "https://kielitoimistonohjepankki.fi/ohje/lainausmerkit-ja-suora-lainaus/ (Kielitoimiston ohjepankki: ”…” at both ends, examples)"];
    readonly notes: string;
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
    readonly sources: readonly ["https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0016.01/DOC_1 (Διοργανικό εγχειρίδιο σύνταξης κειμένων, PDF of 19 April 2022: 4.2.3 σύνταξη του κειμένου (εισαγωγικά, απόστροφοι), 6.4 διαστήματα και σημεία στίξης, 6.5 αριθμοί και σημεία στίξης, 10.1.3 άνω τελεία, 10.1.7 εισαγωγικά, 10.1.8 ενωτικό, παύλα, 10.6 συντομογραφίες, παράρτημα A3 συντομογραφίες)"];
    readonly notes: string;
}];
/** Every language code, derived from the packs. */
export type Lang = (typeof PACKS)[number]['code'];
/** A pack by language code. */
export declare const PACK: Readonly<Record<Lang, LangPack>>;
