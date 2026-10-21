import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { cs } from './cs';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'cs', options).replaceAll(NBSP, '~');

wellFormed(cs, 'cs.test.ts');

// Sources read: Internetová jazyková příručka (ÚJČ AV ČR), pages `?slovo=uvozovky` (quotes),
// `?id=880` (line ends), `?slovo=procento` (number and %), `?slovo=pomlčka` (sentence dash).
describe('Czech', () => {
  test('ÚJČ uvozovky: „…“ with ‚…‘ inside, from English or straight source quotes', () => {
    expect(t('“x ‘y’ z”')).toBe('„x ‚y‘ z“');
    expect(t('"x \'y\' z"')).toBe('„x ‚y‘ z“');
  });

  test('ÚJČ uvozovky: Czech marks already in place are kept', () => {
    expect(t('„x ‚y‘ z“')).toBe('„x ‚y‘ z“');
  });

  test('a third level starts over from „…“', () => {
    expect(t('“x ‘y “w” y’ x”')).toBe('„x ‚y „w“ y‘ x“');
  });

  test('guillemets in the source are set as Czech quotes', () => {
    expect(t('«x ‹y› z»')).toBe('„x ‚y‘ z“');
  });

  test('quotes next to punctuation and words', () => {
    expect(t('Řekl: "jdu domů".')).toBe('Řekl: „jdu domů“.');
  });

  test('ÚJČ line ends: k, s, v, z, o, u, a, i stay with the next word', () => {
    expect(t('Jdu k lesu s přítelem v noci z města')).toBe('Jdu k~lesu s~přítelem v~noci z~města');
    expect(t('o domě u cesty a on i ona')).toBe('o~domě u~cesty a~on i~ona');
  });

  test('capital forms of the same words are bound too', () => {
    expect(t('Dnes. V lese A on')).toBe('Dnes. V~lese A~on');
  });

  test('a longer word is not bound', () => {
    expect(t('do lesa')).toBe('do lesa');
  });

  test('ÚJČ procento: a space stands between number and %, and it does not break', () => {
    expect(t('14 % či 14%')).toBe('14~% či 14~%');
  });

  test('ÚJČ pomlčka: the sentence dash is a spaced en dash', () => {
    expect(t('Praha - hlavní město')).toBe('Praha~– hlavní město');
  });

  test('the apostrophe in a word is not a quote mark', () => {
    expect(t('O\'Brien řekl "ano"')).toBe('O’Brien řekl „ano“');
  });

  test('the goldens are idempotent', () => {
    for (const text of [
      '“x ‘y’ z”',
      'Jdu k lesu s přítelem v noci',
      '14% a 14 %',
      'Praha - hlavní město',
      'Řekl: "jdu domů".',
    ]) {
      const once = typographic(text, 'cs');
      expect(typographic(once, 'cs')).toBe(once);
    }
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Počkáme? - zeptal se.')).toBe('–~Počkáme?~– zeptal se.');
    expect(t('- Počkáme? - zeptal se.', { register: 'literary' })).toBe('–~Počkáme?~– zeptal se.');
  });
});
