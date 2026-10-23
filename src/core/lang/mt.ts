import { NBSP } from '../types.ts';
import type { LangPack } from './pack.ts';

export const mt = {
  code: 'mt',
  name: 'Maltese (Malti)',
  sample: 'Qal "jien hawn" - u telaq... Ix-xogħol idum 21-26 Settembru, 10:00-12:00. Aqra aktar ->',
  // “level 1 ‘level 2’ level 1”: ISG 4.2.3, "further levels are repetitions of levels 1 and 2".
  quotes: [
    ['“', '”'],
    ['‘', '’'],
  ],
  // ISG 4.2.3 and 6.4: p. and pp. before a page number are followed by a fixed space (p.• ĠU C).
  abbreviations: { page: ['p', 'pp'], bare: ['Nru'] },
  // ISG 6.4 table: a fixed space before %.
  percentSpace: true,
  currencySpace: false,
  // ISG 6.5: in Maltese, English and Irish publications a point separates the decimals; a space
  // (not a comma) marks the thousands.
  numbers: { group: NBSP, decimal: '.' },
  // Wiktionary (English edition, Maltese entries ta' and ma'), a community dictionary: low authority.
  truncations: ['ta', 'ma'],
  reviewed: false,
  sources: [
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0015.01/DOC_1 (Il-Gwida tal-Istil Interistituzzjonali, PDF of 19 April 2022: 4.2.3 virgoletti, apostrofu and spazji fissi, 5.10 kwotazzjonijiet, 6.4 sinjali tal-punteġġatura u l-ispazji, 6.5 punteġġatura fiċ-ċifri, 7 euro)',
    'https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: mt “…” ‘…’ “…”)',
    'https://en.wikipedia.org/wiki/Quotation_mark (cross-check only: Maltese “…” ‘…’)',
    "https://en.wiktionary.org/wiki/ta%27 and https://en.wiktionary.org/wiki/ma%27 (Wiktionary, Maltese entries ta' and ma': prepositions with a final apostrophe, the truncations field; a community dictionary, low authority, read as a fetch summary)",
  ],
  notes: [
    'Quotation: “…” then ‘…’ is ISG 4.2.3 ("in Maltese, a quotation is set between double marks, single marks for a quotation inside a quotation; further levels repeat levels 1 and 2") and the Publications Office table; the pack has two levels, and a deeper quotation starts over, which is what the ISG says. The Kunsill Nazzjonali tal-Ilsien Malti was not searched.',
    "Apostrophe: ISG 4.2.3 asks for the typographic apostrophe ’, not the keyboard one. ta', m'hu, x'inhu and the hyphenated articles (l-ħobż, taċ-ċikkulata) stand inside a word or before a space, and the goldens in mt.test.ts pin that they round-trip inside and outside a quotation, including a quotation written with straight single marks around m'hu. Truncations: the truncations field lists ta' (of) and ma' (with), prepositions written with a final apostrophe, taken from Wiktionary (English edition, Maltese entries, read as a fetch summary) only: a community dictionary, low authority, not checked against a Maltese grammar or the Kunsill Nazzjonali tal-Ilsien Malti. After one of them an apostrophe followed by a space, punctuation or the end stays an apostrophe when a later straight single mark can close the quotation, so a quotation written with straight single marks that holds one pairs: `'il-ktieb ta' Mario'` gives `“il-ktieb ta’ Mario”`. sa' and bla' were not confirmed in any source read and are left out. With no such later mark the quotation closes at the word, as before ('ma' gives “ma”). Known limit: ma is also the negation (ma nafx), so a quotation that ends on ma and is followed in the same paragraph by a lone straight single mark that can close reads the first mark as the apostrophe. The elisions field is empty: no Maltese word starts with an apostrophe in any source read.",
    'Numbers: ISG 6.5 gives a point for the decimals and a space between groups of three digits in Maltese (the Official Journal uses a comma, for technical reasons); the group separator is a no-break space, the fixed space of the ISG.',
    "Abbreviations: only p. and pp. before a page number, shown with a fixed space in 4.2.3 (p.• ĠU C) and used in 5.10 (pp. 71–98). Nru is written without a full stop and is followed by a fixed space in 4.2.3 (Nru• ĠU L); the pack lists it in the bare field, so a no-break space follows it before a number (Nru 5).",
    'Euro: ISG 7 writes the euro sign before the amount without a space in Maltese (€30). The pack sets percentSpace (5% becomes 5 %) but not currencySpace, so no space is added before €: 30€ stays 30€ and €30 is untouched.',
    'Not implemented, not verified: one-letter words to keep off the end of a line (none sourced), the dash conventions of the language (not read), longer abbreviation lists, the national rules of the Kunsill Nazzjonali tal-Ilsien Malti. No other typography tool read covers Maltese.',
  ].join(' '),
} as const satisfies LangPack;

export default mt;
