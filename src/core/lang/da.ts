import { NBSP } from '../types.ts';
import type { LangPack } from './pack.ts';

export const da = {
  code: 'da',
  name: 'Danish (dansk)',
  sample:
    'Hun sagde "vi er her" - og gik... Kurset løber 21-26 september, fra kl. 10.00. Læs mere ->',
  // »…« at every level, also a quotation inside a quotation: »x »y« z« (ISG 4.2.3, 10.1).
  quotes: [['»', '«']],
  turnedPairs: [['»', '«']],
  // ISG 10.2 (s. 50, stk. 3, kl. 17.30), 4.2.3 (nr. and s. before a number) and 10.1 (33 mio. EUR).
  abbreviations: {
    bind: ['nr', 'stk', 'kl', 'mio', 'mia'],
    page: ['s'],
  },
  // ISG 6.4: a fixed space between the figure and %; 10.2: 15 %.
  percentSpace: true,
  // ISG part 3, 7 (euro): the € sign follows the figure, separated by a space (et beløb på 30 €); read in the Danish edition.
  currencySpace: true,
  // ISG 4.2.3 and 6.5: a comma for the decimals, a fixed space between groups of three digits.
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '—' },
  reviewed: false,
} as const satisfies LangPack;

export default da;
