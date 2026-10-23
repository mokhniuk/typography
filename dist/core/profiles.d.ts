import { type Abbreviations, type Lang, type Level } from './lang/index.js';
import type { Register } from './types.js';
export type { Abbreviations, Level };
/** Quote marks for each nesting level; a quotation nested deeper than listed starts over from the first. */
export declare const PROFILES: Record<Lang, readonly Level[]>;
/**
 * Literary quotation. British English: ‘outer “inner” outer’ (a third level reopens
 * with ‘). The dialogue dash (`dialogueDash` on the pack) is the same in both registers.
 */
export declare const LITERARY: Partial<Record<Lang, readonly Level[]>>;
/** One-letter words a language must not strand at the end of a line. */
export declare const ORPHANS: Partial<Record<Lang, RegExp>>;
/** Short words (two or three letters) that travel with the next word in a title (`space.short-word`). */
export declare const SHORT_WORDS: Partial<Record<Lang, readonly string[]>>;
/**
 * The dash that sets off a break in the sentence, spaced. An em dash unless a language
 * says otherwise: German sets a spaced en dash, and so does British English in the
 * literary register.
 */
export declare const SENTENCE_DASH: Partial<Record<Lang, string>>;
export declare const SENTENCE_DASH_LITERARY: Partial<Record<Lang, string>>;
/** Abbreviations whose parts must not be split by a line break (see `Abbreviations`). */
export declare const ABBREVIATIONS: Partial<Record<Lang, Abbreviations>>;
/** Every language that has a pack, in registry order. */
export declare const LANGS: readonly Lang[];
export declare const REGISTERS: readonly Register[];
