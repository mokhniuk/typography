import { NBSP } from '../types.ts';
import type { LangPack } from './pack.ts';

export const hu = {
  code: 'hu',
  name: 'Hungarian (magyar)',
  sample:
    'Azt mondta "itt vagyunk" - és elment... A tábor szeptember 21-26., 10:00-12:00. Tovább ->',
  // „outer »inner« outer”, then ’third’. The » « pair is turned (open » close «), read by position.
  quotes: [
    ['„', '”'],
    ['»', '«'],
    ['’', '’'],
  ],
  turnedPairs: [['»', '«']],
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '–' },
  sentenceDash: '–',
  reviewed: false,
} as const satisfies LangPack;

export default hu;
