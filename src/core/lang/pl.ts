import { ELISIONS_EN } from './elisions.ts';
import type { LangPack } from './pack.ts';

export const pl = {
  code: 'pl',
  name: 'Polish (polski)',
  sample:
    'Powiedział "jesteśmy tu" - i wyszedł... Laboratorium trwa 21-26 września, 10:00-12:00. Czytaj więcej ->',
  quotes: [
    ['„', '”'],
    ['«', '»'],
  ],
  orphans: /(?<![\p{L}\p{N}])([aAiIoOuUwWzZ])[ ]+(?=\S)/gu,
  // Two- and three-letter prepositions and conjunctions, for the rule space.short-word:
  // Wolański (PWN) says they may stay at a line end in body text but must travel with what they
  // belong to in a title, which is what the rule is for. The entries are editorial.
  shortWords: ['do', 'od', 'we', 'na', 'po', 'za', 'ze', 'dla', 'bez', 'pod', 'nad', 'lub', 'czy'],
  abbreviations: {
    bind: [
      'ul',
      'al',
      'pl',
      'os',
      'im',
      'godz',
      'zob',
      'np',
      'tzw',
      'tel',
      'ks',
      'św',
      'mgr',
      'inż',
    ],
    page: ['nr', 's', 'poz'],
  },
  elisions: ELISIONS_EN,
  numbers: { group: ' ', decimal: ',' },
  // CLDR 48 pl currency pattern "#,##0.00 ¤": a no-break space between the amount and the sign.
  // No percentSpace: PWN writes 50% (a space is allowed since 2020, not preferred); CLDR "#,##0%".
  currencySpace: true,
  dialogueDash: { mark: '—' },
  reviewed: false,
  sources: [
    'https://sjp.pwn.pl/poradnia/haslo/Pauza-dialogowa-a-myslnik;18816.html',
    'https://sjp.pwn.pl/poradnia/haslo/Sieroty-na-koncu-wiersza;18684.html',
    'https://style-guide.europa.eu/en/content/-/isg/topic?identifier=6.5-punctuation-in-figures',
    'https://sjp.pwn.pl/poradnia/haslo/Jeszcze-raz-o-spacji-lub-jej-braku-po-znaku;21530.html (PWN Poradnia, A. Wolański: "Jeszcze raz o spacji lub jej braku po znaku %", 26.11.2021; also "Odstępy lub ich brak w oznaczeniach jednostek miar", 7.03.2022, and "procent, proc., %", 26.01.2023)',
    'https://raw.githubusercontent.com/unicode-org/cldr-json/main/cldr-json/cldr-numbers-full/main/pl/numbers.json (CLDR 48, cldr-numbers-full 48.2.3: currency pattern "#,##0.00 ¤" with U+00A0, percent pattern "#,##0%")',
  ],
  notes:
    'One-letter conjunctions and prepositions are bound to the next word. Digits are grouped with a no-break space (number.group), as the Interinstitutional Style Guide sets for all languages; the decimal mark is a comma. Dialogue: a line of dialogue opens with the same dash as a break in the sentence, pauza or półpauza, spaced (PWN Poradnia, A. Wolański, "Pauza dialogowa a myślnik"); the engine uses the em dash it uses for a break. Percent: no space is set before % (PWN Poradnia, A. Wolański, 2023: "50% (nie: 50 %)", the Polish tradition); since the 2020 regulation on legal units of measure PWN also accepts 38,4 % (2021), so 50% stays 50% and a typed 38,4 % is left as typed. Currency: a no-break space between a number and € after it (49 €), from CLDR 48 (pl currency pattern "#,##0.00 ¤"); the PWN answer on zł was not read.',
} as const satisfies LangPack;

export default pl;
