import { describe, expect, test } from 'bun:test';
import { typographic } from '../index.ts';
import { NBSP } from '../types.ts';
import { frCH } from './fr-ch.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'fr-CH', options).replaceAll(NBSP, '~');

wellFormed(frCH, 'fr-ch.test.ts');

describe('French (Switzerland)', () => {
  test('quotes are «…» with ‹…› inside, and no space inside the marks, unlike French', () => {
    expect(t('“x ‘y’ z”')).toBe('«x ‹y› z»');
    expect(t('Il a dit "oui" et "non".')).toBe('Il a dit «oui» et «non».');
    expect(t('“x ‘y “z” y’ x”')).toBe('«x ‹y «z» y› x»');
  });

  test('an elided article takes the typographic apostrophe', () => {
    expect(t("l'homme et l'atelier d'été")).toBe('l’homme et l’atelier d’été');
  });

  test('number.group (opt-in) groups digits with a no-break space; the decimal mark is a point', () => {
    const on = { enable: ['number.group'] };
    expect(t('1234567')).toBe('1234567');
    expect(t('1234567', on)).toBe('1~234~567');
    expect(t('CHF 1234567.50', on)).toBe('CHF~1~234~567.50');
  });

  test('% and € stand apart from the number, as in French', () => {
    expect(t('5% et 49€')).toBe('5~% et 49~€');
  });

  test('no space is set before ; ! ? or :', () => {
    expect(t('Vraiment? Oui! Voici: ceci;')).toBe('Vraiment? Oui! Voici: ceci;');
  });

  test('the sample', () => {
    expect(t(frCH.sample)).toBe(
      'Il a dit «nous sommes là»~— et il est parti… Le labo fonctionne du 21–26~septembre, 10:00–12:00. Lire la suite~→',
    );
  });
});
