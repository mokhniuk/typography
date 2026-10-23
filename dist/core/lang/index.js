import { bg } from './bg.js';
import { cs } from './cs.js';
import { da } from './da.js';
import { de } from './de.js';
import { deCH } from './de-ch.js';
import { el } from './el.js';
import { en } from './en.js';
import { es } from './es.js';
import { et } from './et.js';
import { fi } from './fi.js';
import { fr } from './fr.js';
import { frCH } from './fr-ch.js';
import { ga } from './ga.js';
import { hr } from './hr.js';
import { hu } from './hu.js';
import { it } from './it.js';
import { lt } from './lt.js';
import { lv } from './lv.js';
import { mt } from './mt.js';
import { nl } from './nl.js';
import { pl } from './pl.js';
import { pt } from './pt.js';
import { ro } from './ro.js';
import { sk } from './sk.js';
import { sl } from './sl.js';
import { sv } from './sv.js';
import { uk } from './uk.js';
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
];
/** A pack by language code. */
export const PACK = Object.fromEntries(PACKS.map((pack) => [pack.code, pack]));
