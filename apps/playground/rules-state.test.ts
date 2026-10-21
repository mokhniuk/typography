import { describe, expect, test } from 'bun:test';
import type { Rule } from '../../src/core';
import { allOn, groupRules, isOn, readSaved, reset, ruleBadge, setRule } from './rules-state';

const noop = (t: string) => t;
const rules: readonly Rule[] = [
  { id: 'a.one', about: '', apply: noop },
  { id: 'a.two', about: '', apply: noop },
  { id: 'opt.in', about: '', defaultOn: false, apply: noop },
];
const fresh = { disable: [], enable: [] };

describe('playground rule state', () => {
  test('a default-on rule starts checked, an opt-in one starts unchecked', () => {
    expect(rules.map((rule) => isOn(fresh, rule))).toEqual([true, true, false]);
  });

  test('unchecking a default-on rule disables it; checking it again removes the entry', () => {
    const off = setRule(fresh, rules[0] as Rule, false);
    expect(off).toEqual({ disable: ['a.one'], enable: [] });
    expect(isOn(off, rules[0] as Rule)).toBe(false);
    expect(setRule(off, rules[0] as Rule, true)).toEqual(fresh);
  });

  test('checking an opt-in rule enables it; unchecking removes the entry', () => {
    const on = setRule(fresh, rules[2] as Rule, true);
    expect(on).toEqual({ disable: [], enable: ['opt.in'] });
    expect(isOn(on, rules[2] as Rule)).toBe(true);
    expect(setRule(on, rules[2] as Rule, false)).toEqual(fresh);
  });

  test('a rule is never in both lists', () => {
    let state = setRule(fresh, rules[0] as Rule, false);
    state = setRule(state, rules[0] as Rule, false);
    state = setRule(state, rules[2] as Rule, true);
    state = setRule(state, rules[2] as Rule, true);
    expect(state).toEqual({ disable: ['a.one'], enable: ['opt.in'] });
  });

  test('reset goes back to the defaults', () => {
    expect(reset()).toEqual(fresh);
  });

  test('the badge counts what differs from the defaults', () => {
    expect(ruleBadge(fresh)).toBe('');
    expect(ruleBadge({ disable: ['a.one'], enable: [] })).toBe('1 off');
    expect(ruleBadge({ disable: [], enable: ['opt.in'] })).toBe('1 on');
    expect(ruleBadge({ disable: ['a.one', 'a.two'], enable: ['opt.in'] })).toBe('2 off, 1 on');
  });

  test('all on switches on every opt-in rule and no default one is off', () => {
    const state = allOn(rules);
    expect(state).toEqual({ disable: [], enable: ['opt.in'] });
    expect(rules.every((rule) => isOn(state, rule))).toBe(true);
  });

  test('saved state from before opt-in rules (only a disable list) still loads', () => {
    expect(readSaved({ disable: ['a.one', 'gone.rule', 7] }, rules)).toEqual({
      disable: ['a.one'],
      enable: [],
    });
  });

  test('saved state is cleaned: unknown ids dropped, an opt-in id cannot be in disable, a default-on id cannot be in enable', () => {
    expect(
      readSaved({ disable: ['opt.in', 'a.two'], enable: ['a.one', 'opt.in', 'nope'] }, rules),
    ).toEqual({ disable: ['a.two'], enable: ['opt.in'] });
  });

  test('nonsense loads as the defaults', () => {
    expect(readSaved(null, rules)).toEqual(fresh);
    expect(readSaved({ disable: 'a.one', enable: 3 }, rules)).toEqual(fresh);
  });
});

describe('playground rule groups', () => {
  test('rules are grouped by category in the order of RULE_CATEGORIES, run order kept inside a group', () => {
    const list: readonly Rule[] = [
      { id: 'n.one', about: '', category: 'data', apply: noop },
      { id: 'q', about: '', category: 'tradition', apply: noop },
      { id: 'n.two', about: '', category: 'data', apply: noop },
      { id: 'custom', about: '', apply: noop },
      { id: 'pm', about: '', category: 'math', apply: noop },
    ];
    expect(
      groupRules(list).map(({ category, rules }) => [category, rules.map((r) => r.id)]),
    ).toEqual([
      ['tradition', ['q']],
      ['math', ['pm']],
      ['data', ['n.one', 'n.two']],
      ['other', ['custom']],
    ]);
  });
});
