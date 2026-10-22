import type { Lang } from '../../src/core';
import type { Case } from './cases';
import { de } from './cases/de';
import { el } from './cases/el';
import { fi } from './cases/fi';
import { da } from './cases/da';
import { et } from './cases/et';
import { lv } from './cases/lv';
import { lt } from './cases/lt';
import { sl } from './cases/sl';
import { hr } from './cases/hr';
import { bg } from './cases/bg';
import { mt } from './cases/mt';
import { ga } from './cases/ga';
import { pt } from './cases/pt';
import { it } from './cases/it';
import { es } from './cases/es';
import { sv } from './cases/sv';
import { hu } from './cases/hu';
import { ro } from './cases/ro';
import { nl } from './cases/nl';
import { sk } from './cases/sk';
import { cs } from './cases/cs';
import { en } from './cases/en';
import { fr } from './cases/fr';
import { pl } from './cases/pl';
import { uk } from './cases/uk';

/**
 * What the benchmark knows about one language. Every field but `code` is optional: a language with
 * no `quote` tuple has no quote case, and so on. Add a language by creating `apps/bench/cases/<code>.ts`
 * and listing it in `BENCH_LANGS`; the shared cases in `cases.ts` are built from this registry.
 */
export type LangBench = {
  code: Lang;
  /** Opening words of a sentence that holds a quotation: `He said`. */
  lead?: string;
  /** Quotation marks in use, as [open, close]; a check accepts any of them. */
  pairs?: [string, string][];
  /** Outer and inner pair for a quotation inside a quotation: [open1, close1, open2, close2]. */
  nest?: [string, string, string, string][];
  /** A sentence with a straight-quoted word, and the word. */
  quote?: { input: string; word: string };
  /** A sentence with a spaced hyphen between words. */
  dash?: string;
  /** A sentence with `21-26` and `10:00-12:00`, written in the language. */
  range?: string;
  /** A sentence that exercises most rules, for the letters-kept and second-pass checks. */
  sample?: string;
  /** Cases only this language has, appended after the shared ones in registry order. */
  cases?: Case[];
};

/** The languages the benchmark covers, in the order their cases are listed. */
export const BENCH_LANGS: readonly LangBench[] = [en, de, uk, pl, fr, cs, sk, nl, ro, hu, sv, es, it, pt, ga, mt, bg, hr, sl, lt, lv, et, da, fi, el];

/** A language's entry, or an empty one (no data, so no cases from the tables). */
export const benchFor = (code: Lang): LangBench =>
  BENCH_LANGS.find((l) => l.code === code) ?? { code };
