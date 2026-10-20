import { describe, expect, test } from 'bun:test';
import { type Rule, DEFAULT_RULES, RULE_IDS, RULES, addRule, selectRules, typographic, without } from './index';

/** A rule that is off unless asked for, and one that is on, for a list that is not the built-in one. */
const shout: Rule = { id: 'extra.shout', about: 'Upper case', defaultOn: false, apply: (t) => t.toUpperCase() };
const bang: Rule = { id: 'extra.bang', about: 'Adds !', apply: (t) => `${t}!` };
const ids = (list: readonly Rule[]) => list.map((rule) => rule.id);

describe('selectRules', () => {
  test('with no options it is the built-in list', () => {
    expect(ids(selectRules({}))).toEqual(ids(DEFAULT_RULES));
  });

  test('without() is selectRules({ disable })', () => {
    expect(ids(without(['space']))).toEqual(ids(selectRules({ disable: ['space'] })));
    expect(ids(without(['dash.*']))).not.toContain('dash.range');
  });

  test('a rule with defaultOn: false runs only when named in enable', () => {
    const list = [...RULES, shout];
    expect(ids(selectRules({ rules: list }))).not.toContain('extra.shout');
    expect(ids(selectRules({ rules: list, enable: ['extra.shout'] }))).toContain('extra.shout');
  });

  test('enable takes a group, with or without .*', () => {
    const list = [bang, shout];
    expect(ids(selectRules({ rules: list, enable: ['extra'] }))).toEqual(['extra.bang', 'extra.shout']);
    expect(ids(selectRules({ rules: list, enable: ['extra.*'] }))).toEqual(['extra.bang', 'extra.shout']);
  });

  test('enabling a rule that is already on changes nothing', () => {
    expect(ids(selectRules({ enable: ['space.number'] }))).toEqual(ids(DEFAULT_RULES));
  });

  test('names are checked against the list in use, not the built-in one', () => {
    expect(() => selectRules({ rules: [bang], disable: ['quote'] })).toThrow(/Unknown typography rule "quote"/);
    expect(() => selectRules({ rules: [bang], enable: ['space.number'] })).toThrow(/Unknown/);
    expect(ids(selectRules({ rules: [bang, shout], disable: ['extra.bang'] }))).toEqual([]);
  });

  test('an unknown name lists the rules of the list in use', () => {
    expect(() => selectRules({ rules: [bang], enable: ['nope'] })).toThrow(/Rules: extra\.bang/);
    expect(() => selectRules({ enable: ['nope'] })).toThrow(/Unknown typography rule "nope"\. Rules: quote,/);
  });

  test('a rule named in both disable and enable is an error, not a silent winner', () => {
    expect(() => selectRules({ rules: [bang, shout], disable: ['extra.shout'], enable: ['extra.shout'] })).toThrow(
      /both/,
    );
    // Through a group, too.
    expect(() => selectRules({ rules: [bang, shout], disable: ['extra'], enable: ['extra.shout'] })).toThrow(/both/);
  });

  test('enabling a group does not clash with disabling a member that is on by default', () => {
    expect(ids(selectRules({ enable: ['dash'], disable: ['dash.range'] }))).toEqual(
      ids(selectRules({ disable: ['dash.range'] })),
    );
    expect(ids(selectRules({ enable: ['symbol'], disable: ['symbol.minus'] }))).not.toContain('symbol.minus');
    // A member that only enable could turn on is still ambiguous.
    expect(() => selectRules({ rules: [bang, shout], enable: ['extra'], disable: ['extra.shout'] })).toThrow(/both/);
  });

  test('a hand-built list with a duplicate id is an error', () => {
    expect(() => selectRules({ rules: [bang, { ...bang }] })).toThrow(/already in the list|duplicate/i);
  });

  test('disable and enable of different rules work together', () => {
    expect(ids(selectRules({ rules: [bang, shout], disable: ['extra.bang'], enable: ['extra.shout'] }))).toEqual([
      'extra.shout',
    ]);
  });
});

describe('addRule', () => {
  const base = [bang, shout];
  const mark: Rule = { id: 'extra.mark', about: 'Marks', apply: (t) => `${t}.` };

  test('places a rule before, after, first or last, and returns a new list', () => {
    expect(ids(addRule(base, mark, { before: 'extra.shout' }))).toEqual(['extra.bang', 'extra.mark', 'extra.shout']);
    expect(ids(addRule(base, mark, { after: 'extra.bang' }))).toEqual(['extra.bang', 'extra.mark', 'extra.shout']);
    expect(ids(addRule(base, mark, { first: true }))).toEqual(['extra.mark', 'extra.bang', 'extra.shout']);
    expect(ids(addRule(base, mark, { last: true }))).toEqual(['extra.bang', 'extra.shout', 'extra.mark']);
    expect(ids(base)).toEqual(['extra.bang', 'extra.shout']);
  });

  test('does not change the built-in list', () => {
    const before = [...RULE_IDS];
    addRule(RULES, mark, { first: true });
    expect(ids(RULES)).toEqual(before);
    expect(RULE_IDS).toEqual(before);
  });

  test('an anchor that is not in the list, or a duplicate id, is an error', () => {
    expect(() => addRule(base, mark, { before: 'nope' })).toThrow(/Unknown typography rule "nope"/);
    expect(() => addRule(base, mark, { after: 'nope' })).toThrow(/Unknown/);
    expect(() => addRule(base, bang, { last: true })).toThrow(/already/);
  });
});

describe('typographic with a custom list', () => {
  const list = addRule(addRule(RULES, shout, { last: true }), bang, { last: true });

  test('the built-in rules still run, and an opt-in rule stays off by default', () => {
    expect(typographic('"x" - y', 'en', { rules: list })).toBe('«x» — y!');
  });

  test('enable switches an opt-in rule on, in list order', () => {
    expect(typographic('"x" - y', 'en', { rules: list, enable: ['extra.shout'] })).toBe('«X» — Y!');
  });

  test('disable is checked against the list given', () => {
    expect(typographic('"x"', 'en', { rules: list, disable: ['extra.bang'] })).toBe('«x»');
    expect(() => typographic('x', 'en', { rules: [bang], disable: ['quote'] })).toThrow(/Unknown/);
  });

  test('explain attributes a change to the custom rule', () => {
    const changes: string[] = [];
    typographic('x', 'en', { rules: [bang], onChange: (c) => changes.push(c.rule) });
    expect(changes).toEqual(['extra.bang']);
  });

  test('the built-in options still give the built-in result', () => {
    expect(typographic('"x" - y', 'en', { enable: [] })).toBe(typographic('"x" - y', 'en'));
  });
});
