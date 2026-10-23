import { describe, expect, test } from 'bun:test';
import { typographic } from '../index.ts';
import { NBSP } from '../types.ts';
import { deCH } from './de-ch.ts';
import { wellFormed } from './pack-checks.test-utils.ts';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'de-CH', options).replaceAll(NBSP, '~');

wellFormed(deCH, 'de-ch.test.ts');

describe('German (Switzerland)', () => {
  test('quotes are «…» with ‹…› inside, no space inside the marks', () => {
    expect(t('“x ‘y’ z”')).toBe('«x ‹y› z»');
    expect(t('Er sagte "Haus" und "Tür".')).toBe('Er sagte «Haus» und «Tür».');
  });

  test('the sentence dash is the spaced en dash, as in German', () => {
    expect(t('x - y')).toBe('x~– y');
    expect(t('21-26 - x')).toBe('21–26~– x');
  });

  test('the German abbreviations stay together or with what follows', () => {
    expect(t('z. B. das und Nr. 5 auf S. 12')).toBe('z.~B. das und Nr.~5~auf S.~12');
  });

  test('% and € stand apart from the number, as in German', () => {
    expect(t('5% und 49€')).toBe('5~% und 49~€');
  });

  test('number.group (opt-in) groups digits with a no-break space; the decimal mark is a comma (Rz. 512, 514)', () => {
    const on = { enable: ['number.group'] };
    expect(t('1234567')).toBe('1234567');
    expect(t('1234567', on)).toBe('1~234~567');
    expect(t('4,16 Millionen und 1234567,50', on)).toBe('4,16~Millionen und 1~234~567,50');
    expect(t('1234', on)).toBe('1234');
  });

  test('a franc amount with a point (Rz. 514, 543: Fr. 327.65) is left as typed by number.group: a known limit', () => {
    const on = { enable: ['number.group'] };
    // The point marks rappen only in money; the engine does not tell amounts apart, so the
    // number is not grouped rather than grouped with the wrong decimal mark.
    expect(t('Fr. 1234567.50', on)).toBe('Fr. 1234567.50');
    expect(t('Fr. 327.65', on)).toBe('Fr. 327.65');
    expect(t('Fr. 1 234 567.50', on)).toBe('Fr. 1~234~567.50');
  });

  test('a no-break space between a figure and % or € (Rz. 554, 539, 540)', () => {
    expect(t('6% und 49€')).toBe('6~% und 49~€');
    // Known gap: Rz. 555 writes a compound without the space (6%-Anteil); the engine sets one.
    expect(t('6%-Anteil')).toBe('6~%-Anteil');
  });

  test('dialogue is quoted: a paragraph that opens with a dash is left alone', () => {
    expect(t('- Wo bist du?')).toBe('- Wo bist du?');
  });

  test('the sample', () => {
    expect(t(deCH.sample)).toBe(
      'Er sagte «wir sind da»~– und ging… Das Labor läuft 21–26~September, 10:00–12:00. Mehr lesen~→',
    );
  });
});
