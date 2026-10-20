import { describe, expect, test } from 'bun:test';
import { NBSP } from '../types';
import { typographic } from '../typography';
import { de } from './de';
import { wellFormed } from './pack-checks';

const t = (text: string, options?: Parameters<typeof typographic>[2]) =>
  typographic(text, 'de', options).replaceAll(NBSP, '~');

wellFormed(de, 'de.test.ts');

describe('German quotations in a row', () => {
  test('two quotations are not read as one », und «', () => {
    expect(t('Er sagte "Haus" und "Tür".')).toBe('Er sagte »Haus« und »Tür«.');
    expect(t('Er sagte »Haus« und »Tür«.')).toBe('Er sagte »Haus« und »Tür«.');
    expect(t('Sie las „Das Haus“ und »die Tür« laut.')).toBe(
      'Sie las »Das Haus« und »die Tür« laut.',
    );
  });

  test('a text written «…» is read by where each mark stands', () => {
    expect(t('Er sagte «Haus» und «Tür».')).toBe('Er sagte »Haus« und »Tür«.');
  });

  test('a second pass over German output changes nothing', () => {
    const once = typographic('Sie las „Das Haus“ und „die „Tür“ im Haus“ laut.', 'de');
    expect(typographic(once, 'de')).toBe(once);
  });

  test('quotes nest as »outer ›inner‹ outer« and start over at the third level', () => {
    expect(t('“x ‘y’ z”')).toBe('»x ›y‹ z«');
    expect(t('“x ‘y “z” y’ x”')).toBe('»x ›y »z« y‹ x«');
  });
});

describe('German dash and spaces', () => {
  test('a break in the sentence is a spaced en dash', () => {
    expect(t('x - y')).toBe('x~– y');
    expect(t('x – y')).toBe('x~– y');
    expect(t('x -- y')).toBe('x~– y');
    expect(t('21-26 - x')).toBe('21–26~– x');
  });

  test('% and € stand apart from the number', () => {
    expect(t('5% und 49€')).toBe('5~% und 49~€');
  });

  test('abbreviations stay together or with what follows', () => {
    expect(t('z. B. das und d. h. dies')).toBe('z.~B. das und d.~h. dies');
    expect(t('Nr. 5, Abb. 2 und Tel. 030')).toBe('Nr.~5, Abb.~2~und Tel.~030');
    expect(t('siehe S. 12')).toBe('siehe S.~12');
  });
});
