import { describe, expect, test } from 'bun:test';
import { checkConfig, RULES } from '../../src/core';
import { typesetText } from '../../src/text';
import { configText, fromConfig, quoteStyleOf, type Switches } from './config-io';

const switches: Switches = {
  lang: 'de',
  register: 'literary',
  quoteStyle: 'us',
  nbsp: 'char',
  avoid: '⇒½',
  hang: 0.3,
  // Click order, not run order.
  disable: ['dash.range', 'quote'],
  enable: ['symbol.plusminus'],
};
const defaults: Switches = {
  lang: 'en',
  register: 'display',
  quoteStyle: 'language',
  nbsp: 'entity',
  avoid: '',
  hang: 1,
  disable: [],
  enable: [],
};
const runOrder = (ids: string[]) => RULES.map((r) => r.id).filter((id) => ids.includes(id));

describe('playground config: export, and import back', () => {
  test('exports every switch, and the rule lists in run order', () => {
    expect(JSON.parse(configText(switches))).toEqual({
      lang: 'de',
      register: 'literary',
      quoteStyle: 'us',
      nbsp: 'char',
      hangAmount: 0.3,
      avoid: '⇒½',
      disable: runOrder(['dash.range', 'quote']),
      enable: ['symbol.plusminus'],
    });
    expect(JSON.parse(configText(defaults))).toEqual({
      lang: 'en',
      register: 'display',
      quoteStyle: 'language',
      nbsp: 'entity',
      hangAmount: 1,
    });
  });

  test('what it exports is a valid config that sets the text as the page does', () => {
    const config = checkConfig(JSON.parse(configText(switches)));
    const { lang, register, quoteStyle, disable, enable, avoid } = switches;
    const text = '"x" - 1-2 +-3';
    expect(typesetText(text, config)).toBe(
      typesetText(text, { lang, register, quoteStyle, disable, enable, avoid }),
    );
  });

  test('round trip: import of an export gives the same switches and the same text', () => {
    const back = fromConfig(configText(switches));
    expect(back).toEqual({ ...switches, disable: runOrder(switches.disable) });
    expect(configText(back)).toBe(configText(switches));
    expect(fromConfig(configText(defaults))).toEqual(defaults);
  });

  test('the guillemets quote style goes out and comes back', () => {
    const house: Switches = { ...defaults, quoteStyle: 'guillemets' };
    expect(JSON.parse(configText(house)).quoteStyle).toBe('guillemets');
    expect(fromConfig(configText(house))).toEqual(house);
  });

  test('a saved or selected quote style is read as one of the three, else the language', () => {
    expect(quoteStyleOf('us')).toBe('us');
    expect(quoteStyleOf('guillemets')).toBe('guillemets');
    expect(quoteStyleOf('language')).toBe('language');
    expect(quoteStyleOf('uk')).toBe('language');
    expect(quoteStyleOf(undefined)).toBe('language');
  });

  test('a field left out goes back to its default; a whole package.json is read by its key', () => {
    expect(fromConfig('{}')).toEqual(defaults);
    expect(fromConfig('{ "name": "site", "typography": { "lang": "uk" } }')).toEqual({
      ...defaults,
      lang: 'uk',
    });
  });

  test('groups are read as the rules they name', () => {
    const spaces = RULES.filter((r) => r.id.startsWith('space.') && r.defaultOn !== false);
    expect(fromConfig('{ "disable": ["space"] }').disable).toEqual(spaces.map((r) => r.id));
    expect(fromConfig('{ "enable": ["symbol"] }').enable).toEqual(
      RULES.filter((r) => r.id.startsWith('symbol.') && r.defaultOn === false).map((r) => r.id),
    );
  });

  test('a bad config throws with the reason', () => {
    expect(() => fromConfig('{ lang: en }')).toThrow(/Not JSON/);
    expect(() => fromConfig('{ "lang": "xx" }')).toThrow(/lang is/);
    expect(() => fromConfig('{ "colour": 1 }')).toThrow(/unknown key "colour"/);
    expect(() => fromConfig('{ "disable": ["dash.rnage"] }')).toThrow(/dash\.rnage/);
    expect(() => fromConfig('{ "rules": [] }')).toThrow(/rules can only come from a module/);
    expect(() => fromConfig('[]')).toThrow(/expected an object/);
  });
});
