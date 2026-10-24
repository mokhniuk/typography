import { describe, expect, test } from 'bun:test';
import { checkConfig } from './config.ts';
import { PRESET_NAMES, presets } from './presets.ts';
import { typographic } from './resolve.ts';

describe('presets', () => {
  test('there are three, by name', () => {
    expect(PRESET_NAMES).toEqual(['web', 'book', 'ui']);
    expect(Object.keys(presets)).toEqual([...PRESET_NAMES]);
  });

  test('each is a valid config that names no language', () => {
    for (const name of PRESET_NAMES) {
      expect(() => checkConfig(presets[name])).not.toThrow();
      expect(presets[name]).not.toHaveProperty('lang');
    }
  });

  test('they are frozen, so a spread cannot reach back into them', () => {
    expect(Object.isFrozen(presets)).toBe(true);
    for (const name of PRESET_NAMES) expect(Object.isFrozen(presets[name])).toBe(true);
  });

  test('web sets degrees, plus-minus and fractions; ui leaves short words alone', () => {
    expect(typographic('It is -5 C, +-2, 1/2', 'en', presets.web)).toBe('It is −5\u00A0°C, ±2, ½');
    expect(typographic('Go to the city', 'en', presets.ui)).toBe('Go to the city');
    expect(typographic('Go to the city', 'en')).toContain(' ');
  });

  test('book is literary', () => {
    expect(typographic('He said "hi"', 'en', presets.book)).toBe('He said ‘hi’');
  });

  test('a call can override a preset key', () => {
    expect(typographic('He said "hi"', 'en', { ...presets.book, register: 'display' })).toBe(
      'He said “hi”',
    );
  });
});
