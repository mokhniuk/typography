import { describe, expect, test } from 'bun:test';
import { addRule, RULES, type Rule } from '../core';
import type { TypographySetting } from './context';
import { typesetFor } from './Typeset';

/**
 * `Typeset` sets its text with `typesetFor`, from the setting of the surrounding root plus its own
 * props. The hooks around it are React's; what must not be dropped is every option.
 */
const shout: Rule = {
  id: 'extra.shout',
  about: 'Upper case',
  defaultOn: false,
  apply: (t) => t.replace(/\bloud\b/g, 'LOUD'),
};
const rules = addRule(RULES, shout, { last: true });
const root: TypographySetting = { lang: 'en', register: 'display' };

describe('typesetFor', () => {
  test('sets the text in the language and register of the setting', () => {
    expect(typesetFor('"x"', root, true)).toBe('«x»');
    expect(typesetFor('"x"', { ...root, lang: 'de' }, true)).toBe('»x«');
    expect(typesetFor('"x"', { ...root, register: 'literary' }, true)).toBe('‘x’');
  });

  test('a dialogue dash is read only at the start of a paragraph', () => {
    const uk: TypographySetting = { lang: 'uk', register: 'literary' };
    expect(typesetFor('- Так', uk, true)).toBe('— Так');
    expect(typesetFor('- Так', uk, false)).toBe('- Так');
  });

  test('passes rules and enable on', () => {
    expect(typesetFor('so loud', { ...root, rules }, true)).toBe('so loud');
    expect(typesetFor('so loud', { ...root, rules, enable: ['extra.shout'] }, true)).toBe(
      'so LOUD',
    );
  });

  test('passes quoteStyle on, and it beats the literary register', () => {
    expect(typesetFor('"x"', { ...root, quoteStyle: 'us' }, true)).toBe('“x”');
    expect(typesetFor('"x"', { lang: 'de', register: 'literary', quoteStyle: 'us' }, true)).toBe(
      '“x”',
    );
    expect(typesetFor('"x"', { ...root, quoteStyle: 'language' }, true)).toBe('«x»');
  });
});

describe('typesetFor passes the remaining options on', () => {
  test('disable switches a rule off', () => {
    expect(typesetFor('"x" 1-2', { ...root, disable: ['dash.range'] }, true)).toBe('«x» 1-2');
  });

  test('avoid keeps the text as typed where a rule would insert a character the font lacks', () => {
    expect(typesetFor('"x"... ok', { ...root, avoid: '«»' }, true)).toBe('"x"… ok');
    expect(typesetFor('"x"... ok', { ...root, avoid: '…' }, true)).toBe('«x»... ok');
  });

  test('onChange sees every change', () => {
    const seen: string[] = [];
    typesetFor('"x"... ok', { ...root, onChange: (c) => seen.push(c.rule) }, true);
    expect(seen).toEqual(['quote', 'quote', 'ellipsis']);
  });
});
