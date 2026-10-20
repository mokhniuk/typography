import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { mt } from './mt';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'mt', options).replaceAll(NBSP, '~');

wellFormed(mt, 'mt.test.ts');

// ISG = Il-Gwida tal-Istil Interistituzzjonali, Maltese PDF of 19 April 2022; see `sources` in mt.ts.
describe('Maltese quotation (ISG 4.2.3: “…” then ‘…’, further levels repeat 1 and 2)', () => {
  test('ISG 4.2.3: double marks first', () => {
    expect(t('Qal "sew" u mar.')).toBe('Qal “sew” u mar.');
    expect(t('Qal «sew» u mar.')).toBe('Qal “sew” u mar.');
    expect(t('Qal “sew” u mar.')).toBe('Qal “sew” u mar.');
  });

  test('ISG 4.2.3: ‘…’ inside, a third level repeats the first', () => {
    expect(t('"x \'y\' z"')).toBe('“x ‘y’ z”');
    expect(t('“x ‘y “z” y’ x”')).toBe('“x ‘y “z” y’ x”');
    expect(t('“x ‘y “z ‘w’ z” y’ x”')).toBe('“x ‘y “z ‘w’ z” y’ x”');
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Qal "iva" u "le" flimkien.')).toBe('Qal “iva” u “le” flimkien.');
  });

  test('quoteStyle us is the same pair order', () => {
    expect(t('Qal "sew" u mar.', { quoteStyle: 'us' })).toBe('Qal “sew” u mar.');
  });
});

describe('Maltese apostrophe (ISG 4.2.3: the typographic ’; ta’, m’hu, l-)', () => {
  test('apostrophe inside and at the end of a word, outside a quotation', () => {
    expect(t("Il-ktieb ta' Mario, m'hu x'inhu, u l-ħobż.")).toBe(
      'Il-ktieb ta’ Mario, m’hu x’inhu, u l-ħobż.',
    );
  });

  test('ta’ and m’hu inside a quotation keep the pair', () => {
    expect(t('Qal "il-ktieb ta\' Mario" illum.')).toBe('Qal “il-ktieb ta’ Mario” illum.');
    expect(t('Qal "m\'hu hemm" illum.')).toBe('Qal “m’hu hemm” illum.');
    expect(t('Qal "ta\'" u mar.')).toBe('Qal “ta’” u mar.');
  });

  test('a quotation after ta’', () => {
    expect(t('Il-ktieb ta\' "Mario" hu hawn.')).toBe('Il-ktieb ta’ “Mario” hu hawn.');
  });

  test('a quotation with straight single marks (level 1 is double here) that holds ta’ and m’hu', () => {
    expect(t("Qal 'm'hu hemm' illum.")).toBe('Qal “m’hu hemm” illum.');
  });

  test('ċ ġ ħ ż and għ are kept, with the hyphenated article', () => {
    expect(t('"Il-ħobż taċ-ċikkulata, iż-żmien u l-għajn."')).toBe(
      '“Il-ħobż taċ-ċikkulata, iż-żmien u l-għajn.”',
    );
  });
});

describe('Maltese spaces (ISG 6.4 table, common to all languages)', () => {
  test('a fixed space before %', () => {
    expect(t('il-5% hawn')).toBe('il-5~% hawn');
  });

  test('ISG 7: the euro sign stands before the amount, no space', () => {
    expect(t('somma ta’ €30')).toBe('somma ta’ €30');
  });

  test('ISG 6.4: p. stays with the number after it', () => {
    expect(t('ara p. 12, pp. 71–98')).toBe('ara p.~12, pp.~71–98');
  });
});

describe('Maltese numbers (ISG 6.5: a point for decimals, a fixed space between groups)', () => {
  test('pack data', () => {
    expect(mt.numbers).toEqual({ group: NBSP, decimal: '.' });
  });

  test('number.group groups with a no-break space and keeps the point', () => {
    expect(
      typographic('1234567.89', 'mt', { enable: ['number.group'] }).replaceAll(NBSP, '~'),
    ).toBe('1~234~567.89');
  });
});

describe('Maltese idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      'Qal "sew" u mar.',
      "Qal 'm'hu hemm' illum, ta' Mario, 5%.",
      '“x ‘y “z” y’ x”',
      'ara p. 12 "il-ktieb ta\' Mario" 1234567.89',
    ]) {
      const once = typographic(input, 'mt');
      expect(typographic(once, 'mt')).toBe(once);
    }
  });
});
