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

/** A piece of the push/pull markup: plain text, the push before the space ahead of a hung run, or the run. */
export type HangPiece = { kind: 'text' | 'push' | 'mark'; text: string; lead: boolean };

/**
 * `splitHangs` laid out for push/pull hanging. A hung run that follows a space gets a `push`
 * (no text) just before that space: the run is pulled left by its own width and the push holds
 * the same width open, so in the middle of a line the two cancel, and only where the line breaks
 * at that space, leaving the push at the end of the line above, does the run hang. Line breaks
 * then never depend on hanging, and nothing has to be measured per layout. The run that opens the
 * paragraph (`lead`) has nothing before it to push.
 */
export function hangPieces(text: string, atStart = true): HangPiece[] {
  const out: HangPiece[] = [];
  for (const part of splitHangs(text, atStart)) {
    if (!part.hang) {
      out.push({ kind: 'text', text: part.text, lead: false });
      continue;
    }
    const prev = out[out.length - 1];
    const space = prev?.kind === 'text' ? (/\s+$/.exec(prev.text)?.[0] ?? '') : '';
    if (prev && space) {
      out.pop();
      const before = prev.text.slice(0, -space.length);
      if (before) out.push({ kind: 'text', text: before, lead: false });
      out.push({ kind: 'push', text: '', lead: false }, { kind: 'text', text: space, lead: false });
    }
    out.push({ kind: 'mark', text: part.text, lead: part.lead });
  }
  return out;
}
