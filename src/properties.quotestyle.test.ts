import { describe, expect, test } from 'bun:test';
import { LANGS, REGISTERS, RULE_IDS, typographic } from './core';

/**
 * The properties of properties.test.ts, run with `quoteStyle: 'us'` for every language. The
 * generators are copied, not imported, so that file's shared vocabulary (and with it every seeded
 * stream there) stays as it is.
 */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const PIECES = [
  'a', 'I', 'x', 'word', 'don’t', "'tis", 'dogs’', 'Dr.', '5', '21', '10:00', '1920x1080',
  ' ', ' ', ' ', '  ', '\n', ' ',
  '"', '"', "'", '’', '“', '”', '„', '«', '»', '‹', '›', '‘', '‚',
  '-', '--', '—', '->', '...', '(c)', '%', ',', '.', '(', ')', 'https://a.b/1-2', '`x -> y`',
];

function sample(rand: () => number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    if (i > 0 && rand() < 0.7) out += ' ';
    out += PIECES[Math.floor(rand() * PIECES.length)] ?? '';
  }
  return out;
}

const TOKENS = ['stone', 'memory', "don't", 'the ’90s', '5 km', '`x -> y`', 'a', 'I', '...', '-', '5%'];
const WRAPS: [string, string][] = [
  ['"', '"'],
  ['“', '”'],
  ['„', '“'],
  ['«', '»'],
  ['‘', '’'],
  ["'", "'"],
];

/** A sentence as it is written: words, quotations around some of them, nested now and then, a lone mark at an end. */
function sentence(rand: () => number): string {
  const pick = <T>(list: readonly T[]): T => list[Math.floor(rand() * list.length)] as T;
  const words = Array.from({ length: 3 + Math.floor(rand() * 8) }, () => pick(TOKENS));
  let outer = -1;
  const wrap = (from: number, to: number) => {
    if (words[from] === '-' || words[to] === '-') return;
    let style = Math.floor(rand() * WRAPS.length);
    if (style === outer) style = (style + 1) % WRAPS.length;
    outer = style;
    const [open, close] = WRAPS[style] as [string, string];
    words[from] = `${open}${words[from]}`;
    words[to] = `${words[to]}${close}`;
  };
  let nested = false;
  if (rand() < 0.7) {
    const first = Math.floor(rand() * (words.length - 1));
    const last = first + 1 + Math.floor(rand() * (words.length - first - 1));
    wrap(first, last);
    if (rand() < 0.4 && last - first >= 2) {
      wrap(first + 1, last - 1);
      nested = true;
    }
  }
  if (!nested && rand() < 0.15) words[0] = `“${words[0]}`;
  return words.join(' ');
}

const letters = (text: string) =>
  text
    .replace(/\((?:c|R|TM)\)/gi, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .replaceAll(/[xX×]/g, '');

const us = { quoteStyle: 'us' } as const;
const CASES = 1500;
const QUOTE_ONLY = RULE_IDS.filter((id) => id !== 'quote');

describe("properties of typographic() with quoteStyle: 'us'", () => {
  for (const lang of LANGS) {
    for (const register of REGISTERS) {
      test(`${lang}/${register}: never loses or adds a letter or digit`, () => {
        const rand = random(1000 + LANGS.indexOf(lang) * 7 + REGISTERS.indexOf(register));
        for (let i = 0; i < CASES; i++) {
          const input = sample(rand, 1 + Math.floor(rand() * 14));
          const output = typographic(input, lang, { ...us, register });
          if (letters(input) !== letters(output)) {
            throw new Error(
              `letters changed for ${JSON.stringify(input)} -> ${JSON.stringify(output)}`,
            );
          }
        }
      });
    }
  }

  test('a second pass changes nothing, on text as it is written, in every language', () => {
    const failures: string[] = [];
    for (const lang of LANGS) {
      for (const register of REGISTERS) {
        const rand = random(2000 + LANGS.indexOf(lang) * 3 + REGISTERS.indexOf(register));
        for (let i = 0; i < CASES; i++) {
          const input = sentence(rand);
          const once = typographic(input, lang, { ...us, register });
          const twice = typographic(once, lang, { ...us, register });
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

  test('the register makes no difference to the quote marks', () => {
    for (const lang of LANGS) {
      const rand = random(4000 + LANGS.indexOf(lang));
      for (let i = 0; i < CASES / 3; i++) {
        const input = sentence(rand);
        const only = { ...us, disable: QUOTE_ONLY };
        expect(typographic(input, lang, { ...only, register: 'literary' })).toBe(
          typographic(input, lang, { ...only, register: 'display' }),
        );
      }
    }
  });
});
