import { ELISIONS_EN } from './en';
import type { LangPack } from './pack';

export const uk = {
  code: 'uk',
  name: 'Ukrainian (українська)',
  sample:
    'Він сказав: "ми тут" - і пішов... Лабораторія триває 21-26 вересня, 10:00-12:00. Докладніше ->',
  quotes: [
    ['«', '»'],
    ['„', '“'],
    ['‚', '‘'],
  ],
  orphans: /(?<![\p{L}\p{N}])([аАвВіІїЇйЙзЗуУоО])[ ]+(?=\S)/gu,
  abbreviations: {
    together: ['т. д.', 'т. п.', 'т. ч.'],
    bind: ['м', 'вул', 'просп', 'пров', 'пл', 'обл', 'ім', 'див', 'рис', 'табл'],
    page: ['с', 'ст', 'ч'],
  },
  dialogueDash: true,
  elisions: ELISIONS_EN,
  reviewed: false,
  sources: [],
  notes:
    'The literary register keeps the display quotes; what differs is the dialogue dash (an em dash and a no-break space).',
} as const satisfies LangPack;
