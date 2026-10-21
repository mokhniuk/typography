import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { fr } from './fr';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'fr', options).replaceAll(NBSP, '~');

wellFormed(fr, 'fr.test.ts');

describe('French', () => {
  test('quotes are « … » with a no-break space inside, “…” inside them', () => {
    expect(t('“x ‘y’ z”')).toBe('«~x “y” z~»');
  });

  test('% and € stand apart from the number', () => {
    expect(t('5% et 49€')).toBe('5~% et 49~€');
  });

  test('has no abbreviation list', () => {
    expect(t('z. B. das')).toBe('z. B. das');
  });
});
