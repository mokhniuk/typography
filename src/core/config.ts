import { isPack, type LangPack } from './lang/pack.ts';
import { LANGS } from './profiles.ts';
import { type Rule, selectRules } from './rules.ts';
import type { Lang, QuoteStyle, Register } from './types.ts';

/**
 * A project's typography in one object: the options every function, component and the command line
 * take, under the same names, so it spreads straight into any call (`typesetHtml(html, site)`,
 * `typographic(text, site.lang, site)`, `<TypographyRoot config={site}>`, `typo --config`). An option
 * given to a call replaces the config's value for that option; lists are not merged.
 *
 * A new option goes here, and then reaches `ModeOptions` and every mode's type from it.
 */
export type TypographyConfig = {
  /**
   * Language of the text: a code (`'uk'`) or a pack (the `uk` export of
   * `@mokhniuk/typography/lang/uk`); `en` unless given. JSON can only give a code.
   */
  lang?: Lang | LangPack | undefined;
  /** `display` (the default) or `literary`. */
  register?: Register | undefined;
  /** `language` (the default), `us` (“…” and ‘…’ in any language) or `guillemets` (« », „ “, ‚ ‘ in any language: the house style). */
  quoteStyle?: QuoteStyle | undefined;
  /** Rules to switch off: ids or groups. An unknown name throws. */
  disable?: readonly string[] | undefined;
  /** Rules to switch on that are off by default: ids or groups. An unknown name throws. */
  enable?: readonly string[] | undefined;
  /** The list of rules to run instead of the built-in `RULES` (see `addRule`). Only from a module, not JSON. */
  rules?: readonly Rule[] | undefined;
  /**
   * Characters the font cannot draw, as one string (`'⇒½¼¾−'`): a rule that would insert one of them
   * leaves the text as it was typed, for that one change. Empty unless given; the font checker on the
   * website writes the list for a font.
   */
  avoid?: string | undefined;
  /** HTML only: a no-break space as `&nbsp;` (the default) or the character. Ignored by the other modes. */
  nbsp?: 'entity' | 'char' | undefined;
  /** How far hanging punctuation hangs, 0 to 1 (`--hang-amount`); set by `TypographyRoot`. Ignored by the string modes. */
  hangAmount?: number | undefined;
};

const KEYS: readonly (keyof TypographyConfig)[] = [
  'lang',
  'register',
  'quoteStyle',
  'disable',
  'enable',
  'rules',
  'avoid',
  'nbsp',
  'hangAmount',
];

const oneOf = (key: string, value: unknown, allowed: readonly string[]) => {
  if (!allowed.includes(value as string)) {
    throw new Error(
      `config: ${key} is ${allowed.map((a) => `"${a}"`).join(', ')}, not ${JSON.stringify(value)}`,
    );
  }
};

const names = (key: string, value: unknown) => {
  if (!Array.isArray(value) || !value.every((name) => typeof name === 'string')) {
    throw new Error(`config: ${key} is a list of rule ids or groups, not ${JSON.stringify(value)}`);
  }
};

/**
 * Checks a value read from anywhere (a JSON file, a `package.json` key, a pasted text) and returns it
 * as a config: an unknown key, a value of the wrong kind, or a rule name that matches no rule
 * (checked against `rules` when given) throws an `Error` that says which.
 */
export function checkConfig(value: unknown): TypographyConfig {
  if (!value || typeof value !== 'object' || Array.isArray(value)) {
    throw new Error(`config: expected an object, not ${JSON.stringify(value) ?? String(value)}`);
  }
  const config = value as Record<string, unknown>;
  for (const key of Object.keys(config)) {
    if (!KEYS.includes(key as keyof TypographyConfig)) {
      throw new Error(`config: unknown key "${key}" (${KEYS.join(', ')})`);
    }
  }
  const { lang, register, quoteStyle, disable, enable, rules, avoid, nbsp, hangAmount } = config;
  if (lang !== undefined && !isPack(lang)) oneOf('lang', lang, LANGS);
  if (register !== undefined) oneOf('register', register, ['display', 'literary']);
  if (quoteStyle !== undefined) oneOf('quoteStyle', quoteStyle, ['language', 'us', 'guillemets']);
  if (nbsp !== undefined) oneOf('nbsp', nbsp, ['entity', 'char']);
  if (avoid !== undefined && typeof avoid !== 'string') {
    throw new Error(
      `config: avoid is a string of the characters the font cannot draw, not ${JSON.stringify(avoid)}`,
    );
  }
  if (
    hangAmount !== undefined &&
    (typeof hangAmount !== 'number' || !(hangAmount >= 0 && hangAmount <= 1))
  ) {
    throw new Error(
      `config: hangAmount is a number from 0 to 1, not ${JSON.stringify(hangAmount)}`,
    );
  }
  if (disable !== undefined) names('disable', disable);
  if (enable !== undefined) names('enable', enable);
  if (
    rules !== undefined &&
    (!Array.isArray(rules) ||
      !rules.every(
        (rule) => rule && typeof rule.id === 'string' && typeof (rule as Rule).apply === 'function',
      ))
  ) {
    throw new Error(
      'config: rules is a list of rules ({ id, about, apply }), built with addRule; it can only come from a module, not JSON',
    );
  }
  try {
    selectRules({
      rules: rules as readonly Rule[] | undefined,
      disable: disable as readonly string[] | undefined,
      enable: enable as readonly string[] | undefined,
    });
  } catch (error) {
    throw new Error(`config: ${error instanceof Error ? error.message : String(error)}`);
  }
  return config as TypographyConfig;
}

/**
 * Returns `config` as it is, after checking it (see `checkConfig`), so a mistake in a project's
 * config throws where the config is written, not at the first call that uses it. A plain object
 * typed `TypographyConfig` works as well, unchecked.
 */
export function defineConfig(config: TypographyConfig): TypographyConfig {
  checkConfig(config);
  return config;
}
