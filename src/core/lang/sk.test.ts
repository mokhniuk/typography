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

  test('not implemented, not verified: one-letter words are left as written', () => {
    expect(t('Idem k lesu a v noci')).toBe('Idem k lesu a v noci');
  });

  test('the goldens are idempotent', () => {
    for (const text of ['“x ‘y’ z”', 'Povedal: "idem domov."', "O'Brien povedal \"áno\""]) {
      const once = typographic(text, 'sk');
      expect(typographic(once, 'sk')).toBe(once);
    }
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Počkáme? - spýtal sa.')).toBe('–~Počkáme?~– spýtal sa.');
    expect(t('- Počkáme? - spýtal sa.', { register: 'literary' })).toBe('–~Počkáme?~– spýtal sa.');
  });
});
