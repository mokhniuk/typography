/** Opening punctuation, as found at the start of a word. */
const OPENERS = '«‹„“‘‚»›([{¿¡';

export type TextPart = { text: string; hang: boolean; lead: boolean };

/**
 * Cuts `text` into plain runs and the runs of opening punctuation that hang. A
 * run is one or more opening marks (a stack such as «( counts as one) that
 * starts a word and is followed by a letter or digit. `atStart` says whether
 * `text` itself begins a paragraph, so its first character begins a word; a
 * text that continues another (after a link) starts mid-word unless it opens
 * with a space. `lead` marks the run that opens the paragraph, which the page
 * can hang before any measuring has happened.
 */
export function splitHangs(text: string, atStart = true): TextPart[] {
  const parts: TextPart[] = [];
  let plain = 0;
  let i = 0;
  while (i < text.length) {
    const ch = text.charAt(i);
    const startsWord = i === 0 ? atStart : /\s/.test(text.charAt(i - 1));
    if (!OPENERS.includes(ch) || !startsWord) {
      i++;
      continue;
    }
    let end = i;
    while (end < text.length && OPENERS.includes(text.charAt(end))) end++;
    if (end >= text.length || /\s/.test(text.charAt(end))) {
      i = end;
      continue;
    }
    if (i > plain) parts.push({ text: text.slice(plain, i), hang: false, lead: false });
    parts.push({ text: text.slice(i, end), hang: true, lead: i === 0 && atStart });
    plain = end;
    i = end;
  }
  if (plain < text.length) parts.push({ text: text.slice(plain), hang: false, lead: false });
  return parts;
}

/** Closing punctuation, as found at the end of a word. */
const CLOSERS = '»›«‹”“’‘)]}';
/** Sentence punctuation that may follow a closing run and hangs with it: `(AGS).` */
const TRAILING = '.,;:!?…';

/**
 * A piece of hanging markup: plain text, the space before an opening run, an opening run, or a
 * closing run together with the space after it.
 */
export type HangPiece = { kind: 'text' | 'space' | 'open' | 'close'; text: string };

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
export function hangPieces(text: string, atStart = true, after?: string): HangPiece[] {
  const out: HangPiece[] = [];
  const space = (ch: string | undefined) => ch !== undefined && /\s/.test(ch);
  let plain = 0;
  const flush = (end: number) => {
    if (end > plain) out.push({ kind: 'text', text: text.slice(plain, end) });
  };
  let i = 0;
  while (i < text.length) {
    const ch = text.charAt(i);
    const startsWord = i === 0 ? atStart : space(text.charAt(i - 1));
    if (OPENERS.includes(ch) && startsWord) {
      let end = i;
      while (end < text.length && OPENERS.includes(text.charAt(end))) end++;
      const next = end < text.length ? text.charAt(end) : after;
      if (next !== undefined && !space(next)) {
        let cut = i;
        while (cut > plain && space(text.charAt(cut - 1))) cut--;
        flush(cut);
        if (cut < i) out.push({ kind: 'space', text: text.slice(cut, i) });
        out.push({ kind: 'open', text: text.slice(i, end) });
        plain = end;
      }
      i = end;
      continue;
    }
    const endsWord = i === 0 ? !atStart : !space(text.charAt(i - 1));
    if (CLOSERS.includes(ch) && endsWord) {
      let end = i;
      while (
        end < text.length &&
        (CLOSERS.includes(text.charAt(end)) || TRAILING.includes(text.charAt(end)))
      )
        end++;
      const next = end < text.length ? text.charAt(end) : after;
      if (next === undefined || space(next)) {
        let after = end;
        while (after < text.length && space(text.charAt(after))) after++;
        flush(i);
        out.push({ kind: 'close', text: text.slice(i, after) });
        plain = after;
        i = after;
        continue;
      }
    }
    i++;
  }
  flush(text.length);
  return out;
}
