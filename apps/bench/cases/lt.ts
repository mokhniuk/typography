import type { LangBench } from '../langs';

// „…“ at every level (ISG 4.2.3, 10.1.7); ‚…‘ inside is accepted as the other convention in use.
export const lt: LangBench = {
  code: 'lt',
  lead: 'Jis pasakė',
  pairs: [['„', '“']],
  nest: [
    ['„', '“', '„', '“'],
    ['„', '“', '‚', '‘'],
  ],
  quote: { input: 'Jis pasakė "namas" ir išėjo', word: 'namas' },
  dash: 'Akmuo - atmintis - ir laikas',
  range: 'puslapiai 21-26 ir 10:00-12:00',
  sample:
    'Jis pasakė "štai mes" - ir išėjo... Vyks 21-26 rugsėjo, 5% daugiau, t. y. šią savaitę. Skaityti daugiau ->',
};
