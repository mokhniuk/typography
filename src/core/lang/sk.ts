import { NBSP } from '../types';
import type { LangPack } from './pack';

export const sk = {
  code: 'sk',
  name: 'Slovak (slovenčina)',
  sample: 'Povedal "ideme k lesu" - a odišiel... Laboratórium beží 21-26 septembra, 10:00-12:00. Viac ->',
  // „outer ‚inner‘ outer“: low-high marks, the same shapes as German „…“ and not turned guillemets.
  quotes: [
    ['„', '“'],
    ['‚', '‘'],
  ],
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '–' },
  sentenceDash: '–',
  reviewed: false,
  sources: [
    'https://www.juls.savba.sk/ediela/psp2000/psp.pdf',
    'https://www.teraz.sk/slovencina/slovencina-ako-pouzivat-slovenske/348361-clanok.html',
    'https://touchit.sk/jazykove-okienko-ako-je-to-s-pisanim-cisloviek/127957/',
    'https://en.wikipedia.org/wiki/Quotation_mark',
  ],
  notes:
    'Quotes: „…“ with ‚…‘ inside. Read from a TASR language column that cites Pravidlá slovenského pravopisu (2000, s. 107 – 108) and gives „…“ and the single ‚…‘ for a quotation inside one; ' +
    'the Pravidlá themselves (juls.savba.sk PDF) could not be read, and the Wikipedia table lists »…« and ›…‹ as the alternative, which is not set. ' +
    'Number format: groups of three digits separated by a space, decimal comma (a column by an expert of Jazykovedný ústav Ľ. Štúra, touchit.sk, citing the Pravidlá 2013); carried only, the engine does not read it yet. ' +
    'Not implemented, not verified: the EU Interinstitutional Style Guide could not be read (its pages are scripted and gave no text); ' +
    'one-letter prepositions and conjunctions at line end (k, s, v, z, o, u, a, i are bound in Czech by the Czech authority, but no Slovak authority page was read, so Slovak is not set); ' +
    'a space before % (a secondary overview says Slovak writes 50 %, not confirmed against the Pravidlá; a space already written is still kept with its number by the number-unit rule); ' +
    'abbreviations. ' +
    'Dialogue and the sentence dash: dashes are the newer alternative to quotes for direct speech, spaced, with one before the attribution (Pravidlá slovenského pravopisu, 3rd ed., 2000, úvodzovky and pomlčka 10).',
} as const satisfies LangPack;
