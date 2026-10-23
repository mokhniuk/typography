import { type LangPack } from './lang/pack.js';
import { type Rule } from './rules.js';
import type { Lang, QuoteStyle, Register } from './types.js';
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
     * `@mokhniuk/typography/lang/uk`); `en` unless given. A pack may come from JSON too (an object
     * with `code`, `name` and `quotes` pairs), but its `orphans` RegExp, or any other field JSON
     * cannot hold, needs a module.
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
/**
 * Checks a value read from anywhere (a JSON file, a `package.json` key, a pasted text) and returns it
 * as a config: an unknown key, a value of the wrong kind, or a rule name that matches no rule
 * (checked against `rules` when given) throws an `Error` that says which.
 */
export declare function checkConfig(value: unknown): TypographyConfig;
/**
 * Returns `config` as it is, after checking it (see `checkConfig`), so a mistake in a project's
 * config throws where the config is written, not at the first call that uses it. A plain object
 * typed `TypographyConfig` works as well, unchecked.
 */
export declare function defineConfig(config: TypographyConfig): TypographyConfig;
