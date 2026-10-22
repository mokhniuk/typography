import type { LangBench } from '../langs';

// «…» then “…” (Libro de estilo interinstitucional 10.1.12); “…” then ‘…’ is the Latin American order.
export const es: LangBench = {
  code: 'es',
  lead: 'Dijo',
  pairs: [
    ['«', '»'],
    ['“', '”'],
  ],
  nest: [
    ['«', '»', '“', '”'],
    ['“', '”', '‘', '’'],
  ],
  quote: { input: 'Dijo "casa" y se fue', word: 'casa' },
  dash: 'Piedra - memoria - y tiempo',
  range: 'páginas 21-26 y 10:00-12:00',
  sample:
    '¿Dijo "ya estamos aquí" - y se fue...? Dura 21-26 de septiembre, el 5% más, EE. UU. Leer más ->',
};
