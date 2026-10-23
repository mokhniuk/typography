/**
 * `@mokhniuk/typography/lite`: the engine and the text, HTML and Markdown modes without a single
 * language pack. Every call takes the pack itself, imported from `@mokhniuk/typography/lang/<code>`,
 * so a page that sets one language loads one pack: `typesetText` from this entry and `uk` from
 * `@mokhniuk/typography/lang/uk` give `typesetText('Він сказав "привіт"', { lang: uk })`.
 *
 * Nothing here imports `core/lang/index.ts`, directly or through another module (`lite.test.ts`
 * walks the import graph), so the saving does not depend on a bundler's tree-shaking: unbundled ESM
 * on Node or a CDN loads one pack too. Pass a constant pack: the engine keeps its compiled setups in
 * a `WeakMap` keyed by the pack, so a pack spread inline on every call compiles them again.
 *
 * Not here (they need the table of every pack): `checkConfig`/`defineConfig`, `LANGS`, the glyph
 * lists, the rehype plugin and React. Use the full entries for those.
 */
import type { PackModeOptions } from '../core/typography.js';
export { type DiffRun, diff } from '../core/diff.js';
export { type HangPiece, hangPieces, splitHangs, type TextPart } from '../core/hang.js';
export type { Abbreviations, DialogueDash, LangPack, Level, NumberFormat, } from '../core/lang/pack.js';
export { addRule, DEFAULT_RULES, RULE_CATEGORIES, RULE_IDS, RULES, type Rule, type RuleCategory, type RulePosition, selectRules, without, } from '../core/rules.js';
export { type Context, NBSP, type QuoteStyle, type Register } from '../core/types.js';
export { type Change, explain, keepAvoided, type PackModeOptions, type TypographicOptions, typesetBlock, typographic, } from '../core/typography.js';
export { typesetHtml } from '../html/html.js';
export { typesetMarkdown } from '../markdown/markdown.js';
export { typesetText } from '../text/text.js';
/** The options of the lite modes: those of the full modes, with `lang` a pack and required. */
export type LiteOptions = PackModeOptions;
