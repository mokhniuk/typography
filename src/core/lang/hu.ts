import type { LangPack } from './pack';

export const hu = {
  code: 'hu',
  name: 'Hungarian (magyar)',
  sample:
    'Azt mondta "itt vagyunk" - és elment... A tábor szeptember 21-26., 10:00-12:00. Tovább ->',
  // „outer »inner« outer”, then ’third’. The » « pair is turned (open » close «), read by position.
  quotes: [
    ['„', '”'],
    ['»', '«'],
    ['’', '’'],
  ],
  turnedPairs: [['»', '«']],
  numbers: { group: ' ', decimal: ',' },
  reviewed: false,
  sources: [
    'https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages',
    'https://folyoirat.ludovika.hu/index.php/hadmernok/libraryFiles/downloadPublic/145',
    'https://commission.europa.eu/resources/europa-web-guide/design-content-and-development/content/web-writing-guidelines/dates-numbers-and-symbols_en',
  ],
  notes:
    'Quotes: „…” with »…« inside and ’…’ at the third level (EU Publications Office table); a Hungarian journal guide that follows A magyar helyesírás szabályai, 12th ed., gives „idézet »belső idézet« idézet vége”. The MTA rules themselves could not be read. Numbers: a no-break space groups thousands and the decimal mark is a comma (Commission web-writing guide). Not implemented, not verified: % and currency spacing, abbreviations, one-letter words, the sentence dash.',
} as const satisfies LangPack;
