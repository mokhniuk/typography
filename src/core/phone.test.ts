import { describe, expect, test } from 'bun:test';
import { explain, NBSP, typographic } from './index';
import { NB_HYPHEN } from './phone';

/** The rule is off by default, so every case names it; `~` is a no-break space, `‑` U+2011. */
const on = (text: string, lang: Parameters<typeof typographic>[1] = 'en') =>
  typographic(text, lang, { enable: ['phone.bind'] })
    .replaceAll(NBSP, '~')
    .replaceAll(NB_HYPHEN, '‑');

describe('phone.bind', () => {
  test('is off by default', () => {
    expect(typographic('+380 44 123 45 67')).toBe('+380 44 123 45 67');
  });

  test('binds the groups of an international number, without reformatting it', () => {
    expect(on('+380 44 123 45 67')).toBe('+380~44~123~45~67');
    expect(on('+44 20 7946 0958')).toBe('+44~20~7946~0958');
    expect(on('+1 (555) 123-4567')).toBe('+1~(555)~123‑4567');
    expect(on('+49 30 123456-0')).toBe('+49~30~123456‑0');
    expect(on('0049 30 1234567')).toBe('0049~30~1234567');
  });

  test('keeps the sentence around the number', () => {
    // The word after the number is bound by space.number, as it is for any number.
    expect(on('Call +380 44 123 45 67 today.')).toBe('Call +380~44~123~45~67~today.');
    expect(on('(+49 30 1234567)')).toBe('(+49~30~1234567)');
    expect(on('+380 44 123 45 67, or write')).toBe('+380~44~123~45~67, or~write');
  });

  test('leaves a number that is not an international one', () => {
    expect(on('555-1234')).toBe('555-1234');
    expect(on('044-123-45-67')).toBe('044-123-45-67');
    expect(on('+49 30')).toBe('+49 30');
  });

  test('leaves dates, ranges, identifiers and an IBAN alone', () => {
    expect(on('2026-10-20')).toBe('2026-10-20');
    // Three digits and four, unspaced, are a local phone number to dash.range: the hyphen stays.
    expect(on('pages 100-1200')).toBe('pages 100-1200');
    expect(on('pages 100 - 1200')).toBe('pages 100–1200');
    expect(on('ISO 9001-2015')).toBe('ISO 9001-2015');
    expect(on('DE89 3704 0044 0532 0130 00')).toBe('DE89 3704 0044 0532 0130 00');
    expect(on('tel:+49 30 1234567')).toBe('tel:+49 30 1234567');
  });

  test('a bound number is not grouped by number.group', () => {
    const both = typographic('+380 44 123 45 67', 'uk', {
      enable: ['phone.bind', 'number.group'],
    });
    expect(both).toBe(`+380${NBSP}44${NBSP}123${NBSP}45${NBSP}67`);
  });

  test('is stable, and explain names the rule', () => {
    const once = typographic('+1 (555) 123-4567', 'en', { enable: ['phone.bind'] });
    expect(typographic(once, 'en', { enable: ['phone.bind'] })).toBe(once);
    expect(explain('+49 30 123456-0', 'en', { enable: ['phone.bind'] }).changes).toEqual([
      { rule: 'phone.bind', from: ' ', to: NBSP },
      { rule: 'phone.bind', from: ' ', to: NBSP },
      { rule: 'phone.bind', from: '-', to: NB_HYPHEN },
    ]);
  });
});
