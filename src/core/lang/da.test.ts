import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { da } from './da';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'da', options).replaceAll(NBSP, '~');

wellFormed(da, 'da.test.ts');

// ISG = Vejledning i Udformning af EU-Publikationer (Danish Interinstitutional Style Guide), PDF of
// 19 April 2022, section numbers as in that edition; see `sources` in da.ts.
describe('Danish quotation (ISG 4.2.3 and 10.1: »…« at every level)', () => {
  test('ISG 4.2.3: the same marks at all levels, »…«', () => {
    expect(da.quotes).toEqual([['»', '«']]);
    expect(da.turnedPairs).toEqual([['»', '«']]);
  });

  test('straight, English and German marks become »…«', () => {
    expect(t('Hun sagde "hej" og gik')).toBe('Hun sagde »hej« og gik');
    expect(t('Hun sagde “hej” og gik')).toBe('Hun sagde »hej« og gik');
    expect(t('Hun sagde „hej“ og gik')).toBe('Hun sagde »hej« og gik');
    expect(t('Hun sagde »hej« og gik')).toBe('Hun sagde »hej« og gik');
  });

  test('ISG 10.1: a quotation inside a quotation is »…»…«…«', () => {
    expect(t('“x ‘y’ z”')).toBe('»x »y« z«');
    expect(t('"x \'y\' z"')).toBe('»x »y« z«');
    expect(t('»x »y« z«')).toBe('»x »y« z«');
  });

  test('two inner quotations inside one outer one', () => {
    expect(t('»x »y« og »z« w«')).toBe('»x »y« og »z« w«');
    expect(t('"x \'y\' og \'z\' w"')).toBe('»x »y« og »z« w«');
  });

  test('two quotations in a row are not read as one', () => {
    expect(t('Han sagde "a" og "b".')).toBe('Han sagde »a« og »b«.');
    expect(t('»a« »b« »c«')).toBe('»a« »b« »c«');
  });

  test('ISG 4.2.3: the typographic apostrophe ’ stays inside a quotation', () => {
    expect(t('Han sagde "Lars’ bil" nu')).toBe('Han sagde »Lars’ bil« nu');
    expect(t("Det er Lars's bog")).toBe('Det er Lars’s bog');
  });
});

describe('Danish spaces and abbreviations', () => {
  test('ISG 6.4: a fixed space between the figure and %', () => {
    expect(t('om 15% af 25%')).toBe('om 15~% af 25~%');
  });

  test('ISG 10.2: s. 50, stk. 3, kl. 17.30 and nr. stay with what follows', () => {
    expect(t('se s. 50, stk. 3 og kl. 17.30')).toBe('se s.~50, stk.~3~og kl.~17.30');
    expect(t('nr. 5')).toBe('nr.~5');
  });

  test('ISG 10.1 and 10.2: 33 mio. EUR keeps its parts together', () => {
    expect(t('koster 33 mio. EUR')).toBe('koster 33~mio.~EUR');
  });

  test('ISG 10.1 and 6.4: the sentence dash is the long dash, spaced', () => {
    expect(t('Han kom - sent - hjem')).toBe('Han kom~— sent~— hjem');
  });
});

describe('Danish numbers', () => {
  test('ISG 4.2.3 and 6.5: a fixed space between groups of three, a comma for decimals', () => {
    expect(da.numbers).toEqual({ group: NBSP, decimal: ',' });
  });

  test('number.group (opt-in) groups with the no-break space and keeps the decimals', () => {
    expect(t('300000 og 1234567,891234', { enable: ['number.group'] })).toBe(
      '300~000~og 1~234~567,891234',
    );
  });
});

describe('Danish idempotence', () => {
  test('a second pass over the golden strings changes nothing', () => {
    for (const input of [
      'Hun sagde "hej" og "farvel".',
      '“x ‘y’ z”',
      '»a »b« c« og »d«',
      'om 15% af 33 mio. EUR, se s. 50',
      'Han kom - sent - hjem',
    ]) {
      const once = typographic(input, 'da');
      expect(typographic(once, 'da')).toBe(once);
    }
  });

  test('a paragraph that opens with a dash is a line of dialogue, in both registers', () => {
    expect(t('- Venter vi? spurgte han.')).toBe('—~Venter vi? spurgte han.');
    expect(t('- Venter vi? spurgte han.', { register: 'literary' })).toBe('—~Venter vi? spurgte han.');
  });
});
