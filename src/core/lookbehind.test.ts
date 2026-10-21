import { describe, expect, test } from 'bun:test';
import { corpus, lcg } from '../../scripts/corpus';
import { dashRange, dashSentence } from './dashes';
import { fractions, implies, plusMinus } from './extra';
import { apostrophe, minus, multiply } from './marks';
import { ABBREVIATIONS, LANGS, ORPHANS } from './profiles';
import { abbreviations, arrowSpace, initials, orphans, titles, unitSymbol } from './spaces';
import { type Lang, NBSP } from './types';

/**
 * The rules below were rewritten so that no regex opens with a lookbehind (tried at every position, 20+ ms
 * per MB): the literal is found first and the character before it is read by hand (scan.ts). This file
 * keeps each ORIGINAL implementation, verbatim, as the reference, and checks that the rewrite returns the
 * same text on the seeded corpus and on a fuzz of the marks the rules care about, including characters
 * outside the BMP, lone surrogates and very long runs. Never edit the references to make a test pass.
 */
const reference = {
  apostrophe: (text: string) =>
    text.replace(/(?<=\p{L})'/gu, '’').replace(/(?<=^|[\s([])'(?=\d)/g, '’'),
  minus: (text: string) => text.replace(/(?<=^|[\s(])-(?=\d)/g, '−'),
  multiply: (text: string) =>
    text
      .replace(
        /(?<![\w.,-])(?!0[xX])(\d+(?:[.,]\d+)?)((?:x\d+(?:[.,]\d+)?)+)(?![A-Za-z]*\d)/g,
        (_m, first: string, rest: string) => `${first}${rest.replaceAll('x', '×')}`,
      )
      .replace(/(?<=\d)[ ]+x[ ]+(?=\d)/g, ' × '),
  titles: (text: string) =>
    text.replace(
      /(?<![\p{L}\p{N}])(Prof|Dr|Mr|Mrs|Ms|Mx|St|Hon|Rev|Sr|Jr)\.[ ]+(?=\p{L})/gu,
      `$1.${NBSP}`,
    ),
  initials: (text: string) =>
    text.replace(/(?<![\p{L}\p{N}])(\p{Lu})\.[ ]+(?=\p{Lu})/gu, `$1.${NBSP}`),
  orphans: (text: string, lang: Lang) => {
    const pattern = ORPHANS[lang];
    return pattern ? text.replace(pattern, `$1${NBSP}`) : text;
  },
  abbreviations: (text: string, lang: Lang) => {
    const list = ABBREVIATIONS[lang] ?? {};
    const escapeRegex = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
    const names = (words: readonly string[] | undefined) =>
      words?.length ? words.map(escapeRegex).join('|') : null;
    let out = text;
    if (list.together?.length) {
      const together = new RegExp(
        `(?<![\\p{L}\\p{N}])(?:${list.together.map((a) => escapeRegex(a).replace(/ /g, '[ ]+')).join('|')})(?![\\p{L}])`,
        'gu',
      );
      out = out.replace(together, (m) => m.replace(/[ ]+/g, NBSP));
    }
    const bind = names(list.bind);
    if (bind) {
      const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${bind})\\.[ ]+(?=[\\p{L}\\p{N}])`, 'gu');
      out = out.replace(re, (m) => m.replace(/[ ]+$/, NBSP));
    }
    const page = names(list.page);
    if (page) {
      const re = new RegExp(`(?<![\\p{L}\\p{N}])(?:${page})\\.[ ]+(?=\\d)`, 'gu');
      out = out.replace(re, (m) => m.replace(/[ ]+$/, NBSP));
    }
    return out;
  },
  unitSymbol: (text: string) => text.replace(/(?<=\d)(?=[%€])/g, NBSP),
  arrowSpace: (text: string) => text.replace(/ +(?=→)/g, NBSP).replace(/(?<=←) +/g, NBSP),
  dashRange: (text: string) =>
    text
      .replace(/(\d{1,2}:\d{2})[  ]*(?:--|[-–])[  ]*(?=\d{1,2}:\d{2})/g, '$1–')
      .replace(
        /(?<![\d:–-])(\d+)([  ]*(?:--|[-–])[  ]*)(\d+)(?![\d:–-])/g,
        (match, a: string, gap: string, b: string, offset: number, whole: string) => {
          // The helpers of dashes.ts, as they were; reached through the module's own output for the verdict.
          return rangeVerdict(match, a, gap, b, offset, whole);
        },
      ),
  dashSentence: (text: string) =>
    text
      .replace(/[ \u00A0]+(?:--|[-–—])[ \u00A0]+/g, `${NBSP}— `)
      .replace(/(?<=[^\s\-–—])--(?=[^\s\-–—])/g, (match, offset: number, whole: string) =>
        /[«„“‘‚‹»›"']/.test(whole.charAt(offset - 1)) &&
        /[»“”’‘«‹›"']/.test(whole.charAt(offset + 2))
          ? match
          : `${NBSP}— `,
      ),
  plusMinus: (text: string) => text.replace(/(?<![\p{L}\p{N}+])\+-(?=\d)/gu, '±'),
  implies: (text: string) => text.replace(/(?<![=<>])=>(?![>=])/g, '⇒'),
  fractions: (text: string) =>
    text.replace(
      /(?<![\p{L}\p{N}/.,])(1\/2|1\/4|3\/4)(?![\p{L}\p{N}/"]|[.,]\d)([ ]+(?=\p{L}{1,9}(?!\p{L})|[%°€$£]))?/gu,
      (_m, fraction: string, gap: string | undefined) =>
        `${({ '1/2': '½', '1/4': '¼', '3/4': '¾' } as Record<string, string>)[fraction] ?? fraction}${gap ? NBSP : ''}`,
    ),
};

/** The unchanged helpers of the original `dashRange`, copied (they were not rewritten). */
function rangeVerdict(
  match: string,
  a: string,
  gap: string,
  b: string,
  offset: number,
  whole: string,
): string {
  const numeric = (x: string, y: string, before: string, g: string): boolean => {
    if (x.length > 4 || y.length > 4) return false;
    if (x.length === 3 && y.length === 4 && !/\s| /.test(g)) return false;
    if (/^0\d/.test(x) || /^0\d/.test(y)) return false;
    if (Number(x) >= Number(y)) return false;
    if (x.length === 4 && y.length === 2 && Number(y) <= 12) return false;
    return !/\+[\d\s()./-]*$/.test(before);
  };
  const inside = (start: number, end: number): boolean =>
    /\d[, ]$/.test(whole.slice(Math.max(0, start - 2), start)) ||
    /^[, ]\d{3}(?!\d)/.test(whole.slice(end));
  return !inside(offset, offset + match.length) &&
    numeric(a, b, whole.slice(Math.max(0, offset - 20), offset), gap)
    ? `${a}–${b}`
    : match;
}

const ALPHA = [
  'a',
  'b',
  'e',
  'I',
  'A',
  'K',
  'D',
  'r',
  'o',
  'f',
  'x',
  'X',
  'z',
  'S',
  'P',
  'é',
  'Ł',
  'ż',
  'и',
  'Я',
  'ї',
  'α',
  'Ω',
  '中',
  '𝒜',
  '𝔞',
  '😀',
  '٣',
  '²',
  '½',
  'Ⅳ',
  '0',
  '1',
  '2',
  '5',
  '9',
  '10',
  '12',
  '00',
  '2026',
  '12:00',
  ' ',
  ' ',
  ' ',
  ' ',
  '  ',
  ' ',
  '\t',
  '\n',
  ' ',
  '.',
  '.',
  '..',
  '...',
  ',',
  ';',
  ':',
  '!',
  '?',
  '-',
  '--',
  '---',
  '–',
  '—',
  '+',
  '+-',
  '=>',
  '->',
  '→',
  '←',
  '(',
  ')',
  '[',
  '/',
  '%',
  '€',
  '°',
  "'",
  "'",
  "''",
  '’',
  '"',
  '“',
  '”',
  '«',
  '»',
  '`',
  '',
  '_',
  '#',
  'Prof',
  'Dr',
  'Mr',
  'Mrs',
  'Ms',
  'Mx',
  'St',
  'Hon',
  'Rev',
  'Sr',
  'Jr',
  'Nr',
  'Abb',
  'S',
  'p',
  'pp',
  'No',
  'Fig',
  'z. B.',
  'd. h.',
  'i. d. R.',
  'e. p.',
  'l. e. p.',
  'EE. UU.',
  'ul',
  'x',
  '1x',
  '0x1F',
  '3 x 4',
  'v2x3',
  'km',
  // Lone surrogates, to see that a half pair is read as itself.
  '\uD835',
  '\uDC9C',
];

/**
 * JavaScriptCore reads a lone high surrogate followed by a unit from U+E000 up as half of a pair in some
 * compiled paths and not in others, so even the original pattern answers differently with and without
 * a lookbehind prefix. Ill-formed text only, left out of the comparison.
 */
const ILL_FORMED = /[\ud800-\udbff](?![\udc00-\udfff])[-￿]/;

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
  '9'.repeat(5000),
  `a${'1'.repeat(5000)} C`,
  '1x'.repeat(3000),
  `${'1x'.repeat(3000)}a1`,
  `${'1.5x'.repeat(2000)}a1`,
  `x-${'1 - 2 - '.repeat(1000)}`,
  `${'1-'.repeat(3000)}`,
  `5${' '.repeat(5000)}x${' '.repeat(5000)}3`,
  `${'5 x '.repeat(3000)}`,
  `3${' '.repeat(4000)}x 4 ${' '.repeat(4000)}x ${' '.repeat(3)}5`,
  `${'Dr. '.repeat(2000)}${'aDr. '.repeat(2000)}`,
  `${'A. B. '.repeat(2000)}${'z. B. '.repeat(1000)}${'p. 5 '.repeat(1000)}`,
  "'".repeat(3000),
  `${'a=>'.repeat(1000)}${'=>>'.repeat(1000)}`,
  `${'a+-5 '.repeat(1000)}${'1/2 cup '.repeat(1000)}${'11/2 '.repeat(1000)}`,
  '1x2x3x4x5x6x7x8x9x1x2x3x4x5x6x7x8x9x1x2x3x4x5x6x7x8x9x1x2x3x4x5x6x7x8x9x1x2x3',
  `${'1'.repeat(47)}x2 ${'1'.repeat(48)}x2 ${'1'.repeat(49)}x2`,
];

const samples = [...corpus(2500, 11), ...fuzz(25000, 99), ...longRuns].filter(
  (t) => !ILL_FORMED.test(t),
);

describe('rewritten rules equal their lookbehind originals', () => {
  const same = (name: string, run: (text: string) => string, ref: (text: string) => string) =>
    test(name, () => {
      let changed = 0;
      for (const text of samples) {
        const expected = ref(text);
        if (run(text) !== expected) expect(run(text)).toBe(expected); // prints the input via the matcher
        if (expected !== text) changed++;
      }
      // The comparison is empty if the samples never reach the rule.
      expect(changed).toBeGreaterThan(100);
    });

  same('apostrophe', apostrophe, reference.apostrophe);
  same('minus', minus, reference.minus);
  same('multiply', multiply, reference.multiply);
  same('titles', titles, reference.titles);
  same('initials', initials, reference.initials);
  same('dash.range', dashRange, reference.dashRange);
  same('dash.sentence', (t) => dashSentence(t), reference.dashSentence);
  same('arrowSpace', arrowSpace, reference.arrowSpace);
  same('plusMinus', plusMinus, reference.plusMinus);
  same('implies', implies, reference.implies);
  same('fractions', fractions, reference.fractions);

  for (const lang of LANGS) {
    test(`${lang}: orphans, abbreviations and unit symbol`, () => {
      for (const text of samples) {
        expect(orphans(text, lang)).toBe(reference.orphans(text, lang));
        expect(abbreviations(text, lang)).toBe(reference.abbreviations(text, lang));
      }
    });
  }

  test('unit symbol in a language with percentSpace', () => {
    for (const text of samples) expect(unitSymbol(text, 'de')).toBe(reference.unitSymbol(text));
  });

  test('every language has its orphans and abbreviations compared', () => {
    expect(LANGS.length).toBeGreaterThan(20);
  });
});
