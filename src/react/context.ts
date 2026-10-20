import { createContext } from 'react';
import type { Lang, QuoteStyle, Register, Rule } from '../core';

/**
 * What `Typeset` falls back to; set for everything under a `TypographyRoot`. `enable` and `rules`
 * are compared by identity when a text is typeset again, so pass a constant (module level or
 * `useMemo`), not an array written inline in the render.
 */
export type TypographySetting = {
  lang: Lang;
  register: Register;
  /** `language` (the default) or `us`; see `QuoteStyle`. */
  quoteStyle?: QuoteStyle | undefined;
  /** Rules to switch on that are off by default. */
  enable?: readonly string[] | undefined;
  /** The list of rules to run instead of the built-in one. */
  rules?: readonly Rule[] | undefined;
};

export const TypographyContext = createContext<TypographySetting>({
  lang: 'en',
  register: 'display',
});
