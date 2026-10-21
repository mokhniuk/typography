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
  dialogueDash: { mark: '—' },
  reviewed: false,
  sources: [
    'https://vitrinelinguistique.oqlf.gouv.qc.ca/23371/la-ponctuation/tiret/le-tiret-dans-les-dialogues',
    'https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures',
  ],
  notes:
    'A no-break space is set inside the guillemets. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a dash marks each change of speaker, with a no-break space after an opening dash (OQLF Vitrine linguistique, "Le tiret dans les dialogues" and its spacing table); the OQLF accepts the em and the en dash, the engine uses the em dash.',
} as const satisfies LangPack;
