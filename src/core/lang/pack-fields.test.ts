import { describe, expect, test } from 'bun:test';
import { quotesFor } from '../quotes';
import type { LangPack } from './pack';

/** A pack for the tests: only what the engine reads from it matters here. */
const pack = (fields: Partial<LangPack>): LangPack => ({
  code: 'xx',
  name: 'Test',
  sample: '',
  quotes: [
    ['«', '»'],
    ['„', '“'],
  ],
  reviewed: false,
  sources: [],
  notes: '',
  ...fields,
});

describe('pack fields the quote scan reads', () => {
  test('openers: an extra character may stand before an opening mark', () => {
    // A mark with no partner is read by where it stands; without ¿ in `openers`, " after it closes.
    const plain = quotesFor(pack({}));
    const spanish = quotesFor(pack({ openers: '¿¡' }));
    expect(spanish('¿"Qué" dices?')).toBe('¿«Qué» dices?');
    expect(spanish('¡"Hola" amigo!')).toBe('¡«Hola» amigo!');
    expect(spanish('¿"Qué dices?')).toBe('¿«Qué dices?');
    expect(plain('¿"Qué dices?')).toBe('¿»Qué dices?');
  });

  test('openers: a quoted word in single quotes after an opener', () => {
    const spanish = quotesFor(pack({ openers: '¿' }));
    expect(spanish("¿'Qué' dices?")).toBe('¿«Qué» dices?');
  });

  test('openers: characters special in a regex class are escaped', () => {
    const odd = quotesFor(pack({ openers: ']^-\\' }));
    expect(odd('-"x" ^"y"')).toBe('-«x» ^«y»');
  });

  test('elisions: only the listed words are read as an apostrophe', () => {
    const none = quotesFor(pack({}));
    const some = quotesFor(pack({ elisions: ['tis', 'n'] }));
    expect(some("'tis fine and rock 'n' roll")).toBe('’tis fine and rock ’n’ roll');
    // 'tis is listed: an apostrophe. 'em is not: it opens a quotation that the last ' closes.
    expect(some("'em all'")).toBe('«em all»');
    expect(none("'tis fine'")).toBe('«tis fine»');
    expect(some("'tis fine'")).toBe("’tis fine'");
  });

  test('turnedPairs: a guillemet pair listed as turned replaces the usual one', () => {
    const danish = quotesFor(
      pack({
        quotes: [
          ['»', '«'],
          ['›', '‹'],
        ],
        turnedPairs: [
          ['»', '«'],
          ['›', '‹'],
        ],
      }),
    );
    expect(danish('Hun sagde «a» og «b».')).toBe('Hun sagde »a« og »b«.');
    expect(danish('Hun sagde »a« og »b«.')).toBe('Hun sagde »a« og »b«.');
    expect(danish('x “a ‘b’ c” y')).toBe('x »a ›b‹ c« y');
  });
});
