import type { Lang } from './lang/index.js';
/** A no-break space. */
export declare const NBSP = "\u00A0";
/** The language codes; derived from the packs in `lang/index.ts`, never listed by hand. */
export type { Lang };
/**
 * The setting a text is for. `display` is the default: marketing and event pages,
 * set in the PROFILES (profiles.ts). `literary` is book-like text, whose conventions
 * differ by language and which only some languages have a profile for (LITERARY);
 * the rest keep their display rules.
 */
export type Register = 'display' | 'literary';
/**
 * Which quote marks to set. `language` (the default) is the language's own table, or its
 * literary one in the literary register. `us` is “…” with ‘…’ inside for any language, and
 * `guillemets` is «…» with „…“ inside and ‚…‘ third (this package's house style); both take
 * precedence over the table and the register.
 */
export type QuoteStyle = 'language' | 'us' | 'guillemets';
/** What a rule needs to know besides the text. */
export type Context = {
    lang: Lang;
    register: Register;
    quoteStyle: QuoteStyle;
    /** Whether the text opens its paragraph. Only then can its first dash be a dialogue dash. */
    blockStart: boolean;
};
