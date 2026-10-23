import { type ModeOptions } from '../core/index.js';
/**
 * Typesets the prose of a Markdown document and leaves its structure and code as
 * they were. Untouched: fenced and indented code, inline code, front matter, raw
 * HTML (a line that starts with a tag, and inline tags), link and image targets,
 * reference definitions, footnote markers, backslash escapes, entities, thematic
 * breaks and table separator rows. The marker at the start of a line (`#`, `>`,
 * `-`, `1.`) is kept, and the text after it is typeset.
 *
 * A paragraph is typeset as a whole, line breaks included, so a quotation can run
 * over a wrapped line and pair across a link or an emphasis. A paragraph that
 * needs no change comes back byte for byte, and so does the whitespace of every
 * line (trailing spaces that make a hard break, indentation).
 *
 * Not done: a list nested four spaces deep is read as indented code and left as
 * it was (use two), and the `lang` of the document is not read from front matter
 * (pass `lang`).
 */
export type MarkdownOptions = ModeOptions;
export declare function typesetMarkdown(markdown: string, options?: MarkdownOptions): string;
