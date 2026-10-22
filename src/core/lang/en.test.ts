import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { en } from './en';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'en', options).replaceAll(NBSP, '~');

wellFormed(en, 'en.test.ts');

describe('English', () => {
  test('display quotes are guillemets with „…“ inside', () => {
    expect(t('“x ‘y’ z”')).toBe('«x „y“ z»');
  });

  test('the literary register is British: ‘outer “inner” outer’', () => {
    expect(t('“x ‘y’ z”', { register: 'literary' })).toBe('‘x “y” z’');
  });

  test('a break in the sentence is an em dash, an en dash in literary text', () => {
    expect(t('x - y')).toBe('x~— y');
    expect(t('x - y', { register: 'literary' })).toBe('x~– y');
  });

  test('a, A and I are not left at the end of a line', () => {
    expect(t('A cat and I')).toBe('A~cat and I');
  });

  test('% and € keep their usual place', () => {
    expect(t('5% and 49€')).toBe('5% and 49€');
  });

  test('elided words are apostrophes, not quotation marks', () => {
    expect(t("rock 'n' roll and 'til dawn, 'em all")).toBe('rock ’n’ roll and ’til dawn, ’em all');
  });

  test('short words stay with the next word when space.short-word is on', () => {
    expect(t('Welcome to the city', { enable: ['space.short-word'] })).toBe('Welcome to~the city');
    expect(t('Welcome to the city')).toBe('Welcome to the city');
  });
});
