import type { ModeOptions } from '../core/typography.js';
/**
 * Typesets the text of an HTML string and leaves everything else exactly as it was:
 * tags, attributes, comments, and the content of `<pre>`, `<code>`, `<script>`,
 * `<style>`, `<kbd>`, `<samp>`, `<textarea>`, `<svg>`, `<math>` and `<template>`.
 *
 * Text is typeset a block at a time, with each inline element (`<a>`, `<em>`, …)
 * standing in as a placeholder, so a quotation pairs across a link and a dash
 * after `</em>` is still a dash. A block whose text needs no change is returned
 * byte for byte.
 *
 * Entities: `&quot; &apos; &amp; &lt; &gt; &nbsp;`, the typographic names
 * (`&mdash; &laquo; &hellip;` …) and numeric references are read as the characters
 * they stand for, so `&quot;x&quot;` is a quotation. In a block that changes, text
 * is written back as Unicode characters, with `& < >` escaped and, by default, a
 * no-break space as `&nbsp;` and a narrow one as `&#8239;` (so they stay visible in source); use UTF-8. Any other
 * entity (`&copy;`, `&euro;`) is kept as it was.
 *
 * Not done: the `lang` attribute is not read (pass `lang`), and a tag is not told
 * from text by a real HTML parser, only by a tokenizer: malformed markup is left
 * alone rather than repaired.
 *
 * `nbsp` (a `TypographyConfig` field, read by this mode only) is how a no-break space is written in
 * a block that changes: `entity` (`&nbsp;`, and `&#8239;` for the narrow one; the default) or the character.
 */
export type HtmlOptions = ModeOptions;
export declare function typesetHtml(html: string, options?: HtmlOptions): string;
