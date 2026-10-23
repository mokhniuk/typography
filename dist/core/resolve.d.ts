/**
 * The public boundary of the engine: a language given as a code (`'uk'`) or as a pack is resolved to
 * the pack here, and the engine below (`typography.ts`, the rules, the mode bodies) only ever sees a
 * pack. This module is the one that loads every pack (`lang/index.ts`); the pack-only modules do not.
 */
import { type Lang } from './lang/index.js';
import { type LangPack } from './lang/pack.js';
import { type Change, type ModeOptions, type TypographicOptions } from './typography.js';
/**
 * The pack of `lang`: a pack is returned as it is, a code is looked up, `undefined` is English. An
 * unknown code (or a value that is neither) throws an `Error` that lists the codes (the wording of `checkConfig`).
 */
export declare function resolvePack(lang?: Lang | LangPack): LangPack;
/** `options` with `lang` resolved to its pack (see `resolvePack`): what the pack-only modes take. */
export declare const withPack: <T extends {
    lang?: Lang | LangPack | undefined;
}>(options: T) => Omit<T, 'lang'> & {
    lang: LangPack;
};
/**
 * Applies the house rules to a plain string (see `typographic` in typography.ts). `lang` is a
 * language code or a pack (the `uk` export of `@mokhniuk/typography/lang/uk`); English unless given.
 */
export declare function typographic(text: string, lang?: Lang | LangPack, options?: TypographicOptions): string;
/** The typeset text and every change that was made to it, with the rule that made it. */
export declare function explain(text: string, lang?: Lang | LangPack, options?: Omit<TypographicOptions, 'onChange'>): {
    output: string;
    changes: Change[];
};
/** Typesets one block of text for a mode (see `typesetBlock` in typography.ts); `lang` may be a code. */
export declare function typesetBlock(joined: string, options: ModeOptions): {
    text: string;
    keep: () => void;
};
