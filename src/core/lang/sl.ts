import { NBSP } from '../types';
import type { LangPack } from './pack';

export const sl = {
  code: 'sl',
  name: 'Slovenian (slovenščina)',
  sample:
    'Rekel je "gremo v gozd" - in odšel... Laboratorij deluje 21-26 septembra, 10:00-12:00, 15% popusta. Več ->',
  // „outer ‚inner‘ outer“, and the second level again at the third: ISG 10.1.6 and 4.2.3.
  quotes: [
    ['„', '“'],
    ['‚', '‘'],
    ['‚', '‘'],
  ],
  // ISG 10.1.7: the en dash is the stronger mark than a comma; the ISG itself sets it with spaces.
  sentenceDash: '–',
  sentenceDashLiterary: '–',
  // ISG 4.2.3: št. and str. keep a fixed space between them and what follows (št. UL L, str. UL C, a number).
  abbreviations: { page: ['št', 'str'] },
  // ISG 6.4 and 10.8: a fixed space between the number and %; ISG 7.3.3: between amount and EUR / the euro sign.
  percentSpace: true,
  // ISG 4.2.3 and 6.5: a comma for decimals, a fixed space between groups of three digits.
  numbers: { group: NBSP, decimal: ',' },
  reviewed: false,
  sources: [
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0010.01/DOC_1 (Medinstitucionalni slogovni priročnik, Slovenian ISG, PDF of 19 April 2022: 4.2.3 narekovaji, števila and nedeljivi presledki, 6.4 ločila in presledki, 6.5 postavljanje ločil v številih, 7.3.3 denarne enote, 10.1.6 narekovaj, 10.1.7 pomišljaj, 10.8 razno)',
  ],
  notes: [
    'Quotes: the ISG (10.1.6) sets „…“ (Alt 0132, Alt 0147) for a literal quotation and ‚…‘ (Alt 0130, Alt 0145) only inside it and at the third level („xxx ‚xxx ‚xxx‘ xxx‘ xxx“); 4.2.3 says the third level reuses the second. A fourth level starts over from „…“ here, which the ISG does not mention. The alternative »…« was not found in the ISG and is not set; Slovenski pravopis (ZRC SAZU) was not opened.',
    'Dash: ISG 10.1.7 names the en dash (pomišljaj) as a stronger mark than a comma and a glossing device; whether it is spaced is not stated in the section (the table in 6.4 shows "xx – xx" as well as "xx–xx", and the guide\'s own running text sets it spaced), so the spaced en dash is taken from the guide\'s own text, not from a stated rule. The em dash is for list bullets (10.1.8).',
    'Percent and euro: ISG 6.4 shows "00●%", 10.8 requires a fixed space between a number and its unit (15 %); 7.3.3 puts a fixed space between the amount and EUR, or the euro sign.',
    'Abbreviations: only št. and str., which the ISG shows with a fixed space (4.2.3: "št.• UL L", "str.• UL C"); the engine binds them to a following number. No abbreviation list was read, so none is invented.',
    'Numbers: ISG 4.2.3 and 6.5 prescribe groups of three digits separated by a fixed space and a comma for decimals; numbers that number things (years, pages) are written without a space. The grouping is the opt-in rule number.group.',
    'Not implemented, not verified: one-letter prepositions and conjunctions (k, s, v, z, o, a, i, u) are not kept off the end of a line, because the ISG states no such rule and Slovenski pravopis was not read; the period placement relative to a closing quotation mark (10.1.6) is a punctuation-in-quotes rule the engine does not have.',
  ].join(' '),
} as const satisfies LangPack;
