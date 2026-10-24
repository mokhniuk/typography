import type { PackModeOptions } from '../core/typography.ts';
import { typesetBlock } from '../core/typography.ts';
import { BLOCK, RAW_BLOCK, RAW_INLINE } from '../shared/elements.ts';

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

const ELEMENT = 1;
const TEXT = 3;
/** Stands between the text nodes of a run while they are typeset together. */
const SEP = '￼';

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
export function typesetElement(root: DomNode, options: PackModeOptions): void {
  let run: (DomNode | null)[] = [];

  const flush = () => {
    const entries = run;
    run = [];
    const nodes = entries.filter((e): e is DomNode => e !== null);
    if (!nodes.some((n) => /\S/.test(n.nodeValue ?? ''))) return;
    const joined = entries.map((e) => e?.nodeValue ?? '').join(SEP);
    const { text, keep } = typesetBlock(joined, options);
    if (text === joined) return;
    const pieces = text.split(SEP);
    // A rule that lost or added a separator cannot be mapped back: keep the block as it came.
    if (pieces.length !== entries.length) return;
    keep();
    entries.forEach((entry, i) => {
      const piece = pieces[i] as string;
      if (entry && entry.nodeValue !== piece) entry.nodeValue = piece;
    });
  };

  const walk = (node: DomNode) => {
    for (let i = 0; i < node.childNodes.length; i++) {
      const child = node.childNodes[i] as DomNode;
      if (child.nodeType === TEXT) {
        run.push(child);
      } else if (child.nodeType === ELEMENT) {
        const tag = (child.nodeName ?? '').toLowerCase();
        if (child.getAttribute?.('data-typography') === 'off' || RAW_BLOCK.has(tag)) {
          flush();
        } else if (RAW_INLINE.has(tag)) {
          run.push(null);
        } else if (BLOCK.has(tag)) {
          flush();
          walk(child);
          flush();
        } else {
          run.push(null);
          walk(child);
          run.push(null);
        }
      }
    }
  };

  walk(root);
  flush();
}
