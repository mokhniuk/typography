import type { PackProse } from '../pack.ts';

export const en: PackProse = {
  sources: [
    'https://commission.europa.eu/system/files/2023-11/styleguide_english_dgt_en.pdf',
    'https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures',
  ],
  notes:
    "Display register uses “…” with ‘…’ inside, as CLDR gives English; British quotes (‘…’ with “…” inside) are the literary register; quoteStyle: 'guillemets' sets the former house style, «…» with „…“ inside. Digits of a number of five or more are grouped with a comma (opt-in rule number.group): the EU English Style Guide sets a hard space in running text and allows a comma for web writing, promotional material and press releases, which is what this engine is for. The separator is the pack field numbers.group (a no-break space is the EU form).",
};
