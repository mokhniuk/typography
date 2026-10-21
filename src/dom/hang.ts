import { HANG_SCRIPT } from './script';

/**
 * Hangs the opening punctuation marked with `data-hang` (see `HangText` in the
 * react entry, or wrap marks yourself) under `root`, wherever a line happens to
 * start with it, at any width and in any alignment.
 *
 * Push and pull: each mark is pulled left by its own width (`margin-left`), and a
 * push, an empty span just before the space ahead of the mark, holds the same
 * width open (`margin-right`). In the middle of a line the two cancel, so the
 * line breaks are the ones the text would have anyway; where a line breaks at that
 * space, the push stays at the end of the line above and the mark hangs. Nothing
 * depends on where lines break, so nothing is re-measured when they move: only
 * each mark's own width is measured, once, in em (so it follows the text size), and
 * again when web fonts load. A mark with no push before it opens its paragraph and
 * always hangs; one glued to the text before it is left alone.
 *
 * How far a mark hangs is the CSS custom property `--hang-amount` (0 to 1,
 * inherited; unset is 1), read by CSS, so changing it needs no new pass.
 *
 * This is measured rather than `hanging-punctuation: first`: that property is
 * Safari-only and covers only a paragraph's first line, and using both would
 * hang the same mark twice.
 *
 * Framework-free. Returns a function that stops observing.
 */

export function hangPunctuation(el: HTMLElement): () => void {
  // Self-contained on purpose: `hangScript` sends this function's source to the page as it is.
  const PULL = 'calc(var(--hang-w) * var(--hang-amount, 1) * -1)';
  const PUSH = 'calc(var(--hang-w) * var(--hang-amount, 1))';
  const isPush = (node: Node | null): node is HTMLElement =>
    !!node && node.nodeType === 1 && (node as HTMLElement).dataset.hangPush !== undefined;
  /**
   * The push of a mark: found before the space ahead of it, or made there when the page
   * wrapped the mark itself. `null` when the mark opens its paragraph; `false` when it is
   * glued to the text before it and must not hang.
   */
  const pushOf = (mark: HTMLElement): HTMLElement | null | false => {
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
    if (isPush(before)) return before;
    if (before.nodeType !== 3) return false;
    const text = before.textContent ?? '';
    const space = /\s+$/.exec(text)?.[0];
    if (!space) return false;
    if (space.length === text.length && isPush(before.previousSibling)) return before.previousSibling;
    const push = document.createElement('span');
    push.dataset.hangPush = '';
    (before as Text).splitText(text.length - space.length);
    before.parentNode?.insertBefore(push, before.nextSibling);
    return push;
  };
  let frame = 0;
  let alive = true;

  /** Measures the marks not measured yet (all of them once web fonts have loaded). */
  const settle = (all = false) => {
    for (const mark of el.querySelectorAll<HTMLElement>('[data-hang]')) {
      if (!all && mark.dataset.measured !== undefined) continue;
      const width = mark.getBoundingClientRect().width;
      const size = Number.parseFloat(getComputedStyle(mark).fontSize);
      // A mark with no width is not on screen (a closed dialog): leave it for when it is.
      if (!width || !size) continue;
      const push = pushOf(mark);
      mark.dataset.measured = '';
      if (push === false) {
        mark.style.marginLeft = '0';
        continue;
      }
      const w = `${width / size}em`;
      mark.style.setProperty('--hang-w', w);
      mark.style.marginLeft = PULL;
      if (push) {
        push.style.setProperty('--hang-w', w);
        push.style.marginRight = PUSH;
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
  return () => {
    alive = false;
    cancelAnimationFrame(frame);
    resizes.disconnect();
    additions.disconnect();
  };
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
