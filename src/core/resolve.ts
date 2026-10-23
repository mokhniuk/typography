/**
 * The public boundary of the engine: a language given as a code (`'uk'`) or as a pack is resolved to
 * the pack here, and the engine below (`typography.ts`, the rules, the mode bodies) only ever sees a
 * pack. This module is the one that loads every pack (`lang/index.ts`); the pack-only modules do not.
 */
import { type Lang, PACK } from './lang/index.ts';
import { isPack, type LangPack } from './lang/pack.ts';
import { LANGS } from './profiles.ts';

/**
 * The pack of `lang`: a pack is returned as it is, a code is looked up, nothing is English. An unknown
 * code throws an `Error` that lists the codes (the wording of `checkConfig`).
 */
export function resolvePack(lang?: Lang | LangPack): LangPack {
  if (lang === undefined) return PACK.en;
  if (typeof lang === 'string') {
    if (Object.hasOwn(PACK, lang)) return PACK[lang];
  } else if (isPack(lang)) {
    return lang;
  }
  throw new Error(
    `lang is ${LANGS.map((code) => `"${code}"`).join(', ')}, not ${JSON.stringify(lang) ?? String(lang)}`,
  );
}
