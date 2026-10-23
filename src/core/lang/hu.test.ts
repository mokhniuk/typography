import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types.ts';
import { typographic } from '../typography.ts';
import { hu } from './hu.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'hu', options).replaceAll(NBSP, '~');

wellFormed(hu, 'hu.test.ts');

// Sources: EU Publications Office table of quotation marks (Hungarian „…”, »…«, ’…’), and a
// Hungarian journal style guide that follows A magyar helyesírás szabályai, 12th ed.
// („idézet »belső idézet« idézet vége”).
describe('Hungarian quotes', () => {
  test('levels are „…”, »…«, ’…’', () => {
    expect(hu.quotes).toEqual([
      ['„', '”'],
      ['»', '«'],
      ['’', '’'],
    ]);
    expect(hu.turnedPairs).toEqual([['»', '«']]);
  });

  test('straight, English and German marks become „…”', () => {
    expect(t('Azt mondta "szia" és elment')).toBe('Azt mondta „szia” és elment');
    expect(t('Azt mondta “szia” és elment')).toBe('Azt mondta „szia” és elment');
    expect(t('Azt mondta „szia“ és elment')).toBe('Azt mondta „szia” és elment');
  });

  test('a quotation inside a quotation is »…«', () => {
    expect(t('“idézet ‘belső idézet’ vége”')).toBe('„idézet »belső idézet« vége”');
    expect(t('„idézet »belső idézet« vége”')).toBe('„idézet »belső idézet« vége”');
    expect(t('"idézet \'belső\' vége"')).toBe('„idézet »belső« vége”');
  });

  test('two inner quotations in a row are not read as one », és «', () => {
    expect(t('„a »b« és »c« d”')).toBe('„a »b« és »c« d”');
  });

  test('a third level is ’…’', () => {
    expect(t('“a ‘b “c” b’ a”')).toBe('„a »b ’c’ b« a”');
  });

  test('a second pass changes nothing', () => {
    for (const src of [
      '“idézet ‘belső idézet’ vége” és „másik”.',
      '„a »b« és »c« d”',
      '“a ‘b “c” b’ a”',
      'Azt mondta "a" és "b".',
    ]) {
      const once = typographic(src, 'hu');
      expect(typographic(once, 'hu')).toBe(once);
    }
  });
});

describe('Hungarian numbers', () => {
  test('the number format is a no-break space and a comma (Commission web-writing guide)', () => {
    expect(hu.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Várunk? - kérdezte.')).toBe('–~Várunk?~– kérdezte.');
    expect(t('- Várunk? - kérdezte.', { register: 'literary' })).toBe('–~Várunk?~– kérdezte.');
  });
});
