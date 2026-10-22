import type { LangBench } from '../langs';

// “…” at every level (ISG 4.2.3, 6.4, 10.1.6); „…“ is accepted too, because Latvian text is often set so.
export const lv: LangBench = {
  code: 'lv',
  lead: 'Viņš teica',
  pairs: [
    ['“', '”'],
    ['„', '“'],
  ],
  nest: [
    ['“', '”', '“', '”'],
    ['“', '”', '‘', '’'],
    ['„', '“', '„', '“'],
    ['„', '“', '‚', '‘'],
  ],
  quote: { input: 'Viņš teica "māja" un aizgāja', word: 'māja' },
  dash: 'Akmens - atmiņa - un laiks',
  range: 'lappuses 21-26 un 10:00-12:00',
  sample:
    'Viņš teica "mēs esam šeit" - un aizgāja... Notiks 21-26. septembrī, 5% vairāk, t. i. šonedēļ. Lasīt vairāk ->',
};
