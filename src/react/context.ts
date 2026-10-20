import { createContext } from 'react';
import type { Lang, Register } from '../core';

/** What `Typeset` falls back to; set for everything under a `TypographyRoot`. */
export type TypographySetting = { lang: Lang; register: Register };

export const TypographyContext = createContext<TypographySetting>({
  lang: 'en',
  register: 'display',
});
