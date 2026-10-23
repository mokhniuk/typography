/**
 * The registry of why each rule exists: a bibliography (SOURCES) and one decision
 * record per rule (RULE_SOURCES). `render()` is the Markdown page; the HTML page is
 * `renderHtml()` in sources-html.ts. `bun run docs:sources` (gen-sources.ts) writes both.
 *
 * Every source is read before it is entered here; nothing is cited from memory.
 * A rule whose decision is not yet backed by a source read stays `general-knowledge`,
 * so the gap shows. Imports only from ../src and node:, so the package stays liftable.
 */
import { type Lang, RULES } from '../src';

export type Source = {
  /** `cldr-quotes`, `chicago-17`, `bringhurst`. */
  id: string;
  kind: 'standard' | 'style-guide' | 'orthography' | 'research' | 'tool';
  /** Who wrote or publishes it, as the source says; "not named" when the page names nobody. */
  author: string;
  /** The work's own title, without the section. */
  title: string;
  /** What the source is and why it counts, in a sentence or two. */
  about: string;
  /** Author, title, edition, year, section. */
  cite: string;
  url?: string;
  /** ISO date on which the source was read. */
  accessed: string;
  /**
   * How the text was read: `raw` is the data or file itself, `summary` is a page as
   * summarised by a fetch tool. A `summary` source is checked by hand before it is trusted.
   */
  readVia: 'raw' | 'summary';
  /** What it says that we rely on, in one sentence. */
  claim: string;
};

export type Decision = {
  /** Ids from SOURCES. */
  sources: string[];
  /** The reason we do it. */
  why: string;
  /** What others do (other guides, typograf, typopo) and why we do not. */
  alternative: string;
  confidence: 'verified' | 'general-knowledge' | 'disputed';
  /** Source ids that apply to one language only, where languages differ. */
  langs?: Partial<Record<Lang, string[]>>;
};

export const SOURCES: readonly Source[] = [
  {
    id: 'cldr-delimiters',
    kind: 'standard',
    author: 'Unicode Consortium (CLDR project)',
    title: 'CLDR 46 locale data: delimiters (cldr-misc-full 46.0.0)',
    about:
      'The quotation marks every major platform uses per locale, as published by the Unicode Common Locale Data Repository. A reference for what software sets by default, not a printed style guide.',
    cite: 'Unicode CLDR 46, cldr-misc-full 46.0.0, main/<locale>/delimiters.json (quotationStart, quotationEnd, alternateQuotationStart, alternateQuotationEnd), locales en, uk, de, pl, fr, de-CH, fr-CH.',
    url: 'https://cdn.jsdelivr.net/npm/cldr-misc-full@46.0.0/main/de-CH/delimiters.json',
    accessed: '2026-10-20',
    readVia: 'raw',
    claim:
      'Per locale: en “ ” and ‘ ’; uk « » and „ “; de „ “ and ‚ ‘; pl „ ” and « »; fr « » and « »; de-CH „ “ and ‚ ‘; fr-CH « » and ‹ ›.',
  },
  {
    id: 'butterick-dashes',
    kind: 'style-guide',
    author: 'Matthew Butterick (the page itself names no author)',
    title: 'Practical Typography: Hyphens and dashes',
    about:
      'An English-language typography handbook for working writers. Covers hyphen, en dash, em dash and minus; written for English text, so it says nothing about German or Ukrainian dash use.',
    cite: 'Matthew Butterick, Practical Typography, "Hyphens and dashes" (web page; no edition or year on the page).',
    url: 'https://practicaltypography.com/hyphens-and-dashes.html',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'The em dash marks a break within a sentence; em and en dashes are normally set without spaces, and adding a space on each side is acceptable when they look crushed; the en dash is for ranges of values.',
  },
  {
    id: 'butterick-nbsp',
    kind: 'style-guide',
    author: 'Matthew Butterick (the page itself names no author)',
    title: 'Practical Typography: Nonbreaking spaces',
    about:
      'The same handbook on where to prevent a line break: titles, abbreviations before numbers, section signs and the copyright and trademark symbols. English only; the page does not mention units or initials.',
    cite: 'Matthew Butterick, Practical Typography, "Nonbreaking spaces" (web page; no edition or year on the page).',
    url: 'https://practicaltypography.com/nonbreaking-spaces.html',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'Use a nonbreaking space after § and ¶, after abbreviations such as "Ex." and "Fig." before a letter or number, between a title and a name ("Ms."), and with the trademark and copyright symbols.',
  },
  {
    id: 'butterick-section-marks',
    kind: 'style-guide',
    author: 'Matthew Butterick (the page itself names no author)',
    title: 'Practical Typography: Paragraph and section marks',
    about:
      "The handbook on citing numbered paragraphs and sections with ¶ and §. English only; it says nothing about other languages' conventions for citing statutes, and nothing about a mark typed with no space before the number.",
    cite: 'Matthew Butterick, Practical Typography, "Paragraph and section marks" (web page; no edition or year on the page).',
    url: 'https://practicaltypography.com/paragraph-and-section-marks.html',
    accessed: '2026-10-22',
    readVia: 'summary',
    claim:
      '"A paragraph mark or section mark should always be followed by a nonbreaking space", which "acts like glue that keeps the mark joined with the numeric reference that follows"; "In a reference to multiple paragraphs or sections, double the mark (¶¶ or §§)"; at the start of a sentence, spell the word out instead of using the mark.',
  },
  {
    id: 'nist-si-checklist',
    kind: 'standard',
    author: 'Not named on the page (hosted by NIST at physics.nist.gov)',
    title: 'SI Unit rules and style conventions: Check List for Reviewing Manuscripts',
    about:
      'A checklist of SI writing rules, including the space between a value and its unit. It backs the space itself, not that it must be a no-break space, and covers English-language SI usage only.',
    cite: 'SI Unit rules and style conventions: Check List for Reviewing Manuscripts (web page at physics.nist.gov, items 9, 10, 12 and 15; page names no publisher or year).',
    url: 'https://physics.nist.gov/cuu/Units/checklist.html',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'There is a space between a numerical value and a unit symbol, and between a number and the percent sign ("10 %"); the page does not say the space is nonbreaking.',
  },
  {
    id: 'isg-2022-euro',
    kind: 'style-guide',
    author: 'Publications Office of the European Union (interinstitutional)',
    title:
      'Interinstitutional Style Guide, Greek, Finnish, Italian and Danish editions (PDF of 19 April 2022), part 3, chapter 7 (codes of countries, languages and currencies): position of the euro symbol',
    about:
      "The language editions of the EU institutions' own style guide. The section on currencies sets where the euro code and the euro symbol go beside a figure, in each edition. It binds EU publications, not the national orthographies; it does not say the space is nonbreaking except in the Finnish edition.",
    cite: 'Interinstitutional Style Guide, PDF of 19 April 2022, part 3 (conventions common to all languages), chapter 7, section "Position of the euro symbol (€) in amounts". Editions read: Greek https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0016.01/DOC_1; Finnish https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0017.01/DOC_1; Italian https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0021.01/DOC_1; Danish https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0022.01/DOC_1.',
    url: 'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0021.01/DOC_1',
    accessed: '2026-10-22',
    readVia: 'raw',
    claim:
      'The € symbol follows the figure, separated from it by a space ("una somma di 30 €", "ποσό 30 €", "et beløb på 30 €"; Finnish "30 €", the symbol and code separated from the figure by a fixed space); English, Irish, Maltese and Dutch put it before the figure without a space (€30).',
  },
  {
    id: 'ijp-penezni-castky',
    kind: 'orthography',
    author: 'Ústav pro jazyk český AV ČR',
    title: 'Internetová jazyková příručka: Peněžní částky, značky měn; Zalomení řádků',
    about:
      'The online Czech language handbook of the Czech Academy of Sciences. The money entry covers the koruna sign; the € sign appears there only in a list of symbols, and the line-break entry gives the € example and names the one-letter words that must not end a line.',
    cite: 'Internetová jazyková příručka, "Peněžní částky, značky měn" (id 786) and "Zalomení řádků a nevhodné výrazy na jejich konci" (id 880).',
    url: 'https://prirucka.ujc.cas.cz/?id=880',
    accessed: '2026-10-22',
    readVia: 'summary',
    claim:
      'A number and a currency sign are separated by a space ("100 Kč"; without one the compound reads as an adjective), and a line may not break between the number and the sign of a unit or currency ("1 000 000 Kč, 250 €"), for which a fixed space is advised. A line also may not break after the non-syllabic prepositions "k, s, v, z" ("k mostu", "v Plzni") nor after the syllabic prepositions "o, u" and conjunctions "a, i" ("u babičky", "o páté"); one-character prepositions and conjunctions are not separated from the word that follows. The fetched summary does not mention two-letter prepositions.',
  },
  {
    id: 'pwn-wolanski-sieroty',
    kind: 'orthography',
    author: 'Adam Wolański (PWN Poradnia językowa)',
    title: 'Sieroty na końcu wiersza (PWN Poradnia, 8.06.2018)',
    about:
      'An answer of the PWN language advice service, by the author of the PWN book on text editing, on which one-letter words may not end a line. Read as a fetch-tool summary.',
    cite: 'A. Wolański, "Sieroty na końcu wiersza", Poradnia językowa PWN, 8.06.2018.',
    url: 'https://sjp.pwn.pl/poradnia/haslo/Sieroty-na-koncu-wiersza;18684.html',
    accessed: '2026-10-22',
    readVia: 'summary',
    claim:
      '"W wierszach tekstu, które liczą powyżej 40 znaków, nie należy zasadniczo pozostawiać na końcu wiersza jednoliterowych spójników i przyimków (a, i, o, u, w, z, A, I, O, U, W, Z)." and "Przyimki liczące dwa, trzy i więcej znaków mogą pozostawać na końcu wiersza w tekście zasadniczym." A recommendation for lines over 40 characters; in titles and subheads the words must travel with what they belong to.',
  },
  {
    id: 'ujc-poradna-konec-radku',
    kind: 'orthography',
    author: 'Ústav pro jazyk český AV ČR',
    title: 'Jazyková poradna: category "Výraz na konci řádku"',
    about:
      'Answers of the Czech Academy of Sciences language advice service on what may end a line; the answer #12952 gives the list and its limits, #10683 reports the ČSN norm.',
    cite: 'Jazyková poradna ÚJČ AV ČR, answers #12952, #10683, #10881, #10896, #10907 (category "Výraz na konci řádku"); cites ČSN 01 6910 (Lozan, Pravdová, 2014, 12.6, p. 38) and Pravidla českého pravopisu 1994, §106.',
    url: 'https://dotazy.ujc.cas.cz/odpovedi/?id_otazka=778&filter=1&id_kategorie_otazek=201&id_domena_kategorii_otazek=24&items=20&page=1',
    accessed: '2026-10-22',
    readVia: 'raw',
    claim:
      '#12952: "Na konci řádku by neměly stát jednopísmenné neslabičné předložky k, s, v, z. V hodnocení jednopísmenných slabičných předložek (o, u) a spojek (a, i) se příručky rozcházejí. … Doporučujeme, aby pokud to sazba textu umožňuje, ani tyto výrazy na koncích řádku nezůstávaly… Vícepísmenné výrazy na konci řádku zůstat mohou." #10683: "Norma ČSN 01 6910 uvádí, že by na konci řádku neměly stát jednopísmenné neslabičné předložky k, s, v, z a slabičné předložky o, u. Ostatní předložky na konci řádku stát mohou." (The norm lists k s v z o u, not a i.)',
  },
  {
    id: 'zu-blyzniuk-technical-rules',
    kind: 'research',
    author: 'A. S. Blyzniuk (compiler), Zhytomyr Ivan Franko State University',
    title: 'Основні технічні правила набору текстів',
    about:
      "A university handbook of technical typesetting rules (2012) that reproduces the Soviet-era rules for books and periodicals; not an orthography authority. The url is the PDF's landing page, which links to the PDF. The text layer was decoded by hand, so apostrophes and punctuation are missing in the quotes.",
    cite: 'А. С. Близнюк (упоряд.), "Основні технічні правила набору текстів", Житомирський державний університет імені Івана Франка, 2012.',
    url: 'https://eprints.zu.edu.ua/7122/',
    accessed: '2026-10-22',
    readVia: 'raw',
    claim:
      'Books: "У книжкових виданнях не слід залишати в кінці рядка прийменники та сполучники що починають речення а також однобуквені прийменники та сполучники в середині речень" (a recommendation, "не слід"). Periodicals are looser: one-letter ones inside a sentence are allowed at a line end. No letters are listed and two-letter words are not in the body-text rule.',
  },
  {
    id: 'bipm-si-brochure-9',
    kind: 'standard',
    author: 'Bureau International des Poids et Mesures (BIPM)',
    title: 'The International System of Units (SI), 9th edition (SI Brochure)',
    about:
      'The definitive international reference on the SI, in force since 2019. Section 5.4 sets how the value of a quantity and a number are written. It is a metrology standard: it covers unit symbols and digit grouping, not general prose typography, and it does not say whether a space is nonbreaking.',
    cite: 'BIPM, The International System of Units (SI), 9th edition 2019, version V4.01 of June 2026 (doi 10.59161/AUEZ1291), section 5.4.3 "Formatting the value of a quantity" and 5.4.4 "Formatting numbers, and the decimal marker", pp. 144-145; Appendix 1, 9th CGPM Resolution 7 (1948) and 22nd CGPM Resolution 10 (2003).',
    url: 'https://www.bipm.org/documents/20126/41483022/SI-Brochure-9-EN.pdf',
    accessed: '2026-10-22',
    readVia: 'raw',
    claim:
      'A space always separates a number from its unit symbol, so "30.2 °C" and not "30.2°C"; the only exception is the plane-angle symbols for degree, minute and second, which take no space. Digits may be grouped in threes by a space, never by commas or dots, and a four-digit number is not split.',
  },
  {
    id: 'unicode-names',
    kind: 'standard',
    author: 'Unicode Consortium',
    title: 'The Unicode Standard 18.0.0: NamesList.txt',
    about:
      'The official list of character names and cross-references. It shows that the minus sign and the multiplication sign are distinct characters; it does not say when typographers should use them.',
    cite: 'The Unicode Standard 18.0.0, NamesList-18.0.0.txt (generated 2026-08-10), entries U+2212 and U+00D7.',
    url: 'https://www.unicode.org/Public/UNIDATA/NamesList.txt',
    accessed: '2026-10-20',
    readVia: 'raw',
    claim:
      'U+2212 MINUS SIGN and U+00D7 MULTIPLICATION SIGN are characters of their own, cross-referenced to hyphen-minus (U+002D) and to latin small letter x (U+0078) as different characters.',
  },
  {
    id: 'cldr-numbers',
    kind: 'standard',
    author: 'Unicode Consortium (CLDR project)',
    title: 'CLDR 46 locale data: numbers (cldr-numbers-full 46.0.0)',
    about:
      'How each locale formats percentages and currency amounts, including the space before the sign. Describes software output, not a printed style guide.',
    cite: 'Unicode CLDR 46, cldr-numbers-full 46.0.0, main/<locale>/numbers.json (percentFormats standard, currencyFormats standard), locales en, uk, de, pl, fr, de-CH, fr-CH.',
    url: 'https://cdn.jsdelivr.net/npm/cldr-numbers-full@46.0.0/main/de/numbers.json',
    accessed: '2026-10-20',
    readVia: 'raw',
    claim:
      'The percent pattern is "#,##0 %" with U+00A0 before the sign in de and fr, and "#,##0%" in en, uk, pl, de-CH and fr-CH; the currency pattern puts U+00A0 between the amount and the currency sign in de, fr, uk, pl and fr-CH.',
  },
  {
    id: 'uax14',
    kind: 'standard',
    author: 'Unicode Consortium (editor Robin Leroy)',
    title: 'UAX #14: Unicode Line Breaking Algorithm, revision 57 (Unicode 18.0.0, 2026-09-01)',
    about:
      'The standard that decides where a line may break. It is the mechanism behind every no-break rule here: it says what a no-break space does, not which words to bind.',
    cite: 'Unicode Standard Annex #14, Unicode Line Breaking Algorithm, revision 57, Unicode 18.0.0, 2026-09-01 (first 100,000 of 141,504 characters read; line-break class tables and rules LB12, LB12a not read in full).',
    url: 'https://www.unicode.org/reports/tr14/',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'U+00A0 NO-BREAK SPACE is class GL and prohibits a break on either side, and is the preferred way to keep two words on a line (a title and a name); U+202F is the same but narrow; the horizontal ellipsis is class IN, so breaks between consecutive ellipses are never allowed.',
  },
  {
    id: 'oqlf-espacement',
    kind: 'style-guide',
    author: 'Office québécois de la langue française (Banque de dépannage linguistique)',
    title: 'Espacement avant et après les signes de ponctuation et les symboles',
    about:
      'The Quebec language office’s table of the spaces around punctuation and symbols in French, last updated 2024. A Quebec authority, so where France or Switzerland differ (a fine space instead of a full no-break space) it does not say so.',
    cite: 'OQLF, Banque de dépannage linguistique, "Espacement avant et après les signes de ponctuation et les symboles" (web page, updated 2024).',
    url: 'https://vitrinelinguistique.oqlf.gouv.qc.ca/22039/la-typographie/espacement/espacement-avant-et-apres-les-signes-de-ponctuation-et-les-symboles',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'In French a no-break space goes inside the guillemets (after « and before »), before %, before $ and €, and before a colon; before ; ! and ? there is no space or a fine space; no space goes before an ellipsis or a comma.',
  },
  {
    id: 'butterick-quotes',
    kind: 'style-guide',
    author: 'Matthew Butterick (the page itself names no author)',
    title: 'Practical Typography: Straight and curly quotes',
    about:
      'The handbook on quotation marks: use curly quotes, keep straight ones only for foot and inch marks and for code. English-centred; it gives no per-language mark sets.',
    cite: 'Matthew Butterick, Practical Typography, "Straight and curly quotes" (web page; no edition or year on the page).',
    url: 'https://practicaltypography.com/straight-and-curly-quotes.html',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'Use curly quotes, never straight ones; foot and inch marks are the exception; fix quotes before apostrophes (a word-initial apostrophe is a closing single curly quote); quote styles vary by language; do not convert quotes in code.',
  },
  {
    id: 'butterick-apostrophes',
    kind: 'style-guide',
    author: 'Matthew Butterick (the page itself names no author)',
    title: 'Practical Typography: Apostrophes',
    about:
      'The handbook on the apostrophe: always the curly closing mark, including at the start of an elided word.',
    cite: 'Matthew Butterick, Practical Typography, "Apostrophes" (web page; no edition or year on the page).',
    url: 'https://practicaltypography.com/apostrophes.html',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'An apostrophe for possession, contraction or an elided start (’70s, ’n’ in rock ’n’ roll) is a curly apostrophe, not an opening single quote; Hawaiian okina is the exception and takes an opening single quote.',
  },
  {
    id: 'butterick-ellipsis',
    kind: 'style-guide',
    author: 'Matthew Butterick (the page itself names no author)',
    title: 'Practical Typography: Ellipses',
    about:
      'The handbook on the ellipsis: the single character, spaced as the writer prefers, with a no-break space where text is on one side only.',
    cite: 'Matthew Butterick, Practical Typography, "Ellipses" (web page; no edition or year on the page).',
    url: 'https://practicaltypography.com/ellipses.html',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'Use the ellipsis character, not three periods with or without spaces; put a no-break space on a side that has no text so the ellipsis stays with its text; do not let the dots split across lines.',
  },
  {
    id: 'butterick-legal',
    kind: 'style-guide',
    author: 'Matthew Butterick (the page itself names no author)',
    title: 'Practical Typography: Trademark and copyright symbols',
    about:
      'The handbook on ©, ® and ™: the real characters, where they sit, and a warning that autocorrecting (c) damages text such as "Section 12(c)".',
    cite: 'Matthew Butterick, Practical Typography, "Trademark & copyright symbols" (web page; no edition or year on the page).',
    url: 'https://practicaltypography.com/trademark-and-copyright-symbols.html',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'Replace (c), (R) and (TM) with ©, ® and ™; no space before ™ or ®; a no-break space between © and the year; do not autocorrect (c) inside citations such as "Section 12(c)".',
  },
  {
    id: 'butterick-math',
    kind: 'style-guide',
    author: 'Matthew Butterick (the page itself names no author)',
    title: 'Practical Typography: Math symbols',
    about:
      'The handbook on mathematical signs: use real symbols, × for multiplication including dimensions. Its minus guidance names the en dash and the HTML entity for the minus sign in the same breath, so it does not settle which character to use.',
    cite: 'Matthew Butterick, Practical Typography, "Math symbols" (web page; no edition or year on the page).',
    url: 'https://practicaltypography.com/math-symbols.html',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'Use × instead of the letter x for multiplication, dimensions such as 8.5″ × 14″ included; for a minus sign use an en dash (and the HTML entity &minus; is listed).',
  },
  {
    id: 'butterick-word-spaces',
    kind: 'style-guide',
    author: 'Matthew Butterick (the page itself names no author)',
    title: 'Practical Typography: Word spaces',
    about:
      'The handbook on spaces between words: one space, also after a full stop. A thin space is offered for initials.',
    cite: 'Matthew Butterick, Practical Typography, "Word spaces" (web page; no edition or year on the page); the companion page "One space between sentences" says the same.',
    url: 'https://practicaltypography.com/word-spaces.html',
    accessed: '2026-10-20',
    readVia: 'summary',
    claim:
      'Use exactly one word space between words and one after a sentence-ending period; a thin space is suitable after the periods in initials such as W. A. Dwiggins.',
  },
  {
    id: 'pravopys-125',
    kind: 'orthography',
    author: 'Ukrainian National Commission on Orthography (the site names no editor)',
    title: 'Український правопис, § 125 «Розділові знаки при прямій мові»',
    about:
      'The Ukrainian orthography rules (the 1993 edition, as published on pravopys.net). The 2019 edition in force has the same section headings, but its text could not be read.',
    cite: 'Український правопис (1993 rules, labelled the 2015 edition on pravopys.net), § 125, points 1 and 3б.',
    url: 'https://www.pravopys.net/sections/125/',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'When direct speech opens a paragraph, a dash (тире) stands before it (— Ти звідки?), and a dash stands before the words of the author (— Тату! татку! — упізнали діти.).',
  },
  {
    id: 'pwn-pauza-dialogowa',
    kind: 'orthography',
    author: 'Adam Wolański, PWN Poradnia Językowa',
    title: 'Pauza dialogowa a myślnik',
    about:
      'An answer in the language advice service of the PWN Polish dictionary, by a typography specialist at the University of Warsaw.',
    cite: 'A. Wolański, "Pauza dialogowa a myślnik", Poradnia Językowa PWN, 14.09.2018.',
    url: 'https://sjp.pwn.pl/poradnia/haslo/Pauza-dialogowa-a-myslnik;18816.html',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'Polish typography does not tell the dialogue dash from the ordinary dash: the same sign, the pauza (—) or the półpauza (–), is used for both, spaced.',
  },
  {
    id: 'rae-raya-dialogos',
    kind: 'orthography',
    author: 'Real Academia Española and ASALE',
    title: 'Ortografía de la lengua española, § 3.4.7.2.1 «En diálogos»',
    about:
      'The orthography of the Spanish academies (2010), online edition; read from a Wayback copy because rae.es refused the fetch.',
    cite: 'RAE/ASALE, Ortografía de la lengua española (2010), § 3.4.7 and § 3.4.7.2.1.',
    url: 'https://www.rae.es/ortograf%C3%ADa/otros-usos-de-la-raya',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'In dialogue the raya (—) precedes each speaker turn and no space is left between the raya and the start of the turn; list items, unlike dialogue, take a space after it.',
  },
  {
    id: 'oqlf-tiret-dialogues',
    kind: 'style-guide',
    author: 'Office québécois de la langue française',
    title:
      'Vitrine linguistique: Le tiret dans les dialogues; Espacement avant et après les signes de ponctuation',
    about:
      'The language advice of the Québec language office (successor of the Banque de dépannage linguistique).',
    cite: 'OQLF, Vitrine linguistique, "Le tiret dans les dialogues" (fiche 23371) and the spacing table (fiche 22039).',
    url: 'https://vitrinelinguistique.oqlf.gouv.qc.ca/23371/la-ponctuation/tiret/le-tiret-dans-les-dialogues',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'A dash marks each change of speaker in a dialogue; an opening dash takes a no-break space after it; the em and the en dash are both accepted.',
  },
  {
    id: 'treccani-lineetta',
    kind: 'style-guide',
    author: 'Fiammetta Longo, Treccani Magazine',
    title: 'I punti della situazione. 9. Lineette doppie e lineetta singola',
    about:
      'An article on punctuation in the language section of the Treccani encyclopaedia magazine.',
    cite: 'F. Longo, "I punti della situazione… 9. Lineette doppie e lineetta singola", Treccani Magazine, 27.02.2020.',
    url: 'https://www.treccani.it/magazine/lingua_italiana/articoli/scritto_e_parlato/punteggiatura9.html',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'Dashes may enclose direct speech in narrative texts as a conventional alternative to quotation marks, spaced, with the same dash before the narrator (– È qui, – disse mia madre.); its examples set the en dash.',
  },
  {
    id: 'ciberduvidas-travessao',
    kind: 'style-guide',
    author: 'Ciberdúvidas da Língua Portuguesa',
    title: 'Travessão no discurso directo',
    about: 'An answer of the Portuguese language advice service of ISCTE (European norm).',
    cite: 'Ciberdúvidas da Língua Portuguesa, "Travessão no discurso directo" (question of 6.11.2001).',
    url: 'https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/travessao-no-discurso-directo/8747',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'The travessão introduces direct speech and marks a change of speaker, and sets off the narrator, spaced in the examples (— Há um vilarejo… — respondeu o funcionário.); no spacing rule is stated.',
  },
  {
    id: 'indreptar-linia-dialog',
    kind: 'orthography',
    author: 'Academia Română, Institutul de Lingvistică (on dexonline)',
    title:
      'Îndreptar ortografic, ortoepic și de punctuație, 5th ed.: Punctuația 09. Linia de dialog și de pauză',
    about: 'The Romanian academy guide to spelling and punctuation, as published on dexonline.',
    cite: 'Îndreptar ortografic, ortoepic și de punctuație, ediția a V-a, §§ 275–281.',
    url: 'https://dexonline.ro/article/09._Linia_de_dialog_%C8%99i_de_pauz%C4%83',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'The linia de dialog marks the start of each speaker turn, a dash together with quotation marks is wrong, and a linie de pauză sets off the words of the author; the examples set a spaced en dash.',
  },
  {
    id: 'ibl-pryaka-rech',
    kind: 'orthography',
    author: 'Институт за български език, БАН',
    title: 'Езикови справки: При цитиране и пряка реч',
    about:
      'A language advice answer of the Institute for Bulgarian Language, citing the Официален правописен речник (2012), т. 131.1 and 131.4.',
    cite: 'Институт за български език (БАН), Езикови справки, answer 2266.',
    url: 'https://ibl.bas.bg/ezikovispravki/vaprosi/pri-tsitirane-i-pryaka-rech-10/2266',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'Direct speech may be quoted, but is usually set on a new line with a long dash (дълго тире) and a space after it, with a spaced dash before the attribution.',
  },
  {
    id: 'hrvatski-pravopis-8-16',
    kind: 'orthography',
    author: 'Institut za hrvatski jezik',
    title: 'Hrvatski pravopis, § 8.16.1 Pravopisni znakovi u upravnome govoru',
    about: 'The Croatian orthography of the national language institute, online edition.',
    cite: 'Institut za hrvatski jezik, Hrvatski pravopis, § 8.16.1.',
    url: 'https://pravopis.hr/pravilo/pravopisni-znakovi-u-upravnome-govoru/72/',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'Handwriting quotes direct speech; printed text may use quotation marks or dashes, a spaced en dash opening the line and another before the attribution.',
  },
  {
    id: 'slovenski-pravopis-388',
    kind: 'orthography',
    author: 'ZRC SAZU, Inštitut za slovenski jezik Frana Ramovša',
    title: 'Slovenski pravopis 2001: Pravila, § 388 and § 473',
    about: 'The Slovenian orthography rules (PDF; read as extracted text with damaged č, š, ž).',
    cite: 'Slovenski pravopis (2001), Pravila, § 388 point 6 and § 473.',
    url: 'https://www.fran.si/134/slovenski-pravopis/datoteke/Pravopis_Pravila.pdf',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'Direct speech is normally in double quotation marks; a dash may replace them only at the start of a paragraph with no lead-in clause, and the dash is spaced on both sides.',
  },
  {
    id: 'akh12-259',
    kind: 'orthography',
    author: 'Magyar Tudományos Akadémia',
    title: 'A magyar helyesírás szabályai, 12th ed., rule 259',
    about:
      'The Hungarian spelling rules of the Academy of Sciences, online edition (characters checked in the HTML).',
    cite: 'A magyar helyesírás szabályai, 12. kiadás (AkH12), 259.',
    url: 'https://helyesiras.mta.hu/helyesiras/default/akh12',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'In fiction dialogue is marked with a gondolatjel (en dash) instead of quotation marks, and a spaced gondolatjel sets off the attribution (– Nem is tudom – mondta.).',
  },
  {
    id: 'kotus-vuorosanaviiva',
    kind: 'style-guide',
    author: 'Kotimaisten kielten keskus (Kotus)',
    title: 'Kielitoimiston ohjepankki: Lainausmerkit ja vuorosanaviiva',
    about: 'The language advice bank of the Institute for the Languages of Finland.',
    cite: 'Kielitoimiston ohjepankki, "Lainausmerkit ja vuorosanaviiva".',
    url: 'https://kielitoimistonohjepankki.fi/ohje/lainausmerkit-ja-vuorosanaviiva/',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'Instead of quotation marks, the ajatusviiva is often used as a dialogue dash, especially in newspaper interviews and fiction; the attribution follows a comma.',
  },
  {
    id: 'isof-tankstreck',
    kind: 'style-guide',
    author: 'Institutet för språk och folkminnen (Språkrådet)',
    title: 'Frågelådan: Kan man markera anföring med tankstreck?',
    about: 'An answer of the Swedish language council advice service.',
    cite: 'Isof, Frågelådan, svar 52014.',
    url: 'https://frageladan.isof.se/visasvar.py?svar=52014',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'A tankstreck may mark direct speech, common in news and fiction: each new turn starts on a new line with an indent and a tankstreck, without quotation marks.',
  },
  {
    id: 'ijp-pomlcka',
    kind: 'orthography',
    author: 'Ústav pro jazyk český AV ČR',
    title: 'Internetová jazyková příručka: Pomlčka; Uvozovky',
    about: 'The online Czech language handbook of the Czech Academy of Sciences.',
    cite: 'Internetová jazyková příručka, "Pomlčka" (id 165) and "Uvozovky" (id 162).',
    url: 'https://prirucka.ujc.cas.cz/?id=165',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'Quotation marks mark direct speech; a pomlčka at the start of a line may also introduce it (– Čím se živíte? – Překládám.).',
  },
  {
    id: 'psp-2000',
    kind: 'orthography',
    author: 'Jazykovedný ústav Ľudovíta Štúra SAV',
    title: 'Pravidlá slovenského pravopisu, 3rd ed. (2000)',
    about: 'The Slovak orthography rules (PDF).',
    cite: 'Pravidlá slovenského pravopisu, 3. vydanie (2000): úvodzovky; pomlčka, point 10.',
    url: 'https://www.juls.savba.sk/ediela/psp2000/psp.pdf',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'Dashes are the newer alternative to quotation marks at the start and end of direct speech, spaced, with one before the attribution (– Rozviažte mu povrazy, – rozkázal rytier).',
  },
  {
    id: 'dsn-59',
    kind: 'orthography',
    author: 'Dansk Sprognævn',
    title: 'Retskrivningsordbogen 5.1, § 59 Replikgengivelse',
    about: 'The Danish official spelling dictionary and its rules.',
    cite: 'Retskrivningsordbogen 5.1, § 59.',
    url: 'https://ro.dsn.dk/?paragraf=59&type=rulesearch',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'Dialogue may be given with a replikstreg, quotation marks or no marks; the replikstreg has the same form as the tankestreg and is set especially where a turn starts a new line.',
  },
  {
    id: 'drukteinis-skyryba',
    kind: 'style-guide',
    author: 'Antanas Drukteinis',
    title: 'Lietuvių kalbos skyryba: taisyklės, komentarai, patarimai (2020)',
    about:
      'A Lithuanian punctuation handbook funded and endorsed by the State Commission of the Lithuanian Language (PDF).',
    cite: 'A. Drukteinis, Lietuvių kalbos skyryba (2020), chapter 4, rule 4-1.',
    url: 'https://emokykla.lt/upload/files/2024/07/08/liet-k-skyryba.pdf',
    accessed: '2026-10-21',
    readVia: 'summary',
    claim:
      'Direct speech shown as dialogue is set off with dashes (brūkšniai), retold direct speech with quotation marks.',
  },
];

const NOT_YET = 'Not yet researched.';

/** A decision no source has been read for yet. */
const general = (why: string): Decision => ({
  sources: [],
  why,
  alternative: NOT_YET,
  confidence: 'general-knowledge',
});

/** One entry for every id in `RULES`; resources/sources.test.ts checks that none is missing or extra. */
export const RULE_SOURCES: Record<string, Decision> = {
  quote: {
    sources: ['cldr-delimiters', 'butterick-quotes', 'oqlf-espacement'],
    why: "Each language has its own quotation marks, and nesting alternates a second pair. en (“ ” ‘ ’), uk (« » „ “) and pl („ ” « ») match CLDR; fr level one and ch (« » ‹ ›, as fr-CH) match too. The former English default, « » „ “ ‚ ‘, is this package's house style and is kept as the option quoteStyle: 'guillemets' for any language. Butterick agrees that quotes are curly and that styles vary by language, and gives no per-language sets. OQLF puts a no-break space inside French guillemets, as the engine does.",
    alternative:
      'Disputed for the languages that still differ from CLDR: German „ “ ‚ ‘ (the engine sets » « › ‹ on display), French « » with « » inside (the engine uses “ ” inside), and de-CH „ “ ‚ ‘ (the engine ch profile is the fr-CH one). English used to be one of them (the engine set « » „ “ by house style, and every other tool in the benchmark sets “ ”, apps/bench/RESULTS.md); it now follows CLDR. Not read: the Swiss Federal Chancellery Schreibweisungen (a PDF this work could not extract text from), Pravopys 2019 (server refused the fetch), Imprimerie nationale Lexique.',
    confidence: 'disputed',
    langs: {
      en: ['cldr-delimiters', 'butterick-quotes'],
      uk: ['cldr-delimiters'],
      de: ['cldr-delimiters'],
      pl: ['cldr-delimiters'],
      fr: ['cldr-delimiters', 'oqlf-espacement'],
      ch: ['cldr-delimiters'],
    },
  },
  apostrophe: {
    sources: ['butterick-apostrophes', 'butterick-quotes'],
    why: 'A typographic apostrophe is ’, not the straight typewriter mark, and the same ’ opens an elided word (’90s, rock ’n’ roll) instead of an opening quote.',
    alternative:
      'Matches the engine, including the leading-apostrophe cases fixed in the CHANGELOG. Butterick makes an exception for the Hawaiian okina (‘Oʻahu’), which the engine does not know. English only; no source for other languages was read.',
    confidence: 'verified',
    langs: { en: ['butterick-apostrophes'] },
  },
  ellipsis: {
    sources: ['butterick-ellipsis', 'uax14'],
    why: 'Three dots are one character, …, so they cannot break across lines.',
    alternative:
      'Butterick agrees and also asks for a no-break space on a side with no text so the ellipsis stays with its text; the engine does not do that (`... and so` keeps an ordinary space, a gap in the backlog). UAX #14 gives … class IN, so it is never split from another ellipsis. Interrupted speech: Butterick prefers an em dash outside fiction; the engine leaves it.',
    confidence: 'verified',
    langs: { en: ['butterick-ellipsis'] },
  },
  arrow: general('Typed ASCII arrows have a proper character.'),
  'symbol.legal': {
    sources: ['butterick-legal'],
    why: '(c), (R) and (TM) have proper characters.',
    alternative:
      'Matches the engine: (c) is changed only before a year, so "Section 12(c)" is left alone, which is the warning in the source. The source puts no space before ™ and ®; the engine does not add one. English only.',
    confidence: 'verified',
    langs: { en: ['butterick-legal'] },
  },
  'dash.dialogue': {
    sources: [
      'pravopys-125',
      'pwn-pauza-dialogowa',
      'rae-raya-dialogos',
      'oqlf-tiret-dialogues',
      'treccani-lineetta',
      'ciberduvidas-travessao',
      'indreptar-linia-dialog',
      'ibl-pryaka-rech',
      'hrvatski-pravopis-8-16',
      'slovenski-pravopis-388',
      'akh12-259',
      'kotus-vuorosanaviiva',
      'isof-tankstreck',
      'ijp-pomlcka',
      'psp-2000',
      'dsn-59',
      'drukteinis-skyryba',
    ],
    why: 'In these languages a line of dialogue opens with a dash, not a quotation mark, so a paragraph that opens with a typed hyphen and a space is such a line. The dash is the one the language uses for it, followed by a no-break space (attached with no space in Spanish), in both registers.',
    alternative:
      'Which dash: the sources set the em dash for uk, es and pt; pl uses whatever dash the text uses (the pack uses the em dash); fr accepts both (em set); bg says long dash but renders the en dash and it shows the en dash, and for both the pack keeps the em dash of its ISG sentence dash so that dialogue and the narrator match; ro, hr, hu, sk, lt, cs, sl, fi and sv set the en dash; da says the same form as the tankestreg, the em dash in the pack. Only the OQLF asks for a no-break space after the dash; the engine sets one everywhere but Spanish so that the dash never ends a line alone. Not set: et (quotes are the norm, EKI), lv and el (the dash is not confirmed by a source read), and en, de, ch, nl, mt, ga (dialogue is quoted). A paragraph whose later line also opens with a dash is read as a list and left alone. The 2019 Ukrainian Pravopys (§ 161) could not be read; § 125 of the earlier edition was. In cs, sl and da a dash is one of several allowed forms.',
    confidence: 'verified',
    langs: {
      uk: ['pravopys-125'],
      pl: ['pwn-pauza-dialogowa'],
      es: ['rae-raya-dialogos'],
      fr: ['oqlf-tiret-dialogues'],
      it: ['treccani-lineetta'],
      pt: ['ciberduvidas-travessao'],
      ro: ['indreptar-linia-dialog'],
      bg: ['ibl-pryaka-rech'],
      hr: ['hrvatski-pravopis-8-16'],
      sl: ['slovenski-pravopis-388'],
      hu: ['akh12-259'],
      fi: ['kotus-vuorosanaviiva'],
      sv: ['isof-tankstreck'],
      cs: ['ijp-pomlcka'],
      sk: ['psp-2000'],
      da: ['dsn-59'],
      lt: ['drukteinis-skyryba'],
    },
  },
  'dash.range': general('A range of numbers takes an en dash, not a hyphen.'),
  'dash.sentence': {
    sources: ['butterick-dashes', 'uax14'],
    why: 'A break in a sentence takes a dash, and its form depends on the language. For English the em dash is backed by the source; it is the engine default.',
    alternative:
      'The source sets the em dash flush against the words and calls spaces acceptable; the engine sets it spaced, with a no-break space before it, which matches neither. A search result quoting Bringhurst (The Elements of Typographic Style, 2nd ed., section 5.2.1, not read here) says he prefers a spaced en dash in English, so the primary guides disagree among themselves. UAX #14 gives the em dash class B2, which allows a break on both sides, hence the no-break space before it. The spaced en dash for German and for British literary English is not backed by any source read yet. For ro, hr, hu, sk and sv the spaced en dash comes from the dialogue sources: each sets the same spaced en dash before the words of the narrator, and the packs had no verified sentence dash before.',
    confidence: 'verified',
    langs: {
      en: ['butterick-dashes'],
      ro: ['indreptar-linia-dialog'],
      hr: ['hrvatski-pravopis-8-16'],
      hu: ['akh12-259'],
      sk: ['psp-2000'],
      sv: ['isof-tankstreck'],
    },
  },
  'symbol.minus': {
    sources: ['unicode-names', 'butterick-dashes', 'butterick-math'],
    why: 'A minus sign is −, not a hyphen.',
    alternative:
      'The SI brochure, 9th ed., has no passage on the minus sign: its section 5.4.4 only shows the leading zero (-0.234 but not -.234) and says nothing of the character to use, so it does not back this rule. Unicode only shows that the character exists; it does not say when to use it. Butterick says to use an en dash for the minus sign (the "Math symbols" page also lists the &minus; entity) and calls an en dash acceptable in spreadsheets, so a style guide that prefers − over – was not found. Still unchecked.',
    confidence: 'general-knowledge',
  },
  'symbol.multiply': {
    sources: ['butterick-math', 'unicode-names'],
    why: 'A dimension takes ×, not the letter x.',
    alternative:
      'Butterick says to use × instead of the letter x, dimensions included. Unicode shows the two are different characters. The NIST SI checklist, as summarised by the fetch tool, does not address ×. English only; no source for other languages was read.',
    confidence: 'verified',
    langs: { en: ['butterick-math'] },
  },
  'space.collapse': {
    sources: ['butterick-word-spaces'],
    why: 'A run of spaces is a typing accident, not a setting.',
    alternative:
      'Butterick asks for exactly one space between words and one after a full stop; the engine collapses a run to one. He offers a thin space after initials (W. A. Dwiggins); the engine uses a no-break space there (space.initial).',
    confidence: 'verified',
  },
  'space.title': {
    sources: ['butterick-nbsp', 'uax14'],
    why: 'A title stays on the line of the name it belongs to.',
    alternative: 'Not compared with other tools or with guides for the other languages.',
    confidence: 'verified',
    langs: { en: ['butterick-nbsp'] },
  },
  'space.initial': general('An initial stays on the line of the surname it belongs to.'),
  'space.abbreviation': {
    sources: ['butterick-nbsp', 'uax14'],
    why: 'An abbreviation stays on the line of what it qualifies.',
    alternative:
      'Only the English case ("Fig." before a number) is backed by a source read. The German, Ukrainian and Polish lists (in their packs, src/core/lang/) are still from general knowledge and have not been read by a native speaker; they stay unchecked even though the decision as a whole reads verified.',
    confidence: 'verified',
    langs: { en: ['butterick-nbsp'] },
  },
  'space.number': {
    sources: ['nist-si-checklist', 'uax14', 'bipm-si-brochure-9'],
    why: 'A number stays on the line of its unit or month, and an amount of money stays whole: the sign or code before it (USD 5 000, € 49.99) and the digit groups of a number written in threes (1 000 грн).',
    alternative:
      'The source does not say the space is nonbreaking, and says nothing about dates ("21 September"); both are our choice. It spaces % in English, while CLDR sets no space there (see space.percent) and the engine follows CLDR. Money: the SI brochure (5.4.4) says a group separated by a space must not be split, which is why the group spaces of an amount the writer grouped by hand become no-break spaces — the same thing the opt-in number.group does to a bare number, so the two agree. No source was read for binding the sign or code to the amount, or for the list of signs and codes (ISO 4217 codes and the signs of the audience\'s currencies, in src/core/currency.ts): that list and the guards (a leading zero, a group run after another group, four digits at the end, all of which say "phone number", not "amount") are the engine\'s own. The engine never moves, adds or removes a currency sign: where it stands is the writer\'s choice, and placement per language (€49.99 in English, 49,99 € in German) is not applied.',
    confidence: 'verified',
  },
  'space.percent': {
    sources: ['cldr-numbers', 'oqlf-espacement', 'isg-2022-euro', 'ijp-penezni-castky', 'uax14'],
    why: 'German and French set a no-break space before % and a currency sign. CLDR agrees for % in de and fr, and for the currency sign in de and fr; it sets no space before % in en, uk, pl, de-CH and fr-CH, which is what the engine does. OQLF, a printed-style authority, agrees for French: a no-break space before %, $ and €. For € alone, the Greek, Finnish, Italian and Danish editions of the Interinstitutional Style Guide (part 3, 7) write the symbol after the figure with a space (30 €), as does the Czech handbook (250 €, with a fixed space), so currencySpace stays on in el, fi, it, da and cs.',
    alternative:
      "The space before % and the space before € are two pack fields, percentSpace and currencySpace: Irish, Maltese, Portuguese, Latvian, Lithuanian and Estonian set the first and not the second, because their ISG editions write €30 with no space or show money only as the code EUR (see each pack's notes). CLDR also puts a no-break space before the currency sign in uk, pl and fr-CH; the engine leaves 49€ alone there (a gap, in the backlog). OQLF also asks for a no-break space before a French colon, and none or a fine space before ; ! and ?, which the engine does not set (a gap, in the backlog). OQLF is a Quebec source; a France or Swiss guide may differ (a fine space). The German side rests on CLDR only; no Duden page was read. The ISG passage is for the euro only (other currency signs are never spaced by the engine) and, apart from the Finnish edition, does not say the space is nonbreaking; the Czech handbook was read as a fetch-tool summary. The ISG percent rule (6.4) cited in the packs was not re-read here. Of the country guides named in the packs (Kielitoimiston ohjepankki, Retskrivningsordbogen, Treccani), none was read for €.",
    confidence: 'verified',
    langs: {
      de: ['cldr-numbers'],
      fr: ['cldr-numbers', 'oqlf-espacement'],
      el: ['isg-2022-euro'],
      fi: ['isg-2022-euro'],
      it: ['isg-2022-euro'],
      da: ['isg-2022-euro'],
      cs: ['ijp-penezni-castky'],
    },
  },
  'space.section': {
    sources: ['butterick-section-marks', 'butterick-nbsp'],
    why: 'A § or ¶ stays on the line of the number it cites. Butterick: a mark "should always be followed by a nonbreaking space"; the page shows the break between § and the number as the error. The nonbreaking-spaces page repeats it for § and ¶.',
    alternative:
      'The source says "always" and so would also have a space inserted in §5; the engine only turns a typed space into a no-break space, in the same way as ©2026 and €30 are left as typed. The page says to double the mark for several references and to spell the word out at a sentence start; the engine does neither, it only keeps the mark with its number. English only: the source does not cover how other languages set § (German and French practice, for one, is not checked). Read as a fetch-tool summary with quotes; not compared with other tools.',
    confidence: 'verified',
    langs: { en: ['butterick-section-marks'] },
  },
  'space.association': general('e.V. stays on the line of the name it follows.'),
  'space.copyright': {
    sources: ['butterick-nbsp', 'butterick-legal', 'uax14'],
    why: '© stays on the line of the year or name after it. Butterick: a no-break space between © and the year.',
    alternative: 'Not compared with other tools or with guides for the other languages.',
    confidence: 'verified',
  },
  'space.operator': {
    ...general(
      'A lone &, + or = between two words stays on the line of the word before it and of the word after it, so a line neither ends on the operator nor starts with it (Tom & Jerry, rock + roll). The ’n’ of rock ’n’ roll is an "and" with its letters dropped and is bound the same way (0.13.0).',
    ),
    alternative:
      'No source found. Practical Typography "Nonbreaking spaces" was read (as a fetch-tool summary) and does not mention an ampersand or any operator; a web search for a guide on binding an ampersand between names found only general pages on no-break spaces and a LaTeX tie guide for forenames, none a style guide on this point, so none is cited. The rule is a judgement: a line ending on "&" or starting with it reads as a break in the pair. It binds both sides, so "Tom & Jerry" is one unbreakable unit, and a chain of operators binds end to end ("Tom & Jerry & Co" is five tokens in one unit; "one + two + three + four + five" is one run, and a pathological chain could bind a whole line); a guide may prefer a break before the operator instead. Two shapes stay unbound: an operator next to an inline tag in HTML or Markdown ("Tom &amp; <em>Jerry</em>": the tag placeholder is not a letter) and a word ending in a combining mark (decomposed "café & bar"). Numbers (2 + 2, x = 5) are left to the author; doubled operators (&&, ==, +=) and operators with no typed spaces (R&D, x+y) are untouched.',
  },
  'space.short-word': {
    sources: ['pwn-wolanski-sieroty', 'ujc-poradna-konec-radku'],
    why: 'A short word (two or three letters) travels with the word after it, so a line does not end on "to" or "do". On by default since 0.14.0: the sources say it must in a title and may in body text, and this engine sets display text, where the stumble is what readers notice.',
    alternative:
      'Opt-in from 0.10.0 to 0.13.0, on by default since 0.14.0; `disable` restores the body-text convention. What the sources give: Wolański (PWN Poradnia) writes that prepositions of two, three or more characters MAY stay at the end of a line in body text ("Przyimki liczące dwa, trzy i więcej znaków mogą pozostawać na końcu wiersza w tekście zasadniczym"), and adds that in titles and subheads such a word must travel with what it belongs to; the ÚJČ advice service says the same for Czech ("Vícepísmenné výrazy na konci řádku zůstat mohou"). "May" is a permission, not a recommendation, so a default either way is within the sources; the default is on because the engine\'s own register is display text (pages, headings, short copy) and because typograf and typopo bind these words by default too, so a reader comparing tools expects it. The class is source-backed, but the word lists themselves are editorial: no style guide read gives a list of two- and three-letter words for any language, and the five packs that have one (cs, en, pl, sk, uk) hold the engine\'s own enumeration of prepositions, conjunctions and the English article. That is why the decision stays general-knowledge. The rule never binds more than two words in a row, so a chain cannot grow into a whole line; a word that already follows a no-break space is left free. Other languages have no list, and the rule does nothing there.',
    confidence: 'general-knowledge',
  },
  'space.orphan': {
    sources: [
      'ijp-penezni-castky',
      'ujc-poradna-konec-radku',
      'pwn-wolanski-sieroty',
      'zu-blyzniuk-technical-rules',
    ],
    why: 'A one-letter word does not end a line.',
    alternative:
      'Czech: the Internetová jazyková příručka (entry 880, a fetch summary) names k, s, v, z, o, u, a, i; the Jazyková poradna (read raw) says k s v z should not end a line, that guides differ on o u and a i, and recommends binding them too where the typesetting allows; ČSN 01 6910 lists k s v z o u only. The engine binds all eight (the list is the příručka\'s). Longer words may stay. Polish (a, i, o, u, w, z): Wolański in the PWN Poradnia (a fetch summary) lists exactly these, capitals included, as a recommendation for lines over about 40 characters, which is why the pack binds them in body text; in titles and subheads they must travel with what they belong to. Two-letter prepositions may stay in body text there, so none is bound. Ukrainian: a Zhytomyr handbook of technical typesetting rules (read raw, Soviet-era rules) says "не слід" leave one-letter prepositions and conjunctions at a line end in books, without listing letters; the CLASS is source-backed and the letters (а в і ї й з у о) are the engine\'s own enumeration, so Ukrainian stays general-knowledge. Slovak (v, k, s, u, z, o, a, i): an editorial convention, not a read authority: tvorim.net (2008) and a Slovak wikibook name the words, a design studio page (grafeon.sk) states the class without letters, but the Slovak language-advice pages and the Pravidlá PDF could not be read; shipped on that footing, general-knowledge. Bulgarian has a class rule in one anonymous 2005 guide with no letters, so nothing is bound (parked for a native reviewer). Slovenian, Croatian, German, French, Spanish and Italian: nothing found. The English a/I rule has no source at all. Two-letter words are bound in no language.',
    confidence: 'verified',
    langs: {
      cs: ['ijp-penezni-castky', 'ujc-poradna-konec-radku'],
      pl: ['pwn-wolanski-sieroty'],
    },
  },
  'space.arrow': general('An arrow stays on the line of the word it points from or to.'),
  'space.before-punctuation': {
    sources: [],
    why: 'A space before , . ; : ! ? ) is a typing slip in English and most languages; French keeps it before : ; ! ?, so the rule leaves those alone there.',
    alternative:
      'Opt-in rule (off unless named in `enable`). No source was read for it; the choice rests on general knowledge. typograf and typopo do the same.',
    confidence: 'general-knowledge',
  },
  'space.after-comma': {
    sources: [],
    why: 'A comma is followed by a space; a,b is a typing slip.',
    alternative:
      'Opt-in rule (off unless named in `enable`). No source was read for it; the choice rests on general knowledge. It can touch non-prose such as decimals written with a comma (1,5) and lists in code, which is why it is opt-in.',
    confidence: 'general-knowledge',
  },
  'punctuation.double': {
    sources: [],
    why: 'A run of ! or ? is shortened to one mark; ?! and !? are kept because they are deliberate.',
    alternative:
      'Opt-in rule (off unless named in `enable`). No source was read for it; the choice rests on general knowledge. Butterick treats repeated exclamation marks as a style question, not a typesetting one (see the backlog).',
    confidence: 'general-knowledge',
  },
  'symbol.implies': {
    sources: [],
    why: '=> is read as an arrow in plain text and set as ⇒.',
    alternative:
      'Opt-in rule (off unless named in `enable`). No source was read for it; the choice rests on general knowledge. Taste and font coverage: the glyph may be missing (see the backlog item on keeping the original when the font lacks it). No other tool in the benchmark does it.',
    confidence: 'general-knowledge',
  },
  'number.group': {
    sources: ['bipm-si-brochure-9'],
    why: 'Integers of five or more digits are grouped in threes with the language separator (comma, no-break space, dot) so a long number can be read.',
    alternative:
      'Opt-in rule (off unless named in `enable`). The SI brochure (9th ed., 5.4.4) says digits "may be divided into groups of three by a space", that "neither dots nor commas are ever inserted in the spaces between groups", that with only four digits before or after the decimal marker a space is not used to isolate a single digit, and that the practice "is a matter of choice". The engine agrees on groups of three, on starting at five digits, and on the space itself for the languages whose pack uses a no-break space (the brochure does not say nonbreaking). It deliberately differs where the pack groups with a comma (en) or a dot, which the brochure forbids; that is local custom, not SI. The brochure is a metrology standard and does not speak for ordinary prose in any one language, so the choice stays general-knowledge. Separators per language come from the packs and are otherwise unverified; Swiss usage differs (the pack follows the Federal Chancellery, not read here).',
    confidence: 'general-knowledge',
  },
  'phone.bind': {
    sources: ['uax14'],
    why: 'An international phone number is kept whole: no-break spaces between its groups and U+2011 for its hyphens, so a line never ends in the middle of a number.',
    alternative:
      "Opt-in rule (off unless named in `enable`). UAX #14 is the source for the characters used: the no-break space and the non-breaking hyphen (U+2011) are the characters that forbid a break, which is the whole mechanism here. No style guide was read for phone numbers, so the shape the rule accepts is the engine's own: + or 00 followed directly by a digit, seven to fifteen digits (ITU-T E.164 allows fifteen, which is also what keeps a number from swallowing the figure after it), digits, spaces, hyphens and brackets inside. A local number (555-1234, 044-123-45-67) is left as typed, and so is a date, a range, an IBAN and a tel: link. The digits are never reformatted: a locale format per language would need a pack field (in the backlog). typograf has a rule for Russian phone numbers; no tool in the comparison binds an international one.",
    confidence: 'general-knowledge',
  },
  'symbol.plusminus': {
    sources: [],
    why: '+- before a digit is the plus-minus sign ±.',
    alternative:
      'Opt-in rule (off unless named in `enable`). No source was read for it; the choice rests on general knowledge. The SI brochure, 9th ed., does not address the ± sign in section 5.4, so it does not back this rule.',
    confidence: 'general-knowledge',
  },
  'symbol.fraction': {
    sources: [],
    why: '1/2, 1/4 and 3/4 written as whole numbers become the single-glyph fractions ½ ¼ ¾.',
    alternative:
      'Opt-in rule (off unless named in `enable`). No source was read for it; the choice rests on general knowledge. Dates and longer fractions (11/2, 1/20) are left alone; fonts without these glyphs show a fallback.',
    confidence: 'general-knowledge',
  },
  'symbol.degree': {
    sources: ['bipm-si-brochure-9'],
    why: 'A temperature or angle unit gets a no-break space before it (20 °C), and the degree sign is added where the unit letter stands alone.',
    alternative:
      'Opt-in rule (off unless named in `enable`). The SI brochure, 9th ed., 5.4.3: a space always separates the unit from the number, so "t = 30.2 °C but not t = 30.2°C"; the one exception is the plane-angle degree, minute and second, which take no space (30° 22′ 8″). The engine agrees: it puts a space before ° only when a C or F follows, and leaves a bare angle degree (30°) alone. The brochure does not say the space is nonbreaking (our choice), and it covers the Celsius scale only: the Fahrenheit case (°F) is not SI, so no source was read for it. The label guard (Type 2 F is not a temperature) and the English-only rule for a bare C or F are the engine\'s own.',
    confidence: 'verified',
    langs: { en: ['bipm-si-brochure-9'] },
  },
  'space.trailing': {
    sources: [],
    why: 'Spaces and tabs at the end of a line are removed.',
    alternative:
      'Opt-in rule (off unless named in `enable`). No source was read for it; the choice rests on general knowledge. Off by default because text mode keeps them on purpose.',
    confidence: 'general-knowledge',
  },
};

const KINDS: readonly Source['kind'][] = [
  'standard',
  'style-guide',
  'orthography',
  'research',
  'tool',
];

const KIND_TITLES: Record<Source['kind'], string> = {
  standard: 'Standards',
  'style-guide': 'Style guides',
  orthography: 'Orthography',
  research: 'Research',
  tool: 'Other tools',
};

const anchor = (id: string): string => `src-${id}`;

/** HTML-escapes text for the generated pages. One definition, shared by both HTML generators. */
export const esc = (text: string): string =>
  text
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');

/** The anchor of a rule on sources.html (`rule-space-orphan`), one format for every page that links there. */
export const htmlAnchor = (ruleId: string): string => `rule-${ruleId.replaceAll('.', '-')}`;

/**
 * The anchor of a rule's heading on sources.md as GitHub derives it from `` ### `space.orphan` ``:
 * lowercase, punctuation dropped (`spaceorphan`). `docs/rules.md` links with it; the test checks the link lands.
 */
export const mdAnchor = (ruleId: string): string => ruleId.replaceAll('.', '');

/** The decision of a rule; a built-in rule without one is a mistake the generators must not paper over. */
export function decisionOf(ruleId: string): Decision {
  const decision = RULE_SOURCES[ruleId];
  if (!decision) {
    throw new Error(`rule "${ruleId}" has no decision in RULE_SOURCES (resources/sources.ts)`);
  }
  return decision;
}

/** The rules that cite a source, each with the languages it is cited for (empty when cited in general). */
export function usedBy(sourceId: string): { rule: string; langs: string[] }[] {
  return RULES.flatMap((rule) => {
    const decision = decisionOf(rule.id);
    const langs = Object.entries(decision.langs ?? {})
      .filter(([, ids]) => ids.includes(sourceId))
      .map(([lang]) => lang);
    if (!decision.sources.includes(sourceId) && !langs.length) return [];
    return [{ rule: rule.id, langs }];
  });
}

export function render(): string {
  const link = (id: string): string => `[${id}](#${anchor(id)})`;
  const out: string[] = [
    '# Sources',
    '',
    'Why each rule exists: the sources it rests on, the reason it was chosen, and what others do instead. This file is generated by `bun run docs:sources` from `resources/sources.ts`. Do not edit it by hand: `resources/sources.test.ts` fails when it is out of date.',
    '',
    'Every source was read before it was entered, on the date given. The `confidence` of a decision is one of:',
    '',
    '- `verified`: at least one source read says what the rule does.',
    '- `general-knowledge`: no source read yet; the rule is what the author knows to be usual. Treat it as unchecked.',
    '- `disputed`: a source read says something else than the engine does. See [backlog.md](../docs/backlog.md).',
    '',
    '## Decisions',
    '',
  ];
  for (const rule of RULES) {
    const decision = decisionOf(rule.id);
    out.push(`### \`${rule.id}\``, '', `Confidence: \`${decision.confidence}\`.`, '');
    out.push(`Why: ${decision.why}`, '', `Alternative: ${decision.alternative}`, '');
    if (decision.sources.length) out.push(`Sources: ${decision.sources.map(link).join(', ')}`, '');
    for (const [lang, ids] of Object.entries(decision.langs ?? {})) {
      out.push(`- \`${lang}\`: ${ids.map(link).join(', ')}`);
    }
    if (decision.langs && Object.keys(decision.langs).length) out.push('');
  }
  out.push('## Bibliography', '');
  if (!SOURCES.length) out.push('No source has been read yet.', '');
  for (const kind of KINDS) {
    const group = SOURCES.filter((source) => source.kind === kind);
    if (!group.length) continue;
    out.push(`### ${KIND_TITLES[kind]}`, '');
    for (const source of group) {
      out.push(`<a id="${anchor(source.id)}"></a>`, `**${source.id}**. ${source.cite}`, '');
      const via =
        source.readVia === 'raw'
          ? 'read as raw data'
          : 'read as a summary by a fetch tool, check it by hand';
      if (source.url) out.push(`<${source.url}>, ${via} on ${source.accessed}.`, '');
      else out.push(`${via[0]?.toUpperCase()}${via.slice(1)} on ${source.accessed}.`, '');
      out.push(`Relied on: ${source.claim}`, '');
    }
  }
  return `${out.join('\n').trimEnd()}\n`;
}
