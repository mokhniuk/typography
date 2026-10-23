import { describe, expect, test } from 'bun:test';
import { LANGS, NBSP, typographic } from './index.ts';

const us = { quoteStyle: 'us' } as const;
const t = (text: string, lang: Parameters<typeof typographic>[1] = 'en', options = us) =>
  typographic(text, lang, options).replaceAll(NBSP, '~');

describe("quoteStyle: 'us'", () => {
  test('en: “…” with ‘…’ inside, from any source style', () => {
    expect(t('He said "stone" and left.')).toBe('He said “stone” and~left.');
    expect(t('"x \'y\' z"')).toBe('“x ‘y’ z”');
    expect(t('«x „y“ z»')).toBe('“x ‘y’ z”');
  });

  test('de, uk and fr get the same marks, and French no space inside', () => {
    expect(t('Er sagte "Haus" und ging.', 'de')).toBe('Er sagte “Haus” und ging.');
    expect(t('Er sagte »x ›y‹ z«', 'de')).toBe('Er sagte “x ‘y’ z”');
    expect(t('Він сказав "ми тут"', 'uk')).toBe('Він сказав “ми тут”');
    expect(t('Il a dit "oui" et « non »', 'fr')).toBe('Il a dit “oui” et “non”');
  });

  test('it takes precedence over the literary register in every language', () => {
    for (const lang of LANGS) {
      expect(t('"x \'y\' z"', lang, { quoteStyle: 'us', register: 'literary' } as never)).toBe(
        '“x ‘y’ z”',
      );
    }
  });

  test('the default is the language: nothing changes unless asked', () => {
    expect(typographic('"x"', 'de')).toBe('»x«');
    expect(typographic('"x"', 'de', { quoteStyle: 'language' })).toBe('»x«');
    expect(typographic('"x"', 'en')).toBe('“x”');
    expect(typographic('"x"', 'en', { register: 'literary', quoteStyle: 'language' })).toBe('‘x’');
  });

  test('a quotation nested deeper than two levels starts over', () => {
    expect(t('“1 ‘2 “3 ‘4’ 3” 2’ 1”')).toBe('“1 ‘2 “3 ‘4’ 3” 2’ 1”');
  });

  test('an apostrophe inside a US quotation does not break it', () => {
    expect(t('He said “we’re here”')).toBe('He said “we’re here”');
    expect(t('He said "we\'re here" today')).toBe('He said “we’re here” today');
    expect(t("“Maria's stone”")).toBe('“Maria’s stone”');
    expect(t('“outer ‘don’t panic’ outer”')).toBe('“outer ‘don’t panic’ outer”');
  });

  test('the closer of level two is also an apostrophe: ‘don’t’ and a trailing possessive', () => {
    expect(t('She said ‘don’t’ twice')).toBe('She said “don’t” twice');
    expect(t('the dogs’ bowl and “x ‘b’ c”')).toBe('the~dogs’ bowl and~“x ‘b’ c”');
    expect(t("'twas 'til dawn, “x”")).toBe('’twas ’til dawn, “x”');
  });

  test('is stable on its own output', () => {
    for (const sample of [
      '“a ‘b’ c”',
      'He said ‘don’t’ and “we’re “here” now” — then 5\'10" left.',
      '“first paragraph',
      'last paragraph”',
      '‘lone single’ and “double”',
      'the dogs’ and “a ‘b’ c” and ‘x’',
    ]) {
      for (const lang of LANGS) {
        const once = typographic(sample, lang, us);
        expect(typographic(once, lang, us)).toBe(once);
      }
    }
  });

  test('an opening mark without a partner is read by where it stands, as with any style', () => {
    expect(t('"first paragraph')).toBe('“first paragraph');
    expect(t('last paragraph"')).toBe('last paragraph”');
  });
});

const guillemets = { quoteStyle: 'guillemets' } as const;
const g = (text: string, lang: Parameters<typeof typographic>[1] = 'en', options = guillemets) =>
  typographic(text, lang, options).replaceAll(NBSP, '~');

describe("quoteStyle: 'guillemets'", () => {
  test('en: «…», then „…“, then ‚…‘, from any source style', () => {
    expect(g('He said "stone" and left.')).toBe('He said «stone» and~left.');
    expect(g('"x \'y\' z"')).toBe('«x „y“ z»');
    expect(g('“1 ‘2 “3” 2’ 1”')).toBe('«1 „2 ‚3‘ 2“ 1»');
  });

  test('de gets the same marks instead of its own »…«', () => {
    expect(g('Er sagte "Haus" und ging.', 'de')).toBe('Er sagte «Haus» und ging.');
    expect(g('Er sagte »x ›y‹ z«', 'de')).toBe('Er sagte «x „y“ z»');
  });

  test('it takes precedence over the literary register in every language', () => {
    for (const lang of LANGS) {
      expect(
        g('"x \'y\' z"', lang, { quoteStyle: 'guillemets', register: 'literary' } as never),
      ).toBe('«x „y“ z»');
    }
  });

  test('a quotation nested deeper than three levels starts over', () => {
    expect(g('“1 ‘2 “3 ‘4’ 3” 2’ 1”')).toBe('«1 „2 ‚3 «4» 3‘ 2“ 1»');
  });

  test('is stable on its own output', () => {
    for (const sample of ['«a „b ‚c‘ b“ a»', "He said \"we're here\" and 'x'", '«lone opener']) {
      for (const lang of LANGS) {
        const once = typographic(sample, lang, guillemets);
        expect(typographic(once, lang, guillemets)).toBe(once);
      }
    }
  });
});
