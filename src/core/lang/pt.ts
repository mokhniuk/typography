import { NBSP } from '../types';
import type { LangPack } from './pack';

export const pt = {
  code: 'pt',
  name: 'Portuguese (português)',
  sample:
    'Ele disse "estamos aqui" - e saiu... O laboratório dura 21-26 de setembro, 10:00-12:00. Ler mais ->',
  // European Portuguese: «nível 1 “nível 2 ‘nível 3’ nível 2” nível 1», ISG 4.2.3.
  quotes: [
    ['«', '»'],
    ['“', '”'],
    ['‘', '’'],
  ],
  // Abbreviations of ISG annex A3 written in two parts (p. ex., a. C.) and the ones that introduce
  // a number (p. 12, fig. 3); the ISG shows p. with a fixed space (4.2.3: p.• JO C).
  abbreviations: {
    together: ['p. ex.', 'a. C.', 'd. C.', 'N. B.', 'P. S.', 'S. A.', 'S. M.'],
    bind: ['Av'],
    page: ['p', 'cap', 'fig', 'vol'],
  },
  // ISG 6.4 (common to all languages) and A3 (15 % da produção): a fixed space before %.
  percentSpace: true,
  // ISG 6.5: a comma for the decimals, a space between groups of three digits.
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '—' },
  reviewed: false,
  sources: [
    'https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/travessao-no-discurso-directo/8747',
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0008.01/DOC_1 (Código de Redação Interinstitucional, Portuguese of Portugal, PDF of 19 April 2022: 4.2.3 níveis de aspas and espaço protegido, 6.4 espaçamento dos sinais de pontuação, 6.5 pontuação nos números, 10.4.8 travessão, 10.4.10 aspas, anexo A3 abreviaturas)',
    'https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: pt «…» “…” ‘…’)',
    'https://ciberduvidas.iscte-iul.pt/consultorio/perguntas/o-uso-das-aspas--e-/13051 (Ciberdúvidas da Língua Portuguesa: «…» for quotation, “…” for a quotation inside a transcription, ‘…’ for a third level; example «O chefe disse ao seu subordinado: “Disfarce quando ouvir a palavra ‘relatório’, combinado?”»)',
    'https://pt.wikipedia.org/wiki/Aspas (cross-check only: Portugal «…», Brazil “…” ‘…’)',
  ],
  notes: [
    'Dialogue: the travessão opens each turn and sets off the narrator, spaced in the examples (Ciberdúvidas, "Travessão no discurso directo"); no rule on spacing was found.',
    'European Portuguese is chosen because the audience is the EU: «…» then “…” then ‘…’, as in the Código de Redação Interinstitucional and at Ciberdúvidas (whose answer describes its own house style, the one used here). Brazilian Portuguese writes “…” with ‘…’ inside (Wikipedia, cross-check), which quoteStyle: \'us\' gives; no Brazilian style guide was read, and the Brazilian number format and abbreviations were not looked at.',
    'Not implemented, not verified: no source read gives a list of one-letter words (a, e, o) to keep off the end of a line, so there are no orphans; the travessão of 10.4.8 is the em dash, which is the default, and the dialogue dash is the same em dash, set from Ciberdúvidas above; the ordinals n.º and the forms Dr.ª, Sr.ª of annex A3 are not covered; elisions: a Portuguese apostrophe inside a word (d’Ouro) is already read as an apostrophe by the engine and no word starting with an apostrophe was found in a source; the space before € comes with the single percentSpace flag; the ISG table read shows the space before % only.',
  ].join(' '),
} as const satisfies LangPack;
