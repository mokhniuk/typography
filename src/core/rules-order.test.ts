import { describe, expect, test } from 'bun:test';
import { RULE_IDS } from './index';

/**
 * The order is part of the behaviour, and several rules are planned that have to land in a
 * known place (the comment block above `RULES` in rules.ts). Those rules do not exist yet; this
 * test pins the order of the ones that do, so the places stay where they were reserved, and
 * checks a planned rule against its place the moment it is added.
 */
const ORDER = [
  'quote',
  'apostrophe',
  'ellipsis',
  'arrow',
  'symbol.legal',
  'dash.dialogue',
  'dash.range',
  'dash.sentence',
  'symbol.minus',
  'symbol.multiply',
  'space.collapse',
  'space.title',
  'space.initial',
  'space.abbreviation',
  'space.number',
  'space.percent',
  'space.association',
  'space.copyright',
  'space.orphan',
  'space.arrow',
];

const at = (id: string) => RULE_IDS.indexOf(id);

describe('the built-in order', () => {
  test('is the one the reserved slots were written against', () => {
    expect(RULE_IDS.filter((id) => ORDER.includes(id))).toEqual(ORDER);
  });
});

/** A planned rule: where it must stand when it exists, as [rule, relation, anchor]. */
const SLOTS: readonly (readonly [string, 'before' | 'after', string])[] = [
  ['number.group', 'before', 'dash.range'],
  ['number.group', 'before', 'space.number'],
  ['symbol.fraction', 'before', 'space.number'],
  ['space.before-punctuation', 'after', 'ellipsis'],
  ['space.after-comma', 'after', 'ellipsis'],
  ['punctuation.double', 'after', 'ellipsis'],
  ['symbol.degree', 'after', 'space.number'],
  ['symbol.plusminus', 'before', 'symbol.minus'],
  ['space.trailing', 'after', 'space.arrow'],
];

describe('the reserved slots', () => {
  test('every anchor exists, so a slot can be filled', () => {
    for (const [, , anchor] of SLOTS) expect(at(anchor)).toBeGreaterThanOrEqual(0);
  });

  test('a planned rule that exists stands in its slot', () => {
    for (const [id, relation, anchor] of SLOTS) {
      if (at(id) < 0) continue;
      if (relation === 'before') expect(at(id)).toBeLessThan(at(anchor));
      else expect(at(id)).toBeGreaterThan(at(anchor));
    }
  });

  test('space.trailing, if present, is the last rule', () => {
    if (at('space.trailing') >= 0) expect(at('space.trailing')).toBe(RULE_IDS.length - 1);
  });

  test('symbol.plusminus, if present, is next to symbol.minus', () => {
    if (at('symbol.plusminus') >= 0) {
      expect(Math.abs(at('symbol.plusminus') - at('symbol.minus'))).toBe(1);
    }
  });
});
