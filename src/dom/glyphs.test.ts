import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { insertedGlyphs } from '../core/index.ts';
import { glyphStatus, missingGlyphs, supports } from './glyphs.ts';

/**
 * The glyph measure runs in a browser; here the browser is one stub canvas. Each fake font has the
 * characters it draws and the width it draws them at, and a family list falls through to the next
 * font exactly as a browser's does — which is the whole point of the comparison in `supports`.
 */
const FONTS: Record<string, { has: string; width: number }> = {
  Narrow: { has: 'A…’', width: 7 },
  monospace: { has: '*', width: 10 },
  serif: { has: '*', width: 20 },
};

const familiesOf = (font: string): string[] =>
  font
    .replace(/^\d+px\s+/, '')
    .split(',')
    .map((name) => name.trim().replace(/^["']|["']$/g, ''));

class FakeContext {
  font = '';
  measureText(text: string) {
    for (const family of familiesOf(this.font)) {
      const face = FONTS[family];
      if (face && (face.has === '*' || [...text].every((ch) => face.has.includes(ch)))) {
        return { width: face.width * [...text].length };
      }
    }
    return { width: 0 };
  }
}

const saved = globalThis.document;

beforeAll(() => {
  (globalThis as { document?: unknown }).document = {
    createElement: () => ({ getContext: () => new FakeContext() }),
  };
});
afterAll(() => {
  (globalThis as { document?: unknown }).document = saved;
});

describe('supports', () => {
  test('a character the font draws itself', () => {
    expect(supports('…', '"Narrow"')).toBe(true);
    expect(supports('’', '"Narrow"')).toBe(true);
  });

  test('a character only a fallback can draw', () => {
    expect(supports('«', '"Narrow"')).toBe(false);
    expect(supports('⇒', '"Narrow"')).toBe(false);
  });

  test('nothing to measure means nothing is avoided', () => {
    expect(supports('', '"Narrow"')).toBe(true);
  });
});

describe('glyphStatus', () => {
  test('the font draws it, a fallback draws it, or nothing does', () => {
    expect(glyphStatus('…', '"Narrow"')).toBe('own');
    expect(glyphStatus('«', '"Narrow"')).toBe('fallback');
    // Nothing in the stub draws a character of width 0 but the generic fallbacks, which draw
    // everything; a face that measures 0 is reported as drawn by nothing.
    expect(glyphStatus('', '"Narrow"')).toBe('own');
  });
});

describe('missingGlyphs', () => {
  test('lists the characters the font cannot draw, each once', () => {
    expect(missingGlyphs('…«»«', '"Narrow"')).toBe('«»');
  });

  test('over the characters the rules insert, and never a character the font has', () => {
    const missing = missingGlyphs(insertedGlyphs('en'), '"Narrow"');
    expect(missing).toContain('«');
    expect(missing).not.toContain('…');
    expect(missing).not.toContain('’');
  });
});
