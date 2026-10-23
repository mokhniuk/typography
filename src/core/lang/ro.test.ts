import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types.ts';
import { typographic } from '../typography.ts';
import { wellFormed } from './pack-checks.test-utils.ts';
import { ro } from './ro.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'ro', options).replaceAll(NBSP, '~');

wellFormed(ro, 'ro.test.ts');

// Sources: EU Publications Office table of quotation marks (Romanian „…” and «…»).
describe('Romanian quotes', () => {
  test('levels are „…” and «…»', () => {
    expect(ro.quotes).toEqual([
      ['„', '”'],
      ['«', '»'],
    ]);
  });

  test('straight, English and German marks become „…”', () => {
    expect(t('El a zis "salut" și a plecat')).toBe('El a zis „salut” și a plecat');
    expect(t('El a zis “salut” și a plecat')).toBe('El a zis „salut” și a plecat');
    expect(t('El a zis „salut“ și a plecat')).toBe('El a zis „salut” și a plecat');
  });

  test('a quotation inside a quotation is «…»', () => {
    expect(t('“x ‘y’ z”')).toBe('„x «y» z”');
    expect(t('„x «y» z”')).toBe('„x «y» z”');
  });

  test('the third level starts over from „…”', () => {
    expect(t('“x ‘y “z” y’ x”')).toBe('„x «y „z” y» x”');
  });

  test('two quotations in a row stay two', () => {
    expect(t('El a zis „a” și „b”.')).toBe('El a zis „a” și „b”.');
  });

  test('a second pass changes nothing', () => {
    const once = typographic('El a zis "a" și “x ‘y’ z” și „b”.', 'ro');
    expect(typographic(once, 'ro')).toBe(once);
  });
});

describe('Romanian numbers', () => {
  test('the number format is a no-break space and a comma (Commission web-writing guide)', () => {
    expect(ro.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Așteptăm? - a întrebat.')).toBe('–~Așteptăm?~– a întrebat.');
    expect(t('- Așteptăm? - a întrebat.', { register: 'literary' })).toBe(
      '–~Așteptăm?~– a întrebat.',
    );
  });
});
