import { ch } from './ch';
import { de } from './de';
import { en } from './en';
import { es } from './es';
import { fr } from './fr';
import { it } from './it';
import type { LangPack } from './pack';
import { pt } from './pt';
import { pl } from './pl';
import { uk } from './uk';

export type { Abbreviations, LangPack, Level, NumberFormat } from './pack';

/**
 * The single registry of languages: add a pack here and the language exists everywhere
 * (`Lang`, `LANGS`, the command line, the rehype plugin, the playground, the docs).
 */
export const PACKS = [en, uk, de, pl, fr, ch, es, it, pt] as const;

/** Every language code, derived from the packs. */
export type Lang = (typeof PACKS)[number]['code'];

/** A pack by language code. */
export const PACK = Object.fromEntries(PACKS.map((pack) => [pack.code, pack])) as unknown as Readonly<
  Record<Lang, LangPack>
>;
