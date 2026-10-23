import { HANG_SCRIPT } from './script';

/**
 * Hangs the punctuation marked by `HangText` (or `markHangs`) under `root`
 * wherever a line happens to start or end with it, at any width and in any
 * alignment: an opening mark (`data-hang`) hangs left where it starts a line,
 * a closing mark (`data-hang-close`) hangs right where it ends one.
 *
 * Each mark gets a negative margin of its own width, and the space beside it,
 * which the browser drops wherever a line breaks, carries the same width as
 * extra word spacing: the space before an opening mark (`data-hang-space`), and
 * the space a closing span holds after its mark. In the middle of a line the two
 * cancel; where the line breaks at that space, the space goes and the mark hangs.
 * Nothing depends on where lines break, so nothing is re-measured when they move:
 * only each mark's width is measured, once, in em (`--hang-w`, and `--hang-open`
 * on the space before an opening mark), and again when web fonts load. An opening
 * mark wrapped by the page with nothing before it opens its paragraph and always
 * hangs; one glued to the text before it is left alone.
 *
 * How far a mark hangs is the CSS custom property `--hang-amount` (0 to 1,
 * inherited; unset is 1), read by CSS, so changing it needs no new pass.
 *
 * This is measured rather than `hanging-punctuation`: that property is Safari-only
 * and covers less, and using both would hang the same mark twice.
 *
 * Framework-free. Returns a function that stops observing.
 */

export function hangPunctuation(el: HTMLElement): () => void {
  // Self-contained on purpose: `hangScript` sends this function's source to the page as it is.
  // One pass per element: the inline script starts one as the page is parsed, and the React hook
  // starts one on the same root once hydrated, so the later call stops the earlier pass.
  const owner = el as HTMLElement & { __hang?: () => void };
  owner.__hang?.();
  const PULL = 'calc(var(--hang-w) * var(--hang-amount, 1) * -1)';
  const SPACE = 'calc(var(--hang-open, 0em) * var(--hang-amount, 1))';
  const CLOSE_SPACE = 'calc((var(--hang-w) + var(--hang-open, 0em)) * var(--hang-amount, 1))';
  const marked = (node: Node | null, key: string): node is HTMLElement =>
    !!node && node.nodeType === 1 && (node as HTMLElement).dataset[key] !== undefined;
  /** The width of a span's text, without the whitespace a closing span holds after its mark. */
  const glyphs = (span: HTMLElement): number => {
    const text = span.firstChild;
    if (text?.nodeType !== 3) return span.getBoundingClientRect().width;
    const range = document.createRange();
    range.setStart(text, 0);
    range.setEnd(text, (text.textContent ?? '').replace(/\s+$/, '').length);
    return range.getBoundingClientRect().width;
  };
  /**
   * What holds the space before an opening mark: a space span or the closing span before it, or
   * one made around the trailing whitespace of the text before it when the page wrapped the mark
   * itself. `null` when the mark opens its paragraph; `false` when it is glued to the text before.
   */
  const holderOf = (mark: HTMLElement): HTMLElement | null | false => {
    // A mark that opens an inline element (<em>«x</em>) looks for the space before the element.
    let node: Node = mark;
    while (
      !node.previousSibling &&
      node.parentElement &&
      node.parentElement !== el &&
      getComputedStyle(node.parentElement).display === 'inline'
    )
      node = node.parentElement;
    const before = node.previousSibling;
    if (!before) return null;
    if (marked(before, 'hangSpace') || marked(before, 'hangClose')) return before;
    if (before.nodeType !== 3) return false;
    const text = before.textContent ?? '';
    const gap = /\s+$/.exec(text)?.[0];
    if (!gap) return false;
    const spaceText = (before as Text).splitText(text.length - gap.length);
    const holder = document.createElement('span');
    holder.dataset.hangSpace = '';
    spaceText.replaceWith(holder);
    holder.append(spaceText);
    return holder;
  };
  let frame = 0;
  let alive = true;

  /** Measures the marks not measured yet (all of them once web fonts have loaded). */
  const settle = (all = false) => {
    for (const mark of el.querySelectorAll<HTMLElement>('[data-hang], [data-hang-close]')) {
      if (!all && mark.dataset.measured !== undefined) continue;
      const closing = mark.dataset.hangClose !== undefined;
      const width = closing ? glyphs(mark) : mark.getBoundingClientRect().width;
      const size = Number.parseFloat(getComputedStyle(mark).fontSize);
      // A mark with no width is not on screen (a closed dialog): leave it for when it is.
      if (!width || !size) continue;
      mark.dataset.measured = '';
      const w = `${width / size}em`;
      mark.style.setProperty('--hang-w', w);
      if (closing) {
        // A closing span holds the space after its mark; one that does not (it ends an inline
        // element, and the space is outside) hangs only where its block ends.
        if (!/\s$/.test(mark.textContent ?? '')) {
          let node: Node = mark;
          while (
            !node.nextSibling &&
            node.parentElement &&
            node.parentElement !== el &&
            getComputedStyle(node.parentElement).display === 'inline'
          )
            node = node.parentElement;
          if (node.nextSibling) {
            mark.style.marginRight = '0';
            continue;
          }
        }
        mark.style.marginRight = PULL;
        mark.style.wordSpacing = CLOSE_SPACE;
        continue;
      }
      const holder = holderOf(mark);
      if (holder === false) {
        mark.style.marginLeft = '0';
        continue;
      }
      mark.style.marginLeft = PULL;
      if (holder) {
        holder.style.setProperty('--hang-open', w);
        if (holder.dataset.hangSpace !== undefined) holder.style.wordSpacing = SPACE;
      }
    }
  };

  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(() => settle());
  };

  settle();
  document.fonts?.ready.then(() => alive && settle(true));
  // A dialog's text is measured only once the dialog is open, which is when it gets a size.
  const resizes = new ResizeObserver(schedule);
  const watch = () => {
    resizes.observe(el);
    for (const dialog of el.querySelectorAll('dialog')) resizes.observe(dialog);
  };
  watch();
  // Text that arrives later (a section that loads, a dialog that fills in).
  const additions = new MutationObserver(() => {
    watch();
    schedule();
  });
  additions.observe(el, { childList: true, subtree: true, characterData: true });
  const stop = () => {
    alive = false;
    cancelAnimationFrame(frame);
    resizes.disconnect();
    additions.disconnect();
    if (owner.__hang === stop) delete owner.__hang;
  };
  owner.__hang = stop;
  return stop;
}

/**
 * The source of a script that hangs the punctuation under its own parent element,
 * for a prerendered page: put it as an inline `<script>` right after the text, and
 * the marks hang as the page is parsed, not when the bundle has loaded and hydrated.
 * Without it the marks that start a wrapped line move by their own width at that
 * moment. The text is generated from `hangPunctuation` (`bun run gen:script`), so
 * the server build and the client build print the same script.
 */
export function hangScript(): string {
  return HANG_SCRIPT;
}
