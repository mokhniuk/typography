import type { LangPack } from './pack';

export const nl = {
  code: 'nl',
  name: 'Dutch (Nederlands)',
  sample:
    'Hij zei "ik zie \'t huis en zo\'n boom" - en ging... Het lab loopt 21-26 september, 10:00-12:00. Meer ->',
  // “outer ‘inner’ outer”: double marks for the quotation, single inside it.
  quotes: [
    ['“', '”'],
    ['‘', '’'],
  ],
  // ’s avonds, ’m, ’t huis: the apostrophe marks dropped letters and is not a quotation mark.
  elisions: ['s', 'm', 't'],
  reviewed: false,
  sources: [
    'https://taaladvies.net/dubbele-of-enkele-aanhalingstekens-bij-een-citaat/',
    'https://nl.wikipedia.org/wiki/Aanhalingsteken',
    'https://nl.wikipedia.org/wiki/Apostrof_in_de_Nederlandse_spelling',
    'https://www.vlaanderen.be/team-taaladvies/taaladviezen/apostrof-taalkundige-term-gebruik',
    'https://www.vlaanderen.be/team-taaladvies/taaladviezen/procentteken-spatie',
    'https://en.wikipedia.org/wiki/Quotation_mark',
  ],
  notes:
    'Quotes: Taaladvies.net (Taalunie) says there is no fixed rule: double marks were traditional, single are common now, one system consistently; for a quotation inside a quotation it gives double for the outer and single for the inner "of andersom". ' +
    'The pack sets “…” with ‘…’ inside, the pair the Wikipedia table gives as primary and secondary. ' +
    'The other system, `‘outer “inner” outer’`, and the traditional „…” with ‚…’ (nl.wikipedia calls „…” the Dutch double mark for speech) are read from the source but not set. ' +
    'Apostrophes: nl.wikipedia warns that a single quotation mark must not be confused with the apostrophe (’s morgens is not an opening quote). ' +
    '’s and ’m are listed there and ’s and ’n on the Flemish Team Taaladvies page; ’t is not on any page read, it is added as the same kind of dropped-letter form (’t huis), not verified. ' +
    "’n (’n feestje) is not set: the engine reads the elision n only as rock 'n' roll, so a lone ’n before a word is not protected. " +
    'Percent: Team Taaladvies says it is usually written without a space (the Belgian standard NBN Z 01-002 asks for one, for exact-science fields), so percentSpace is off. ' +
    'Not implemented, not verified: the EU Interinstitutional Style Guide could not be read (its pages are scripted and gave no text); number format, sentence dash, abbreviations, one-letter words (none is a Dutch convention in any page read).',
} as const satisfies LangPack;
