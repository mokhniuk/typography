import type { LangBench } from '../langs';

// Portugal «…» then “…” (Código de Redação Interinstitucional 4.2.3); Brazil “…” then ‘…’.
export const pt: LangBench = {
  code: 'pt',
  lead: 'Ele disse',
  pairs: [
    ['«', '»'],
    ['“', '”'],
  ],
  nest: [
    ['«', '»', '“', '”'],
    ['“', '”', '‘', '’'],
  ],
  quote: { input: 'Ele disse "casa" e saiu', word: 'casa' },
  dash: 'Pedra - memória - e tempo',
  range: 'páginas 21-26 e 10:00-12:00',
  sample: 'Ele disse "estamos aqui" - e saiu... Dura 21-26 de setembro, 5% mais, p. ex. isto. Ler ->',
};
