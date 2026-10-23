/* Shared pack data; a pack imports this module, never another language's pack. */

/**
 * Words that start with an apostrophe for dropped letters ('em, 'til, 'cause), and 'n' as in rock 'n'
 * roll. Before the packs this list was read for every language; the other packs list it too so that
 * their output stays what it was. A language that does not use these words should drop it, which is
 * an output change.
 */
export const ELISIONS_EN = [
  'em',
  'til',
  'till',
  'cause',
  'bout',
  'round',
  'tis',
  'twas',
  'cos',
  'n',
] as const;
