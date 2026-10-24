import type { PackModeOptions } from '../core/typography.js';
/**
 * The parts of a DOM node `typesetElement` reads and writes, so it runs on a real element and on a
 * stand-in alike.
 */
export type DomNode = {
    nodeType: number;
    nodeValue: string | null;
    childNodes: ArrayLike<DomNode>;
    nodeName?: string;
    getAttribute?(name: string): string | null;
};
/**
 * Typesets the text under `root` in place, as the HTML mode does a string: text is typeset a block
 * at a time, with the inline elements (`a`, `em`, ...) standing in as gaps, so a quotation pairs
 * across a link. Left alone: `pre`, `code`, `kbd`, `samp`, `textarea`, `script`, `style`, `svg`,
 * `math`, `template`, anything with `data-typography="off"`, and every attribute. One language for
 * the whole element: `options.lang` is a pack (use `resolvePack` for a code). A text node whose text
 * needs no change is not written, so a second run does nothing.
 *
 * It does not watch the element: call it again after the content changes.
 */
export declare function typesetElement(root: DomNode, options: PackModeOptions): void;
