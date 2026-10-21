import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { ga } from './ga';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'ga', options).replaceAll(NBSP, '~');

wellFormed(ga, 'ga.test.ts');

// EU vocab = the Publications Office table "Use of quotation marks in the different languages";
// ISG(mt) = the Maltese Interinstitutional Style Guide PDF (sections 6.4, 6.5); the Irish ISG PDF
// has no content stream in the Cellar. See `sources` in ga.ts.
describe('Irish quotation (EU vocabularies table: ‘…’ then “…” then ‘…’)', () => {
  test('a quotation is set in single marks first', () => {
    expect(t('Dúirt sé "dia duit" agus d\'imigh sé.')).toBe('Dúirt sé ‘dia duit’ agus d’imigh sé.');
    expect(t('Dúirt sé “dia duit” agus d’imigh sé.')).toBe('Dúirt sé ‘dia duit’ agus d’imigh sé.');
    expect(t('Dúirt sé ‘dia duit’ agus d’imigh sé.')).toBe('Dúirt sé ‘dia duit’ agus d’imigh sé.');
  });

  test('“…” inside, ‘…’ at the third level', () => {
    expect(t('“x ‘y’ z”')).toBe('‘x “y” z’');
    expect(t('“x ‘y “z” y’ x”')).toBe('‘x “y ‘z’ y” x’');
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Dúirt sé "tá" agus "níl" araon.')).toBe('Dúirt sé ‘tá’ agus ‘níl’ araon.');
  });

  test('quoteStyle us gives “…” then ‘…’', () => {
    expect(t('Dúirt sé "tá" agus d\'imigh.', { quoteStyle: 'us' })).toBe(
      'Dúirt sé “tá” agus d’imigh.',
    );
  });
});

describe('Irish apostrophe (d’ b’ m’ before a lenited or vowel-initial word)', () => {
  test('elision outside a quotation', () => {
    expect(t("D'fhág sé an teach. B'fhéidir go bhfuil m'athair ann.")).toBe(
      'D’fhág sé an teach. B’fhéidir go bhfuil m’athair ann.',
    );
  });

  test('elision inside a quotation keeps the pair', () => {
    expect(t('Dúirt sé "d\'fhág sé" inné.')).toBe('Dúirt sé ‘d’fhág sé’ inné.');
    expect(t('Dúirt sé "b\'fhéidir" agus "m\'athair" inné.')).toBe(
      'Dúirt sé ‘b’fhéidir’ agus ‘m’athair’ inné.',
    );
    expect(t('Dúirt sé “d’fhág sé” inné.')).toBe('Dúirt sé ‘d’fhág sé’ inné.');
  });

  test('a quotation written with straight single marks that holds an elision', () => {
    expect(t("Dúirt sé 'd'fhág sé' inné.")).toBe('Dúirt sé ‘d’fhág sé’ inné.');
    expect(t("Dúirt sé 'b'fhéidir' inné.")).toBe('Dúirt sé ‘b’fhéidir’ inné.');
  });

  test('a quotation that starts with an elision', () => {
    expect(t('"D\'fhág sé," ar sé.')).toBe('‘D’fhág sé,’ ar sé.');
  });

  test('fada and dot above letters are kept', () => {
    expect(t('"Ḃí sé ann, á ċur ḋóibh."')).toBe('‘Ḃí sé ann, á ċur ḋóibh.’');
  });
});

describe('Irish spaces (ISG 6.4, common to all languages)', () => {
  test('a fixed space before %', () => {
    expect(t('an 5% sin')).toBe('an 5~% sin');
  });

  test('ISG 7 (Maltese edition, stated for Irish): the euro sign stands before the amount, no space', () => {
    expect(t('suim €30')).toBe('suim €30');
  });

  test('ISG 7 (Maltese edition, stated for Irish): currencySpace is off, so no space is added before € (percentSpace still spaces %)', () => {
    expect(t('30€')).toBe('30€');
    expect(t('5%')).toBe('5~%');
    expect(t('€30')).toBe('€30');
  });
});

describe('Irish numbers (ISG 6.5, read in the Maltese ISG: a point for decimals, a space between groups)', () => {
  test('pack data', () => {
    expect(ga.numbers).toEqual({ group: NBSP, decimal: '.' });
  });

  test('number.group groups with a no-break space and keeps the point', () => {
    expect(
      typographic('1234567.89', 'ga', { enable: ['number.group'] }).replaceAll(NBSP, '~'),
    ).toBe('1~234~567.89');
  });
});

describe('Irish idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      'Dúirt sé "dia duit" agus d\'imigh sé.',
      "Dúirt sé 'b'fhéidir' inné, 5% m'athair.",
      '“x ‘y “z” y’ x”',
      'D\'fhág sé "b\'fhéidir" agus 1234567.89',
    ]) {
      const once = typographic(input, 'ga');
      expect(typographic(once, 'ga')).toBe(once);
    }
  });
});
