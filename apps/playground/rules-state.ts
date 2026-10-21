import type { Rule } from '../../src/core';

/**
 * Which rules the playground has switched away from their defaults: `disable` holds rules that are
 * on by default and were switched off, `enable` holds rules that are off by default and were
 * switched on. Both lists go to the engine as they are.
 */
export type RuleState = { disable: string[]; enable: string[] };

const optIn = (rule: Rule) => rule.defaultOn === false;

/** Whether the rule's checkbox is checked. */
export function isOn(state: RuleState, rule: Rule): boolean {
  return optIn(rule) ? state.enable.includes(rule.id) : !state.disable.includes(rule.id);
}

/** The state after the rule's checkbox is set to `on`. */
export function setRule(state: RuleState, rule: Rule, on: boolean): RuleState {
  // A rule is in the list of the way it differs from its default, and only once.
  const list = optIn(rule) ? 'enable' : 'disable';
  const differs = optIn(rule) ? on : !on;
  const rest = state[list].filter((id) => id !== rule.id);
  return { ...state, [list]: differs ? [...rest, rule.id] : rest };
}

/** Every rule back at its default. */
export const reset = (): RuleState => ({ disable: [], enable: [] });

/** The note beside "Rules": what differs from the defaults. */
export function ruleBadge(state: RuleState): string {
  return [
    state.disable.length ? `${state.disable.length} off` : '',
    state.enable.length ? `${state.enable.length} on` : '',
  ]
    .filter(Boolean)
    .join(', ');
}

const ids = (value: unknown, allowed: (id: string) => boolean): string[] =>
  Array.isArray(value)
    ? value.filter((id): id is string => typeof id === 'string' && allowed(id))
    : [];

/**
 * Reads the part of saved state that concerns rules. State saved before opt-in rules existed has only
 * `disable`, and loads as it did; an id that is not a rule, or is in the list that does not fit its
 * default, is dropped.
 */
export function readSaved(saved: unknown, rules: readonly Rule[]): RuleState {
  const record = (saved && typeof saved === 'object' ? saved : {}) as Record<string, unknown>;
  const on = new Set(rules.filter((rule) => !optIn(rule)).map((rule) => rule.id));
  const off = new Set(rules.filter(optIn).map((rule) => rule.id));
  return {
    disable: ids(record.disable, (id) => on.has(id)),
    enable: ids(record.enable, (id) => off.has(id)),
  };
}
