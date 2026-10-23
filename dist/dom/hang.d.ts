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
export declare function hangPunctuation(el: HTMLElement): () => void;
/**
 * The source of a script that hangs the punctuation under its own parent element,
 * for a prerendered page: put it as an inline `<script>` right after the text, and
 * the marks hang as the page is parsed, not when the bundle has loaded and hydrated.
 * Without it the marks that start a wrapped line move by their own width at that
 * moment. The text is generated from `hangPunctuation` (`bun run gen:script`), so
 * the server build and the client build print the same script.
 */
export declare function hangScript(): string;
