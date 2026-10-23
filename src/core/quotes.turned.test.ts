import { describe, expect, test } from 'bun:test';
import { corpus, lcg, longText } from '../../scripts/corpus.ts';
import { PACK } from './lang/index.ts';
import { quotes, turnedPair } from './quotes.ts';
import type { Lang } from './types.ts';

/**
 * The turned pairs (`turnedPairs` on a pack: German, Danish and Hungarian »…« and ›…‹). They were matched by
 * a regex that opened with a lookbehind, tried at every position of the text: German prose cost three times
 * English in the quote rule, whether or not it held a » at all. The rewrite finds the opening mark first and
 * reads the character before it by hand. The cases below pin what the engine did before the rewrite, the
 * ORIGINAL regex is kept verbatim as the reference for a fuzz, and a timing keeps the cost from coming back.
 * Never edit the reference to make a test pass.
 */

describe('turned pairs, as set before the rewrite', () => {
  const cases: [Lang, string, string][] = [
    ['de', '»a« und »b«', '»a« und »b«'],
    ['de', 'Er sagte: »Das ist ›gut‹ so.«', 'Er sagte: »Das ist ›gut‹ so.«'],
    // Right after a letter the » does not open a pair; it is read by where it stands.
    ['de', 'Wort»a« und b', 'Wort«a« und b'],
    ['de', 'x›a‹ und ›b‹', 'x«a« und »b«'],
    ['de', '»Am Anfang« stand es.', '»Am Anfang« stand es.'],
    ['de', 'Er sagte »ja«.', 'Er sagte »ja«.'],
    ['de', 'Ein Wort (»hier«) steht.', 'Ein Wort (»hier«) steht.'],
    ['de', '[»da«] und ', '[»da«] und »'],
    // Read as «…», the « and the » between two quotations would pair.
    ['de', '«a» und «b»', '»a« und »b«'],
    // A space after the opener or before the closer: no pair.
    ['de', '» a« und »b «', '» a« und »b «'],
    ['de', '»«', '»«'],
    ['da', 'Han sagde »hej« og gik.', 'Han sagde »hej« og gik.'],
    ['da', '»Hun sagde »nej« til ham«', '»Hun sagde »nej« til ham«'],
    ['da', 'ord»a« og »b«', 'ord«a« og »b«'],
    ['hu', 'Azt mondta: »Jó napot!«', 'Azt mondta: „Jó napot!”'],
    ['hu', 'szó»a« és »b«', 'szó”a” és „b”'],
    ['es', '¿»a«?', '¿«a»?'],
  ];
  for (const [lang, input, expected] of cases) {
    test(`${lang}: ${input}`, () => {
      expect(quotes(input, PACK[lang], 'display')).toBe(expected);
      expect(quotes(input, PACK[lang], 'literary')).toBe(expected);
    });
  }

  // The samples of the packs, then their output typeset again: the »…« it holds is a turned pair.
  const samples: [Lang, string][] = [
    [
      'de',
      'Er sagte »wir sind da« - und ging... Das Labor läuft 21-26 September, 10:00-12:00. Mehr lesen ->',
    ],
    [
      'da',
      'Hun sagde »vi er her« - og gik... Kurset løber 21-26 september, fra kl. 10.00. Læs mere ->',
    ],
    [
      'hu',
      'Azt mondta „itt vagyunk” - és elment... A tábor szeptember 21-26., 10:00-12:00. Tovább ->',
    ],
  ];
  for (const [lang, expected] of samples) {
    test(`the ${lang} pack sample, and its output again`, () => {
      expect(quotes(PACK[lang].sample, PACK[lang], 'display')).toBe(expected);
      expect(quotes(expected, PACK[lang], 'display')).toBe(expected);
      expect(quotes(expected.replace('„', '»').replace('”', '«'), PACK[lang], 'display')).toBe(
        expected,
      );
    });
  }
});

/** The ORIGINAL matcher of quotes.ts, verbatim, with what `setupOf` passed it. */
const RAW = '„“”‚‘’«»‹›"';
const BODY = `[^${RAW}]*`;
const OPEN = '\ue000';
const original = (open: string, close: string, before: string) =>
  new RegExp(`(?<=${before})${open}(?=\\S)(${BODY})(?<=\\S)${close}`, 'g');
const beforeOf = (openers: string) => {
  const extra = openers.replace(/[\\\]^-]/g, '\\$&');
  return {
    source: `^|[\\s(\\[${OPEN}${extra}]`,
    openerBefore: new RegExp(`[\\s(\\[${OPEN}${extra}]`),
  };
};
/** Shows what the setter was handed: the inner text and the characters on either side. */
const mark = (inner: string, before: string | undefined, after: string | undefined) =>
  `<${before ?? '^'}|${inner}|${after ?? '$'}>`;

const ALPHA = [
  '»',
  '«',
  '›',
  '‹',
  '»',
  '«',
  '"',
  '„',
  '“',
  ' ',
  ' ',
  ' ',
  '\t',
  '\n',
  'a',
  'Wort',
  'ß',
  '1',
  '.',
  ',',
  '(',
  ')',
  '[',
  ']',
  '¿',
  '¡',
  OPEN,
  '',
  '😀',
  '￼',
  '¦',
];
function fuzz(count: number, seed: number): string[] {
  const rand = lcg(seed);
  const out: string[] = [];
  for (let i = 0; i < count; i++) {
    let text = '';
    for (let n = 1 + Math.floor(rand() * 16); n > 0; n--)
      text += ALPHA[Math.floor(rand() * ALPHA.length)];
    out.push(text);
  }
  return out;
}
const longRuns = [
  '»'.repeat(3000),
  '»a'.repeat(3000),
  `${'a»b« '.repeat(1000)}${'(»b« '.repeat(1000)}`,
  `»${'a'.repeat(5000)}«`,
  `x»${'a'.repeat(5000)}« »${' '.repeat(3000)}«`,
  '»«'.repeat(3000),
  `${'›a‹ »b« '.repeat(1000)}`,
];
const samples = [
  ...corpus(2500, 11),
  ...fuzz(30000, 7),
  ...longRuns,
  ...(['de', 'da', 'hu'] as const).map((lang) => longText(20_000, 3, lang)),
];

describe('turnedPair equals its lookbehind original', () => {
  for (const [open, close] of [
    ['»', '«'],
    ['›', '‹'],
    // A closer that is not one of RAW keeps its lookbehind in the pattern (no pack has one).
    ['»', '¦'],
  ] as const) {
    for (const openers of ['', '¿¡']) {
      test(`${open}…${close}${openers ? `, openers ${openers}` : ''}`, () => {
        const { source, openerBefore } = beforeOf(openers);
        const ref = original(open, close, source);
        const run = turnedPair(open, close, openerBefore, mark);
        let changed = 0;
        for (const text of samples) {
          const expected = text.replace(
            ref,
            (match: string, inner: string, offset: number, whole: string) =>
              mark(inner, whole[offset - 1], whole[offset + match.length]),
          );
          if (run(text) !== expected) expect(run(text)).toBe(expected); // prints the input via the matcher
          if (expected !== text) changed++;
        }
        // The comparison is empty if the samples never reach the pair.
        expect(changed).toBeGreaterThan(150);
      });
    }
  }
});

/** Fastest of five runs, with a floor so that a sub-millisecond timing cannot make the ratio noisy. */
function best(run: () => unknown): number {
  let fastest = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 5; i++) {
    const start = performance.now();
    run();
    fastest = Math.min(fastest, performance.now() - start);
  }
  return Math.max(fastest, 2);
}

describe('a language with turned pairs costs about as much as English', () => {
  // Before the rewrite: German prose 10 ms against English 1.2 ms at 100 KB; the bound is 3x, loose on purpose.
  const pair = (name: string, de: string, en: string) =>
    test(name, () => {
      quotes(de.slice(0, 2000), PACK.de, 'display'); // warm the setter and its regexes
      quotes(en.slice(0, 2000), PACK.en, 'display');
      const german = best(() => quotes(de, PACK.de, 'display'));
      const english = best(() => quotes(en, PACK.en, 'display'));
      expect(german).toBeLessThan(english * 3);
    }, 30_000);

  pair('100 KB of prose', longText(100_000, 1, 'de'), longText(100_000, 1, 'en'));
  pair(
    '100 KB with a quotation in every sentence',
    'Er sagte »ja« und dann ›nein‹, (»gut«) so. '.repeat(2400),
    'He said “yes” and then ‘no’, (“good”) so. '.repeat(2400),
  );
});
