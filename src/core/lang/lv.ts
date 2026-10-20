import { NBSP } from '../types';
import type { LangPack } from './pack';

export const lv = {
  code: 'lv',
  name: 'Latvian (latviešu)',
  sample:
    'Viņš teica "mēs esam šeit" - un aizgāja... Seminārs notiks 21-26. septembrī, 10:00-12:00, t. i. šonedēļ. Lasīt vairāk ->',
  // “…” with both marks at the top, at every level: ISG 4.2.3, 6.4 and 10.1.6 (a quotation inside
  // a quotation takes the double marks again).
  quotes: [['“', '”']],
  // ISG 10.7: the parts of an abbreviation written with full stops are joined by a fixed space
  // (u. c., u. tml., t. i., š. g., v. i., z. v.); 10.7 also shows P. S.; 4.2.3: Nr.• OV L•.
  abbreviations: {
    together: ['u. tml.', 'u. c.', 't. i.', 'š. g.', 'v. i.', 'z. v.', 'P. S.'],
    bind: ['Nr'],
  },
  // ISG 10.1.7: a dash has a space on each side; the examples are written with the en dash.
  sentenceDash: '–',
  // ISG 6.4: a fixed space between the figure and %.
  percentSpace: true,
  // ISG 6.5: a comma for the decimals, a fixed space between groups of three digits.
  numbers: { group: NBSP, decimal: ',' },
  reviewed: false,
  sources: [
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0024.01/DOC_1 (Publikāciju noformēšanas rokasgrāmata, Latvian PDF of 19 April 2022, read as text with pdfjs: 4.2.3 teksta sagatavošana (pēdiņas, saistītās atstarpes, skaitļi), 6.4 interpunkcijas zīmes un atstarpes, 6.5 interpunkcija skaitļos, 10.1.6 pēdiņas, 10.1.7 domuzīme, 10.7 saīsinājumi, simboli un akronīmi)',
    'https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: lv “…” at all three levels)',
  ],
  notes: [
    'Quotation: the ISG (4.2.3, 6.4 and 10.1.6) and the Publications Office table write “…” (U+201C, U+201D, both marks at the top, as in English) at every level, so a quotation inside a quotation is “…“…”…” here. This is not the German-shaped „…“ that a Latvian reader may expect from other sources: „…“ was suggested to this pack and was not found in the ISG, so it is not set; no Latviešu valodas aģentūra or Valsts valodas centrs page was read, so nothing says whether „…“ is also accepted by the national authority.',
    'The ISG puts single quotes ‘…’ around translations of words, explanations of meaning and plant variety names (4.2.3, 10.1.6). The engine cannot tell such a use from a nested quotation, so a top-level ‘…’ is not kept (the nesting level decides); this is not implemented. Quotes of the third level are set as “…” as well.',
    'Dash: ISG 10.1.7 sets a space on each side of the dash; its examples ("brīdinājuma zīme" – zīme, ila – ‘daba’) use the en dash, and 4.2.3 reserves the em dash for lists and empty table cells, so sentenceDash is U+2013.',
    'Not implemented, not verified: the ISG gives no list of one-letter words (k, s, v, z, a, i, o, u) to keep off the end of a line, so there are no orphans; elisions: none read; the abbreviation list is only those the ISG itself writes with a fixed space in 10.7 (u. c., u. tml., t. i., š. g., v. i., z. v., P. S.) and Nr.; lpp. (7.–13. lpp.) follows a number and is already kept with it by the number rule; the ISG writes a time range with full stops and an en dash (9.00–18.30, 10.1.7), but the range rule does not read a dotted time as a range, so 9.00-18.30 keeps its hyphen (a core limit, not a pack field; 9:00-18:30 works); the percentSpace flag also sets a space before €, which the ISG shows only as the code EUR.',
    'Numbers: ISG 6.5 gives a comma for decimals and a fixed space between groups of three; the engine groups from five digits, as it does in every language.',
  ].join(' '),
} as const satisfies LangPack;
