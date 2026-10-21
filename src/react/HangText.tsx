import type { CSSProperties } from 'react';
import { hangPieces } from '../core';
import { hangStyle } from '../dom/mark';

/**
 * Text that already went through `typographic`, with the punctuation that hangs wrapped in the
 * spans `hangPunctuation` reads (see `hangPieces`): an opening run in `data-hang`, the space before
 * it in `data-hang-space`, a closing run with the space after it in `data-hang-close`. Used on its
 * own where a page cuts the text up itself and so has to typeset before it cuts. Every span carries
 * a rough width from the first paint, so a prerendered page hangs before the measuring refines it.
 */
export function HangText({ text, atStart = true }: { text: string; atStart?: boolean }) {
  const pieces = hangPieces(text, atStart);
  return (
    <>
      {pieces.map((piece, i) => {
        if (piece.kind === 'text') return piece.text;
        const { attr, style } = hangStyle(piece, pieces[i + 1]);
        const css = Object.fromEntries(
          Object.entries(style).map(([name, value]) => [
            name.startsWith('--') ? name : name.replace(/-(\w)/g, (_, c: string) => c.toUpperCase()),
            value,
          ]),
        ) as CSSProperties;
        return (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: pieces have no identity beyond their position
            key={i}
            {...{ [attr]: '' }}
            // The inline script (hangScript) sets the exact widths and data attributes before React
            // hydrates; React's development build would warn about the difference.
            suppressHydrationWarning
            style={css}
          >
            {piece.text}
          </span>
        );
      })}
    </>
  );
}
