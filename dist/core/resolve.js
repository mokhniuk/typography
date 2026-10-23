/**
 * The public boundary of the engine: a language given as a code (`'uk'`) or as a pack is resolved to
 * the pack here, and the engine below (`typography.ts`, the rules, the mode bodies) only ever sees a
 * pack. This module is the one that loads every pack (`lang/index.ts`); the pack-only modules do not.
 */
import { PACK } from './lang/index.js';
import { isPack } from './lang/pack.js';
import { LANGS } from './profiles.js';
import { explain as explainWith, typesetBlock as typesetBlockWith, typographic as typographicWith, } from './typography.js';
/**
 * The pack of `lang`: a pack is returned as it is, a code is looked up, `undefined` is English. An
 * unknown code (or a value that is neither) throws an `Error` that lists the codes (the wording of `checkConfig`).
 */
export function resolvePack(lang) {
    if (lang === undefined)
        return PACK.en;
    if (typeof lang === 'string') {
        if (Object.hasOwn(PACK, lang))
            return PACK[lang];
    }
    else if (isPack(lang)) {
        return lang;
    }
    throw new Error(`lang is ${LANGS.map((code) => `"${code}"`).join(', ')}, not ${JSON.stringify(lang) ?? String(lang)}`);
}
/** `options` with `lang` resolved to its pack (see `resolvePack`): what the pack-only modes take. */
export const withPack = (options) => ({ ...options, lang: resolvePack(options.lang) });
/**
 * Applies the house rules to a plain string (see `typographic` in typography.ts). `lang` is a
 * language code or a pack (the `uk` export of `@mokhniuk/typography/lang/uk`); English unless given.
 */
export function typographic(text, lang = 'en', options) {
    return typographicWith(text, resolvePack(lang), options);
}
/** The typeset text and every change that was made to it, with the rule that made it. */
export function explain(text, lang = 'en', options) {
    return explainWith(text, resolvePack(lang), options);
}
/** Typesets one block of text for a mode (see `typesetBlock` in typography.ts); `lang` may be a code. */
export function typesetBlock(joined, options) {
    return typesetBlockWith(joined, withPack(options));
}
