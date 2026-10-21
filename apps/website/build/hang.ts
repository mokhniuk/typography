import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { hangPieces } from '../../../src/core';
import { hangScript, hangStyle } from '../../../src/dom';
import { BLOCK } from '../../../src/shared/elements';

type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
};

/** Text that is never typeset, so its marks never hang (as `markHangs` skips it). */
const SKIP = new Set(['pre', 'code', 'kbd', 'samp', 'script', 'style', 'textarea']);
const marked = (node: Node) =>
  node.properties?.dataHang !== undefined ||
  node.properties?.dataHangClose !== undefined ||
  node.properties?.dataHangSpace !== undefined;

type Found = { node: Node; parent: Node; block: Node; skip: boolean };

/**
 * `markHangs` at build time: the punctuation in each `[data-hanging]` region is wrapped in the
 * spans `hangPunctuation` reads, with their rough widths, so the text hangs from the first paint
 * instead of moving when the bundle runs. A block is an element of `BLOCK` (the browser's display
 * is not known here); the rest is as `markHangs` does it. The engine's inline script goes last in
 * each region and measures the exact widths as the page is parsed.
 */
function markRegion(root: Node): void {
  const found: Found[] = [];
  const walk = (node: Node, block: Node, skip: boolean) => {
    for (const child of node.children ?? []) {
      if (child.type === 'text') found.push({ node: child, parent: node, block, skip });
      else if (child.type === 'element')
        walk(
          child,
          BLOCK.has(child.tagName ?? '') ? child : block,
          skip || SKIP.has(child.tagName ?? '') || marked(child),
        );
    }
  };
  walk(root, root, false);

  // The first character of the text after each node in its block, as `markHangs` reads it.
  const after: (string | undefined)[] = [];
  let next: string | undefined;
  for (let k = found.length - 1; k >= 0; k--) {
    if (found[k]?.block !== found[k + 1]?.block) next = undefined;
    after[k] = next;
    next = found[k]?.node.value?.charAt(0) || next;
  }
  const last = new Map<Node, string>();
  for (const [k, { node, parent, block, skip }] of found.entries()) {
    const text = node.value ?? '';
    const before = last.get(block);
    last.set(block, text.slice(-1) || (before ?? ''));
    if (!/\S/.test(text) || skip) continue;
    const pieces = hangPieces(text, before === undefined || /\s/.test(before), after[k]);
    if (!pieces.some((piece) => piece.kind !== 'text')) continue;
    const nodes = pieces.map((piece, i): Node => {
      if (piece.kind === 'text') return { type: 'text', value: piece.text };
      const { attr, style } = hangStyle(piece, pieces[i + 1]);
      const css = Object.entries(style)
        .map(([name, value]) => `${name}: ${value}`)
        .join('; ');
      const prop = attr.replace(/-(\w)/g, (_, c: string) => c.toUpperCase());
      return {
        type: 'element',
        tagName: 'span',
        properties: { [prop]: '', style: css },
        children: [{ type: 'text', value: piece.text }],
      };
    });
    const siblings = parent.children ?? [];
    siblings.splice(siblings.indexOf(node), 1, ...nodes);
  }
  root.children?.push({
    type: 'element',
    tagName: 'script',
    properties: {},
    children: [{ type: 'text', value: hangScript() }],
  });
}

/** Marks the hanging punctuation of every `[data-hanging]` region of a page. */
export function markHangsInPage(html: string): string {
  if (!html.includes('data-hanging')) return html;
  const processor = unified()
    .use(rehypeParse)
    .use(() => (tree: Node) => {
      const visit = (node: Node) => {
        if (node.type === 'element' && node.properties?.dataHanging !== undefined) {
          markRegion(node);
          return;
        }
        for (const child of node.children ?? []) visit(child);
      };
      visit(tree);
    })
    .use(rehypeStringify);
  return String(processor.processSync(html));
}
