import { ch } from './ch';
import { cs } from './cs';
import { da } from './da';
import { de } from './de';
import { el } from './el';
import { en } from './en';
import { es } from './es';
import { fi } from './fi';
import { fr } from './fr';
import { hu } from './hu';
import { it } from './it';
import { nl } from './nl';
import type { LangPack } from './pack';
import { pt } from './pt';
import { pl } from './pl';
import { ro } from './ro';
import { sk } from './sk';
import { sv } from './sv';
import { uk } from './uk';

export type { Abbreviations, LangPack, Level, NumberFormat } from './pack';

/**
 * The single registry of languages: add a pack here and the language exists everywhere
 * (`Lang`, `LANGS`, the command line, the rehype plugin, the playground, the docs).
 */
export const PACKS = [en, uk, de, pl, fr, ch, cs, sk, nl, sv, ro, hu, es, it, pt, da, fi, el] as const;

/** Every language code, derived from the packs. */
export type Lang = (typeof PACKS)[number]['code'];

/** A pack by language code. */
export const PACK = Object.fromEntries(PACKS.map((pack) => [pack.code, pack])) as unknown as Readonly<
  Record<Lang, LangPack>
>;
