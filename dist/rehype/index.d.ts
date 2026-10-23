import { type ModeOptions } from '../core/index.js';
/**
 * A rehype plugin (and a function for any hast tree) that typesets the text of an
 * HTML syntax tree. It needs no dependency: a hast node is read as plain data.
 *
 *     unified().use(remarkParse).use(remarkRehype).use(rehypeTypography, { lang: 'uk' })
 *
 * Text is typeset a block at a time, with the inline elements (`a`, `em`, …) inside
 * it, so a quotation pairs across a link. Left alone: the content of `pre`, `code`,
 * `kbd`, `samp`, `textarea`, `script`, `style`, `svg`, `math`, `template`, anything
 * with `data-typography="off"`, and every attribute. An element's `lang` attribute
 * sets the language of its subtree, when it is one the package has a pack for (the
 * primary subtag is read, in any case: `uk-UA` is `uk`), or the code of the pack given
 * as the `lang` option (a pack of one's own is used inside `lang="<its code>"`); the
 * `quoteStyle` option is kept for every subtree, so `lang="en-US"` alone does not change the quotes. An inline
 * element in another language is typeset on its own, so a quotation does not pair across it.
 *
 * hast text is already decoded, so entities are not a concern here: text comes back
 * as characters, and the serializer escapes what it must.
 */
export type RehypeOptions = ModeOptions;
type Node = {
    type: string;
    children?: Node[];
    value?: string;
};
export declare function typesetHast<T extends Node>(tree: T, options?: RehypeOptions): T;
/** The unified plugin: `.use(rehypeTypography, { lang, register, quoteStyle, disable, enable })`. */
export default function rehypeTypography(options?: RehypeOptions): (tree: Node) => void;
export {};
