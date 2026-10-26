import { describe, expect, test } from 'bun:test';
import type { Rule } from '../../src/index.ts';
import {
  DEFAULT_SETTINGS,
  readSettings,
  ruleLabel,
  rulesSummary,
  type Settings,
  toOptions,
} from './settings.ts';

describe('readSettings', () => {
  test('nothing saved gives the defaults', () => {
    expect(readSettings(undefined)).toEqual(DEFAULT_SETTINGS);
    expect(readSettings('junk')).toEqual(DEFAULT_SETTINGS);
  });

  test('a saved value that is valid is kept', () => {
    const saved: Settings = {
      lang: 'de',
      register: 'literary',
      quoteStyle: 'us',
      disable: ['dash.range'],
      enable: ['symbol.fraction'],
    };
    expect(readSettings(saved)).toEqual(saved);
  });

  test('an unknown language, register or quote style falls back one field at a time', () => {
    expect(readSettings({ lang: 'xx', register: 'loud', quoteStyle: 'odd', disable: ['dash.range'] })).toEqual({
      ...DEFAULT_SETTINGS,
      disable: ['dash.range'],
    });
  });

  test('a rule id that no longer exists, or sits in the wrong list, is dropped', () => {
    const read = readSettings({ disable: ['gone.rule', 'symbol.fraction'], enable: ['dash.range'] });
    expect(read.disable).toEqual([]);
    expect(read.enable).toEqual([]);
  });
});

describe('toOptions', () => {
  test('passes the settings to the engine as its options', () => {
    expect(toOptions({ ...DEFAULT_SETTINGS, lang: 'fr', disable: ['dash.range'] })).toEqual({
      lang: 'fr',
      register: 'display',
      quoteStyle: 'language',
      disable: ['dash.range'],
    });
  });

  test('leaves empty rule lists out', () => {
    const options = toOptions(DEFAULT_SETTINGS);
    expect('disable' in options).toBe(false);
    expect('enable' in options).toBe(false);
  });
});

describe('rule list text', () => {
  const rule = (id: string, defaultOn?: boolean) => ({ id, about: '', defaultOn }) as Rule;

  test('an id reads as a label, opt-in rules say so', () => {
    expect(ruleLabel(rule('dash.range'))).toBe('Dash range');
    expect(ruleLabel(rule('space.before-punctuation', false))).toBe('Space before punctuation (opt-in)');
  });

  test('the summary counts rules that run', () => {
    const rules = [rule('a'), rule('b'), rule('c', false)];
    expect(rulesSummary({ disable: [], enable: [] }, rules)).toBe('Rules (2 of 3 on)');
    expect(rulesSummary({ disable: ['a'], enable: ['c'] }, rules)).toBe('Rules (2 of 3 on)');
    expect(rulesSummary({ disable: ['a', 'b'], enable: [] }, rules)).toBe('Rules (0 of 3 on)');
  });
});
