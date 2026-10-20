import { describe, expect, test } from 'bun:test';
import { corpus, lcg } from '../../scripts/corpus';
import { dashSentence } from './dashes';
import { trailingSpace } from './extra';
import { arrowSpace, association } from './spaces';
import { shield } from './zones';

/**
 * Rules and passes that were quadratic on a long run of one character (a regex tried from every
 * position of the run, each try scanning to the end of it) and were rewritten to find a literal
 * first and read the run by hand. Each block holds the ORIGINAL implementation verbatim as the
 * reference, checks the rewrite against it on the seeded corpus, a fuzz of the marks the rule cares
 * about and long runs, and checks that 4x the text takes well under 16x the time (a quadratic one
 * takes about 16x; linear about 4x; the bound is 10x, loose on purpose). Never edit a reference to
 * make a test pass.
 */

/**
 * JavaScriptCore reads a lone high surrogate followed by a unit from U+E000 up as half of a pair in some
 * compiled paths and not in others (see lookbehind.test.ts): ill-formed text only, left out.
 */
const ILL_FORMED = /[\ud800-\udbff](?![\udc00-\udfff])[-￿]/;

/**
 * A JavaScriptCore bug in the ORIGINAL zone regex (Bun 1.3, `u` flag): when its email alternative scans a
 * run of word characters, dots, plus signs and hyphens that holds a `www.`, and an astral character
 * comes after, the match that follows is reported one character late (`.www.😀)😀` zones `ww.😀)😀`
 * instead of `www.😀)😀`). The rewrite finds the correct address. Texts that can trigger it are left out
 * of the comparison (a deliberate over-approximation: a word character before `www.`, an astral after).
 */
const ZONE_ENGINE_BUG = /[\w.+-]www\.[^]*[\ud800-\udbff][\udc00-\udfff]/;

/** Fastest of three runs, with a floor so that a sub-millisecond timing cannot make the ratio noisy. */
function best(run: (text: string) => unknown, text: string): number {
  let fastest = Number.POSITIVE_INFINITY;
  for (let i = 0; i < 3; i++) {
    const start = performance.now();
    run(text);
    fastest = Math.min(fastest, performance.now() - start);
  }
  return Math.max(fastest, 2);
}

/** 4x the input takes under 10x the time. `input(n)` builds an input of about n characters. */
function scales(name: string, run: (text: string) => unknown, input: (n: number) => string) {
  test(`${name} scales linearly`, () => {
    run(input(2000)); // warm the regex caches
    const small = best(run, input(10_000));
    const large = best(run, input(40_000));
    expect(large).toBeLessThan(small * 10);
  }, 30_000);
}

const rep = (unit: string) => (n: number) => unit.repeat(Math.ceil(n / unit.length));

function fuzzer(alphabet: readonly string[]) {
  return (count: number, seed: number): string[] => {
    const rand = lcg(seed);
    const out: string[] = [];
    for (let i = 0; i < count; i++) {
      let text = '';
      for (let n = 1 + Math.floor(rand() * 16); n > 0; n--) {
        text += alphabet[Math.floor(rand() * alphabet.length)];
      }
      out.push(text);
    }
    return out;
  };
}

/** `ref` and `run` agree on every sample, and the samples do change in a good share of cases. */
function same(
  name: string,
  samples: readonly string[],
  run: (text: string) => string,
  ref: (text: string) => string,
  minChanged = 100,
) {
  test(`${name} equals its original`, () => {
    let changed = 0;
    for (const text of samples) {
      if (ILL_FORMED.test(text)) continue;
      const expected = ref(text);
      if (run(text) !== expected) expect(run(text)).toBe(expected); // prints the input via the matcher
      if (expected !== text) changed++;
    }
    expect(changed).toBeGreaterThan(minChanged);
  });
}

const base = corpus(2500, 11);

describe('shield (zones.ts)', () => {
  const ZONE = '';
  const ZONES = new RegExp(
    [
      '`[^`\\n]+`',
      'https?://[^\\s<>"“”«»‘’‚„‹›]+',
      'www\\.[^\\s<>"“”«»‘’‚„‹›]+',
      '[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+',
    ].join('|'),
    'gu',
  );
  function isTail(zone: string, end: number): boolean {
    const ch = zone.charAt(end - 1);
    if (/[.,;:!?'’…]/.test(ch)) return true;
    const head = zone.slice(0, end);
    if (ch === ')') return head.split('(').length < head.split(')').length;
    if (ch === ']') return head.split('[').length < head.split(']').length;
    return false;
  }
  function original(text: string): [string, (typeset: string) => string] {
    if (text.includes(ZONE)) return [text, (s) => s];
    const zones: string[] = [];
    const out = text.replace(ZONES, (match) => {
      let end = match.length;
      if (!match.startsWith('`')) while (end > 0 && isTail(match, end)) end--;
      zones.push(match.slice(0, end));
      return ZONE + match.slice(end);
    });
    if (!zones.length) return [text, (s) => s];
    let next = 0;
    return [out, (s) => s.replace(//g, () => zones[next++] ?? '')];
  }

  const ALPHA = [
    'a', 'b', 'Z', '0', '9', '_', '.', '.', '+', '-', '--', '@', '@', '@', ',', ';', '!', '?', "'", '’', '…',
    '(', ')', '[', ']', ' ', ' ', '\n', '\t', '`', '`', '"', '“', '»', '<', '>', '/', ':', '://',
    'http', 'https://', 'www.', 'a@b.co', 'x@y', 'foo.bar@baz.org', '.com', '.co.uk', 'é', 'я', '😀', '𝒜', ZONE.replace(ZONE, ''),
  ];
  const samples = [
    ...base,
    ...fuzzer(ALPHA)(30000, 5),
    `${'x'.repeat(3000)}@a.b`,
    `${'x'.repeat(3000)}`,
    `${'x.'.repeat(2000)}@y.z q@r.st`,
    `${'a@'.repeat(1500)}b.c`,
    `${'a@b.c '.repeat(1000)}`,
    `${'1-'.repeat(3000)}`,
    `${'+-'.repeat(3000)}@d.e`,
    `${'`a'.repeat(2000)}`,
    `${'`a\n'.repeat(2000)}`,
    `see http://a/b@c.de ${'x'.repeat(3000)} www.q@r.st`,
  ];
  test('shield and restore equal their original', () => {
    let zoned = 0;
    for (const text of samples) {
      if (ILL_FORMED.test(text) || ZONE_ENGINE_BUG.test(text)) continue;
      const [a, restoreA] = original(text);
      const [b, restoreB] = shield(text);
      if (b !== a) expect([text, b]).toEqual([text, a]);
      const probe = `${a}!`;
      if (restoreB(probe) !== restoreA(probe)) expect(restoreB(probe)).toBe(restoreA(probe));
      if (a !== text) zoned++;
    }
    expect(zoned).toBeGreaterThan(1000);
  });
  scales('shield on a long word-character run', (t) => shield(t), rep('x'));
  scales('shield on digits', (t) => shield(t), rep('1'));
  scales('shield on hyphens', (t) => shield(t), rep('-'));
  scales('shield on dots', (t) => shield(t), rep('.'));
  scales('shield on +-', (t) => shield(t), rep('+-'));
  scales('shield on 1x', (t) => shield(t), rep('1x'));
  scales('shield on a run, then an @', (t) => shield(t), (n) => `${'x'.repeat(n)}@`);
});

describe('space.trailing', () => {
  const ALPHA = [' ', ' ', ' ', '\t', '\n', '\r', '\r\n', '\u2028', '\u2029', '\u00A0', '\v', '\f', 'a', 'b', '1', '.', '😀', '\uD835', ' \n', '  \n\n'];
  const samples = [
    ...base,
    ...fuzzer(ALPHA)(30000, 21),
    `${' '.repeat(3000)}a${' '.repeat(3000)}`,
    `${' \t'.repeat(3000)}x`,
    `${'a  \n'.repeat(1000)}`,
  ];
  same('trailingSpace', samples, trailingSpace, (t) => t.replace(/[ \t]+$/gm, ''));
  scales('trailingSpace on spaces then a letter', trailingSpace, (n) => `${' '.repeat(n)}a`);
  scales('trailingSpace on tabs then a letter', trailingSpace, (n) => `${'\t'.repeat(n)}a`);
  scales('trailingSpace on spaces, a letter, spaces', trailingSpace, (n) => `${' '.repeat(n / 2)}a${' '.repeat(n / 2)}b`);
});

describe('dash.sentence', () => {
  const original = (text: string) =>
    text
      .replace(/[ \u00A0]+(?:--|[-–—])[ \u00A0]+/g, `\u00A0— `)
      .replace(/(?<=[^\s\-–—])--(?=[^\s\-–—])/g, (match, offset: number, whole: string) =>
        /[«„“‘‚‹»›"']/.test(whole.charAt(offset - 1)) && /[»“”’‘«‹›"']/.test(whole.charAt(offset + 2))
          ? match
          : `\u00A0— `,
      );
  const ALPHA = [' ', ' ', ' ', '  ', '\u00A0', '\t', '\n', '-', '-', '--', '---', '–', '—', '- ', ' -', ' - ', ' -- ', ' --- ', 'a', 'b', '1', '"', "'", '«', '»', '“', '”', '.', '😀', '\uD835', '\uDC9C'];
  const samples = [
    ...base,
    ...fuzzer(ALPHA)(30000, 22),
    `${' '.repeat(3000)}-x`,
    `${' '.repeat(3000)}-${' '.repeat(3000)}x`,
    `${' - '.repeat(3000)}`,
    `${' -  '.repeat(3000)}-x`,
    `${'-- '.repeat(3000)}`,
    `${'a --'.repeat(3000)}b`,
    `${'a - --'.repeat(2000)}b`,
    `${'\u00A0'.repeat(2000)}—${' '.repeat(2000)}x`,
  ];
  same('dashSentence', samples, (t) => dashSentence(t), original);
  scales('dashSentence on spaces then a hyphen', (t) => dashSentence(t), (n) => `${' '.repeat(n)}-a`);
  scales('dashSentence on no-break spaces then a dash', (t) => dashSentence(t), (n) => `${'\u00A0'.repeat(n)}–a`);
  scales('dashSentence on spaces then --', (t) => dashSentence(t), (n) => `${' '.repeat(n)}--a`);
});

describe('space.association and space.arrow', () => {
  const ALPHA = [' ', ' ', ' ', '  ', '\u00A0', '\t', '\n', 'e.V.', 'e.V.', 'e.V', 'e.', 'ee.V.', ' e.V.', '→', '→', '←', '←', ' →', '← ', 'a', 'b', '.', '😀'];
  const samples = [
    ...base,
    ...fuzzer(ALPHA)(30000, 23),
    `${' '.repeat(3000)}a${' '.repeat(3000)}e.V.`,
    `${' '.repeat(3000)}→`,
    `${' '.repeat(3000)}a→${' '.repeat(3000)}←${' '.repeat(3000)}`,
    `${' e.V.'.repeat(2000)}`,
    `${' → ← '.repeat(2000)}`,
  ];
  same('association', samples, association, (t) => t.replace(/[ ]+(?=e\.V\.)/g, '\u00A0'));
  same(
    'arrowSpace',
    samples,
    arrowSpace,
    (t) => t.replace(/ +(?=→)/g, '\u00A0').replace(/(?<=←) +/g, '\u00A0'),
  );
  scales('association on spaces, then e.V. elsewhere', association, (n) => `e.V.${' '.repeat(n)}a`);
  scales('arrowSpace on spaces, then an arrow elsewhere', arrowSpace, (n) => `→${' '.repeat(n)}a`);
});
