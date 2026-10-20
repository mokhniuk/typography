import { describe, expect, test } from 'bun:test';
import { LANGS, PACK, typographic } from './index';
import { GROUP_MIN_DIGITS } from './numbers';

const on = (text: string, lang: (typeof LANGS)[number] = 'en') =>
  typographic(text, lang, { enable: ['number.group'] });
const N = ' ';

describe('number.group', () => {
  test('is off by default', () => {
    expect(typographic('1000000', 'en')).toBe('1000000');
  });

  test('groups in threes from the right with the pack separator', () => {
    expect(on('1000000')).toBe('1,000,000');
    expect(on('12345')).toBe('12,345');
    expect(on('1234567', 'uk')).toBe(`1${N}234${N}567`);
    expect(on('1234567', 'pl')).toBe(`1${N}234${N}567`);
    expect(on('1234567', 'fr')).toBe(`1${N}234${N}567`);
    expect(on('1234567', 'de')).toBe(`1${N}234${N}567`);
    const ch = PACK.ch.numbers?.group;
    expect(on('1234567', 'ch')).toBe(`1${ch}234${ch}567`);
  });

  test('the threshold is a constant: a run shorter than it is left', () => {
    expect(GROUP_MIN_DIGITS).toBe(5);
    expect(on('2026 1999 9999')).toBe('2026 1999 9999');
    expect(on('10000')).toBe('10,000');
  });

  test('groups the integer part and leaves the fraction alone', () => {
    expect(on('1234567.891234')).toBe('1,234,567.891234');
    expect(on('1234567,891234', 'de')).toBe(`1${N}234${N}567,891234`);
    expect(on('0.123456')).toBe('0.123456');
    expect(on('3,14159265', 'de')).toBe('3,14159265');
  });

  test('leaves a number already grouped, in any language', () => {
    for (const s of [
      '1,000,000',
      '1 000 000',
      `1${N}000${N}000`,
      '1.000.000',
      '1’000’000',
      "1'000'000",
    ]) {
      for (const lang of LANGS) expect(on(s, lang)).toBe(s);
    }
    expect(on('1234,000')).toBe('1234,000');
    expect(on('12345,000')).toBe('12345,000');
  });

  test('leaves digits glued to letters or underscores, hex, colours', () => {
    for (const s of [
      'v1000000',
      'ID12345678',
      '0x1F4A2B',
      '0x123456',
      'a_12345678',
      '12345678px',
      '#123456',
      '&#12345;',
    ]) {
      expect(on(s)).toBe(s);
    }
  });

  test('leaves phone numbers', () => {
    for (const s of [
      '+380501234567',
      '+49 12345678',
      '044-1234567',
      '(044) 1234567',
      '1234567-890',
      '800 12345 678',
    ]) {
      expect(on(s)).toBe(s);
    }
  });

  test('leaves dates, times and versions', () => {
    for (const s of ['2026-10-20', '10:00:00', '1.2.30000', '1.2.30000.5', '12345:67', '12345/67890']) {
      expect(on(s)).toBe(s);
    }
  });

  test('leaves a leading zero', () => {
    expect(on('007')).toBe('007');
    expect(on('00123456')).toBe('00123456');
  });

  test('leaves a run inside a URL, an email, a code span', () => {
    const s = 'see https://a.b/1234567 and a1234567@b.co and `1234567`';
    expect(on(s)).toBe(s);
  });

  test('works in a sentence, beside a unit', () => {
    expect(on('We sold 1234567 copies.')).toBe('We sold 1,234,567\u00A0copies.');
    expect(on('-12345 and 12345%')).toBe('\u221212,345\u00A0and 12,345%');
  });

  test('is idempotent on its own output, in every language', () => {
    for (const lang of LANGS) {
      const once = on('Sold 1234567 and 12345 and 1234567,891234 units.', lang);
      expect(on(once, lang)).toBe(once);
    }
  });
});
