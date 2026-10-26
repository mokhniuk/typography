import {
  type Lang,
  LANGS,
  type QuoteStyle,
  type Register,
  type Rule,
  RULES,
  type TextOptions,
} from '../../src/index.ts';
import { isOn, readSaved, type RuleState } from '../website/playground/rules-state.ts';

/** What the plugin keeps between runs (`figma.clientStorage`): the language, two style choices and the rule switches. */
export type Settings = RuleState & { lang: Lang; register: Register; quoteStyle: QuoteStyle };

export const DEFAULT_SETTINGS: Settings = {
  lang: 'en',
  register: 'display',
  quoteStyle: 'language',
  disable: [],
  enable: [],
};

const pick = <T extends string>(value: unknown, allowed: readonly T[], fallback: T): T =>
  allowed.includes(value as T) ? (value as T) : fallback;

/** Reads saved settings; a field that is missing or no longer valid goes back to its default, one at a time. */
export function readSettings(saved: unknown): Settings {
  const record = (saved && typeof saved === 'object' ? saved : {}) as Record<string, unknown>;
  return {
    lang: pick(record.lang, LANGS, DEFAULT_SETTINGS.lang),
    register: pick(record.register, ['display', 'literary'], DEFAULT_SETTINGS.register),
    quoteStyle: pick(record.quoteStyle, ['language', 'us', 'guillemets'], DEFAULT_SETTINGS.quoteStyle),
    ...readSaved(record, RULES),
  };
}

/** The settings as the options of `typesetText`; an empty rule list is left out. */
export function toOptions(settings: Settings): TextOptions {
  const { lang, register, quoteStyle, disable, enable } = settings;
  return {
    lang,
    register,
    quoteStyle,
    ...(disable.length ? { disable } : {}),
    ...(enable.length ? { enable } : {}),
  };
}

/** A rule id as a label: `dash.range` is "Dash range", `space.before-punctuation` "Space before punctuation". */
export function ruleLabel(rule: Rule): string {
  const words = rule.id.replace(/[.-]/g, ' ');
  return words.charAt(0).toUpperCase() + words.slice(1) + (rule.defaultOn === false ? ' (opt-in)' : '');
}

/** The heading of the rule list: how many rules run with these settings. */
export function rulesSummary(settings: RuleState, rules: readonly Rule[] = RULES): string {
  const on = rules.filter((rule) => isOn(settings, rule)).length;
  return `Rules (${on} of ${rules.length} on)`;
}
