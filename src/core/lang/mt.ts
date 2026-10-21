import { NBSP } from '../types';
import type { LangPack } from './pack';

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
  abbreviations: { page: ['p', 'pp'] },
  // ISG 6.4 table: a fixed space before %.
  percentSpace: true,
  // ISG 6.5: in Maltese, English and Irish publications a point separates the decimals; a space
  // (not a comma) marks the thousands.
  numbers: { group: NBSP, decimal: '.' },
  reviewed: false,
  sources: [
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0015.01/DOC_1 (Il-Gwida tal-Istil Interistituzzjonali, PDF of 19 April 2022: 4.2.3 virgoletti, apostrofu and spazji fissi, 5.10 kwotazzjonijiet, 6.4 sinjali tal-punteġġatura u l-ispazji, 6.5 punteġġatura fiċ-ċifri, 7 euro)',
    'https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: mt “…” ‘…’ “…”)',
    'https://en.wikipedia.org/wiki/Quotation_mark (cross-check only: Maltese “…” ‘…’)',
  ],
  notes: [
    'Quotation: “…” then ‘…’ is ISG 4.2.3 ("in Maltese, a quotation is set between double marks, single marks for a quotation inside a quotation; further levels repeat levels 1 and 2") and the Publications Office table; the pack has two levels, and a deeper quotation starts over, which is what the ISG says. The Kunsill Nazzjonali tal-Ilsien Malti was not searched.',
    "Apostrophe: ISG 4.2.3 asks for the typographic apostrophe ’, not the keyboard one. ta', m'hu, x'inhu and the hyphenated articles (l-ħobż, taċ-ċikkulata) stand inside a word or before a space, and the goldens in mt.test.ts pin that they round-trip inside and outside a quotation, including a quotation written with straight single marks around m'hu. Known limit: a quotation written with straight single marks that holds a word ending in an apostrophe, 'il-ktieb ta' Mario', is closed at ta' (it comes out as “il-ktieb ta” Mario’), because the pack has no field for a trailing apostrophe; double quotes are not affected. The elisions field is empty: no Maltese word starts with an apostrophe in any source read.",
    'Numbers: ISG 6.5 gives a point for the decimals and a space between groups of three digits in Maltese (the Official Journal uses a comma, for technical reasons); the group separator is a no-break space, the fixed space of the ISG.',
    "Abbreviations: only p. and pp. before a page number, shown with a fixed space in 4.2.3 (p.• ĠU C) and used in 5.10 (pp. 71–98). Nru is written without a full stop and is followed by a fixed space in 4.2.3 (Nru• ĠU L), but the engine's abbreviation fields need the dot, so it is not implemented.",
    "Euro: ISG 7 writes the euro sign before the amount without a space in Maltese (€30). The engine's percentSpace field also puts a no-break space between a number and €, so 30€ becomes 30 €, which the ISG does not use; the pack has no separate flag for % alone. €30 is untouched.",
    'Not implemented, not verified: one-letter words to keep off the end of a line (none sourced), the dash conventions of the language (not read), longer abbreviation lists, the national rules of the Kunsill Nazzjonali tal-Ilsien Malti. No other typography tool read covers Maltese.',
  ].join(' '),
} as const satisfies LangPack;
