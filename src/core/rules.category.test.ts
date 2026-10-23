import { describe, expect, test } from 'bun:test';
import { addRule, RULE_CATEGORIES, RULES, type Rule, typographic } from './index.ts';

describe('rule categories', () => {
  test('the categories are tradition, symbols, math and data, in that order', () => {
    expect([...RULE_CATEGORIES]).toEqual(['tradition', 'symbols', 'math', 'data']);
  });

  test('every built-in rule has a category from the list', () => {
    const missing = RULES.filter(
      (rule) => !rule.category || !RULE_CATEGORIES.includes(rule.category),
    ).map((rule) => rule.id);
    expect(missing).toEqual([]);
  });

  test('every category holds at least one built-in rule', () => {
    for (const category of RULE_CATEGORIES) {
      expect(RULES.some((rule) => rule.category === category)).toBe(true);
    }
  });

  test('a custom rule without a category still runs', () => {
    const shout: Rule = { id: 'extra.shout', about: 'Upper case', apply: (t) => t.toUpperCase() };
    const rules = addRule(RULES, shout, { last: true });
    expect(typographic('hi', 'en', { rules })).toBe('HI');
  });
});
