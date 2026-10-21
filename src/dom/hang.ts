import { HANG_SCRIPT } from './script';

/**
 * Hangs the opening punctuation marked with `data-hang` (see `HangText` in the
 * react entry, or wrap marks yourself) under `root`, wherever a line happens to
 * start with it: the first line of a paragraph and any line the text wraps onto.
 * A mark that starts a line is pulled left by its own width (in em, so it follows
 * the text size), or by the share of it set in the CSS custom property
 * `--hang-amount` (0 to 1, inherited; 0 hangs nothing, unset is 1); one in the
 * middle of a line is left alone. Hanging a
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
  /** The share of its width a mark hangs by: `--hang-amount` from 0 to 1, or 1 when unset. */
  const amountOf = (style: CSSStyleDeclaration): number => {
    const value = Number.parseFloat(style.getPropertyValue('--hang-amount'));
    return Number.isFinite(value) ? Math.min(1, Math.max(0, value)) : 1;
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
        // A hung mark carries the share it was hung by, so a new amount is noticed.
        const hung = mark.dataset.hung !== undefined;
        const applied = hung ? Number.parseFloat(mark.dataset.hung ?? '') || 1 : 0;
        // Centred, right-aligned and indented text has no left edge for a line to start from.
        const leftAligned =
          !['center', 'right', 'end', 'justify-all'].includes(style.textAlign) &&
          Number.parseFloat(style.textIndent) === 0 &&
          style.direction === 'ltr';
        // A hung mark sits that share of its width left of the edge.
        const atStart = leftAligned && Math.abs(rect.left - (edge - rect.width * applied)) < 1.5;
        const own = getComputedStyle(mark);
        return {
          mark,
          rect,
          atStart,
          hung,
          applied,
          amount: amountOf(own),
          size: Number.parseFloat(own.fontSize),
        };
      });
      for (const { mark, rect, atStart, hung, applied, amount, size } of reads) {
        const hang = atStart && amount > 0;
        // A mark with no width is not on screen (a closed dialog): leave it for when it is.
        if ((hang === hung && (!hung || applied === amount)) || !size || !rect.width) continue;
        changed = true;
        if (hang) {
          mark.dataset.hung = String(amount);
          mark.style.marginLeft = `${(-rect.width * amount) / size}em`;
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
