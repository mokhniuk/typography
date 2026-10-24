import type { TypographyConfig } from './config.js';
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
declare const web: Readonly<{
    enable: readonly string[];
}>;
declare const book: Readonly<{
    register: "literary";
    enable: readonly string[];
}>;
declare const ui: Readonly<{
    disable: readonly string[];
    enable: readonly string[];
}>;
export declare const PRESET_NAMES: readonly ['web', 'book', 'ui'];
export type PresetName = (typeof PRESET_NAMES)[number];
export declare const presets: Readonly<{
    web: typeof web;
    book: typeof book;
    ui: typeof ui;
}>;
export {};
