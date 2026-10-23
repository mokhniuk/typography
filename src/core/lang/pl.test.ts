import { describe, expect, test } from 'bun:test';
import { typographic } from '../index.ts';
import { NBSP } from '../types.ts';
import { wellFormed } from './pack-checks.test-utils.ts';
import { pl } from './pl.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'pl', options).replaceAll(NBSP, '~');

wellFormed(pl, 'pl.test.ts');

describe('Polish', () => {
  test('quotes are „…” with «…» inside', () => {
    expect(t('“x ‘y’ z”')).toBe('„x «y» z”');
  });

  test('one-letter words stay with the next word', () => {
    expect(t('Idę w las i z nim')).toBe('Idę w~las i~z~nim');
  });

  test('ul. stays with the street', () => {
    expect(t('ul. Marszałkowska 5')).toBe('ul.~Marszałkowska 5');
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Poczekamy? - zapytał.')).toBe('—~Poczekamy?~— zapytał.');
    expect(t('- Poczekamy? - zapytał.', { register: 'literary' })).toBe('—~Poczekamy?~— zapytał.');
  });

  test('short words stay with the next word, by default and when enabled', () => {
    expect(t('Zapraszamy na rynek', { enable: ['space.short-word'] })).toBe('Zapraszamy na~rynek');
    expect(t('Zapraszamy na rynek')).toBe('Zapraszamy na~rynek');
  });
});
