/**
 * Text that already went through `typographic`, with the punctuation that hangs wrapped in the
 * spans `hangPunctuation` reads (see `hangPieces`): an opening run in `data-hang`, the space before
 * it in `data-hang-space`, a closing run with the space after it in `data-hang-close`. Used on its
 * own where a page cuts the text up itself and so has to typeset before it cuts. Every span carries
 * a rough width from the first paint, so a prerendered page hangs before the measuring refines it.
 */
export declare function HangText({ text, atStart }: {
    text: string;
    atStart?: boolean;
}): import("react").JSX.Element;
