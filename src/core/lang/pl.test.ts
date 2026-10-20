import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { wellFormed } from './pack-checks';
import { pl } from './pl';

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
});
