import { describe, expect, test } from 'bun:test';
import { quotesFor } from '../quotes.ts';
import { NBSP } from '../types.ts';
import { typographic } from '../typography.ts';
import type { LangPack } from './pack.ts';

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

describe('pack fields a default rule reads', () => {
  test('highPunctuation: the space each names is set before : and before ; ! ?', () => {
    const run = (text: string, fields: Partial<LangPack>) =>
      typographic(text, pack(fields)).replaceAll(NBSP, '~').replaceAll('\u202F', '^');
    const text = 'Voici: ici; oui! non?';
    expect(run(text, { highPunctuation: { colon: NBSP, others: '\u202F' } })).toBe(
      'Voici~: ici^; oui^! non^?',
    );
    expect(run(text, { highPunctuation: { colon: NBSP } })).toBe('Voici~: ici; oui! non?');
    expect(run(text, { highPunctuation: { others: NBSP } })).toBe('Voici: ici~; oui~! non~?');
    expect(run(text, {})).toBe(text);
  });
});

describe('pack fields an opt-in rule reads, through the pack-only typographic', () => {
  const run = (text: string, fields: Partial<LangPack>, rule: string) =>
    typographic(text, pack(fields), { enable: [rule] }).replaceAll(NBSP, '~');

  test('highPunctuation: the space before : ; ! ? stays, the one before , . goes', () => {
    const text = 'Attention : ici ! Et là , oui .';
    const high = { colon: NBSP, others: '\u202F' };
    expect(
      typographic(text, pack({ highPunctuation: high }), {
        disable: ['space.high-punctuation'],
        enable: ['space.before-punctuation'],
      }),
    ).toBe('Attention : ici ! Et là, oui.');
    expect(run(text, {}, 'space.before-punctuation')).toBe('Attention: ici! Et là, oui.');
  });

  test('highPunctuation: a space stays only before the mark whose field is set', () => {
    const run2 = (high: NonNullable<LangPack['highPunctuation']>) =>
      typographic('ici : ici ! non ?', pack({ highPunctuation: high }), {
        disable: ['space.high-punctuation'],
        enable: ['space.before-punctuation'],
      });
    expect(run2({ colon: NBSP })).toBe('ici : ici! non?');
    expect(run2({ others: '\u202F' })).toBe('ici: ici ! non ?');
  });

  test('bareTemperature: a bare 20 C is read as a temperature only with it', () => {
    expect(run('It is 20 C today', { bareTemperature: true }, 'symbol.degree')).toBe(
      'It is 20~°C today',
    );
    // Without it the C stays a letter (space.number still binds it to the number).
    expect(run('It is 20 C today', {}, 'symbol.degree')).toBe('It is 20~C today');
    // The degree sign is read whatever the pack says.
    expect(run('It is 20°C today', {}, 'symbol.degree')).toBe('It is 20~°C today');
  });

  test('a code where a pack belongs throws, naming the module a pack is imported from: lang/<code>', () => {
    expect(() => typographic('x', 'en' as never)).toThrow(
      'lang is a language pack here: import one from @mokhniuk/typography/lang/<code>',
    );
  });
});
