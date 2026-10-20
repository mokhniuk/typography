import { NBSP } from '../types';
import { ELISIONS_EN } from './en';
import type { LangPack } from './pack';

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
  elisions: ELISIONS_EN,
  reviewed: false,
  sources: [],
  notes: 'A no-break space is set inside the guillemets.',
} as const satisfies LangPack;
