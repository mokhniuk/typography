/** A no-break space. */
export const NBSP = '\u00A0';

export type Lang = 'en' | 'uk' | 'de' | 'pl' | 'fr' | 'ch';

/**
 * The setting a text is for. `display` is the default: marketing and event pages,
 * set in the PROFILES (profiles.ts). `literary` is book-like text, whose conventions
 * differ by language and which only some languages have a profile for (LITERARY);
 * the rest keep their display rules.
 */
export type Register = 'display' | 'literary';

/** What a rule needs to know besides the text. */
export type Context = {
  lang: Lang;
  register: Register;
  /** Whether the text opens its paragraph. Only then can its first dash be a dialogue dash. */
  blockStart: boolean;
};
