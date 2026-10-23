import { bg } from './bg.ts';
import { cs } from './cs.ts';
import { da } from './da.ts';
import { de } from './de.ts';
import { deCH } from './de-ch.ts';
import { el } from './el.ts';
import { en } from './en.ts';
import { es } from './es.ts';
import { et } from './et.ts';
import { fi } from './fi.ts';
import { fr } from './fr.ts';
import { frCH } from './fr-ch.ts';
import { ga } from './ga.ts';
import { hr } from './hr.ts';
import { hu } from './hu.ts';
import { it } from './it.ts';
import { lt } from './lt.ts';
import { lv } from './lv.ts';
import { mt } from './mt.ts';
import { nl } from './nl.ts';
import type { LangPack } from './pack.ts';
import { pl } from './pl.ts';
import { pt } from './pt.ts';
import { ro } from './ro.ts';
import { sk } from './sk.ts';
import { sl } from './sl.ts';
import { sv } from './sv.ts';
import { uk } from './uk.ts';

export type { Abbreviations, LangPack, Level, NumberFormat } from './pack.ts';

/**
 * The single registry of languages: add a pack here and the language exists everywhere
 * (`Lang`, `LANGS`, the command line, the rehype plugin, the playground, the docs).
 */
export const PACKS = [
  en,
  uk,
  de,
  pl,
  fr,
  deCH,
  frCH,
  cs,
  sk,
  nl,
  sv,
  ro,
  hu,
  es,
  it,
  pt,
  ga,
  mt,
  bg,
  hr,
  sl,
  lt,
  lv,
  et,
  da,
  fi,
  el,
] as const;

/** Every language code, derived from the packs. */
export type Lang = (typeof PACKS)[number]['code'];

/** A pack by language code. */
export const PACK = Object.fromEntries(
  PACKS.map((pack) => [pack.code, pack]),
) as unknown as Readonly<Record<Lang, LangPack>>;
