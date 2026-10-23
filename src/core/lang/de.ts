import { ELISIONS_EN } from './elisions.ts';
import type { LangPack } from './pack.ts';

export const de = {
  code: 'de',
  name: 'German (Deutsch)',
  sample:
    'Er sagte "wir sind da" - und ging... Das Labor läuft 21-26 September, 10:00-12:00. Mehr lesen ->',
  // »outer ›inner‹ outer«, the single guillemets inside the double ones. A third level starts over from »…«.
  quotes: [
    ['»', '«'],
    ['›', '‹'],
  ],
  turnedPairs: [
    ['»', '«'],
    ['›', '‹'],
  ],
  abbreviations: {
    together: ['z. B.', 'd. h.', 'u. a.', 'u. U.', 'i. d. R.', 'v. a.', 's. o.', 's. u.'],
    bind: ['Nr', 'Abb', 'Tab', 'Tel', 'Bd', 'Hrsg', 'vgl', 'ca'],
    page: ['S'],
  },
  sentenceDash: '–',
  sentenceDashLiterary: '–',
  percentSpace: true,
  currencySpace: true,
  elisions: ELISIONS_EN,
  numbers: { group: ' ', decimal: ',' },
  reviewed: false,
  sources: [
    'https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures',
  ],
  notes:
    'The other German style, `„outer ‚inner‘ outer“`, is a literary profile that does not exist yet. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; a point is not used for thousands. The decimal mark is a comma.',
} as const satisfies LangPack;

export default de;
