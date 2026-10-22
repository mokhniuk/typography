import type { LangBench } from '../langs';

export const sv: LangBench = {
  code: 'sv',
  lead: 'Han sa',
  pairs: [
    ['”', '”'],
    ['’', '’'],
  ],
  nest: [['”', '”', '’', '’']],
  quote: { input: 'Han sa "hus" och gick', word: 'hus' },
  dash: 'Sten - minne - och tid',
  range: 'sidorna 21-26 och 10:00-12:00',
  sample: 'Han sa "vi är här" - och gick... Det pågår 21-26 september. Mer ->',
};
