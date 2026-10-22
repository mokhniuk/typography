import type { LangBench } from '../langs';

export const sk: LangBench = {
  code: 'sk',
  lead: 'Povedal',
  // „…“ with ‚…‘ inside; »…« ›…‹ is the alternative the Wikipedia table lists.
  pairs: [
    ['„', '“'],
    ['»', '«'],
  ],
  nest: [
    ['„', '“', '‚', '‘'],
    ['„', '“', '›', '‹'],
  ],
  quote: { input: 'Povedal "dom" a odišiel', word: 'dom' },
  dash: 'Kameň - pamäť - a čas',
  range: 'strany 21-26 a 10:00-12:00',
  sample: 'Povedal "ideme k lesu" - a odišiel... Trvá 21-26 septembra. Viac ->',
};
