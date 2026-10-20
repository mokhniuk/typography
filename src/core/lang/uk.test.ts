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

  test('the literary register keeps the quotes and sets the dialogue dash', () => {
    expect(t('“x ‘y’ z”', { register: 'literary' })).toBe('«x „y“ z»');
    expect(t('- Привіт', { register: 'literary' })).toBe('—~Привіт');
    expect(t('- Привіт')).toBe('- Привіт');
  });

  test('one-letter words stay with the next word', () => {
    expect(t('Він і я в домі')).toBe('Він і~я в~домі');
  });

  test('abbreviations stay together or with what follows', () => {
    expect(t('і т. д. і т. п.')).toBe('і~т.~д. і~т.~п.');
    expect(t('вул. Хрещатик, м. Київ')).toBe('вул.~Хрещатик, м.~Київ');
  });
});
