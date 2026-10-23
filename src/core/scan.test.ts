import { describe, expect, test } from 'bun:test';
import { before, isLetter, isLetterOrNumber } from './scan.ts';

/**
 * The helpers stand in for a `u`-flag lookbehind, so they must answer as the lookbehind does on the
 * engine that runs the test, for every code point (JavaScriptCore does not see astral letters in a
 * lookbehind, V8 does; see scan.ts).
 */
const POSITIVE_L = /(?<=\p{L})x/u;
const NEGATIVE_LN = /(?<![\p{L}\p{N}])x/u;

describe('lookbehind stand-ins', () => {
  test('isLetter and isLetterOrNumber agree with the lookbehinds for every code point', () => {
    const wrong: string[] = [];
    let seen = 0;
    let letters = 0;
    for (let cp = 0; cp <= 0x10ffff; cp++) {
      if (cp >= 0xd800 && cp <= 0xdfff) continue;
      const ch = String.fromCodePoint(cp);
      const text = `${ch}x`;
      // A lookbehind tested at the x, which stands at index ch.length.
      const letter = new RegExp(POSITIVE_L.source, 'uy');
      const number = new RegExp(NEGATIVE_LN.source, 'uy');
      letter.lastIndex = number.lastIndex = ch.length;
      const seesLetter = letter.test(text);
      const seesNeither = number.test(text);
      seen++;
      if (seesLetter) letters++;
      if (isLetter(before(text, ch.length)) !== seesLetter) wrong.push(`L U+${cp.toString(16)}`);
      if (isLetterOrNumber(before(text, ch.length)) === seesNeither)
        wrong.push(`LN U+${cp.toString(16)}`);
      if (wrong.length > 5) break;
    }
    expect(wrong).toEqual([]);
    expect(seen).toBe(0x110000 - 0x800);
    expect(letters).toBeGreaterThan(40_000);
  });

  test('before reads a surrogate pair as one code point and a lone surrogate as itself', () => {
    expect(before('a\u{1D51E}', 3)).toBe('\u{1D51E}');
    expect(before('\u{1D51E}', 1)).toBe('\uD835');
    expect(before('\uDD1E', 1)).toBe('\uDD1E');
    expect(before('x\uDD1E', 2)).toBe('\uDD1E');
    expect(before('abc', 0)).toBe('');
    expect(before('abc', 2)).toBe('b');
  });
});
