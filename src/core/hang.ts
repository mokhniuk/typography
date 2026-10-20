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
