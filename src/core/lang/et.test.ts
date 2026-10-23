import { describe, expect, test } from 'bun:test';
import { typographic } from '../index.ts';
import { NBSP } from '../types.ts';
import { et } from './et.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'et', options).replaceAll(NBSP, '~');

wellFormed(et, 'et.test.ts');

// ISG = Väljaannete stiilijuhend (Euroopa Liidu Väljaannete Talitus), PDF of 19 April 2022,
// section numbers as in that edition; see `sources` in et.ts.
describe('Estonian quotation (ISG 4.2.3, 5.10, 10.1.6: „…“ at every level)', () => {
  test('ISG 4.2.3, 10.1.6: „…“ from straight, English and guillemet source quotes', () => {
    expect(t('Ta ütles "tere" ja läks.')).toBe('Ta ütles „tere“ ja läks.');
    expect(t('Ta ütles “tere” ja läks.')).toBe('Ta ütles „tere“ ja läks.');
    expect(t('Ta ütles «tere» ja läks.')).toBe('Ta ütles „tere“ ja läks.');
    expect(t('Ta ütles „tere“ ja läks.')).toBe('Ta ütles „tere“ ja läks.');
  });

  test('ISG 5.10: a quotation inside a quotation is doubled with the same marks', () => {
    expect(t('“x ‘y’ z”')).toBe('„x „y“ z“');
    expect(t('“x ‘y “w” y’ x”')).toBe('„x „y „w“ y“ x“');
  });

  test('ISG 5.10 example: „Nõukogu tahtis võtta meetmeid, kuid loobus.“', () => {
    expect(
      t('"Nõukogu tahtis võtta asjakohaseid meetmeid, kuid lõpuks loobus sellest kavast."'),
    ).toBe('„Nõukogu tahtis võtta asjakohaseid meetmeid, kuid lõpuks loobus sellest kavast.“');
    const ready = 'Vallet, G., „La nature juridique de l’Union européenne“, Le droit de l’Union';
    expect(t(ready)).toBe(ready);
  });

  // The ISG omission mark [---] (5.10, 10.1.6) was set as "[ – -]" in every language until the dash
  // rules learned that a run of three hyphens is no double hyphen.
  test('ISG 5.10: the omission mark [---] stays as written', () => {
    expect(t('„Nõukogu tahtis võtta meetmeid [---], kuid loobus.“')).toBe(
      '„Nõukogu tahtis võtta meetmeid [---], kuid loobus.“',
    );
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Ta ütles "jah" ja "ei" korraga.')).toBe('Ta ütles „jah“ ja „ei“ korraga.');
  });

  test('Estonian letters inside and next to quotes survive', () => {
    expect(t('"õäöüšž" ja "ÕÄÖÜŠŽ"')).toBe('„õäöüšž“ ja „ÕÄÖÜŠŽ“');
    expect(t('("öökülm")')).toBe('(„öökülm“)');
    expect(t('(„öökülm“)')).toBe('(„öökülm“)');
    expect(t('Tallinn"ä"')).toBe('Tallinn„ä“');
  });
});

describe('Estonian spaces and dashes', () => {
  test('ISG 6.4: a fixed space before %', () => {
    expect(t('käibemaks 22% ja 100 %')).toBe('käibemaks 22~% ja 100~%');
  });

  test('ISG 6.4 (money only as the code EUR): currencySpace is off, so no space is added before € (percentSpace still spaces %)', () => {
    expect(t('30€')).toBe('30€');
    expect(t('5%')).toBe('5~%');
    expect(t('€30')).toBe('€30');
  });

  test('ISG 10.1.7: the dash is the en dash', () => {
    expect(t('tähtaeg - ajavahemik')).toBe('tähtaeg~– ajavahemik');
    expect(t('tähtaeg — ajavahemik')).toBe('tähtaeg~– ajavahemik');
  });

  test('a range of numbers takes an unspaced en dash (ISG A3 lk 2–5)', () => {
    expect(t('lk 2-5')).toBe('lk~2–5');
  });
});

describe('Estonian numbers (ISG 6.5)', () => {
  test('the pack: a comma for the decimals, a no-break space between groups of three', () => {
    expect(et.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('ISG 6.5: groups from five digits; number.group, opt-in, with a no-break space', () => {
    expect(t('Elanikke 1234567, summa 12345,67 EUR', { enable: ['number.group'] })).toBe(
      'Elanikke 1~234~567, summa 12~345,67~EUR',
    );
    expect(t('aastal 1961, lk 2064', { enable: ['number.group'] })).toBe('aastal 1961, lk~2064');
  });
});

describe('Estonian idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      'Ta ütles "tere" ja läks.',
      '“x ‘y “w” y’ x”',
      'Vallet, G., „La nature juridique de l’Union européenne“',
      'käibemaks 22% ja lk 2-5',
      'tähtaeg - ajavahemik',
    ]) {
      const once = typographic(input, 'et');
      expect(typographic(once, 'et')).toBe(once);
      const grouped = typographic(`${input} 1234567`, 'et', { enable: ['number.group'] });
      expect(typographic(grouped, 'et', { enable: ['number.group'] })).toBe(grouped);
    }
  });
});
