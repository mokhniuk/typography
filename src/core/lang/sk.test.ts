import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { wellFormed } from './pack-checks';
import { sk } from './sk';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'sk', options).replaceAll(NBSP, '~');

wellFormed(sk, 'sk.test.ts');

// Sources read: TASR language column citing Pravidlá slovenského pravopisu (2000, s. 107 – 108)
// (teraz.sk, clanok 348361) for the marks; touchit.sk column by a JÚŠ expert for number format.
describe('Slovak', () => {
  test('Pravidlá slovenského pravopisu via TASR: „…“ with ‚…‘ inside, from English or straight source quotes', () => {
    expect(t('“x ‘y’ z”')).toBe('„x ‚y‘ z“');
    expect(t('"x \'y\' z"')).toBe('„x ‚y‘ z“');
  });

  test('Slovak marks already in place are kept', () => {
    expect(t('„x ‚y‘ z“')).toBe('„x ‚y‘ z“');
  });

  test('a third level starts over from „…“', () => {
    expect(t('“x ‘y “w” y’ x”')).toBe('„x ‚y „w“ y‘ x“');
  });

  test('guillemets in the source are set as Slovak quotes', () => {
    expect(t('«x ‹y› z»')).toBe('„x ‚y‘ z“');
  });

  test('TASR: the punctuation of a quoted sentence stays before the closing mark', () => {
    expect(t('Povedal: "idem domov."')).toBe('Povedal: „idem domov.“');
  });

  test('the apostrophe in a word is not a quote mark', () => {
    expect(t('O\'Brien povedal "áno"')).toBe('O’Brien povedal „áno“');
  });

  test('v, k, s, u, z, o, a, i bind to the next word (convention from secondary sources)', () => {
    expect(t('Idem k lesu a v noci')).toBe('Idem k~lesu a~v~noci');
    expect(t('o dome u cesty s priateľom z mesta i ona')).toBe('o~dome u~cesty s~priateľom z~mesta i~ona');
  });

  test('capital forms are bound too', () => {
    expect(t('Dnes. V lese A on')).toBe('Dnes. V~lese A~on');
  });

  test('a word that ends in a list letter is not bound; the standalone letter after it is', () => {
    expect(t('Rusko a on')).toBe('Rusko a~on');
    expect(t('Slovensko v Európe')).toBe('Slovensko v~Európe');
  });

  test('a letter inside a word and longer words are left alone', () => {
    expect(t('kôň sa učí')).toBe('kôň sa učí');
    expect(t('do lesa')).toBe('do lesa');
  });

  test('the goldens are idempotent', () => {
    for (const text of ['“x ‘y’ z”', 'Povedal: "idem domov."', 'O\'Brien povedal "áno"', 'Idem k lesu a v noci']) {
      const once = typographic(text, 'sk');
      expect(typographic(once, 'sk')).toBe(once);
    }
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Počkáme? - spýtal sa.')).toBe('–~Počkáme?~– spýtal sa.');
    expect(t('- Počkáme? - spýtal sa.', { register: 'literary' })).toBe('–~Počkáme?~– spýtal sa.');
  });
});
