import { NBSP } from '../types.ts';
import type { LangPack } from './pack.ts';

export const it = {
  code: 'it',
  name: 'Italian (italiano)',
  sample:
    'Disse "siamo qui" - e uscì... Il laboratorio dura 21-26 settembre, 10:00-12:00. Leggi di più ->',
  // «livello 1 “livello 2 ‘livello 3’ livello 2” livello 1», ISG 4.2.3.
  quotes: [
    ['«', '»'],
    ['“', '”'],
    ['‘', '’'],
  ],
  // The abbreviations of ISG annex A3 that introduce a number (n. 5, pag. 12) or that are written
  // in two parts (p. es.), the ones the ISG shows with a fixed space (4.2.3: n.• pag.•).
  abbreviations: {
    together: ['p. es.', 'ad es.', 'op. cit.'],
    page: ['n', 'pag', 'pagg', 'art', 'par', 'parr', 'vol', 'voll'],
  },
  // ISG 6.4 (common to all languages): a fixed space before %.
  percentSpace: true,
  // ISG part 3, 7 (euro): the € sign follows the figure, separated by a space (30 €); read in the Italian edition.
  currencySpace: true,
  // ISG 6.5: a comma for the decimals, a fixed space between groups of three digits.
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '—' },
  // Treccani, Enciclopedia dell'italiano, "apostrofo" (Definizione, Casi incerti, Errori comuni) and
  // "troncamento": the imperatives da', di', fa', sta', va' and the truncations po', be', mo', pie', que'.
  truncations: ['da', 'di', 'fa', 'sta', 'va', 'po', 'be', 'mo', 'pie', 'que'],
  reviewed: false,
} as const satisfies LangPack;

export default it;
