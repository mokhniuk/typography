import type { PackProse } from '../pack.ts';

export const ga: PackProse = {
  sources: [
    'https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: ga ‘…’ “…” ‘…’)',
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0015.01/DOC_1 (Interinstitutional Style Guide, Maltese edition, PDF of 19 April 2022: 6.4 spacing table with %, 6.5 "in Maltese, English and Irish publications a point separates whole numbers from decimals" and a space marks thousands, 7 euro: "the same rule applies in English and Irish"; it is evidence about Irish only through those statements)',
    'https://knowledge-centre-translation-interpretation.ec.europa.eu/en/content/guidelines-translating-eu-documents-irish (Knowledge Centre for Translation and Interpretation: points to the Irish ISG at style-guide.europa.eu/ga and to the An Gúm and Foras na Gaeilge guides; their text was not read)',
    'https://en.wikipedia.org/wiki/Quotation_mark (cross-check only: lists Irish with “…” first and ‘…’ inside, the opposite of the Publications Office table)',
  ],
  notes: [
    "Quotation: the pack follows the Publications Office table (‘…’ then “…” then ‘…’, the English order). The Irish edition of the Interinstitutional Style Guide (Treoir Stíle Idirinstitiúideach, section 4.2.3) could not be read: style-guide.europa.eu is script-rendered, and the Cellar lists the Irish PDF (manifestations 0018.01 to 0018.03 of 01ed788a-d266-11ec-a95f-01aa75ed71a1) but serves no file for it (404 on DOC_1 and DOC_2). Wikipedia gives “…” first for Irish; quoteStyle: 'us' gives that order.",
    "Apostrophe: d', b', m' (d'fhág, b'fhéidir, m'athair) stand inside a word, which the engine already reads as an apostrophe, not a quote mark; the goldens in ga.test.ts pin that inside and outside a quotation, including a quotation written with straight single marks. The elisions field is empty: no Irish word starts with an apostrophe in any source read.",
    'Initial mutations: t-, n- and h- (an t-athair, i n-Éirinn, go h-álainn, na h-oibrithe, an t-uisce) are a hyphen after one letter with no space; no rule matches that shape, so they pass through unchanged in both registers, inside and outside a quotation, and beside a numeric range (an t-athair 1-2 sets only the range); with symbol.minus enabled they stay as typed. The goldens in ga.test.ts pin this. A spaced "t -" is not a mutation: an t - athair is set as a sentence dash like any spaced hyphen. The forms were taken from general knowledge of Irish orthography; no source was read.',
    'Numbers: a point for decimals and a space between groups of three digits are read in the Maltese edition of the ISG, which states it for Irish; the Irish edition was not read. The group separator is a no-break space.',
    'Euro: the Maltese edition says Irish writes the euro sign before the amount without a space (€30). The pack sets percentSpace (5% becomes 5 %) but not currencySpace, so no space is added before €: 30€ stays 30€ and €30 is untouched.',
    'Not implemented, not verified: one-letter words to keep off the end of a line (none sourced), abbreviation lists (none read), the dot-above letters of the old orthography and the fada need no rule (they are letters; tests pin that they are kept), the Irish dash conventions (not read), and everything in the Irish edition of the ISG. The task brief says typograf covers Irish; this pack was not compared with it.',
  ].join(' '),
};
