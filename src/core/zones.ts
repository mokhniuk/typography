// Text the rules must not touch: a web address, an email, a code span. Each is set
// aside as a placeholder while the rules run and put back as it was, so `12-15` in a
// path, `->` in a command or `(c)` in an address survive.
const ZONE = '\uE003';
const ZONES = new RegExp(
  [
    '`[^`\\n]+`',
    'https?://[^\\s<>"“”«»‘’‚„‹›]+',
    'www\\.[^\\s<>"“”«»‘’‚„‹›]+',
    '[\\w.+-]+@[\\w-]+(?:\\.[\\w-]+)+',
  ].join('|'),
  'gu',
);

/** Whether the last character of `zone.slice(0, end)` is sentence punctuation rather than part of the address. */
function isTail(zone: string, end: number): boolean {
  const ch = zone.charAt(end - 1);
  if (/[.,;:!?'’…]/.test(ch)) return true;
  const head = zone.slice(0, end);
  if (ch === ')') return head.split('(').length < head.split(')').length;
  if (ch === ']') return head.split('[').length < head.split(']').length;
  return false;
}

/** Sets the zones aside; the second value puts them back into the typeset text. */
export function shield(text: string): [string, (typeset: string) => string] {
  if (text.includes(ZONE)) return [text, (s) => s];
  const zones: string[] = [];
  const out = text.replace(ZONES, (match) => {
    let end = match.length;
    if (!match.startsWith('`')) while (end > 0 && isTail(match, end)) end--;
    zones.push(match.slice(0, end));
    return ZONE + match.slice(end);
  });
  if (!zones.length) return [text, (s) => s];
  let next = 0;
  return [out, (s) => s.replace(/\uE003/g, () => zones[next++] ?? '')];
}
