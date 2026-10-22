import {
  checkConfig,
  type Lang,
  type QuoteStyle,
  type Register,
  RULES,
  selectRules,
  type TypographyConfig,
} from '../../src/core';
import type { RuleState } from './rules-state';

/** The switches of the page that a config carries. */
export type Switches = RuleState & {
  lang: Lang;
  register: Register;
  quoteStyle: QuoteStyle;
  nbsp: 'entity' | 'char';
  /** Characters the font cannot draw (`avoid`), as one string; empty when there are none. */
  avoid: string;
  /** How far marks hang, 0 to 1 (`hangAmount`). */
  hang: number;
};

/** In the order the rules run, so the same switches always export the same text. */
const inRuleOrder = (ids: readonly string[]) =>
  RULES.map((rule) => rule.id).filter((id) => ids.includes(id));

/**
 * The switches as a config. Every switch is written, so the config pins what was tried here even if
 * a default changes later; `disable` and `enable` only when they hold something.
 */
export function toConfig(switches: Switches): TypographyConfig {
  const disable = inRuleOrder(switches.disable);
  const enable = inRuleOrder(switches.enable);
  return {
    lang: switches.lang,
    register: switches.register,
    quoteStyle: switches.quoteStyle,
    nbsp: switches.nbsp,
    hangAmount: switches.hang,
    ...(switches.avoid ? { avoid: switches.avoid } : {}),
    ...(disable.length ? { disable } : {}),
    ...(enable.length ? { enable } : {}),
  };
}

/** The config as JSON, ready for the `typography` key of `package.json` or a `--config` file. */
export const configText = (switches: Switches): string =>
  JSON.stringify(toConfig(switches), null, 2);

/**
 * The switches a pasted config sets: a config object, or a whole `package.json` with a `typography`
 * key. A field it leaves out goes back to its default; groups in `disable` and `enable` are read as
 * the rules they name. Throws an `Error` saying what is wrong (the same check as `defineConfig`).
 */
export function fromConfig(text: string): Switches {
  let value: unknown;
  try {
    value = JSON.parse(text);
  } catch (error) {
    throw new Error(`Not JSON: ${error instanceof Error ? error.message : String(error)}`);
  }
  if (value && typeof value === 'object' && 'typography' in value) {
    value = (value as { typography: unknown }).typography;
  }
  if (value && typeof value === 'object' && 'rules' in value) {
    throw new Error(
      'config: rules can only come from a module; the playground runs the built-in rules',
    );
  }
  const config = checkConfig(value);
  const on = new Set(selectRules({ disable: config.disable, enable: config.enable }));
  return {
    lang: config.lang ?? 'en',
    register: config.register ?? 'display',
    quoteStyle: config.quoteStyle ?? 'language',
    nbsp: config.nbsp ?? 'entity',
    avoid: config.avoid ?? '',
    hang: config.hangAmount ?? 1,
    disable: RULES.filter((rule) => rule.defaultOn !== false && !on.has(rule)).map((r) => r.id),
    enable: RULES.filter((rule) => rule.defaultOn === false && on.has(rule)).map((r) => r.id),
  };
}
