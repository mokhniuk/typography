import { type Abbreviations, type Lang, type LangPack, type Level, PACKS } from './lang';
import type { Register } from './types';

export type { Abbreviations, Level };

/**
 * The tables below are derived from the language packs (`lang/`); edit a pack, not them.
 * A language with no entry in a table simply gets no rule from it.
 */
const table = <T>(pick: (pack: LangPack) => T | undefined): Partial<Record<Lang, T>> =>
  Object.fromEntries(
    PACKS.flatMap((pack) => {
      const value = pick(pack);
      return value === undefined ? [] : [[pack.code, value]];
    }),
  );

/** Quote marks for each nesting level; a quotation nested deeper than listed starts over from the first. */
export const PROFILES = Object.fromEntries(
  PACKS.map((pack) => [pack.code, pack.quotes]),
) as unknown as Record<Lang, readonly Level[]>;

/**
 * Literary quotation. British English: ‘outer “inner” outer’ (a third level reopens
 * with ‘). Ukrainian quotes are the same as on display; what differs there is the
 * dialogue dash (`dialogueDash` on the pack).
 */
export const LITERARY: Partial<Record<Lang, readonly Level[]>> = table((p) => p.literary);

/** One-letter words a language must not strand at the end of a line. */
export const ORPHANS: Partial<Record<Lang, RegExp>> = table((p) => p.orphans);

/**
 * The dash that sets off a break in the sentence, spaced. An em dash unless a language
 * says otherwise: German sets a spaced en dash, and so does British English in the
 * literary register.
 */
export const SENTENCE_DASH: Partial<Record<Lang, string>> = table((p) => p.sentenceDash);
export const SENTENCE_DASH_LITERARY: Partial<Record<Lang, string>> = table((p) => p.sentenceDashLiterary);

/** Abbreviations whose parts must not be split by a line break (see `Abbreviations`). */
export const ABBREVIATIONS: Partial<Record<Lang, Abbreviations>> = table((p) => p.abbreviations);

/** Every language that has a pack, in registry order. */
export const LANGS: readonly Lang[] = PACKS.map((pack) => pack.code);

export const REGISTERS: readonly Register[] = ['display', 'literary'];
