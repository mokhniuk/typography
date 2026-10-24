import type { LangPack } from './pack.ts';

export const nl = {
  code: 'nl',
  name: 'Dutch (Nederlands)',
  sample:
    'Hij zei "ik zie \'t huis en zo\'n boom" - en ging... Het lab loopt 21-26 september, 10:00-12:00. Meer ->',
  // “outer ‘inner’ outer”: double marks for the quotation, single inside it.
  quotes: [
    ['“', '”'],
    ['‘', '’'],
  ],
  // ’s avonds, ’m, ’t huis: the apostrophe marks dropped letters and is not a quotation mark.
  elisions: ['s', 'm', 't'],
  reviewed: false,
} as const satisfies LangPack;

export default nl;
