import { describe, expect, test } from 'bun:test';
import { type Change, LANGS, type Register, RULES } from '../../src/core';
import { typesetHtml } from '../../src/html';
import { typesetText } from '../../src/text';
import { example, LONG, MODES } from './examples';

const OPT_IN = RULES.filter((rule) => rule.defaultOn === false).map((rule) => rule.id);

/**
 * The rules that act on the long example. Text mode keeps trailing spaces by design, so
 * `space.trailing` shows only in HTML; the default is the text mode the playground opens in.
 */
function fired(
  lang: (typeof LANGS)[number],
  register: Register,
  mode: 'text' | 'html' = 'text',
): Set<string> {
  const ids = new Set<string>();
  const options = { lang, register, enable: OPT_IN, onChange: (c: Change) => ids.add(c.rule) };
  const text = example(mode, lang, 'long');
  if (mode === 'html') typesetHtml(text, options);
  else typesetText(text, options);
  return ids;
}

describe('playground examples', () => {
  test('every language has a long example', () => {
    expect(Object.keys(LONG).sort()).toEqual([...LANGS].sort());
  });

  test.each([...LANGS])('the long %s example makes at least 15 rules act', (lang) => {
    expect(fired(lang, 'display').size).toBeGreaterThanOrEqual(15);
  });

  test('together the long examples make every rule act', () => {
    const all = new Set<string>();
    for (const lang of LANGS) {
      for (const register of ['display', 'literary'] as const) {
        for (const mode of ['text', 'html'] as const) {
          for (const id of fired(lang, register, mode)) all.add(id);
        }
      }
    }
    expect(RULES.map((rule) => rule.id).filter((id) => !all.has(id))).toEqual([]);
  });

  test.each([...LANGS])('every %s example is in the language, not English, and changes', (lang) => {
    for (const size of ['short', 'long'] as const) {
      for (const mode of MODES) {
        const text = example(mode, lang, size);
        expect(text.length).toBeGreaterThan(0);
        if (lang !== 'en') expect(text).not.toContain('Title');
        expect(typesetText(text, { lang })).not.toBe(text);
      }
    }
  });
});
