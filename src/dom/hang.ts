import { HANG_SCRIPT } from './script';

/**
 * Hangs the opening punctuation marked with `data-hang` (see `HangText` in the
 * react entry, or wrap marks yourself) under `root`, wherever a line happens to
 * start with it: the first line of a paragraph and any line the text wraps onto.
 * A mark that starts a line is pulled left by exactly its own width (in em, so it
 * follows the text size); one in the middle of a line is left alone. Hanging a
 * mark gives its line a little more room, which can move a later break, so the
 * pass repeats until no mark changes.
 *
 * This is measured rather than `hanging-punctuation: first`: that property is
 * Safari-only and covers only a paragraph's first line, and using both would
 * hang the same mark twice.
 *
 * Framework-free. Returns a function that stops observing.
 */

export function hangPunctuation(el: HTMLElement): () => void {
  // Self-contained on purpose: `hangScript` sends this function's source to the page as it is.
  /** The block whose left edge a line starts from: the nearest ancestor that is not inline. */
  const lineBox = (mark: HTMLElement): HTMLElement => {
    let box = mark.parentElement;
    while (box?.parentElement && getComputedStyle(box).display === 'inline')
      box = box.parentElement;
    return box ?? mark;
  };
  let frame = 0;
  let alive = true;

  const settle = () => {
    const marks = [...el.querySelectorAll<HTMLElement>('[data-hang]')];
    // A mark not seen before may carry the rough first-paint offset: measure it from zero.
    for (const mark of marks) {
      if (mark.dataset.measured !== undefined) continue;
      mark.dataset.measured = '';
      mark.style.marginLeft = '0';
    }
    for (let pass = 0; pass < 4; pass++) {
      let changed = false;
      const reads = marks.map((mark) => {
        const rect = mark.getBoundingClientRect();
        const box = lineBox(mark);
        const style = getComputedStyle(box);
        const edge =
          box.getBoundingClientRect().left +
          Number.parseFloat(style.paddingLeft) +
          Number.parseFloat(style.borderLeftWidth);
        const hung = mark.dataset.hung === '';
        // Centred, right-aligned and indented text has no left edge for a line to start from.
        const leftAligned =
          !['center', 'right', 'end', 'justify-all'].includes(style.textAlign) &&
          Number.parseFloat(style.textIndent) === 0 &&
          style.direction === 'ltr';
        // A hung mark sits one of its own widths left of the edge.
        const atStart =
          leftAligned && Math.abs(rect.left - (hung ? edge - rect.width : edge)) < 1.5;
        return {
          mark,
          rect,
          atStart,
          hung,
          size: Number.parseFloat(getComputedStyle(mark).fontSize),
        };
      });
      for (const { mark, rect, atStart, hung, size } of reads) {
        // A mark with no width is not on screen (a closed dialog): leave it for when it is.
        if (atStart === hung || !size || !rect.width) continue;
        changed = true;
        if (atStart) {
          mark.dataset.hung = '';
          mark.style.marginLeft = `${-rect.width / size}em`;
        } else {
          delete mark.dataset.hung;
          mark.style.marginLeft = '0';
        }
      }
      if (!changed) break;
    }
  };

  const schedule = () => {
    cancelAnimationFrame(frame);
    frame = requestAnimationFrame(settle);
  };

  settle();
  document.fonts?.ready.then(() => alive && settle());
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
