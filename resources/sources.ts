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
    why: 'Each language has its own quotation marks, and nesting alternates a second pair. uk (« » „ “) and pl („ ” « ») match CLDR; fr level one and ch (« » ‹ ›, as fr-CH) match too. Butterick agrees that quotes are curly and that styles vary by language, and gives no per-language sets. OQLF puts a no-break space inside French guillemets, as the engine does.',
    alternative:
      'CLDR gives English “ ” ‘ ’ (the engine default is « » „ “, a gap already in the backlog as P0), German „ “ ‚ ‘ (the engine sets » « › ‹ on display), French « » with « » inside (the engine uses “ ” inside), and de-CH „ “ ‚ ‘ (the engine ch profile is the fr-CH one). The backlog records that every other tool in the benchmark produces “ ” for English by default (apps/bench/RESULTS.md). Not read: the Swiss Federal Chancellery Schreibweisungen (a PDF this work could not extract text from), Pravopys 2019 (server refused the fetch), Imprimerie nationale Lexique.',
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
      'Unicode only shows that the character exists; it does not say when to use it. Butterick says to use an en dash for the minus sign (the "Math symbols" page also lists the &minus; entity) and calls an en dash acceptable in spreadsheets, so a style guide that prefers − over – was not found. Still unchecked.',
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
    sources: ['nist-si-checklist', 'uax14'],
    why: 'A number stays on the line of its unit or month. The source backs a space between a value and a unit, percent included.',
    alternative:
      'The source does not say the space is nonbreaking, and says nothing about dates ("21 September"); both are our choice. It spaces % in English, while CLDR sets no space there (see space.percent) and the engine follows CLDR.',
    confidence: 'verified',
  },
  'space.percent': {
    sources: ['cldr-numbers', 'oqlf-espacement', 'uax14'],
    why: 'German and French set a no-break space before % and a currency sign. CLDR agrees for % in de and fr, and for the currency sign in de and fr; it sets no space before % in en, uk, pl, de-CH and fr-CH, which is what the engine does. OQLF, a printed-style authority, agrees for French: a no-break space before %, $ and €.',
    alternative:
      'CLDR also puts a no-break space before the currency sign in uk, pl and fr-CH; the engine leaves 49€ alone there (a gap, in the backlog). OQLF also asks for a no-break space before a French colon, and none or a fine space before ; ! and ?, which the engine does not set (a gap, in the backlog). OQLF is a Quebec source; a France or Swiss guide may differ (a fine space). The German side rests on CLDR only; no Duden page was read.',
    confidence: 'verified',
    langs: { de: ['cldr-numbers'], fr: ['cldr-numbers', 'oqlf-espacement'] },
  },
  'space.association': general('e.V. stays on the line of the name it follows.'),
  'space.copyright': {
    sources: ['butterick-nbsp', 'butterick-legal', 'uax14'],
    why: '© stays on the line of the year or name after it. Butterick: a no-break space between © and the year.',
    alternative: 'Not compared with other tools or with guides for the other languages.',
    confidence: 'verified',
  },
  'space.orphan': {
    ...general('A one-letter word does not end a line.'),
    alternative:
      'No authoritative source found. Only secondary pages (a WebKit bug thread, a Czech nbsp generator, plugin pages) state the Polish and Czech practice; none is a style guide, so none is cited. A Polish or Ukrainian typography guide is needed, and the English a/I rule has no source at all.',
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
    sources: [],
    why: 'Integers of five or more digits are grouped in threes with the language separator (comma, no-break space, dot) so a long number can be read.',
    alternative:
      'Opt-in rule (off unless named in `enable`). No source was read for it; the choice rests on general knowledge. Separators per language come from the packs and are unverified; Swiss usage differs (the pack follows the Federal Chancellery, not read here).',
    confidence: 'general-knowledge',
  },
  'symbol.plusminus': {
    sources: [],
    why: '+- before a digit is the plus-minus sign ±.',
    alternative:
      'Opt-in rule (off unless named in `enable`). No source was read for it; the choice rests on general knowledge.',
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
    sources: [],
    why: 'A temperature or angle unit gets a no-break space before it (20 °C), and the degree sign is added where the unit letter stands alone.',
    alternative:
      'Opt-in rule (off unless named in `enable`). No source was read for it; the choice rests on general knowledge. The SI brochure rule on the space before a unit and its plane-angle exception are in the backlog reading list, not read.',
    confidence: 'general-knowledge',
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
    const decision = RULE_SOURCES[rule.id];
    if (!decision) continue;
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
