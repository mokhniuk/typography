import type { LangBench } from '../langs';

// «…» then “…” (Manuale interistituzionale 4.2.3, Treccani); “…” then ‘…’ is the other usual order.
export const it: LangBench = {
  code: 'it',
  lead: 'Disse',
  pairs: [
    ['«', '»'],
    ['“', '”'],
  ],
  nest: [
    ['«', '»', '“', '”'],
    ['“', '”', '‘', '’'],
  ],
  quote: { input: 'Disse "casa" e uscì', word: 'casa' },
  dash: 'Pietra - memoria - e tempo',
  range: 'pagine 21-26 e 10:00-12:00',
  sample:
    "Disse \"l'amico è qui\" - e uscì... Dura 21-26 settembre, un po' di più, il 5% a pag. 12. Leggi ->",
};
