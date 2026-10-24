import type { TypographyConfig } from './config.ts';

/** The options a preset sets; it never sets the language, which is the text's. */
export type Preset = Readonly<Omit<TypographyConfig, 'lang' | 'rules'>>;

/**
 * Named starting points for a project's config. They are plain objects: spread one into
 * `defineConfig` (or any call) and add the language and whatever else is yours. A key you give
 * replaces the preset's value for that key, lists included, so repeat what you want to keep.
 *
 *     defineConfig({ ...presets.book, lang: 'de', enable: [...presets.book.enable, 'number.group'] })
 *
 * - `web`: articles and marketing pages. The defaults, plus `°C`, `±`, `½` and trailing spaces.
 * - `book`: running prose. The `literary` register, those opt-ins and one mark of `!` or `?`.
 * - `ui`: labels, buttons and other short strings in narrow boxes. The defaults, without the rules that
 *   bind short words and one-letter words (a bound pair is a longer unbreakable unit), plus trailing spaces.
 */
const web = Object.freeze({
  enable: Object.freeze(['symbol.degree', 'symbol.plusminus', 'symbol.fraction', 'space.trailing']),
}) satisfies Preset;

const book = Object.freeze({
  register: 'literary',
  enable: Object.freeze([
    'symbol.degree',
    'symbol.plusminus',
    'symbol.fraction',
    'space.trailing',
    'punctuation.double',
  ]),
}) satisfies Preset;

const ui = Object.freeze({
  disable: Object.freeze(['space.short-word', 'space.orphan']),
  enable: Object.freeze(['space.trailing']),
}) satisfies Preset;

export const PRESET_NAMES = ['web', 'book', 'ui'] as const;
export type PresetName = (typeof PRESET_NAMES)[number];

export const presets: Readonly<{ web: typeof web; book: typeof book; ui: typeof ui }> =
  Object.freeze({ web, book, ui });
