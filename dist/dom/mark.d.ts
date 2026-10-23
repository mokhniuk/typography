import { type HangPiece } from '../core/hang.js';
/** A mark's width before it is measured, in em per character: close for quotes and brackets in most text faces. */
export declare const ROUGH_EM = 0.4;
/**
 * The attribute and inline style of each kind of hanging piece, with rough widths, so that text
 * hangs from the first paint and `hangPunctuation` only refines the widths. `next` is the piece
 * after this one: a space or a closing span before an opening run carries that run's width.
 */
export declare function hangStyle(piece: HangPiece, next: HangPiece | undefined): {
    attr: string;
    style: Record<string, string>;
};
/**
 * Wraps the punctuation under `root` that should hang in the spans `hangPunctuation` reads, for
 * markup that did not come from `HangText` (the output of the HTML, Markdown or rehype modes, or
 * any page). A text node opens its block when no text came before it in the nearest ancestor
 * that is not inline. Text in `pre`, `code`, `kbd`, `samp`, `script`, `style` and `textarea`, and
 * text already wrapped, is left alone. Run it once, before `hangPunctuation`.
 */
export declare function markHangs(root: HTMLElement): void;
