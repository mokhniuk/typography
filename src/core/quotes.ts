import { LITERARY, PROFILES } from './profiles';
import type { Lang, Register } from './types';

// Pairs found in source text are first swapped for these placeholders, then
// given the marks of their level, so a text can mix any source styles.
const OPEN = '\uE000';
const CLOSE = '\uE001';
const RAW = '„“”‚‘’«»‹›"';
const BODY = `[^${RAW}]*`;
const GUILLEMETS = new RegExp(`«(${BODY})»`, 'g');
const SINGLE_GUILLEMETS = new RegExp(`‹(${BODY})›`, 'g');
const PAIRS = [
  new RegExp(`„(${BODY})[“”]`, 'g'),
  new RegExp(`“(${BODY})”`, 'g'),
  new RegExp(`‚(${BODY})[‘’]`, 'g'),
  new RegExp(`‘(${BODY})’`, 'g'),
  GUILLEMETS,
  SINGLE_GUILLEMETS,
  // A straight " cannot open a quotation straight after a letter or digit: there it is an inch mark
  // (2" pipe), so two inch marks in one text do not pair. Closing after a digit is still allowed
  // ("call 911"), because an opener that stands where a quotation opens has been found.
  new RegExp(`(?<![\\p{L}\\p{N}])"(${BODY})"`, 'gu'),
];
// German sets »…« and ›…‹, turned the other way. Read as «…», the « that ends one quotation and the »
// that opens the next would pair (»a« und »b«), and so would ‹ › between two inner ones, so in German
// the pairs are »…« and ›…‹, and a text written «…» is read by where each mark stands, like any mark
// with no partner. The opening mark must stand where a quotation opens and the closing one where it
// closes, so a text written «a» und «b» is not read as » und «.
const turned = (open: string, close: string) =>
  new RegExp(`(?<=^|[\\s(\\[${OPEN}])${open}(?=\\S)(${BODY})(?<=\\S)${close}`, 'g');
const GERMAN_PAIRS = [
  turned('»', '«'),
  turned('›', '‹'),
  ...PAIRS.filter((pair) => pair !== GUILLEMETS && pair !== SINGLE_GUILLEMETS),
];
/** A quoted 'word': the opening one follows a space or a bracket, so an apostrophe inside a word never pairs. */
const SINGLE = new RegExp(`(^|[\\s(\\[${OPEN}])'([^']+)'(?=[\\s).,;:!?\\]${CLOSE}]|$)`, 'g');

/** Marks that are never an apostrophe; ’ is left out because it ends a possessive (dogs’). */
const LONE = '"„“”‚«»‹›‘';
const SPACED = '«‹';
const SPACED_CLOSING = '»›';
const NBSP = '\u00A0';
// An opening mark may follow another (»„ at the start of a nested quotation), so it is read until
// none is left. French sets a no-break space inside « », which belongs to the mark.
const LONE_OPENING = new RegExp(
  `(?<=^|[\\s(\\[${OPEN}])(?:[${LONE.replace(/[«‹]/g, '')}]|[${SPACED}]${NBSP}?)(?=\\S)`,
  'g',
);
// After a digit only a curly or guillemet mark closes: the straight " is an inch (5'10").
const LONE_CLOSING = new RegExp(
  `(?<=[^\\s\\d(\\[])[${LONE}]|(?<=\\d)[${LONE.replace('"', '')}]|(?<=\\S)${NBSP}[${SPACED_CLOSING}]`,
  'g',
);

const trimInner = (s: string) => s.replace(/^[\s\u00A0]+|[\s\u00A0]+$/g, '');

// An apostrophe inside a word (don't, don’t, Maria’s) must not be taken for a quote mark, or
// the quotation around it would not pair. It is set aside as a placeholder and put back.
const APOSTROPHE = '\uE002';
// Words that start with an apostrophe for dropped letters ('til, 'em, 'cause), and 'n' as in rock 'n' roll.
// Each alternative holds the apostrophe in a group so the replacer can tell it from the others. A word
// that goes on (the 'emergency' exit) or is closed by another ' (the 'til' button) stays a quotation.
const EDGE = '(?<=^|[\\s([])';
const ELISION = [
  `${EDGE}(')(?=(?:[Ee]m|[Tt]ill?|[Cc]ause|[Bb]out|[Rr]ound|[Tt]is|[Tt]was|[Cc]os)(?![\\p{L}'’]))`,
  `${EDGE}(')(?=[Nn]'(?=$|[\\s).,;:!?\\]]))`,
  `(?<=${EDGE}'[Nn])(')(?=$|[\\s).,;:!?\\]])`,
].join('|');
const ELISION_GROUPS = 3;

/** Sets the quotation marks of the language, register and nesting level; source quotes may be of any style. */
export function quotes(text: string, lang: Lang, register: Register): string {
  // The apostrophes are put back as they were; the `apostrophe` rule sets them.
  const kept: string[] = [];
  let out = text.replace(
    // Inside a word, or a leading apostrophe on a year (the ’90s: two digits). A straight ' there may open
    // a quoted number ('12'), a curly ’ cannot, so only the straight one is told apart by what follows.
    // The second group is an apostrophe for dropped letters, rock 'n' roll and 'til: it is set curly here,
    // since the `apostrophe` rule only turns a straight ' after a letter or before a digit.
    new RegExp(
      `(?<=\\p{L})['’](?=\\p{L})|(?<=^|[\\s([])’(?=\\d{2}s?(?![\\d\\p{L}]))|(?<=^|[\\s([])'(?=\\d{2}s?(?![\\d'’\\p{L}]))|${ELISION}`,
      'gu',
    ),
    (mark: string, ...groups: (string | undefined)[]) => {
      kept.push(groups.slice(0, ELISION_GROUPS).some(Boolean) ? '’' : mark);
      return APOSTROPHE;
    },
  );
  // Innermost pairs first, so a quotation inside a quotation resolves before its outer one.
  for (let changed = true; changed; ) {
    const before = out;
    for (const pair of lang === 'de' ? GERMAN_PAIRS : PAIRS) {
      out = out.replace(pair, (_, inner: string) => `${OPEN}${trimInner(inner)}${CLOSE}`);
    }
    out = out.replace(
      SINGLE,
      (_, lead: string, inner: string) => `${lead}${OPEN}${trimInner(inner)}${CLOSE}`,
    );
    changed = out !== before;
  }
  // A quotation mark that found no partner is read by where it stands: an opening one after
  // a space, a bracket or the start, before a word; a closing one after a word or a mark. Not
  // after a digit (5'10"), which is an inch. Quoting several paragraphs, books open the quote
  // in each and close it only in the last. Reading marks by position, not by shape, makes the
  // result stable: set once, a lone « or » is read the same way when it is typeset again.
  for (let before = ''; before !== out; ) {
    before = out;
    out = out.replace(LONE_OPENING, OPEN);
  }
  out = out.replace(LONE_CLOSING, CLOSE);
  const levels = (register === 'literary' && LITERARY[lang]) || PROFILES[lang];
  let depth = 0;
  let next = 0;
  let result = '';
  for (const ch of out) {
    if (ch === OPEN) {
      result += levels[depth % levels.length]?.[0] ?? '';
      depth++;
    } else if (ch === CLOSE) {
      depth = Math.max(0, depth - 1);
      result += levels[depth % levels.length]?.[1] ?? '';
    } else if (ch === APOSTROPHE) {
      result += kept[next++] ?? '’';
    } else {
      result += ch;
    }
  }
  return result;
}
