import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { bg } from './bg';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'bg', options).replaceAll(NBSP, '~');

wellFormed(bg, 'bg.test.ts');

// ISG = Междуинституционално ръководство за оформяне на текстове (Служба за публикации на ЕС),
// PDF of 19 April 2022, section numbers as in that edition; see `sources` in bg.ts.
describe('Bulgarian quotation (ISG 4.2.3 and 10.1.7: „…“ at every level)', () => {
  test('ISG 10.1.7: „…“ is the Bulgarian pair', () => {
    expect(t('Той каза "здравей" и си тръгна.')).toBe('Той каза „здравей“ и си тръгна.');
    expect(t('Той каза “здравей” и си тръгна.')).toBe('Той каза „здравей“ и си тръгна.');
    expect(t('Той каза „здравей“ и си тръгна.')).toBe('Той каза „здравей“ и си тръгна.');
  });

  test('ISG 10.1.7 example: булевард „България“, площад „Съединение“', () => {
    expect(t('булевард "България", площад "Съединение"')).toBe(
      'булевард „България“, площад „Съединение“',
    );
  });

  test('ISG 4.2.3: every level uses „…“, a quotation inside a quotation too', () => {
    expect(t('"x \'y\' z"')).toBe('„x „y“ z“');
    expect(t('“x ‘y’ z”')).toBe('„x „y“ z“');
    expect(t('„x „y“ z“')).toBe('„x „y“ z“');
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Каза "да" и "не" едновременно.')).toBe('Каза „да“ и „не“ едновременно.');
  });

  test('Cyrillic text with Latin quotes round-trips: a second pass changes nothing', () => {
    for (const input of [
      'Той каза "здравей" и си тръгна.',
      'Вестник "Култура" и списание "Тема".',
      'Думата "hello" в "английски" текст.',
    ]) {
      const once = typographic(input, 'bg');
      expect(once).not.toContain('"');
      expect(once.replace(/[„“]/g, '')).toBe(input.replace(/"/g, ''));
      expect(typographic(once, 'bg')).toBe(once);
    }
  });

  test('quoteStyle us keeps “…” with ‘…’ inside', () => {
    expect(t('Той каза "здравей"', { quoteStyle: 'us' })).toBe('Той каза “здравей”');
  });
});

describe('Bulgarian spaces', () => {
  test('ISG 6.4: a fixed space before % ; ISG 7.3.3: before the euro sign', () => {
    expect(t('със 5% и 49€')).toBe('със 5~% и 49~€');
  });

  test('ISG 4.2.3: стр. stays with its number', () => {
    expect(t('вж. стр. 12, стр. 40')).toBe('вж. стр.~12, стр.~40');
  });
});

describe('Bulgarian numbers', () => {
  test('ISG 4.2.3 and 6.5: groups of three with a fixed space, a comma for decimals (opt-in)', () => {
    expect(t('сума 1234567; 152231,324', { enable: ['number.group'] })).toBe(
      'сума 1~234~567; 152~231,324',
    );
  });

  test('ISG 6.5: comma for decimals, a fixed space between groups of three', () => {
    expect(bg.numbers).toEqual({ group: NBSP, decimal: ',' });
  });
});

describe('Bulgarian idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of ['"x \'y\' z"', 'със 5% и 49€, вж. стр. 12', 'сума 1234567']) {
      const once = typographic(input, 'bg', { enable: ['number.group'] });
      expect(typographic(once, 'bg', { enable: ['number.group'] })).toBe(once);
    }
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Ще чакаме ли? - попита той.')).toBe('—~Ще чакаме ли?~— попита той.');
    expect(t('- Ще чакаме ли? - попита той.', { register: 'literary' })).toBe(
      '—~Ще чакаме ли?~— попита той.',
    );
  });
});
