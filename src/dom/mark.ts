import { type HangPiece, hangPieces } from '../core/hang.ts';

/** A mark's width before it is measured, in em per character: close for quotes and brackets in most text faces. */
export const ROUGH_EM = 0.4;
const PULL = 'calc(var(--hang-w) * var(--hang-amount, 1) * -1)';
const SPACE = 'calc(var(--hang-open, 0em) * var(--hang-amount, 1))';
const CLOSE_SPACE = 'calc((var(--hang-w) + var(--hang-open, 0em)) * var(--hang-amount, 1))';

const rough = (text: string) => `${ROUGH_EM * text.replace(/\s+$/, '').length}em`;

/**
 * The attribute and inline style of each kind of hanging piece, with rough widths, so that text
 * hangs from the first paint and `hangPunctuation` only refines the widths. `next` is the piece
 * after this one: a space or a closing span before an opening run carries that run's width.
 */
export function hangStyle(
  piece: HangPiece,
  next: HangPiece | undefined,
): { attr: string; style: Record<string, string> } {
  const open = next?.kind === 'open' ? { '--hang-open': rough(next.text) } : {};
  if (piece.kind === 'open')
    return { attr: 'data-hang', style: { '--hang-w': rough(piece.text), 'margin-left': PULL } };
  if (piece.kind === 'close')
    return {
      attr: 'data-hang-close',
      style: {
        '--hang-w': rough(piece.text),
        ...open,
        'margin-right': PULL,
        'word-spacing': CLOSE_SPACE,
      },
    };
  return { attr: 'data-hang-space', style: { ...open, 'word-spacing': SPACE } };
}

/** Text that is never typeset, so its marks never hang. */
const SKIP =
  'pre, code, kbd, samp, script, style, textarea, [data-hang], [data-hang-close], [data-hang-space]';

/**
 * Wraps the punctuation under `root` that should hang in the spans `hangPunctuation` reads, for
 * markup that did not come from `HangText` (the output of the HTML, Markdown or rehype modes, or
 * any page). A text node opens its block when no text came before it in the nearest ancestor
 * that is not inline. Text in `pre`, `code`, `kbd`, `samp`, `script`, `style` and `textarea`, and
 * text already wrapped, is left alone. Run it once, before `hangPunctuation`.
 */
export function markHangs(root: HTMLElement): void {
  const doc = root.ownerDocument;
  const view = doc.defaultView;
  if (!view) return;
  const blockOf = (node: Node): Element => {
    let box = node.parentElement;
    while (box && box !== root && view.getComputedStyle(box).display === 'inline')
      box = box.parentElement;
    return box ?? root;
  };
  const walker = doc.createTreeWalker(root, view.NodeFilter.SHOW_TEXT);
  const nodes: Text[] = [];
  for (let node = walker.nextNode(); node; node = walker.nextNode()) nodes.push(node as Text);
  // The last character of text seen in each block: a word starts after none or after a space.
  const last = new Map<Element, string>();
  const blocks = nodes.map(blockOf);
  // The first character of the text after each node in its block, which a mark at the node's
  // edge is read against: in `<ins>“</ins>Curiouser` the letter is in the next node.
  const after: (string | undefined)[] = [];
  let next: string | undefined;
  for (let k = nodes.length - 1; k >= 0; k--) {
    if (blocks[k] !== blocks[k + 1]) next = undefined;
    after[k] = next;
    next = nodes[k]?.data.charAt(0) || next;
  }
  for (const [k, node] of nodes.entries()) {
    const block = blocks[k] as Element;
    const before = last.get(block);
    last.set(block, node.data.slice(-1) || (before ?? ''));
    if (!/\S/.test(node.data) || node.parentElement?.closest(SKIP)) continue;
    const atStart = before === undefined || /\s/.test(before);
    const pieces = hangPieces(node.data, atStart, after[k]);
    if (!pieces.some((piece) => piece.kind !== 'text')) continue;
    node.replaceWith(
      ...pieces.map((piece, i) => {
        if (piece.kind === 'text') return doc.createTextNode(piece.text);
        const { attr, style } = hangStyle(piece, pieces[i + 1]);
        const span = doc.createElement('span');
        span.setAttribute(attr, '');
        for (const [name, value] of Object.entries(style)) span.style.setProperty(name, value);
        span.textContent = piece.text;
        return span;
      }),
    );
  }
}
