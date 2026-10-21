import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { hr } from './hr';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'hr', options).replaceAll(NBSP, '~');

wellFormed(hr, 'hr.test.ts');

// ISG = Međuinstitucijski stilski priručnik (Ured za publikacije EU-a), PDF of 19 April 2022,
// section numbers as in that edition; see `sources` in hr.ts.
describe('Croatian quotation (ISG 10.1.8: „…” then ‚…’, the second again at the third level)', () => {
  test('ISG 10.1.8: „…” is the first level', () => {
    expect(t('Rekao je "dobar dan" i otišao.')).toBe('Rekao je „dobar dan” i otišao.');
    expect(t('Rekao je “dobar dan” i otišao.')).toBe('Rekao je „dobar dan” i otišao.');
    expect(t('Rekao je „dobar dan” i otišao.')).toBe('Rekao je „dobar dan” i otišao.');
  });

  test('ISG 10.1.8: ‚…’ is the second level', () => {
    expect(t('"x \'y\' z"')).toBe('„x ‚y’ z”');
    expect(t('„x ‚y’ z”')).toBe('„x ‚y’ z”');
  });

  test('ISG 10.1.8: the third level reuses the second: „x ‚y ‚z’ y’ x”', () => {
    expect(t('“x ‘y “z” y’ x”')).toBe('„x ‚y ‚z’ y’ x”');
    const ready = '„x ‚y ‚z’ y’ x”';
    expect(t(ready)).toBe(ready);
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Rekao je "da" i "ne" istodobno.')).toBe('Rekao je „da” i „ne” istodobno.');
  });

  test('an apostrophe inside a word does not break a quotation', () => {
    expect(t("Rekao je \"o'Brien\" jučer.")).toBe('Rekao je „o’Brien” jučer.');
  });

  test('quoteStyle us gives “…” with ‘…’ inside', () => {
    expect(t('"x \'y\' z"', { quoteStyle: 'us' })).toBe('“x ‘y’ z”');
  });
});

describe('Croatian spaces', () => {
  test('ISG 6.4 and 10.1.12: a fixed space before % ; ISG 7.3.3: before the euro sign', () => {
    expect(t('od 15% i 49€')).toBe('od 15~% i 49~€');
  });

  test('ISG 10.1.12: br. and str. stay with the number after them', () => {
    expect(t('vidjeti str. 12, br. 5')).toBe('vidjeti str.~12, br.~5');
  });
});

describe('Croatian numbers', () => {
  test('ISG 6.5 and 10.1.12: groups of three with a fixed space, a comma for decimals (opt-in)', () => {
    expect(t('iznos 12500; 152231,324567', { enable: ['number.group'] })).toBe(
      'iznos 12~500; 152~231,324567',
    );
  });

  test('ISG 6.5: comma for decimals, a fixed space between groups of three', () => {
    expect(hr.numbers).toEqual({ group: NBSP, decimal: ',' });
  });
});

describe('Croatian idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of ['“x ‘y “z” y’ x”', 'od 15% i 49€, str. 12', 'iznos 12500']) {
      const once = typographic(input, 'hr', { enable: ['number.group'] });
      expect(typographic(once, 'hr', { enable: ['number.group'] })).toBe(once);
    }
  });
});
