import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types.ts';
import { typographic } from '../typography.ts';
import { lv } from './lv.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'lv', options).replaceAll(NBSP, '~');

wellFormed(lv, 'lv.test.ts');

// ISG = Publikāciju noformēšanas rokasgrāmata (Eiropas Savienības Publikāciju birojs), PDF of
// 19 April 2022, section numbers as in that edition; see `sources` in lv.ts.
describe('Latvian quotation (ISG 4.2.3, 6.4, 10.1.6: “…” at every level)', () => {
  test('ISG 4.2.3: “…” with both marks at the top, from straight, German and guillemet quotes', () => {
    expect(t('Viņš teica "sveiki" un aizgāja.')).toBe('Viņš teica “sveiki” un aizgāja.');
    expect(t('Viņš teica „sveiki“ un aizgāja.')).toBe('Viņš teica “sveiki” un aizgāja.');
    expect(t('Viņš teica «sveiki» un aizgāja.')).toBe('Viņš teica “sveiki” un aizgāja.');
    expect(t('Viņš teica “sveiki” un aizgāja.')).toBe('Viņš teica “sveiki” un aizgāja.');
  });

  test('ISG 10.1.6: a quotation inside a quotation takes the double marks again', () => {
    expect(t('“x ‘y’ z”')).toBe('“x “y” z”');
    expect(t('"x \'y\' z"')).toBe('“x “y” z”');
    expect(t('“x ‘y “w” y’ x”')).toBe('“x “y “w” y” x”');
  });

  test('ISG 10.1.6 example: grozījumi likumā “Par valsts pensijām”', () => {
    expect(t('grozījumi likumā "Par valsts pensijām"')).toBe(
      'grozījumi likumā “Par valsts pensijām”',
    );
    expect(t('laikraksts "Diena", fabrika "Laima"')).toBe('laikraksts “Diena”, fabrika “Laima”');
    const ready = 'laikraksts “Diena”, fabrika “Laima”, šokolāde “Laima”';
    expect(t(ready)).toBe(ready);
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Viņš teica "jā" un "nē" reizē.')).toBe('Viņš teica “jā” un “nē” reizē.');
  });

  test('ISG 10.1.6: the full stop of a whole sentence stands inside the quotation', () => {
    expect(
      t('Uz iepakojuma ir teksts: "Ražojumu pareizi dozējot, tiek samazinātas izmaksas."'),
    ).toBe('Uz iepakojuma ir teksts: “Ražojumu pareizi dozējot, tiek samazinātas izmaksas.”');
  });

  test('Latvian letters inside and next to quotes survive', () => {
    expect(t('"āēģīķļņšūž" un "ĀĒĢĪĶĻŅŠŪŽ"')).toBe('“āēģīķļņšūž” un “ĀĒĢĪĶĻŅŠŪŽ”');
    expect(t('("ķēniņš")')).toBe('(“ķēniņš”)');
    expect(t('(“ķēniņš”)')).toBe('(“ķēniņš”)');
  });
});

describe('Latvian spaces and dashes', () => {
  test('ISG 6.4: a fixed space before %', () => {
    expect(t('PVN 21% un 100 %')).toBe('PVN 21~% un 100~%');
  });

  test('ISG 6.4 (money only as the code EUR): currencySpace is off, so no space is added before € (percentSpace still spaces %)', () => {
    expect(t('30€')).toBe('30€');
    expect(t('5%')).toBe('5~%');
    expect(t('€30')).toBe('€30');
  });

  test('ISG 10.1.7: the sentence dash is a spaced en dash', () => {
    expect(t('Zīme - kas brīdina par briesmām')).toBe('Zīme~– kas brīdina par briesmām');
    expect(t('Zīme — kas brīdina par briesmām')).toBe('Zīme~– kas brīdina par briesmām');
  });

  test('ISG 10.1.7, 10.5: a range of numbers takes an unspaced en dash', () => {
    expect(t('Biroja darba laiks: 9:00-18:30')).toBe('Biroja darba laiks: 9:00–18:30');
    expect(t('2001-2002. gads')).toBe('2001–2002. gads');
  });

  test('ISG 10.7: the parts of an abbreviation are not split across lines', () => {
    expect(t('u. c., u. tml., t. i., š. g., v. i., z. v.')).toBe(
      'u.~c., u.~tml., t.~i., š.~g., v.~i., z.~v.',
    );
  });

  test('ISG 4.2.3: Nr. stays with the number after it', () => {
    expect(t('Regula (EK) Nr. 1101/2007')).toBe('Regula (EK) Nr.~1101/2007');
  });
});

describe('Latvian numbers (ISG 6.5)', () => {
  test('the pack: a comma for the decimals, a no-break space between groups of three', () => {
    expect(lv.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('number.group, opt-in, groups in threes with a no-break space', () => {
    expect(t('Iedzīvotāju 1234567, summa 12345,67 EUR', { enable: ['number.group'] })).toBe(
      'Iedzīvotāju 1~234~567, summa 12~345,67~EUR',
    );
    expect(t('2026. gads', { enable: ['number.group'] })).toBe('2026. gads');
  });
});

describe('Latvian idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      'Viņš teica "sveiki" un aizgāja.',
      '“x ‘y “w” y’ x”',
      'grozījumi likumā “Par valsts pensijām”',
      'PVN 21% un u. c., Nr. 5',
      'Zīme - kas brīdina 2001-2002. gads',
    ]) {
      const once = typographic(input, 'lv');
      expect(typographic(once, 'lv')).toBe(once);
      const grouped = typographic(`${input} 1234567`, 'lv', { enable: ['number.group'] });
      expect(typographic(grouped, 'lv', { enable: ['number.group'] })).toBe(grouped);
    }
  });
});
