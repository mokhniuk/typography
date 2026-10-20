// Text the rules must not touch: a web address, an email, a code span. Each is set
// aside as a placeholder while the rules run and put back as it was, so `12-15` in a
// path, `->` in a command or `(c)` in an address survive.
const ZONE = '\uE003';
/** The zones that start with a literal: a code span, a web address. Found by the regex engine in one pass. */
const LITERAL_ZONES = new RegExp(
  ['`[^`\\n]+`', 'https?://[^\\s<>"“”«»‘’‚„‹›]+', 'www\\.[^\\s<>"“”«»‘’‚„‹›]+'].join('|'),
  'gu',
);

/**
 * The email zone was the fourth alternative of one regex, `[\w.+-]+@[\w-]+(?:\.[\w-]+)+`, whose
 * local part is tried from every position of a long run of word characters, hyphens and dots and
 * scans to the end of the run each time (quadratic on 20,000 `x` or `-` with no `@`). A local part
 * can only end at an `@` (it is not in the class), so the `@` is found first, the run before it is
 * read back by hand, and the domain is matched forward from it.
 */
const DOMAIN = /@[\w-]+(?:\.[\w-]+)+/y;
const isLocal = (code: number): boolean =>
  (code >= 0x30 && code <= 0x39) ||
  (code >= 0x41 && code <= 0x5a) ||
  (code >= 0x61 && code <= 0x7a) ||
  code === 0x5f ||
  code === 0x2e ||
  code === 0x2b ||
  code === 0x2d;

/** The first email at or after `from`: where it starts (not before `from`) and ends, or `null`. */
function nextEmail(text: string, from: number): [number, number] | null {
  for (let at = text.indexOf('@', from); at >= 0; at = text.indexOf('@', at + 1)) {
    let start = at;
    while (start > from && isLocal(text.charCodeAt(start - 1))) start--;
    if (start === at) continue;
    DOMAIN.lastIndex = at;
    const domain = DOMAIN.exec(text);
    if (domain) return [start, at + domain[0].length];
  }
  return null;
}

/**
 * The zones in order, as `[start, end]` pairs, exactly as `text.replace` with the four alternatives
 * in one regex would find them: the leftmost match wins, and at one position the earlier alternative
 * (a code span, an address, `www.`, an email).
 */
function zonesOf(text: string): [number, number][] {
  const found: [number, number][] = [];
  let from = 0;
  LITERAL_ZONES.lastIndex = 0;
  let literal = LITERAL_ZONES.exec(text);
  let email = nextEmail(text, 0);
  while (literal || email) {
    let start: number;
    let end: number;
    if (literal && (!email || literal.index <= email[0])) {
      start = literal.index;
      end = start + literal[0].length;
    } else if (email) {
      [start, end] = email;
    } else break;
    found.push([start, end]);
    from = end;
    if (literal && literal.index < from) {
      LITERAL_ZONES.lastIndex = from;
      literal = LITERAL_ZONES.exec(text);
    }
    if (email && email[0] < from) email = nextEmail(text, from);
  }
  LITERAL_ZONES.lastIndex = 0;
  return found;
}

const SENTENCE_PUNCTUATION = /[.,;:!?'’…]/;

/**
 * How much of an address (not a code span) is the address: the rest is sentence punctuation that
 * followed it. A trailing `.,;:!?'’…` is cut, and so is a `)` or `]` with no `(` or `[` to close in the
 * address before it. The brackets are counted once and kept up to date as characters are cut (this
 * used to split the head of the address at every step, quadratic on an address ending in many `)`).
 */
function addressLength(zone: string): number {
  let open = 0;
  let close = 0;
  let squareOpen = 0;
  let squareClose = 0;
  for (let i = 0; i < zone.length; i++) {
    const ch = zone.charCodeAt(i);
    if (ch === 0x28) open++;
    else if (ch === 0x29) close++;
    else if (ch === 0x5b) squareOpen++;
    else if (ch === 0x5d) squareClose++;
  }
  let end = zone.length;
  while (end > 0) {
    const ch = zone.charAt(end - 1);
    if (ch === ')' ? open < close : ch === ']' ? squareOpen < squareClose : SENTENCE_PUNCTUATION.test(ch)) {
      if (ch === ')') close--;
      else if (ch === ']') squareClose--;
      end--;
    } else break;
  }
  return end;
}

/** Sets the zones aside; the second value puts them back into the typeset text. */
export function shield(text: string): [string, (typeset: string) => string] {
  if (text.includes(ZONE)) return [text, (s) => s];
  const zones: string[] = [];
  let out = '';
  let copied = 0;
  for (const [start, end] of zonesOf(text)) {
    const match = text.slice(start, end);
    const kept = match.startsWith('`') ? match.length : addressLength(match);
    zones.push(match.slice(0, kept));
    out += text.slice(copied, start) + ZONE + match.slice(kept);
    copied = end;
  }
  if (!zones.length) return [text, (s) => s];
  out += text.slice(copied);
  let next = 0;
  return [out, (s) => s.replace(/\uE003/g, () => zones[next++] ?? '')];
}
