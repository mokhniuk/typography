import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types.ts';
import { typographic } from '../typography.ts';
import { fr } from './fr.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

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

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- On attend ? - a-t-il demandé.')).toBe('—~On attend ?~— a-t-il demandé.');
    expect(t('- On attend ? - a-t-il demandé.', { register: 'literary' })).toBe(
      '—~On attend ?~— a-t-il demandé.',
    );
  });
});
