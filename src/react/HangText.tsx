import { splitHangs } from '../core';

/**
 * Text that already went through `typographic`, with its hanging marks wrapped in
 * `data-hang` spans for `hangPunctuation` to measure. Used on its own where a page
 * cuts the text up itself and so has to typeset before it cuts. The mark that
 * opens a paragraph carries a rough inline offset from the first paint, so a
 * prerendered page does not jump when the measuring replaces it.
 */
export function HangText({ text, atStart = true }: { text: string; atStart?: boolean }) {
  return (
    <>
      {splitHangs(text, atStart).map((part, i) =>
        part.hang ? (
          <span
            // biome-ignore lint/suspicious/noArrayIndexKey: parts have no identity beyond their position
            key={i}
            data-hang=""
            style={part.lead ? { marginLeft: '-0.5em' } : undefined}
          >
            {part.text}
          </span>
        ) : (
          part.text
        ),
      )}
    </>
  );
}
