import { describe, expect, test } from 'bun:test';
import { typographic } from '../index.ts';
import { NBSP } from '../types.ts';
import { lt } from './lt.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'lt', options).replaceAll(NBSP, '~');

wellFormed(lt, 'lt.test.ts');

// ISG = Leidinių rengimo vadovas (Europos Sąjungos leidinių biuras), PDF of 19 April 2022,
// section numbers as in that edition; see `sources` in lt.ts.
describe('Lithuanian quotation (ISG 4.2.3, 10.1.7: „…“ at every level)', () => {
  test('ISG 4.2.3: „…“ from straight, English and guillemet source quotes', () => {
    expect(t('Jis pasakė "labas" ir išėjo.')).toBe('Jis pasakė „labas“ ir išėjo.');
    expect(t('Jis pasakė “labas” ir išėjo.')).toBe('Jis pasakė „labas“ ir išėjo.');
    expect(t('Jis pasakė «labas» ir išėjo.')).toBe('Jis pasakė „labas“ ir išėjo.');
    expect(t('Jis pasakė „labas“ ir išėjo.')).toBe('Jis pasakė „labas“ ir išėjo.');
  });

  test('ISG 4.2.3: the same marks at every level of nesting', () => {
    expect(t('“x ‘y’ z”')).toBe('„x „y“ z“');
    expect(t('“x ‘y “w” y’ x”')).toBe('„x „y „w“ y“ x“');
  });

  test('ISG 10.1.7 example: „kilo ginčų dėl bendrovės „Microsoft““ (nested, written out)', () => {
    expect(t('Komisijos narys pažymėjo, kad "kilo ginčų dėl bendrovės \'Microsoft\'".')).toBe(
      'Komisijos narys pažymėjo, kad „kilo ginčų dėl bendrovės „Microsoft““.',
    );
    const ready = 'Komisijos narys pažymėjo, kad „kilo ginčų dėl bendrovės „Microsoft““.';
    expect(t(ready)).toBe(ready);
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Jis sakė "taip" ir "ne" kartu.')).toBe('Jis sakė „taip“ ir „ne“ kartu.');
  });

  test('ISG 10.1.7: punctuation after the closing mark, a whole sentence before it', () => {
    expect(t('Komisijos narys pažymėjo: "Kilo ginčų."')).toBe(
      'Komisijos narys pažymėjo: „Kilo ginčų.“',
    );
  });

  test('Lithuanian letters inside and next to quotes survive', () => {
    expect(t('"ąčęėįšųūž" ir "ĄČĘĖĮŠŲŪŽ"')).toBe('„ąčęėįšųūž“ ir „ĄČĘĖĮŠŲŪŽ“');
    expect(t('(„šūkis“)')).toBe('(„šūkis“)');
    expect(t('("šūkis")')).toBe('(„šūkis“)');
  });
});

describe('Lithuanian spaces and dashes', () => {
  test('ISG 6.4: a fixed space before %', () => {
    expect(t('PVM 21% ir 100 %')).toBe('PVM 21~% ir 100~%');
  });

  test('ISG 6.4 (money only as the code EUR): currencySpace is off, so no space is added before € (percentSpace still spaces %)', () => {
    expect(t('30€')).toBe('30€');
    expect(t('5%')).toBe('5~%');
    expect(t('€30')).toBe('€30');
  });

  test('ISG 10.1.4: the sentence dash is a spaced en dash, not an em dash', () => {
    expect(t('Kitas žingsnis - sumažinti išlaidas')).toBe('Kitas žingsnis~– sumažinti išlaidas');
    expect(t('Kitas žingsnis — sumažinti išlaidas')).toBe('Kitas žingsnis~– sumažinti išlaidas');
  });

  test('ISG 10.1.4: a range of numbers takes an unspaced en dash', () => {
    expect(t('2006-2009 m.')).toBe('2006–2009~m.');
  });

  test('ISG 10.3.9, 10.1.8: the parts of an abbreviation are not split across lines', () => {
    expect(t('Taip, t. y. visi, t. t. ir š. m.')).toBe('Taip, t.~y. visi, t.~t. ir š.~m.');
    expect(t('a. k. ir b. k.')).toBe('a.~k. ir b.~k.');
  });

  test('ISG 4.2.3, 10.3.9: Nr. and p. stay with the number after them', () => {
    expect(t('Nr. 5, p. 21')).toBe('Nr.~5, p.~21');
  });
});

describe('Lithuanian numbers (ISG 6.5)', () => {
  test('the pack: a comma for the decimals, a no-break space between groups of three', () => {
    expect(lt.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('number.group, opt-in, groups in threes with a no-break space', () => {
    expect(t('Gyventojų 1234567, suma 12345,67 EUR', { enable: ['number.group'] })).toBe(
      'Gyventojų 1~234~567, suma 12~345,67~EUR',
    );
    expect(t('2026 m.', { enable: ['number.group'] })).toBe('2026~m.');
  });
});

describe('Lithuanian idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      'Jis pasakė "labas" ir išėjo.',
      '“x ‘y “w” y’ x”',
      'Komisijos narys pažymėjo, kad „kilo ginčų dėl bendrovės „Microsoft““.',
      'PVM 21% ir t. y. Nr. 5, p. 21',
      'Kitas žingsnis - sumažinti išlaidas 2006-2009 m.',
    ]) {
      const once = typographic(input, 'lt');
      expect(typographic(once, 'lt')).toBe(once);
      const grouped = typographic(`${input} 1234567`, 'lt', { enable: ['number.group'] });
      expect(typographic(grouped, 'lt', { enable: ['number.group'] })).toBe(grouped);
    }
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Palauksime? - paklausė.')).toBe('–~Palauksime?~– paklausė.');
    expect(t('- Palauksime? - paklausė.', { register: 'literary' })).toBe(
      '–~Palauksime?~– paklausė.',
    );
  });
});
