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
  numbers: { group: NBSP, decimal: ',' },
  reviewed: false,
  sources: ['https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures'],
  notes:
    'A no-break space is set inside the guillemets. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma.',
} as const satisfies LangPack;
