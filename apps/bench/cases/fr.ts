import type { LangBench } from '../langs';

export const fr: LangBench = {
  code: 'fr',
  lead: 'Il a dit',
  pairs: [['«', '»']],
  nest: [['«', '»', '“', '”']],
  quote: { input: 'Il a dit "maison" et il est parti', word: 'maison' },
  dash: 'Pierre - mémoire - et temps',
  range: 'pages 21-26 et 10:00-12:00',
  sample: 'Il a dit "nous voilà" - et il est parti... Cela dure 21-26 septembre, 5% de plus. Lire ->',
};
