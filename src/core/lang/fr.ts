import { NBSP } from '../types.ts';
import { ELISIONS_EN } from './elisions.ts';
import type { LangPack } from './pack.ts';

export const fr = {
  code: 'fr',
  name: 'French (français)',
  sample:
    'Il a dit "nous voilà" - et il est parti... Le labo dure 21-26 septembre, 10:00-12:00. Lire la suite ->',
  // French sets a non-breaking space inside the guillemets.
  quotes: [
    [`«${NBSP}`, `${NBSP}»`],
    ['“', '”'],
  ],
  percentSpace: true,
  currencySpace: true,
  // A no-break space before :, a narrow no-break space before ; ! ? (Lacroux, Orthotypographie;
  // OQLF): `space.high-punctuation` sets them, `space.before-punctuation` keeps them.
  highPunctuation: { colon: NBSP, others: '\u202F' },
  elisions: ELISIONS_EN,
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '—' },
  reviewed: false,
} as const satisfies LangPack;

export default fr;
