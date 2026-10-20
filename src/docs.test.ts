import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { RULE_IDS } from './core';
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
