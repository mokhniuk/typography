import { NBSP } from '../types.ts';
import type { LangPack } from './pack.ts';

export const hr = {
  code: 'hr',
  name: 'Croatian (hrvatski)',
  sample:
    'Rekao je "idemo u šumu" - i otišao... Laboratorij radi 21-26. rujna, 10:00-12:00, popust 15%. Više ->',
  // „outer ‚inner’ outer”, and the second level again at the third: ISG 10.1.8 and 4.2.3.
  quotes: [
    ['„', '”'],
    ['‚', '’'],
    ['‚', '’'],
  ],
  // ISG 10.1.12: br. and str. keep a fixed space between them and the number that follows.
  abbreviations: { page: ['br', 'str'] },
  // ISG 6.4 and 10.1.12: a fixed space before %; ISG 7.3.3: a fixed space between amount and EUR / the euro sign.
  percentSpace: true,
  currencySpace: true,
  // ISG 6.5 and 10.1.12: a comma for decimals, a fixed space inside numbers of several digits.
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '–' },
  sentenceDash: '–',
  reviewed: false,
  sources: [
    'https://pravopis.hr/pravilo/pravopisni-znakovi-u-upravnome-govoru/72/',
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0023.01/DOC_1 (Međuinstitucijski stilski priručnik, Croatian ISG, PDF of 19 April 2022: 4.2.3 navodnici, 6.4 interpunkcija i razmaci, 6.5 interpunkcija unutar brojeva, 7.3.3 pravila pisanja monetarnih jedinica, 10.1.8 navodnici, 10.1.10 crtica, 10.1.12 nedjeljivi razmaci, 10.7 kratice)',
  ],
  notes: [
    'Dialogue and the sentence dash: printed text may set direct speech with dashes instead of quotes, a spaced en dash opening the line and one before the attribution (Institut za hrvatski jezik, Hrvatski pravopis, § 8.16.1).',
    'Quotes: the ISG (10.1.8) names two levels, „…” (Alt 0132, Alt 0148) and ‚…’ (Alt 0130, Alt 0146), and says that a third level reuses the second; the pack lists that third level, so a fourth level starts over from „…”, which the ISG does not mention. The alternative »…« was not found in the ISG and is not set. No other tool or source was read for Croatian: the Hrvatski pravopis (Institut za hrvatski jezik) was not opened, so whether the national orthography differs is not verified.',
    'Percent and euro: ISG 6.4 shows "00●%" and 10.1.12 lists "15 %" among the fixed spaces; ISG 7.3.3 puts a fixed space between the amount and the code EUR (12 500 EUR). The euro sign is covered by the same rule as in the other packs; the ISG discourages it in running text, so the space before € follows the code.',
    'Abbreviations: only br. and str. before a number (ISG 10.1.12, "između kratica br. ili str. i broja koji slijedi"). Other abbreviations (ISG 10.7 on kratice and pokrate) carry no no-break rule and no list is given, so none is invented.',
    'Numbers: ISG 6.5 prescribes groups of three digits with a space and a comma for decimals; 10.1.12 lists "11 500" among fixed spaces. The grouping is the opt-in rule number.group.',
    'Not implemented, not verified: one-letter prepositions and conjunctions (k, s, u, o, i, a) are not kept off the end of a line, because the ISG states no such rule and the Hrvatski pravopis was not read; the sentence dash is the engine\'s default em dash, while ISG 10.1.10 only sets em dash for vertical lists and en dash (no spaces) for ranges, and gives no rule for a dash in a sentence; dates and ordinals ("13. rujna 1959.", "članak 3.") are listed in 10.1.12 as fixed spaces, but the engine has no field for them.',
  ].join(' '),
} as const satisfies LangPack;
