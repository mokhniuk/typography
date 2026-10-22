import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { wellFormed } from './pack-checks';
import { uk } from './uk';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'uk', options).replaceAll(NBSP, '~');

wellFormed(uk, 'uk.test.ts');

describe('Ukrainian', () => {
  test('quotes are guillemets with „…“ inside', () => {
    expect(t('“x ‘y’ z”')).toBe('«x „y“ z»');
  });

  test('the literary register keeps the quotes; the dialogue dash is set in both registers', () => {
    expect(t('“x ‘y’ z”', { register: 'literary' })).toBe('«x „y“ z»');
    expect(t('- Привіт', { register: 'literary' })).toBe('—~Привіт');
    expect(t('- Привіт')).toBe('—~Привіт');
  });

  test('one-letter words stay with the next word', () => {
    expect(t('Він і я в домі')).toBe('Він і~я в~домі');
  });

  test('abbreviations stay together or with what follows', () => {
    expect(t('і т. д. і т. п.')).toBe('і~т.~д. і~т.~п.');
    expect(t('вул. Хрещатик, м. Київ')).toBe('вул.~Хрещатик, м.~Київ');
  });

  test('short words stay with the next word when space.short-word is on', () => {
    expect(t('Ласкаво просимо до міста', { enable: ['space.short-word'] })).toBe('Ласкаво просимо до~міста');
    expect(t('Ласкаво просимо до міста')).toBe('Ласкаво просимо до міста');
  });
});
