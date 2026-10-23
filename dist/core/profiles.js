import { PACKS } from './lang/index.js';
/** Every language that has a pack, in registry order. */
export const LANGS = PACKS.map((pack) => pack.code);
export const REGISTERS = ['display', 'literary'];
