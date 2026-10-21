import type { CSSProperties } from 'react';
import { hangPieces } from '../core';

/** A mark's width before it is measured, in em per character: close for quotes and brackets in most text faces. */
const ROUGH_EM = 0.4;
const PULL = 'calc(var(--hang-w) * var(--hang-amount, 1) * -1)';
const PUSH = 'calc(var(--hang-w) * var(--hang-amount, 1))';

const width = (text: string) => ({ '--hang-w': `${ROUGH_EM * text.length}em` }) as CSSProperties;

/**
 * Text that already went through `typographic`, with its hanging marks wrapped in
 * `data-hang` spans and a `data-hang-push` span before the space ahead of each
 * (see `hangPunctuation`). Used on its own where a page cuts the text up itself and
 * so has to typeset before it cuts. Every mark carries a rough width from the first
 * paint, so a prerendered page hangs before the measuring replaces it with the exact one.
 */
export function HangText({ text, atStart = true }: { text: string; atStart?: boolean }) {
  const pieces = hangPieces(text, atStart);
  return (
    <>
      {pieces.map((piece, i) => {
        if (piece.kind === 'text') return piece.text;
        // The width a push holds open is the width of the mark after it (past the space).
        const mark = piece.kind === 'push' ? (pieces[i + 2]?.text ?? '') : piece.text;
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: pieces have no identity beyond their position
            key={i}
            {...(piece.kind === 'push' ? { 'data-hang-push': '' } : { 'data-hang': '' })}
            // The inline script (hangScript) sets the exact width and data attributes before React
            // hydrates; React's development build would warn about the difference.
            suppressHydrationWarning
            style={{ ...width(mark), [piece.kind === 'push' ? 'marginRight' : 'marginLeft']: piece.kind === 'push' ? PUSH : PULL }}
          >
            {piece.kind === 'mark' ? piece.text : null}
          </span>
        );
      })}
    </>
  );
}
