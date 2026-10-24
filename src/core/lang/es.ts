import { NBSP } from '../types.ts';
import type { LangPack } from './pack.ts';

export const es = {
  code: 'es',
  name: 'Spanish (español)',
  sample:
    '¿Dijo "ya estamos aquí" - y se fue...? El laboratorio dura 21-26 de septiembre, 10:00-12:00. Leer más ->',
  // «outer “inner ‘third’ inner” outer», ISG 10.1.12.
  quotes: [
    ['«', '»'],
    ['“', '”'],
    ['‘', '’'],
  ],
  // ¿ and ¡ may stand right before an opening mark: ¿«Qué»?
  openers: '¿¡',
  // ISG 10.4: an abbreviation is never split at the end of a line; the examples it gives are listed.
  abbreviations: {
    together: ['EE. UU.', 'JJ. OO.', 'a. m.', 'p. m.', 'N. B.'],
    bind: ['Sr'],
    page: ['p', 'pp'],
  },
  // ISG 10.3.1.4: a fixed space between the figure and % ; ISG 7.3.3: between the figure and the code EUR.
  percentSpace: true,
  currencySpace: true,
  // ISG 6.5: a comma for the decimals, a fixed space between groups of three digits.
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '—', attached: true },
  reviewed: false,
} as const satisfies LangPack;

export default es;
