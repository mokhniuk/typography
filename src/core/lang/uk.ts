import { ELISIONS_EN } from './elisions.ts';
import type { LangPack } from './pack.ts';

export const uk = {
  code: 'uk',
  name: 'Ukrainian (українська)',
  sample:
    'Він сказав: "ми тут" - і пішов... Лабораторія триває 21-26 вересня, 10:00-12:00. Докладніше ->',
  quotes: [
    ['«', '»'],
    ['„', '“'],
    ['‚', '‘'],
  ],
  orphans: /(?<![\p{L}\p{N}])([аАвВіІїЇйЙзЗуУоО])[ ]+(?=\S)/gu,
  // Two- and three-letter prepositions and conjunctions, for the rule space.short-word
  // (titles and headings). Editorial, as the orphan letters are.
  shortWords: ['до', 'на', 'за', 'по', 'із', 'від', 'під', 'над', 'при', 'без', 'для', 'та', 'що'],
  abbreviations: {
    together: ['т. д.', 'т. п.', 'т. ч.'],
    bind: ['м', 'вул', 'просп', 'пров', 'пл', 'обл', 'ім', 'див', 'рис', 'табл'],
    page: ['с', 'ст', 'ч'],
  },
  // CLDR 48 uk currency pattern "#,##0.00 ¤": a no-break space between the amount and the sign.
  // No percentSpace: CLDR's uk percent pattern is "#,##0%", and Pravopys 2019 says nothing on it.
  currencySpace: true,
  dialogueDash: { mark: '—' },
  elisions: ELISIONS_EN,
  numbers: { group: ' ', decimal: ',' },
  reviewed: false,
  sources: [
    'https://www.pravopys.net/sections/125/',
    'https://slovnyk.ua/pravopys.php?prav_par=167 (Український правопис 2019, § 164 «Лапки», § 167 «Розділові знаки для оформлення прямої мови та цитат», as published on slovnyk.ua; not compared with the official PDF)',
    'https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-numbers-full/main/uk/numbers.json (CLDR 48, cldr-numbers-full 48.2.3: currency pattern "#,##0.00 ¤" with U+00A0, percent pattern "#,##0%")',
    'https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures',
  ],
  notes:
    'The literary register keeps the display quotes; the dialogue dash (an em dash and a no-break space) is set in both registers. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a paragraph of direct speech opens with тире (Український правопис § 125, the 1993 rules as published on pravopys.net); the 2019 edition says the same in § 167, read on slovnyk.ua, a section-by-section copy, because the official PDF on mon.gov.ua could not be fetched (the copy was not compared with the PDF). Quotes: § 164 of the 2019 edition recommends «…» outside and “…” inside and lists „…“ as a further form; the pack keeps „…“ inside (CLDR). Currency: a no-break space between a number and € after it (49 €), from CLDR 48 (uk currency pattern "#,##0.00 ¤"); no national guide on it was read, and the Pravopys 2019 sections read say nothing on currency or %. No space is set before %: the CLDR uk percent pattern is "#,##0%".',
} as const satisfies LangPack;

export default uk;
