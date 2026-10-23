import { describe, expect, test } from 'bun:test';
import { LANGS, typographic } from './core/index.ts';

/** Properties of the opt-in rule `number.group`, on seeded random strings with a vocabulary of its own. */
function random(seed: number) {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const PIECES = [
  '1',
  '12',
  '123',
  '1234',
  '12345',
  '123456',
  '1234567',
  '12345678',
  '1000000',
  '007',
  '00123456',
  '2026',
  '2026-10-20',
  '10:00:00',
  '1.2.30000',
  '1,000,000',
  '1 000 000',
  '1.000.000',
  '1’000’000',
  '3,14159265',
  '3.14159265',
  '+380501234567',
  '(044) 1234567',
  'v1000000',
  'ID12345678',
  '0x1F4A2B',
  'km',
  'word',
  '%',
  '€',
  '-',
  '.',
  ',',
  ':',
  '/',
  '(',
  ')',
  ' ',
  ' ',
  ' ',
  ' ',
  '\n',
  'https://a.b/1234567',
  'a1234567@b.co',
  '`1234567`',
];

const ZONES = ['https://a.b/1234567-8', 'a1234567@b.co', '`x 12345678 y`'];

function sample(rand: () => number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    if (i > 0 && rand() < 0.6) out += ' ';
    out += PIECES[Math.floor(rand() * PIECES.length)] ?? '';
  }
  return out;
}

const digits = (text: string) => text.replace(/\D/g, '');
const run = (text: string, lang: (typeof LANGS)[number]) =>
  typographic(text, lang, { enable: ['number.group'] });
const CASES = 1500;

describe('properties of number.group', () => {
  for (const lang of LANGS) {
    test(`${lang}: no digit lost or added, stable on a second pass, never throws`, () => {
      const rand = random(5 + LANGS.indexOf(lang));
      for (let i = 0; i < CASES; i++) {
        const input = sample(rand, 1 + Math.floor(rand() * 12));
        const once = run(input, lang);
        if (digits(once) !== digits(input)) {
          throw new Error(`digits changed for ${JSON.stringify(input)} -> ${JSON.stringify(once)}`);
        }
        const twice = run(once, lang);
        if (twice !== once) {
          throw new Error(
            `not stable for ${JSON.stringify(input)} -> ${JSON.stringify(once)} -> ${JSON.stringify(twice)}`,
          );
        }
      }
    });

    test(`${lang}: zones come back exactly as written`, () => {
      const rand = random(50 + LANGS.indexOf(lang));
      for (let i = 0; i < CASES; i++) {
        const zone = ZONES[i % ZONES.length] ?? '';
        const output = run(`${sample(rand, 4)} ${zone} ${sample(rand, 4)}`, lang);
        expect(output).toContain(zone);
      }
    });
  }

  test('never throws on arbitrary text', () => {
    const rand = random(3);
    for (let i = 0; i < CASES; i++) {
      let input = '';
      for (let j = 0; j < 20; j++) input += String.fromCodePoint(Math.floor(rand() * 0x2fff) + 1);
      for (const lang of LANGS) expect(() => run(input, lang)).not.toThrow();
    }
  });
});
