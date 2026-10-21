import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { wellFormed } from './pack-checks';
import { sl } from './sl';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'sl', options).replaceAll(NBSP, '~');

wellFormed(sl, 'sl.test.ts');

// ISG = Medinstitucionalni slogovni priročnik (Urad za publikacije EU), PDF of 19 April 2022,
// section numbers as in that edition; see `sources` in sl.ts.
describe('Slovenian quotation (ISG 10.1.6: „…“ then ‚…‘, the second again at the third level)', () => {
  test('ISG 10.1.6: „…“ is the double quotation mark', () => {
    expect(t('Rekel je "dober dan" in odšel.')).toBe('Rekel je „dober dan“ in odšel.');
    expect(t('Rekel je “dober dan” in odšel.')).toBe('Rekel je „dober dan“ in odšel.');
    expect(t('Rekel je „dober dan“ in odšel.')).toBe('Rekel je „dober dan“ in odšel.');
  });

  test('ISG 10.1.6: ‚…‘ only inside „…“: „xxx ‚xxx‘ xxx“', () => {
    expect(t('"x \'y\' z"')).toBe('„x ‚y‘ z“');
    expect(t('„x ‚y‘ z“')).toBe('„x ‚y‘ z“');
  });

  test('ISG 10.1.6 and 4.2.3: the third level reuses the second: „xxx ‚xxx ‚xxx‘ xxx‘ xxx“', () => {
    expect(t('“xxx ‘xxx “xxx” xxx’ xxx”')).toBe('„xxx ‚xxx ‚xxx‘ xxx‘ xxx“');
    const ready = '„xxx ‚xxx ‚xxx‘ xxx‘ xxx“';
    expect(t(ready)).toBe(ready);
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Rekel je "da" in "ne" hkrati.')).toBe('Rekel je „da“ in „ne“ hkrati.');
  });

  test('quoteStyle us gives “…” with ‘…’ inside', () => {
    expect(t('"x \'y\' z"', { quoteStyle: 'us' })).toBe('“x ‘y’ z”');
  });
});

describe('Slovenian dash (ISG 10.1.7)', () => {
  test('a break in the sentence is a spaced en dash (no-break space before it)', () => {
    expect(t('Kamen - spomin - in čas')).toBe('Kamen~– spomin~– in čas');
  });
});

describe('Slovenian spaces', () => {
  test('ISG 6.4 and 10.8: a fixed space before % ; ISG 7.3.3: before the euro sign', () => {
    expect(t('od 15% in 49€')).toBe('od 15~% in 49~€');
  });

  test('ISG 4.2.3: št. and str. stay with the number after them', () => {
    expect(t('glej str. 12, št. 5')).toBe('glej str.~12, št.~5');
  });
});

describe('Slovenian numbers', () => {
  test('ISG 4.2.3 and 6.5: groups of three with a fixed space, a comma for decimals (opt-in)', () => {
    expect(t('znesek 12500; 152231,324567', { enable: ['number.group'] })).toBe(
      'znesek 12~500; 152~231,324567',
    );
  });

  test('ISG 6.5: comma for decimals, a fixed space between groups of three', () => {
    expect(sl.numbers).toEqual({ group: NBSP, decimal: ',' });
  });
});

describe('Slovenian idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      '“xxx ‘xxx “xxx” xxx’ xxx”',
      'od 15% in 49€, str. 12',
      'znesek 12500',
      'Kamen - spomin',
    ]) {
      const once = typographic(input, 'sl', { enable: ['number.group'] });
      expect(typographic(once, 'sl', { enable: ['number.group'] })).toBe(once);
    }
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Počakamo? je vprašal.')).toBe('–~Počakamo? je vprašal.');
    expect(t('- Počakamo? je vprašal.', { register: 'literary' })).toBe('–~Počakamo? je vprašal.');
  });
});
