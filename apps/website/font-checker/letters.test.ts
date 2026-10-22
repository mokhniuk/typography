import { describe, expect, test } from 'bun:test';
import { insertedGlyphs, LANGS, PACK } from '../../../src/core';
import { RISKY_LETTERS } from './letters';

/**
 * The letters the font checker asks about on top of the marks the rules insert. A new language pack
 * must get a line here, even an empty one, so no language is checked for its marks only.
 */
describe('the letters fonts often lack', () => {
  test('every language has a line', () => {
    expect(Object.keys(RISKY_LETTERS).sort()).toEqual([...LANGS].sort());
  });

  test('each line is letters of its own language, each one once, and never a mark', () => {
    for (const [lang, letters] of Object.entries(RISKY_LETTERS)) {
      expect(new Set([...letters]).size, lang).toBe([...letters].length);
      for (const letter of letters) {
        expect(/\p{L}|\p{P}/u.test(letter), `${lang}: ${letter}`).toBe(true);
        expect(insertedGlyphs(), `${lang}: ${letter}`).not.toContain(letter);
      }
    }
  });

  test('a language whose letters are plain ASCII has an empty line', () => {
    expect(RISKY_LETTERS.en).toBe('');
    expect(PACK.en.code).toBe('en');
  });
});
