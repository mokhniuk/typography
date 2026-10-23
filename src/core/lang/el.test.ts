import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types.ts';
import { typographic } from '../typography.ts';
import { el } from './el.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'el', options).replaceAll(NBSP, '~');

wellFormed(el, 'el.test.ts');

// ISG = Διοργανικό εγχειρίδιο σύνταξης κειμένων (Greek Interinstitutional Style Guide), PDF of
// 19 April 2022, section numbers as in that edition; see `sources` in el.ts.
describe('Greek quotation (ISG 4.2.3, 6.4, 10.1.7: «…» then “…” then ‘…’)', () => {
  test('ISG 10.1.7: angular quotes first', () => {
    expect(el.quotes).toEqual([
      ['«', '»'],
      ['“', '”'],
      ['‘', '’'],
    ]);
    expect(t('Είπε "γεια" και έφυγε.')).toBe('Είπε «γεια» και έφυγε.');
    expect(t('Είπε “γεια” και έφυγε.')).toBe('Είπε «γεια» και έφυγε.');
    expect(t('Είπε «γεια» και έφυγε.')).toBe('Είπε «γεια» και έφυγε.');
  });

  test('ISG 10.1.7: English double marks inside, single marks at the third level', () => {
    expect(t('“x ‘y’ z”')).toBe('«x “y” z»');
    expect(t('“x ‘y “z” y’ x”')).toBe('«x “y ‘z’ y” x»');
  });

  test('ISG 10.1.7 example: «Ο κ. Μπαρόζο δήλωσε: «…» » with “δεσπόζουσα θέση” inside', () => {
    const ready =
      'Ο κ. Μπαρόζο δήλωσε: «Η Επιτροπή δίνει διαφορετική ερμηνεία στον όρο “δεσπόζουσα θέση”».';
    expect(
      t(
        'Ο κ. Μπαρόζο δήλωσε: "Η Επιτροπή δίνει διαφορετική ερμηνεία στον όρο \'δεσπόζουσα θέση\'".',
      ),
    ).toBe(ready.replace('κ. Μπ', 'κ.~Μπ'));
    expect(t(ready)).toBe(ready.replace('κ. Μπ', 'κ.~Μπ'));
  });

  test('ISG 10.1.7 three-level example: «… “… (‘MAS’)”.»', () => {
    const ready = '«— το “ψήφισμα A.950(23) του ΙΜΟ”, με τίτλο “Υπηρεσίες συνδρομής (‘MAS’)”.»';
    expect(t(ready)).toBe(ready);
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Είπε "ναι" και "όχι" μαζί.')).toBe('Είπε «ναι» και «όχι» μαζί.');
  });

  test('ISG 4.2.3: the apostrophe of an elision is ’ and does not open a quotation', () => {
    expect(t("Το έκανε γι' αυτό και απ' ό,τι είδα")).toBe('Το έκανε γι’ αυτό και απ’ ό,τι είδα');
    expect(t('Είπε "το έκανε γι\' αυτό" τότε')).toBe('Είπε «το έκανε γι’ αυτό» τότε');
  });
});

describe('Greek ; and · are never broken (ISG 6.4: question mark ; and ano teleia ·)', () => {
  test('the Greek question mark stays attached to its word', () => {
    expect(t('Τι κάνεις;')).toBe('Τι κάνεις;');
    expect(t('Τι είναι αυτό; Ναι.')).toBe('Τι είναι αυτό; Ναι.');
    expect(t('Είπε «τι κάνεις;» τότε')).toBe('Είπε «τι κάνεις;» τότε');
    expect(t('Είπε "τι κάνεις;" τότε')).toBe('Είπε «τι κάνεις;» τότε');
  });

  test('the ano teleia stays attached to its word', () => {
    expect(t('Ήρθε· έφυγε.')).toBe('Ήρθε· έφυγε.');
    expect(t('Ήρθε · έφυγε')).toBe('Ήρθε · έφυγε');
    expect(t('«Ήρθε· έφυγε» είπε')).toBe('«Ήρθε· έφυγε» είπε');
  });

  test('a Greek semicolon and a Latin one next to a number survive', () => {
    expect(t('5%; 6%·')).toBe('5~%; 6~%·');
  });
});

describe('Greek spaces and abbreviations', () => {
  test('ISG 6.4: a fixed space between the figure and %', () => {
    expect(t('το 15% και 25%')).toBe('το 15~% και 25~%');
  });

  test('ISG 4.2.3 and annex A3: αριθ., σ. and εκατ. stay with what follows', () => {
    expect(t('κανονισμός αριθ. 3600/2001, σ. 14')).toBe('κανονισμός αριθ.~3600/2001, σ.~14');
    expect(t('10 εκατ. ευρώ και 2 δισ. ευρώ')).toBe('10~εκατ.~ευρώ και 2~δισ.~ευρώ');
  });

  test('ISG 10.6: abbreviations without inner spaces (π.χ., κ.λπ.) are left alone', () => {
    expect(t('π.χ. το κ.λπ. και κ.ο.κ.')).toBe('π.χ. το κ.λπ. και κ.ο.κ.');
  });

  test('ISG 6.4: the spaced dash is the long dash', () => {
    expect(t('Πέτρα - μνήμη - και χρόνος')).toBe('Πέτρα~— μνήμη~— και χρόνος');
  });
});

describe('Greek numbers', () => {
  test('ISG 6.5: a comma for decimals, a fixed half space between groups of three', () => {
    expect(el.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('number.group (opt-in) groups with the no-break space and keeps the decimals', () => {
    expect(t('1234567 και 3,14159265', { enable: ['number.group'] })).toBe(
      '1~234~567~και 3,14159265',
    );
  });
});

describe('Greek idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      'Είπε "ναι" και "όχι" μαζί.',
      '“x ‘y “z” y’ x”',
      'Τι κάνεις; Ήρθε· έφυγε.',
      "Το έκανε γι' αυτό, το 15% και σ. 14",
      'Πέτρα - μνήμη - και χρόνος',
    ]) {
      const once = typographic(input, 'el');
      expect(typographic(once, 'el')).toBe(once);
    }
  });
});
