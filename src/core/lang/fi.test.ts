import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { fi } from './fi';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'fi', options).replaceAll(NBSP, '~');

wellFormed(fi, 'fi.test.ts');

// ISG = Toimielinten yhteiset tekstinlaadinnan ohjeet (Finnish Interinstitutional Style Guide), PDF of
// 19 April 2022, section numbers as in that edition. Kotus = Kotus article "Joudutko lainaamaan kieli
// keskellä suuta?" (inner quotation in ’…’). See `sources` in fi.ts.
describe('Finnish quotation: the same mark opens and closes (ISG 4.2.3, 6.4, 10.4.5; Kotus)', () => {
  test('the pack says so', () => {
    expect(fi.sameMarkQuotes).toBe(true);
    expect(fi.quotes).toEqual([
      ['”', '”'],
      ['’', '’'],
    ]);
  });

  test('ISG 10.4.5: straight, English and German marks become ”…”', () => {
    expect(t('Hän sanoi "hei" ja meni')).toBe('Hän sanoi ”hei” ja meni');
    expect(t('Hän sanoi “hei” ja meni')).toBe('Hän sanoi ”hei” ja meni');
    expect(t('Hän sanoi „hei“ ja meni')).toBe('Hän sanoi ”hei” ja meni');
    expect(t('Hän sanoi ”hei” ja meni')).toBe('Hän sanoi ”hei” ja meni');
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Hän sanoi ”a” ja ”b”.')).toBe('Hän sanoi ”a” ja ”b”.');
    expect(t('Hän sanoi "a" ja "b".')).toBe('Hän sanoi ”a” ja ”b”.');
    expect(t('”a” ”b” ”c”')).toBe('”a” ”b” ”c”');
  });

  test('Kotus: an inner quotation is ’…’, the example of the article', () => {
    const ready = '”Sanoit ehtineesi vain ’pää kolmantena jalkana’ eiliseen kokoukseen”, muistutin hänelle.';
    expect(
      t('"Sanoit ehtineesi vain \'pää kolmantena jalkana\' eiliseen kokoukseen", muistutin hänelle.'),
    ).toBe(ready);
    expect(
      t('“Sanoit ehtineesi vain ‘pää kolmantena jalkana’ eiliseen kokoukseen”, muistutin hänelle.'),
    ).toBe(ready);
    expect(t(ready)).toBe(ready);
  });

  test('ISG 4.2.3: an apostrophe or a closing ’ inside a quotation is kept', () => {
    expect(t('Hän sanoi "Lars’ auto" nyt')).toBe('Hän sanoi ”Lars’ auto” nyt');
    expect(t('Hän sanoi ”ota Lars’” nyt')).toBe('Hän sanoi ”ota Lars’” nyt');
    expect(t("Se on Lars's kirja")).toBe('Se on Lars’s kirja');
  });

  test('a second pass changes nothing', () => {
    for (const src of [
      'Hän sanoi "a" ja "b" ja "c ’d’ e".',
      'Hän sanoi ”Lars’ auto” ja ”ota Lars’” nyt.',
      'Hän luki „x ‚y‘ z“ ja ”w”.',
      '”a ’b ”c” b’ a”',
      '”x’”',
    ]) {
      const once = typographic(src, 'fi');
      expect(typographic(once, 'fi')).toBe(once);
    }
  });
});

describe('Finnish spaces, dashes and abbreviations', () => {
  test('ISG 6.4: a fixed space between the figure and %', () => {
    expect(t('noin 15% ja 25%')).toBe('noin 15~% ja 25~%');
  });

  test('ISG 6.4 and 10.4.8: the spaced dash is the short one, and a range uses it unspaced', () => {
    expect(t('Kivi - muisti - ja aika')).toBe('Kivi~– muisti~– ja aika');
    expect(t('vuosina 1990-1995')).toBe('vuosina 1990–1995');
  });

  test('ISG 10.7.1 and 4.2.3: s. 12 stays with its number', () => {
    expect(t('katso s. 12')).toBe('katso s.~12');
  });

  test('ISG 10.7.1: p. (puhelin), v. (vuonna) and mrd. (miljardia) stay with what follows', () => {
    expect(t('p. 09 123 456')).toBe('p.~09 123 456');
    expect(t('v. 1995 ja 2 mrd. euroa')).toBe('v.~1995~ja 2~mrd.~euroa');
  });
});

describe('Finnish numbers', () => {
  test('ISG 6.5 and 10.2.1: a comma for decimals, a thin fixed space between groups of three', () => {
    expect(fi.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('number.group (opt-in) groups with the no-break space and keeps the decimals', () => {
    expect(t('1234567 ja 3,14159265', { enable: ['number.group'] })).toBe(
      '1~234~567~ja 3,14159265',
    );
  });
});

describe('Finnish letters ä ö å are never touched', () => {
  test('a quotation and a sentence full of them come back letter for letter', () => {
    expect(t('Hän sanoi "yöllä äänestäjät älähtivät åbo"')).toBe(
      'Hän sanoi ”yöllä äänestäjät älähtivät åbo”',
    );
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Odotetaanko? kysyi hän.')).toBe('–~Odotetaanko? kysyi hän.');
    expect(t('- Odotetaanko? kysyi hän.', { register: 'literary' })).toBe('–~Odotetaanko? kysyi hän.');
  });
});
