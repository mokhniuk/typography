import { NBSP } from '../types.ts';
import type { LangPack } from './pack.ts';

export const sk = {
  code: 'sk',
  name: 'Slovak (slovenčina)',
  sample:
    'Povedal "ideme k lesu" - a odišiel... Laboratórium beží 21-26 septembra, 10:00-12:00. Viac ->',
  // „outer ‚inner‘ outer“: low-high marks, the same shapes as German „…“ and not turned guillemets.
  quotes: [
    ['„', '“'],
    ['‚', '‘'],
  ],
  // v, k, s, u, z (prepositions), o, a, i; both cases. Editorial convention from secondary sources
  // (tvorim.net and sk.wikibooks name the words, grafeon.sk states the class); no Slovak authority could be read, so this is not a verified list.
  orphans: /(?<![\p{L}\p{N}])([kKsSvVzZoOuUaAiI])[ ]+(?=\S)/gu,
  // Two- and three-letter prepositions, for the rule space.short-word.
  // Editorial, like the orphan list: no Slovak authority could be read.
  shortWords: ['do', 'od', 'vo', 'na', 'so', 'za', 'po', 'pre', 'pri', 'nad', 'pod', 'bez'],
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '–' },
  sentenceDash: '–',
  reviewed: false,
} as const satisfies LangPack;

export default sk;
