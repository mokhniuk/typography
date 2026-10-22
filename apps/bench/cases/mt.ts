import type { LangBench } from '../langs';

// “…” then ‘…’ (ISG 4.2.3, Publications Office table); the sources allow no other order.
export const mt: LangBench = {
  code: 'mt',
  lead: 'Qal',
  pairs: [
    ['“', '”'],
    ['‘', '’'],
  ],
  nest: [['“', '”', '‘', '’']],
  quote: { input: 'Qal "dar" u telaq', word: 'dar' },
  dash: 'Ġebla - memorja - u żmien',
  range: 'paġni 21-26 u 10:00-12:00',
  sample:
    'Qal "il-ktieb ta\' Mario hawn" - u telaq... Idum 21-26 Settembru, 5% m\'hu p. 12. Aqra aktar ->',
};
