import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { wellFormed } from './pack-checks';
import { sv } from './sv';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'sv', options).replaceAll(NBSP, '~');

wellFormed(sv, 'sv.test.ts');

// Sources: EU Publications Office table of quotation marks (Swedish ”…” and ’…’), and
// Frågelådan, Institutet för språk och folkminnen (an inner quotation takes enkla citattecken).
describe('Swedish quotes: the same mark opens and closes', () => {
  test('the pack says so', () => {
    expect(sv.sameMarkQuotes).toBe(true);
    expect(sv.quotes).toEqual([
      ['”', '”'],
      ['’', '’'],
    ]);
  });

  test('straight, English and German marks become ”…”', () => {
    expect(t('Han sa "hej" och gick')).toBe('Han sa ”hej” och gick');
    expect(t('Han sa “hej” och gick')).toBe('Han sa ”hej” och gick');
    expect(t('Han sa „hej“ och gick')).toBe('Han sa ”hej” och gick');
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Han sa ”a” och ”b”.')).toBe('Han sa ”a” och ”b”.');
    expect(t('Han sa "a" och "b".')).toBe('Han sa ”a” och ”b”.');
    expect(t('”a” ”b” ”c”')).toBe('”a” ”b” ”c”');
  });

  test('an inner quotation is ’…’', () => {
    expect(t('“x ‘y’ z”')).toBe('”x ’y’ z”');
    expect(t('"x \'y\' z"')).toBe('”x ’y’ z”');
    expect(t('”x ’y’ z”')).toBe('”x ’y’ z”');
  });

  test('an apostrophe or a closing ’ inside a quotation is kept', () => {
    expect(t('Han sa "Lars’ bil" nu')).toBe('Han sa ”Lars’ bil” nu');
    expect(t('Han sa ”Lars’ bil” nu')).toBe('Han sa ”Lars’ bil” nu');
    expect(t('Han sa ”ta Lars’” nu')).toBe('Han sa ”ta Lars’” nu');
    expect(t("Det är Lars's bok")).toBe('Det är Lars’s bok');
  });

  test('a second pass changes nothing', () => {
    for (const src of [
      'Han sa "a" och "b" och "c ’d’ e".',
      'Han sa ”Lars’ bil” och ”ta Lars’” nu.',
      'Hon läste „x ‚y‘ z“ och ”w”.',
      '”a ’b ”c” b’ a”',
      '”x’”',
    ]) {
      const once = typographic(src, 'sv');
      expect(typographic(once, 'sv')).toBe(once);
    }
  });
});

describe('Swedish numbers', () => {
  test('the number format is a no-break space and a comma (Commission web-writing guide)', () => {
    expect(sv.numbers).toEqual({ group: NBSP, decimal: ',' });
  });
});
