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
} as const satisfies LangPack;

export default hr;
