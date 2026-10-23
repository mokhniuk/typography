/**
 * The space before French high punctuation (`space.high-punctuation`): the pack's `highPunctuation`
 * names the space set before a colon (`colon`) and before `; ! ?` (`others`). French (Lacroux,
 * Orthotypographie; OQLF): a no-break word space before `:`, a narrow no-break space before `; ! ?`,
 * between a letter or digit and the mark only.
 */
import type { LangPack } from './lang/pack.ts';
import { before, isLetter, isLetterOrNumber } from './scan.ts';

export type HighPunctuation = NonNullable<LangPack['highPunctuation']>;

/** The four marks. A forward search for the mark; what stands before it is read by hand (scan.ts). */
const MARK = /[:;!?]/g;

/** A space typed before the mark that the rule replaces: a plain, no-break, narrow no-break or thin one. */
const isSpace = (code: number): boolean =>
  code === 0x20 || code === 0xa0 || code === 0x202f || code === 0x2009;

/** The code point that starts at `index` (a surrogate pair is one), or `''` at the end. */
const codePointAt = (text: string, index: number): string => {
  const code = text.codePointAt(index);
  return code === undefined ? '' : String.fromCodePoint(code);
};

const COMBINING = /\p{M}/u;
/** A combining mark (an accent typed after its letter, as in NFD text). */
const isCombining = (codePoint: string): boolean => codePoint !== '' && COMBINING.test(codePoint);

/** A digit or another number (`½`, which `symbol.fraction` may write after this rule ran). */
const isNumber = (codePoint: string): boolean =>
  isLetterOrNumber(codePoint) && !isLetter(codePoint);

/**
 * What after `:` or `;` makes an emoticon or a path (`:)`, `;-)`, `C:\`, `C:/`), with what a later
 * rule turns those characters into (`(c)` ©, `-5` −5, `--` —), so a second run reads them the same.
 */
const AFTER_COLON = "-)(/|\\'*–—−©®™";

/**
 * Whether a `;` at `index` ends a character reference typed as text (`&nbsp;`, `&#8239;`): the run of
 * letters, digits and `#` before it, at most 32 long, opens with `&`.
 */
function endsReference(text: string, index: number): boolean {
  const stop = Math.max(0, index - 33);
  for (let at = index - 1; at >= stop; at--) {
    const code = text.charCodeAt(at);
    if (code === 0x26) return at < index - 1;
    const alnum =
      (code >= 0x30 && code <= 0x39) || ((code | 0x20) >= 0x61 && (code | 0x20) <= 0x7a);
    if (!alnum && code !== 0x23) return false;
  }
  return false;
}

/**
 * Whether the mark at `index` is not sentence punctuation, by what follows it: a letter or digit
 * (`a:b`, `x?y`, `10:30`, `Note:3`), an emoticon or a path after `:` `;` (`:)`, `;-)`, `C:\`,
 * `C:/`), `!=` `?=` `:=` (and `⇒`, what `symbol.implies` makes of `=>`), a Markdown image (`![`),
 * optional chaining (`?.`), the `;` of a character reference (`&nbsp;`). A spaced colon between
 * numbers is a time or a ratio (`10 : 30`).
 */
function notPunctuation(text: string, index: number, mark: string, start: number): boolean {
  const next = codePointAt(text, index + 1);
  // U+E003 stands for a web address, an email or a code span set aside (zones.ts): a mark glued to
  // one (`voir:https://…`) is part of what it starts, as before a letter.
  if (isLetterOrNumber(next) || next === '=' || next === '⇒' || next === '\uE003') return true;
  if ((mark === ':' || mark === ';') && next !== '' && AFTER_COLON.includes(next)) return true;
  if (mark === ';' && endsReference(text, index)) return true;
  if (mark === '!' && next === '[') return true;
  if (mark === '?' && next === '.') return true;
  if (mark === ':' && isNumber(before(text, start))) {
    let after = index + 1;
    while (text.charCodeAt(after) === 0x20 || text.charCodeAt(after) === 0x09) after++;
    if (isNumber(codePointAt(text, after))) return true;
  }
  return false;
}

/**
 * Sets `setting.colon` before a colon and `setting.others` before `; ! ?`, where a letter or digit
 * stands straight before the mark or before the spaces typed in front of it (which the set space
 * replaces). Never between two marks (`?!` takes one space, before the `?`; nothing after `…` `.`
 * `)` `»`), never at a line start, nothing after the mark. Linear: each mark reads back only the run
 * of spaces before it, and runs before two marks never overlap.
 */
export function highPunctuation(text: string, setting: HighPunctuation): string {
  let out = '';
  let from = 0;
  MARK.lastIndex = 0;
  for (let m = MARK.exec(text); m; m = MARK.exec(text)) {
    const index = m.index;
    const mark = m[0];
    const space = mark === ':' ? setting.colon : setting.others;
    if (!space) continue;
    let start = index;
    while (start > from && isSpace(text.charCodeAt(start - 1))) start--;
    // A letter with combining accents typed after it (NFD `e` U+0301) is a letter: step over them.
    let base = start;
    while (base > from && isCombining(before(text, base))) base -= before(text, base).length;
    if (!isLetterOrNumber(before(text, base))) continue;
    if (text.slice(start, index) === space) continue;
    if (notPunctuation(text, index, mark, start)) continue;
    out += text.slice(from, start) + space;
    from = index;
  }
  MARK.lastIndex = 0;
  return from === 0 ? text : out + text.slice(from);
}
