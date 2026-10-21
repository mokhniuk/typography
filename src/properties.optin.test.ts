import { describe, expect, test } from 'bun:test';
import { LANGS, type Lang, type QuoteStyle, typographic } from './core';

/**
 * The properties of properties.test.ts, run for each opt-in rule switched on (`enable`), with a
 * vocabulary of its own that is full of what the rule looks at. The generator is copied, not
 * imported, so the shared vocabulary there (and every seeded stream) stays as it is. A failure
 * prints the input, so it can be turned into a golden case.
 */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

/** Pieces every rule's vocabulary shares: words, spaces, breaks, quotes, other punctuation. */
const COMMON = [
  'a',
  'I',
  'word',
  'Dr.',
  'K.',
  'km',
  'и',
  'Haus',
  '5',
  '21',
  '2026',
  '10:00',
  ' ',
  ' ',
  ' ',
  '  ',
  '\n',
  '"',
  "'",
  '’',
  '“',
  '”',
  '«',
  '»',
  '-',
  '--',
  '—',
  '->',
  '...',
  '%',
  '(',
  ')',
  ',',
  '.',
  ':',
  ';',
  '!',
  '?',
];

/**
 * The same without quotation marks and dashes, for the stability check only: a lone quote mark or
 * a hyphen run is read differently on a second pass by the default quote and dash rules (the
 * shared property test feeds those rules well-formed text for that reason), whatever a rule here does.
 */
const CALM = COMMON.filter((piece) => !/["'’“”«»—-]/.test(piece));

const OWN: Record<string, readonly string[]> = {
  'space.before-punctuation': [
    ' ,',
    ' .',
    ' ;',
    ' :',
    ' !',
    ' ?',
    ' )',
    ' :)',
    ' ;-)',
    ' ...',
    ' …',
    ' .5',
    ' !=',
    ' ??',
    '10 :',
    '10 : 30',
    '\n ,',
    ',',
    '.',
    'Oui',
  ],
  'space.after-comma': [
    'a,b',
    ',x',
    '1,5',
    '1,000',
    '3,14',
    ',',
    ',,',
    'b,',
    ',\n',
    'ça,va',
    ',"x"',
    ',)',
  ],
  'punctuation.double': [
    '!!',
    '!!!',
    '??',
    '???',
    '?!',
    '!?',
    '!!?',
    'x!!',
    'w??',
    '!!x',
    '(!!y)',
    '?!!',
  ],
  'space.trailing': ['  \n', ' \n', '\t\n', '\t', ' \r\n', ' \n', '\n\n'],
  'symbol.plusminus': ['+-5', '+-', '+-0.2', 'a+-b', '1+-5', '(+-3)', '+-x', '+'],
  'symbol.fraction': [
    '1/2',
    '1/4',
    '3/4',
    '11/2',
    '1/20',
    'a1/2',
    '1/2/2026',
    '2/3',
    '2 1/2',
    '1/2 cup',
    '3/4 of',
    '1/',
    '/2',
    '0.1/2',
    '½',
    '¼',
    '¾',
  ],
  'symbol.degree': [
    '20°C',
    '20 °C',
    '20 C',
    '20 F',
    '20° C',
    '68 F',
    '-5 C',
    '20 °C',
    '20C',
    '20 Cat',
    '5 C.E.',
    'Vitamin C 5 C',
    'Type 2 F',
    'C',
    'F',
    '°',
  ],
  'symbol.implies': ['=>', '==>', '=>>', '=>=', '<=>', 'x=>y', ' => ', '=', '>', '<'],
};

/** Text inside which no rule may change anything. */
const ZONES = ['https://a.b/1/2?x=1,y=>z', 'info@a-b.org', '`1/2 20 C +-5 => a,b !! a ,`'];

function sample(
  rand: () => number,
  id: string,
  length: number,
  common: readonly string[] = COMMON,
  calm = false,
): string {
  const own = (OWN[id] ?? []).filter((piece) => !calm || !/["'’“”«»]/.test(piece));
  let out = '';
  for (let i = 0; i < length; i++) {
    if (i > 0 && rand() < 0.5) out += ' ';
    const own_ = rand() < 0.55;
    const list = own_ ? own : common;
    out += list[Math.floor(rand() * list.length)] ?? '';
  }
  return out;
}

/** Letters and digits in order; a fraction glyph counts as its digits (½ is 12), the other new marks as nothing. */
const letters = (text: string) =>
  text
    .replaceAll('½', '12')
    .replaceAll('¼', '14')
    .replaceAll('¾', '34')
    .replace(/[±°⇒]/g, '')
    .replace(/[^\p{L}\p{N}]/gu, '');

const CASES = 400;
const STYLES: QuoteStyle[] = ['language', 'us'];

function run(text: string, lang: Lang, quoteStyle: QuoteStyle, id: string): string {
  return typographic(text, lang, { quoteStyle, enable: [id] });
}

for (const id of Object.keys(OWN)) {
  describe(`properties of ${id}`, () => {
    for (const lang of LANGS) {
      for (const quoteStyle of STYLES) {
        const seed =
          1 +
          Object.keys(OWN).indexOf(id) * 101 +
          LANGS.indexOf(lang) * 7 +
          STYLES.indexOf(quoteStyle);
        const label = `${lang}/${quoteStyle}`;

        test(`${label}: a second pass changes nothing`, () => {
          const rand = random(seed);
          for (let i = 0; i < CASES; i++) {
            const input = sample(rand, id, 1 + Math.floor(rand() * 12), CALM, true);
            const once = run(input, lang, quoteStyle, id);
            const twice = run(once, lang, quoteStyle, id);
            if (once !== twice) {
              throw new Error(
                `not stable for ${JSON.stringify(input)} -> ${JSON.stringify(once)} -> ${JSON.stringify(twice)}`,
              );
            }
          }
        });

        test(`${label}: never loses or adds a letter or digit`, () => {
          const rand = random(seed + 5000);
          for (let i = 0; i < CASES; i++) {
            const input = sample(rand, id, 1 + Math.floor(rand() * 12));
            const output = run(input, lang, quoteStyle, id);
            if (letters(input) !== letters(output)) {
              throw new Error(
                `letters changed for ${JSON.stringify(input)} -> ${JSON.stringify(output)}`,
              );
            }
          }
        });

        test(`${label}: addresses, emails and code spans come back as written; never throws`, () => {
          const rand = random(seed + 9000);
          for (let i = 0; i < CASES; i++) {
            const zone = ZONES[i % ZONES.length] ?? '';
            const input = `${sample(rand, id, 4)} ${zone} ${sample(rand, id, 4)}`;
            let output = '';
            try {
              output = run(input, lang, quoteStyle, id);
            } catch (error) {
              throw new Error(`threw for ${JSON.stringify(input)}: ${String(error)}`);
            }
            if (!output.includes(zone)) {
              throw new Error(
                `zone changed for ${JSON.stringify(input)} -> ${JSON.stringify(output)}`,
              );
            }
          }
        });
      }
    }
  });
}

describe('the opt-in rules on arbitrary text', () => {
  test('never throw', () => {
    const rand = random(31);
    const enable = Object.keys(OWN);
    for (let i = 0; i < CASES; i++) {
      let input = '';
      for (let j = 0; j < 20; j++) input += String.fromCodePoint(Math.floor(rand() * 0x2fff) + 1);
      expect(() => typographic(input, 'en', { enable })).not.toThrow();
    }
  });
});
