import { describe, expect, test } from 'bun:test';
import { corpus } from '../../scripts/corpus.ts';
import { PACK, PACKS } from './lang/index.ts';
import { RULES } from './rules.ts';
import type { Context, Lang, Register } from './types.ts';
import { typographic } from './typography.ts';

/**
 * A rule's `when` is a cheap test the loop in `typographic()` runs before `apply`. It is sound only if,
 * whenever it says no, `apply` returns the text unchanged. This test proves it on a seeded corpus, in
 * every language and register, for every built-in rule that has one. The inputs are the corpus strings
 * and short windows of them (a few tokens), because a long fuzz string contains every trigger and so
 * proves nothing about the rules' no.
 */
const LANGS = PACKS.map((pack) => pack.code);
const REGISTERS: Register[] = ['display', 'literary'];

const whole = corpus(1200, 7);
const inputs = new Set<string>(whole);
for (const text of whole) {
  const tokens = text.split(/(?<= )/);
  for (let at = 0; at < tokens.length; at += 3) {
    inputs.add(tokens.slice(at, at + 1).join(''));
    inputs.add(tokens.slice(at, at + 3).join(''));
  }
}
const samples = [...inputs];

describe('Rule.when', () => {
  const triggered = RULES.filter((rule) => rule.when);

  test('the rules that have a trigger', () => {
    expect(triggered.map((rule) => rule.id)).toEqual([
      'apostrophe',
      'ellipsis',
      'space.before-punctuation',
      'space.after-comma',
      'punctuation.double',
      'symbol.implies',
      'phone.bind',
      'dash.range',
      'dash.sentence',
      'symbol.plusminus',
      'symbol.minus',
      'symbol.multiply',
      'symbol.fraction',
      'space.collapse',
      'space.title',
      'space.initial',
      'space.abbreviation',
      'space.percent',
      'symbol.degree',
      'space.section',
      'space.association',
      'space.copyright',
      'space.operator',
      'space.short-word',
      'space.orphan',
      'space.arrow',
      'space.trailing',
    ]);
  });

  for (const rule of triggered) {
    test(`${rule.id}: when false means apply changes nothing (every language and register)`, () => {
      let skipped = 0;
      let changed = 0;
      for (const lang of LANGS) {
        for (const register of REGISTERS) {
          for (const blockStart of [true, false]) {
            const context: Context = {
              lang,
              pack: PACK[lang],
              register,
              quoteStyle: 'language',
              blockStart,
            };
            for (const text of samples) {
              const out = rule.apply(text, context);
              if (!rule.when?.(text, context)) {
                skipped++;
                if (out !== text) {
                  throw new Error(
                    `${rule.id} (${lang}, ${register}) changed ${JSON.stringify(text)} to ${JSON.stringify(out)} although when() said no`,
                  );
                }
              } else if (out !== text) {
                changed++;
              }
            }
          }
        }
      }
      // The corpus must exercise both sides, or the test proves nothing.
      expect(skipped).toBeGreaterThan(100);
      // space.orphan, space.percent and space.abbreviation are pack-dependent: some packs have none.
      expect(changed).toBeGreaterThan(0);
    });
  }

  test('a skipped rule leaves output and records as if it had run', () => {
    // typographic() skips on `when`; running every rule's apply regardless gives the same text.
    const all = RULES.filter((rule) => rule.defaultOn !== false);
    const context = (lang: Lang): Context => ({
      lang,
      pack: PACK[lang],
      register: 'display',
      quoteStyle: 'language',
      blockStart: true,
    });
    for (const text of samples.slice(0, 600)) {
      let expected = text;
      for (const rule of all) expected = rule.apply(expected, context('en'));
      // zones are shielded in typographic(), so compare on text without a zone-like part
      if (/https?:|www\.|@|`/.test(text)) continue;
      expect(typographic(text, 'en')).toBe(expected);
    }
  });

  test('a custom rule without `when` always runs', () => {
    const rule = { id: 'always', about: 'x', apply: (text: string) => `${text}!` };
    expect(typographic('plain', 'en', { rules: [rule] })).toBe('plain!');
  });
});
