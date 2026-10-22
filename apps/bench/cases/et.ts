import type { LangBench } from '../langs';

// „…“ at every level (ISG 4.2.3, 5.10, 10.1.6); ‚…‘ inside is accepted as the other convention in use.
export const et: LangBench = {
  code: 'et',
  lead: 'Ta ütles',
  pairs: [['„', '“']],
  nest: [
    ['„', '“', '„', '“'],
    ['„', '“', '‚', '‘'],
  ],
  quote: { input: 'Ta ütles "maja" ja läks', word: 'maja' },
  dash: 'Kivi - mälu - ja aeg',
  range: 'leheküljed 21-26 ja 10:00-12:00',
  sample:
    'Ta ütles "me oleme siin" - ja läks... Kestab 21-26 septembrini, 5% rohkem, nt kolm päeva. Loe edasi ->',
};
