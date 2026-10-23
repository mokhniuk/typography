export type TextPart = {
    text: string;
    hang: boolean;
    lead: boolean;
};
/**
 * Cuts `text` into plain runs and the runs of opening punctuation that hang. A
 * run is one or more opening marks (a stack such as «( counts as one) that
 * starts a word and is followed by a letter or digit. `atStart` says whether
 * `text` itself begins a paragraph, so its first character begins a word; a
 * text that continues another (after a link) starts mid-word unless it opens
 * with a space. `lead` marks the run that opens the paragraph, which the page
 * can hang before any measuring has happened.
 */
export declare function splitHangs(text: string, atStart?: boolean): TextPart[];
/**
 * A piece of hanging markup: plain text, the space before an opening run, an opening run, or a
 * closing run together with the space after it.
 */
export type HangPiece = {
    kind: 'text' | 'space' | 'open' | 'close';
    text: string;
};
/**
 * Cuts `text` for hanging on both sides. An opening run (`« ( „ ¿ …` starting a word, followed by
 * a letter or digit) hangs left where it starts a line; a closing run (`» ) “ ’ …` ending a word,
 * with any `.,;:!?…` after it) hangs right where it ends one. The whitespace around them is what
 * makes it work without measuring lines: the space before an opening run and the space after a
 * closing run carry the marks' widths as extra word spacing, which cancels the marks' negative
 * margins in the middle of a line and goes away with the space wherever the line breaks there.
 * So the space before an opener is its own `space` piece, and a closer keeps the space after it in
 * its own piece (a closer and an opener around one space share it). `atStart` says whether `text`
 * begins a paragraph; a text that continues another starts mid-word. `after` is the character
 * that follows `text` in its paragraph when markup cut the two apart (`<ins>“</ins>Curiouser`);
 * unset, `text` ends the paragraph. The texts joined give `text`.
 */
export declare function hangPieces(text: string, atStart?: boolean, after?: string): HangPiece[];
