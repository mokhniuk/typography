import type { LangBench } from '../langs';

export const nl: LangBench = {
  code: 'nl',
  lead: 'Hij zei',
  // Taaladvies.net allows double or single marks for the quotation, the other kind inside it;
  // the traditional „…” is read too.
  pairs: [
    ['“', '”'],
    ['‘', '’'],
    ['„', '”'],
  ],
  nest: [
    ['“', '”', '‘', '’'],
    ['‘', '’', '“', '”'],
    ['„', '”', '‚', '’'],
  ],
  quote: { input: 'Hij zei "huis" en ging', word: 'huis' },
  dash: 'Steen - geheugen - en tijd',
  range: 'pagina 21-26 en 10:00-12:00',
  sample: 'Hij zei "ik zie \'t huis" - en ging... Het duurt 21-26 september. Meer ->',
};
