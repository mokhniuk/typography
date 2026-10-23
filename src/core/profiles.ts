import { type Lang, PACKS } from './lang/index.ts';
import type { Register } from './types.ts';

/** Every language that has a pack, in registry order. */
export const LANGS: readonly Lang[] = PACKS.map((pack) => pack.code);

export const REGISTERS: readonly Register[] = ['display', 'literary'];
