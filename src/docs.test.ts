import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { addRule, RULE_IDS, RULES, type Rule } from './core';
import { EXAMPLES, render, runOnly } from '../scripts/gen-rules-doc';

describe('docs/rules.md', () => {
  test('is what `bun run docs:rules` writes', () => {
    const written = readFileSync(join(import.meta.dir, '..', 'docs', 'rules.md'), 'utf8');
    expect(written).toBe(render());
  });

  for (const id of RULE_IDS) {
    test(`${id} has examples, and each one changes its text`, () => {
      const examples = EXAMPLES[id] ?? [];
      expect(examples.length).toBeGreaterThan(0);
      for (const example of examples) expect(runOnly(id, example)).not.toBe(example.input);
    });
  }

  test('no example belongs to a rule that does not exist', () => {
    expect(Object.keys(EXAMPLES).filter((id) => !RULE_IDS.includes(id))).toEqual([]);
  });
});

describe('docs/rules.md with a rule that is off by default', () => {
  const shout: Rule = {
    id: 'extra.shout',
    about: 'Upper case',
    defaultOn: false,
    apply: (text) => text.toUpperCase(),
  };
  const list = addRule(RULES, shout, { last: true });

  test('an example of an opt-in rule runs it with enable, and nothing else', () => {
    expect(runOnly('extra.shout', { input: 'loud "x"' }, list)).toBe('LOUD "X"');
  });

  test('an example of a default-on rule is unchanged by the opt-in rule being there', () => {
    expect(runOnly('quote', { input: 'a "x"' }, list)).toBe('a «x»');
  });

  test('the page says how many rules are on by default, and marks the opt-in one', () => {
    const page = render(list);
    expect(page).toContain(`The engine has ${RULES.length + 1} rules, ${RULES.length} on by default`);
    expect(page).toContain(`${RULES.length + 1}. \`extra.shout\` (off by default)`);
  });

  test('with every rule on by default the wording is the plain one', () => {
    expect(render()).toContain(`The engine has ${RULES.length} rules. \`typographic\``);
  });
});
