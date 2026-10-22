import { createContext } from 'react';
import type { Change, Lang, QuoteStyle, Register, Rule } from '../core';

/**
 * What `Typeset` falls back to; set for everything under a `TypographyRoot`. `disable`, `enable`,
 * `rules` and `onChange` are compared by identity when a text is typeset again, so pass a constant
 * (module level or `useMemo`/`useCallback`), not an array or function written inline in the render.
 */
export type TypographySetting = {
  lang: Lang;
  register: Register;
  /** `language` (the default) or `us`; see `QuoteStyle`. */
  quoteStyle?: QuoteStyle | undefined;
  /** Rules to switch off: ids or groups. An unknown name throws. */
  disable?: readonly string[] | undefined;
  /** Rules to switch on that are off by default. */
  enable?: readonly string[] | undefined;
  /** The list of rules to run instead of the built-in one. */
  rules?: readonly Rule[] | undefined;
  /**
   * Characters the font cannot draw: a rule that would insert one of them leaves the text as it was
   * typed. `TypographyRoot` measures the font of the page and fills this in; see `avoidMissing`.
   */
  avoid?: string | undefined;
  /** Called with each change made to a text, when it is typeset (not on every render). */
  onChange?: ((change: Change) => void) | undefined;
};

export const TypographyContext = createContext<TypographySetting>({
  lang: 'en',
  register: 'display',
});
