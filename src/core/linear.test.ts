import { describe, expect, test } from 'bun:test';
import { corpus, lcg, longText } from '../../scripts/corpus';
import { dashSentence } from './dashes';
import { beforePunctuation, degrees, doubleMarks, trailingSpace } from './extra';
import { groupDigits, groupNumbers } from './numbers';
import { arrowSpace, association } from './spaces';
import type { Lang } from './types';
import { shield } from './zones';

/**
 * Rules and passes that were quadratic on a long run of one character (a regex tried from every
 * position of the run, each try scanning to the end of it) and were rewritten to find a literal
 * first and read the run by hand. Each block holds the ORIGINAL implementation verbatim as the
 * reference, checks the rewrite against it on the seeded corpus, a fuzz of the marks the rule cares
 * about and long runs, and checks that 4x the text takes well under 16x the time (a quadratic one
 * takes about 12 to 16x; linear about 4x; the bound is 8x, loose on purpose). Never edit a reference to
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
// biome-ignore lint/correctness/noEmptyCharacterClassInRegex: [^] is any character, line breaks included
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

/** 4x the input takes under 8x the time. `input(n)` builds an input of about n characters. */
function scales(name: string, run: (text: string) => unknown, input: (n: number) => string) {
  test(`${name} scales linearly`, () => {
    run(input(2000)); // warm the regex caches
    const small = best(run, input(10_000));
    const large = best(run, input(40_000));
    expect(large).toBeLessThan(small * 8);
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

const prose = longText(400_000);

/** On ordinary prose the rewrite takes under 70% of the time of the original that opened with a lookbehind. */
function fasterThanOriginal(
  name: string,
  run: (text: string) => unknown,
  original: (text: string) => unknown,
) {
  test(`${name} is faster than its lookbehind original on prose`, () => {
    run(prose);
    original(prose);
    expect(best(run, prose)).toBeLessThan(best(original, prose) * 0.7);
  }, 30_000);
}

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
    'a',
    'b',
    'Z',
    '0',
    '9',
    '_',
    '.',
    '.',
    '+',
    '-',
    '--',
    '@',
    '@',
    '@',
    ',',
    ';',
    '!',
    '?',
    "'",
    '’',
    '…',
    '(',
    ')',
    '[',
    ']',
    ' ',
    ' ',
    '\n',
    '\t',
    '`',
    '`',
    '"',
    '“',
    '»',
    '<',
    '>',
    '/',
    ':',
    '://',
    'http',
    'https://',
    'www.',
    'a@b.co',
    'x@y',
    'foo.bar@baz.org',
    '.com',
    '.co.uk',
    'é',
    'я',
    '😀',
    '𝒜',
    ZONE.replace(ZONE, ''),
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
  scales(
    'shield on a run, then an @',
    (t) => shield(t),
    (n) => `${'x'.repeat(n)}@`,
  );
  scales(
    'shield on an address ending in many )',
    (t) => shield(t),
    (n) => `http://a${')'.repeat(n)}`,
  );
  scales(
    'shield on an address ending in many ]',
    (t) => shield(t),
    (n) => `http://a${']'.repeat(n)}`,
  );
  scales(
    'shield on an address ending in many )) and .',
    (t) => shield(t),
    (n) => `www.a(${'.)'.repeat(n / 2)}`,
  );
});

describe('space.trailing', () => {
  const ALPHA = [
    ' ',
    ' ',
    ' ',
    '\t',
    '\n',
    '\r',
    '\r\n',
    '\u2028',
    '\u2029',
    '\u00A0',
    '\v',
    '\f',
    'a',
    'b',
    '1',
    '.',
    '😀',
    '\uD835',
    ' \n',
    '  \n\n',
  ];
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
  scales(
    'trailingSpace on spaces, a letter, spaces',
    trailingSpace,
    (n) => `${' '.repeat(n / 2)}a${' '.repeat(n / 2)}b`,
  );
});

describe('dash.sentence', () => {
  const original = (text: string) =>
    text
      .replace(/[ \u00A0]+(?:--|[-–—])[ \u00A0]+/g, `\u00A0— `)
      .replace(/(?<=[^\s\-–—])--(?=[^\s\-–—])/g, (match, offset: number, whole: string) =>
        /[«„“‘‚‹»›"']/.test(whole.charAt(offset - 1)) &&
        /[»“”’‘«‹›"']/.test(whole.charAt(offset + 2))
          ? match
          : `\u00A0— `,
      );
  const ALPHA = [
    ' ',
    ' ',
    ' ',
    '  ',
    '\u00A0',
    '\t',
    '\n',
    '-',
    '-',
    '--',
    '---',
    '–',
    '—',
    '- ',
    ' -',
    ' - ',
    ' -- ',
    ' --- ',
    'a',
    'b',
    '1',
    '"',
    "'",
    '«',
    '»',
    '“',
    '”',
    '.',
    '😀',
    '\uD835',
    '\uDC9C',
  ];
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
  scales(
    'dashSentence on spaces then a hyphen',
    (t) => dashSentence(t),
    (n) => `${' '.repeat(n)}-a`,
  );
  scales(
    'dashSentence on no-break spaces then a dash',
    (t) => dashSentence(t),
    (n) => `${'\u00A0'.repeat(n)}–a`,
  );
  scales(
    'dashSentence on spaces then --',
    (t) => dashSentence(t),
    (n) => `${' '.repeat(n)}--a`,
  );
});

describe('space.association and space.arrow', () => {
  const ALPHA = [
    ' ',
    ' ',
    ' ',
    '  ',
    '\u00A0',
    '\t',
    '\n',
    'e.V.',
    'e.V.',
    'e.V',
    'e.',
    'ee.V.',
    ' e.V.',
    '→',
    '→',
    '←',
    '←',
    ' →',
    '← ',
    'a',
    'b',
    '.',
    '😀',
  ];
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
  same('arrowSpace', samples, arrowSpace, (t) =>
    t.replace(/ +(?=→)/g, '\u00A0').replace(/(?<=←) +/g, '\u00A0'),
  );
  scales('association on spaces, then e.V. elsewhere', association, (n) => `e.V.${' '.repeat(n)}a`);
  scales('arrowSpace on spaces, then an arrow elsewhere', arrowSpace, (n) => `→${' '.repeat(n)}a`);
});

describe('number.group', () => {
  test('groupDigits equals the lookahead regex for every length', () => {
    for (const sep of [',', ' ', '\u00A0', '.', '\u202F']) {
      for (let length = 1; length <= 80; length++) {
        const run = Array.from({ length }, (_, i) => String((i + 1) % 10)).join('');
        expect(groupDigits(run, sep)).toBe(run.replace(/\B(?=(?:\d{3})+$)/g, sep));
      }
    }
  });
  scales('groupNumbers on one very long run of digits', (t) => groupNumbers(t, 'en'), rep('1'));
  scales(
    'groupNumbers on a long run of digits then a hyphen',
    (t) => groupNumbers(t, 'de'),
    (n) => `${'9'.repeat(n)}-`,
  );
});

describe('symbol.degree', () => {
  const LABEL =
    /(?:^|[\s(])(?:\p{L}|Type|Class|Section|Plan|Grade|Level|Group|Vitamin|Gate|Row|Part|Option|Item|Line|Page|Room|Tier|Step|Unit|Table|Figure|Fig\.|No\.|Nr\.)[ \u00A0]+$/iu;
  const original = (text: string, lang: Lang = 'en'): string =>
    text.replace(
      /(?<![\p{L}\p{N}])([\u2212+\u00B1-]?\d+(?:[.,]\d+)?)(?:[ \u00A0]*(°)[ \u00A0]*|[ \u00A0]+)([CF])(?![\p{L}\p{N}]|\.\p{L})/gu,
      (
        match: string,
        number: string,
        sign: string | undefined,
        unit: string,
        offset: number,
        whole: string,
      ) => {
        const before = whole.slice(0, offset);
        const afterUnit = /(?:\d[ \u00A0]+|°[ \u00A0]*)[CF][ \u00A0]+$/.test(before);
        if (!sign && lang !== 'en') return match;
        if (!sign && !afterUnit && LABEL.test(before)) return match;
        return `${number}\u00A0°${unit}`;
      },
    );
  const ALPHA = [
    '1',
    '2',
    '20',
    '5.5',
    '3,5',
    '.',
    ',',
    '1.5.7',
    '-',
    '+',
    '\u2212',
    '±',
    ' ',
    ' ',
    ' ',
    '\u00A0',
    '°',
    '° ',
    ' °',
    'C',
    'F',
    'C',
    'F',
    ' C',
    ' F',
    '°C',
    '°F',
    'Celsius',
    'a',
    'x',
    'K',
    'Type',
    'Class ',
    'Section ',
    'Vitamin ',
    'Fig. ',
    'No. ',
    'Nr. ',
    'Step ',
    'Option ',
    'T',
    'ſ',
    'K',
    'Ⅳ',
    '٣',
    '²',
    '😀',
    '𝒜',
    '𝔞',
    '(',
    ')',
    '\n',
    ' 20 C',
    ' 20 F ',
    'F1',
    'C.E.',
    '.a',
  ];
  const samples = [
    ...base,
    ...fuzzer(ALPHA)(60000, 24),
    `${'1 C '.repeat(3000)}`,
    `${'20 C 20 F '.repeat(1500)}`,
    `${'Type 2 C '.repeat(1500)}`,
    `${'9'.repeat(3000)} C`,
    `a${'9'.repeat(3000)} C`,
    `${'1.'.repeat(3000)}5 C`,
    `Vitamin${' '.repeat(3000)}5 C`,
    `${' '.repeat(3000)}5 C`,
    `5 C${' '.repeat(3000)}5 C`,
    `${'-1 C'.repeat(2000)}`,
    `${'5°C-3°C'.repeat(1000)}`,
  ];
  same(
    'degrees (en)',
    samples,
    (t) => degrees(t, 'en'),
    (t) => original(t, 'en'),
  );
  same(
    'degrees (de)',
    samples,
    (t) => degrees(t, 'de'),
    (t) => original(t, 'de'),
    20,
  );
  fasterThanOriginal(
    'degrees',
    (t) => degrees(t),
    (t) => original(t, 'en'),
  );
  scales('degrees on "1 C 1 C "', (t) => degrees(t), rep('1 C '));
  scales('degrees on "20 C 20 F "', (t) => degrees(t), rep('20 C 20 F '));
  scales(
    'degrees on a long run of digits then " C"',
    (t) => degrees(t),
    (n) => `${'9'.repeat(n)} C`,
  );
  scales(
    'degrees on a long run of digits then " X"',
    (t) => degrees(t, 'en'),
    (n) => `${'9'.repeat(n)} X C`,
  );
  scales(
    'degrees on "1." then 5 C',
    (t) => degrees(t),
    (n) => `${'1.'.repeat(n / 2)}5 C`,
  );
  scales(
    'degrees on spaces before a number',
    (t) => degrees(t),
    (n) => `Vitamin${' '.repeat(n)}5 C`,
  );
});

describe('space.before-punctuation', () => {
  const SPACE_BEFORE_HIGH = new Set<Lang>(['fr']);
  const original = (text: string, lang: Lang): string =>
    text.replace(
      /(?<=[^\s([{“"«‘„])[ \t]+([,.;:!?)])/gu,
      (match: string, mark: string, offset: number, whole: string) => {
        const next = whole.charAt(offset + match.length);
        if (/[\p{L}\p{N}]/u.test(next) && !(mark === ',' && /\p{L}/u.test(next))) return match;
        if (mark === '!' && next === '[') return match;
        if (mark === '.' && /^[ \t]*\./.test(whole.slice(offset + match.length))) return match;
        if (mark === '.' && (next === '.' || whole.charAt(offset - 1) === '.')) return match;
        if ((mark === ':' || mark === ';') && /[-)(/|\\'*]/.test(next)) return match;
        if (
          mark === ':' &&
          /\d/.test(whole.charAt(offset - 1)) &&
          /^[ \t]*\d/.test(whole.slice(offset + match.length))
        ) {
          return match;
        }
        if ((mark === '!' || mark === '?') && next === '=') return match;
        if (mark === '?' && (next === '?' || next === '.')) return match;
        if (SPACE_BEFORE_HIGH.has(lang) && /[:;!?]/.test(mark)) return match;
        return mark;
      },
    );
  const ALPHA = [
    ' ',
    ' ',
    ' ',
    '  ',
    '\t',
    ' \t',
    ' ',
    '\n',
    '\r\n',
    ',',
    '.',
    ';',
    ':',
    '!',
    '?',
    ')',
    '(',
    '[',
    '{',
    '“',
    '"',
    '«',
    '‘',
    '„',
    "'",
    '-',
    '/',
    '|',
    '\\',
    '*',
    '=',
    '..',
    '...',
    'a',
    'b',
    'é',
    'я',
    '1',
    '5',
    '10',
    '😀',
    '𝒜',
    '\uD835',
    '\uDC9C',
    ' ,',
    ' .',
    ' ;',
    ' :',
    ' !',
    ' ?',
    ' )',
    ' . .',
    ' :)',
    ' ;-)',
    ' !=',
    ' ??',
    '![',
    '10 : 30',
  ];
  const samples = [
    ...base,
    ...fuzzer(ALPHA)(60000, 25),
    `a${' '.repeat(3000)},`,
    `a${' '.repeat(3000)}x`,
    `${' '.repeat(3000)},`,
    `a ${' '.repeat(3000)}.${' '.repeat(3000)}.`,
    `${'a ,'.repeat(3000)}`,
    `${'a . '.repeat(3000)}`,
    `${'a ! '.repeat(3000)}`,
    `${'1 :'.repeat(2000)} 5`,
    `a${' \t'.repeat(3000)}!`,
  ];
  same(
    'beforePunctuation (en)',
    samples,
    (t) => beforePunctuation(t, 'en'),
    (t) => original(t, 'en'),
  );
  same(
    'beforePunctuation (fr)',
    samples,
    (t) => beforePunctuation(t, 'fr'),
    (t) => original(t, 'fr'),
    50,
  );
  fasterThanOriginal(
    'beforePunctuation',
    (t) => beforePunctuation(t, 'en'),
    (t) => original(t, 'en'),
  );
  scales(
    'beforePunctuation on spaces then a comma',
    (t) => beforePunctuation(t, 'en'),
    (n) => `a${' '.repeat(n)},`,
  );
  scales(
    'beforePunctuation on spaces then a letter',
    (t) => beforePunctuation(t, 'en'),
    (n) => `a${' '.repeat(n)}x`,
  );
  scales(
    'beforePunctuation on spaces and tabs',
    (t) => beforePunctuation(t, 'en'),
    (n) => `a${' \t'.repeat(n / 2)}!`,
  );
  scales('beforePunctuation on " ,"', (t) => beforePunctuation(t, 'en'), rep('a ,'));
  scales('beforePunctuation on " . "', (t) => beforePunctuation(t, 'en'), rep('a . '));
});

describe('punctuation.double', () => {
  const original = (text: string): string =>
    text.replace(/(?<=[^\s([{!?])([!?])\1+(?!\1)(?![\p{L}\p{N}_])/gu, '$1');
  const ALPHA = [
    '!',
    '!',
    '?',
    '?',
    '!!',
    '??',
    '!!!',
    '???',
    '!?',
    '?!',
    '!?!',
    '?!?',
    ' ',
    ' ',
    '\t',
    '\n',
    ' ',
    '(',
    '[',
    '{',
    ')',
    'a',
    'b',
    'Z',
    '1',
    '9',
    '_',
    '-',
    '.',
    ',',
    'é',
    'я',
    '😀',
    '𝒜',
    '𝔞',
    '\uD835',
    '\uDC9C',
    '’',
    '"',
  ];
  const samples = [
    ...base,
    ...fuzzer(ALPHA)(60000, 26),
    `a${'!'.repeat(3000)}`,
    `a${'!'.repeat(3000)}b`,
    `a${'?'.repeat(3000)} b`,
    `${'!'.repeat(3000)}`,
    `${'a!!'.repeat(2000)}`,
    `${'a!?!?'.repeat(2000)}`,
    `${'a!!b '.repeat(1000)}${'a!! '.repeat(1000)}`,
    `?${'!'.repeat(3000)}.`,
    `a${'!?'.repeat(3000)}`,
  ];
  same('doubleMarks', samples, doubleMarks, original);
  fasterThanOriginal('doubleMarks', doubleMarks, original);
  scales('doubleMarks on a long run of !', doubleMarks, (n) => `a${'!'.repeat(n)}`);
  scales('doubleMarks on a long run of ! then a letter', doubleMarks, (n) => `a${'!'.repeat(n)}b`);
  scales('doubleMarks on a long run of ?', doubleMarks, (n) => `a${'?'.repeat(n)} `);
  scales('doubleMarks on !?!?', doubleMarks, rep('!?'));
  scales('doubleMarks on a!!', doubleMarks, rep('a!! '));
});
