import { NBSP } from '../types.ts';
import type { LangPack } from './pack.ts';

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
  currencySpace: false,
  // ISG 6.5: a comma for the decimals, a fixed space between groups of three digits.
  numbers: { group: NBSP, decimal: ',' },
  reviewed: false,
} as const satisfies LangPack;

export default lv;
