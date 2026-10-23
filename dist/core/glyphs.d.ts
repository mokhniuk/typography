/**
 * What each rule can put into the text that the writer did not type. A font that lacks one of these
 * draws a box or lets another font draw it, and the text as typed would have been better, so two
 * things read this table: the `avoid` option (see `TypographyConfig`), which lists the characters a
 * font cannot draw and makes the engine keep the original text wherever a rule would insert one, and
 * the font checker, which tells a reader which of them a font has.
 *
 * The quote marks and the digit separator come from the language packs, so a new pack is covered
 * without a change here. `src/core/glyphs.test.ts` fails if a rule has no entry, and proves that a
 * rule given its own characters to avoid changes nothing.
 */
import type { LangPack } from './lang/pack.js';
import type { Lang } from './types.js';
/**
 * The characters each rule can insert, by rule id. Without `lang` it is every language's marks at
 * once (what the docs show); with one (a code or a pack), only that language's.
 */
export declare function ruleGlyphs(lang?: Lang | LangPack): Readonly<Record<string, string>>;
/**
 * Every character any rule can insert (`lang`: in that language only), the no-break space included.
 * The font checker lists these; the `avoid` option takes the ones a font cannot draw.
 */
export declare const insertedCharacters: (lang?: Lang | LangPack) => string;
/**
 * The same without the no-break space, which is the marks a font draws. Measuring a space against a
 * fallback font says nothing (both are blank), so the font-aware pass only ever tests these.
 */
export declare const insertedGlyphs: (lang?: Lang | LangPack) => string;
