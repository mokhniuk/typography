import type { Lang } from '../index.ts';
import type { PackProse } from '../pack.ts';
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
import { pl } from './pl.ts';
import { pt } from './pt.ts';
import { ro } from './ro.ts';
import { sk } from './sk.ts';
import { sl } from './sl.ts';
import { sv } from './sv.ts';
import { uk } from './uk.ts';

/**
 * The sources and notes of every pack, by language code. Read by the documentation generators
 * (`scripts/gen-languages-doc.ts`) and the tests; nothing the package ships imports it, and the build
 * leaves `lang/prose/` out, so no bundle and no install carries it.
 */
export const PROSE: Readonly<Record<Lang, PackProse>> = {
  en: en,
  uk: uk,
  de: de,
  pl: pl,
  fr: fr,
  'de-CH': deCH,
  'fr-CH': frCH,
  cs: cs,
  sk: sk,
  nl: nl,
  sv: sv,
  ro: ro,
  hu: hu,
  es: es,
  it: it,
  pt: pt,
  ga: ga,
  mt: mt,
  bg: bg,
  hr: hr,
  sl: sl,
  lt: lt,
  lv: lv,
  et: et,
  da: da,
  fi: fi,
  el: el,
};
