import { describe, expect, test } from 'bun:test';
import { LANGS, REGISTERS, typographic } from './core/index.ts';
import { typesetHtml } from './html/index.ts';
import { typesetMarkdown } from './markdown/index.ts';
import { typesetText } from './text/index.ts';

/**
 * Properties that must hold for any input, checked on seeded random strings built
 * from the characters the rules care about. A failure prints the input, so it can
 * be turned into a golden case.
 */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const PIECES = [
  'a',
  'I',
  'z',
  'x',
  'word',
  'Prof.',
  'Dr.',
  'K.',
  'z. B.',
  'Nr.',
  'e.V.',
  'km',
  'September',
  'и',
  'в',
  '1',
  '5',
  '10',
  '2026',
  '21',
  '26',
  '10:00',
  '0x1F',
  '1920x1080',
  ' ',
  ' ',
  ' ',
  '  ',
  '\n',
  ' ',
  '"',
  '"',
  "'",
  '’',
  '“',
  '”',
  '„',
  '«',
  '»',
  '‘',
  '‚',
  '-',
  '--',
  '–',
  '—',
  '->',
  '<-',
  '...',
  '(c)',
  '(R)',
  '%',
  '€',
  ',',
  '.',
  ':',
  '(',
  ')',
  ';',
  '!',
  '?',
  '9.00',
  'klo',
  'nr',
  '€49',
  'po',
  '\u202F',
  'https://a.b/1-2',
  'a@b.co',
  '`x -> y`',
];

/** Mostly words set apart by spaces, now and then run together, as text goes wrong. */
function sample(rand: () => number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    if (i > 0 && rand() < 0.7) out += ' ';
    out += PIECES[Math.floor(rand() * PIECES.length)] ?? '';
  }
  return out;
}

const TOKENS = [
  'stone',
  'memory',
  'Prof. Dr. Oksana',
  '21-26 September',
  "don't",
  'the ’90s',
  '5 km',
  '10:00-12:00',
  'https://a.b/1-2',
  '`x -> y`',
  'a',
  'I',
  'в',
  'z. B.',
  '...',
  'Read more ->',
  '(c) 2026',
  '-',
  '--',
  '5%',
  '3 x 4',
];
const WRAPS: [string, string][] = [
  ['"', '"'],
  ['“', '”'],
  ['„', '“'],
  ['«', '»'],
  ['‘', '’'],
];

/** A sentence as it is written: words, with quotations around some of them, nested now and then, a lone mark at an end. */
function sentence(rand: () => number): string {
  const pick = <T>(list: readonly T[]): T => list[Math.floor(rand() * list.length)] as T;
  const words = Array.from({ length: 3 + Math.floor(rand() * 8) }, () => pick(TOKENS));
  const isDash = (i: number) => words[i] === '-' || words[i] === '--';
  let outer = -1;
  const wrap = (from: number, to: number, sequel = false) => {
    // A dash standing alone is not what a quotation is put around.
    if (isDash(from) || isDash(to)) return;
    // A quotation inside another is set in other marks: the same ones could not be told apart.
    let style = Math.floor(rand() * WRAPS.length);
    if (style === outer && !sequel) style = (style + 1) % WRAPS.length;
    outer = style;
    const [open, close] = WRAPS[style] as [string, string];
    words[from] = `${open}${words[from]}`;
    words[to] = `${words[to]}${close}`;
  };
  let nested = false;
  let first = -1;
  let last = -1;
  if (rand() < 0.6) {
    first = Math.floor(rand() * (words.length - 1));
    last = first + 1 + Math.floor(rand() * (words.length - first - 1));
    wrap(first, last);
    if (rand() < 0.4 && last - first >= 2) {
      wrap(first + 1, last - 1);
      nested = true;
    }
  }
  // A second quotation after the first, in the same marks or others ("a" and "b").
  if (!nested && first >= 0 && last < words.length - 2 && rand() < 0.4) {
    const next = last + 1 + Math.floor(rand() * (words.length - last - 2));
    wrap(next, next + Math.floor(rand() * (words.length - next)), true);
  }
  // A quotation that runs on into the next paragraph has a mark at one end only. Three levels
  // deep are not found in running text, and German has only two to set them in.
  if (!nested) {
    const [open, close] = WRAPS[
      (outer + 1 + Math.floor(rand() * (WRAPS.length - 1))) % WRAPS.length
    ] as [string, string];
    const roll = rand();
    if (roll < 0.1 && first !== 0) words[0] = `${open}${words[0]}`;
    else if (roll > 0.9 && last !== words.length - 1)
      words[words.length - 1] = `${words[words.length - 1]}${close}`;
  }
  return words.join(' ');
}

/** `sample` for HTML text: a literal < or > would be read as a tag. */
const htmlText = (text: string) => text.replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/**
 * Letters and digits in order, without the letter x (which × may stand for) and the
 * letters of (c), (R) and (TM), which © ® ™ stand for.
 */
const letters = (text: string) =>
  text
    .replace(/\((?:c|R|TM)\)/gi, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .replaceAll(/[xX×]/g, '');

const CASES = 1500;

const RUN = /[\s\u00A0]+/g;
const MARK = /["„“”‚‘’«»‹›']/;
const DASH = /[-–—]/;
/** Whether a letter or digit stands at `at`, or beyond any quote marks from `at` on, in direction `step`. */
function wordBeyond(text: string, at: number, step: 1 | -1): boolean {
  let ch = text[at];
  while (ch !== undefined && MARK.test(ch)) {
    at += step;
    ch = text[at];
  }
  return ch !== undefined && /[\p{L}\p{N}]/u.test(ch);
}
/**
 * How many runs of whitespace in `text` must still be there after the rules ran: those with a word
 * on both sides, where a quote mark between the run and the word does not count (`Then "x"`,
 * `2" pipe`, `km‘ z`). A rule may change such a run (a no-break space, a dash with spaces), add to
 * it or move it past a mark, never remove it: that would glue two words together. A run just inside
 * a free quotation may go (`" stone "` is `«stone»`), and one beside a dash too (a spaced range
 * closes up).
 */
function survivingRuns(text: string): number {
  let count = 0;
  RUN.lastIndex = 0;
  for (let run = RUN.exec(text); run; run = RUN.exec(text)) {
    const left = text[run.index - 1];
    const right = text[run.index + run[0].length];
    // A spaced range (`5 - 26`) closes up to `5–26`, so a run beside a dash is not held to survive.
    const besideDash =
      (left !== undefined && DASH.test(left)) || (right !== undefined && DASH.test(right));
    if (
      !besideDash &&
      wordBeyond(text, run.index - 1, -1) &&
      wordBeyond(text, run.index + run[0].length, 1)
    )
      count++;
  }
  return count;
}
const runs = (text: string) => (text.match(RUN) ?? []).length;

describe('properties of typographic()', () => {
  for (const lang of LANGS) {
    for (const register of REGISTERS) {
      test(`${lang}/${register}: never removes a space that stands between two words`, () => {
        const rand = random(101 + LANGS.indexOf(lang) * 7 + REGISTERS.indexOf(register));
        for (let i = 0; i < CASES; i++) {
          const input = sample(rand, 1 + Math.floor(rand() * 14));
          const output = typographic(input, lang, { register });
          if (runs(output) < survivingRuns(input)) {
            throw new Error(
              `a space between words was lost in ${JSON.stringify(input)} -> ${JSON.stringify(output)}`,
            );
          }
        }
      });

      test(`${lang}/${register}: never loses or adds a letter or digit`, () => {
        const rand = random(1 + LANGS.indexOf(lang) * 7 + REGISTERS.indexOf(register));
        for (let i = 0; i < CASES; i++) {
          const input = sample(rand, 1 + Math.floor(rand() * 14));
          const output = typographic(input, lang, { register });
          if (letters(input) !== letters(output)) {
            throw new Error(
              `letters changed for ${JSON.stringify(input)} -> ${JSON.stringify(output)}`,
            );
          }
        }
      });
    }
  }

  test('a second pass changes nothing, on text as it is written', () => {
    const failures: string[] = [];
    for (const lang of LANGS) {
      for (const register of REGISTERS) {
        const rand = random(99 + LANGS.indexOf(lang) * 3 + REGISTERS.indexOf(register));
        for (let i = 0; i < CASES; i++) {
          const input = sentence(rand);
          const once = typographic(input, lang, { register });
          const twice = typographic(once, lang, { register });
          if (once !== twice) {
            failures.push(
              `${lang}/${register} ${JSON.stringify(input)} -> ${JSON.stringify(once)} -> ${JSON.stringify(twice)}`,
            );
          }
        }
      }
    }
    expect(failures.slice(0, 5)).toEqual([]);
  });

  test('addresses, emails and code spans come back exactly as written', () => {
    const rand = random(7);
    for (let i = 0; i < CASES; i++) {
      const zone = ['https://a.b/1-2--x', 'info@a-b.org', '`x -> (c) 1-2 "q"`'][i % 3] ?? '';
      const input = `${sample(rand, 4)} ${zone} ${sample(rand, 4)}`;
      for (const lang of LANGS) {
        expect(typographic(input, lang)).toContain(zone);
      }
    }
  });

  test('never throws on arbitrary text', () => {
    const rand = random(3);
    for (let i = 0; i < CASES; i++) {
      let input = '';
      for (let j = 0; j < 20; j++) input += String.fromCodePoint(Math.floor(rand() * 0x2fff) + 1);
      expect(() => typographic(input, 'en')).not.toThrow();
    }
  });
});

describe('properties of the modes', () => {
  test('text mode never loses a letter and keeps the number of lines', () => {
    const rand = random(11);
    for (let i = 0; i < 400; i++) {
      const input = Array.from({ length: 1 + Math.floor(rand() * 4) }, () => sample(rand, 6)).join(
        rand() < 0.5 ? '\n' : '\n\n',
      );
      const output = typesetText(input, { lang: 'en' });
      expect(letters(output)).toBe(letters(input));
      expect(output.split('\n').length).toBe(input.split('\n').length);
    }
  });

  test('HTML mode keeps every tag, attribute and code block byte for byte', () => {
    const rand = random(13);
    const tags = (html: string) => html.match(/<[^>]+>/g) ?? [];
    for (let i = 0; i < 400; i++) {
      const html = `<p class="x-1">${htmlText(sample(rand, 5))}<a href="https://a.b/1-2" title="a - b">${htmlText(sample(rand, 3))}</a> ${htmlText(sample(rand, 4))}</p><pre>${htmlText(sample(rand, 4))}</pre><code>${htmlText(sample(rand, 2))}</code>`;
      const output = typesetHtml(html, { lang: 'en', nbsp: 'char' });
      expect(tags(output)).toEqual(tags(html));
      expect(output.match(/<pre>[\s\S]*?<\/pre>/)?.[0]).toBe(
        html.match(/<pre>[\s\S]*?<\/pre>/)?.[0],
      );
      expect(output.match(/<code>[\s\S]*?<\/code>/)?.[0]).toBe(
        html.match(/<code>[\s\S]*?<\/code>/)?.[0],
      );
    }
  });

  test('Markdown mode keeps fenced code and inline code', () => {
    const rand = random(17);
    for (let i = 0; i < 400; i++) {
      const fence = `\`\`\`\n${sample(rand, 5)}\n\`\`\``;
      const md = `# ${sample(rand, 3)}\n\n${sample(rand, 5)} \`${sample(rand, 2).replaceAll('`', '')}x\`\n\n${fence}\n\n${sample(rand, 4)}\n`;
      const output = typesetMarkdown(md);
      expect(output).toContain(fence);
      expect(output.match(/`[^`\n]+x`/)?.[0]).toBe(md.match(/`[^`\n]+x`/)?.[0]);
    }
  });
});
