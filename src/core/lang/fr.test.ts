import { describe, expect, test } from 'bun:test';
import { typographic } from '../index.ts';
import { NBSP } from '../types.ts';
import { fr } from './fr.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

/** `~` is a no-break space (U+00A0), `^` a narrow one (U+202F). */
const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'fr', options).replaceAll(NBSP, '~').replaceAll('\u202F', '^');

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
    expect(t('- On attend ? - a-t-il demandé.')).toBe('—~On attend^?~— a-t-il demandé.');
    expect(t('- On attend ? - a-t-il demandé.', { register: 'literary' })).toBe(
      '—~On attend^?~— a-t-il demandé.',
    );
  });

  test('a no-break space before a colon, a narrow one before ; ! ? (space.high-punctuation)', () => {
    expect(t('Pourquoi? Attention! Voici: le plan; sinon rien.')).toBe(
      'Pourquoi^? Attention^! Voici~: le plan^; sinon rien.',
    );
    expect(t('Pourquoi ? Voici : le plan')).toBe('Pourquoi^? Voici~: le plan');
  });

  test('no space between two marks, in a time or a ratio, or at a line start', () => {
    expect(t('Quoi?! Bien...! à 10:30 en 16:9\n? non')).toBe('Quoi^?! Bien…! à 10:30 en 16:9\n? non');
  });
});
