import { type LangPack, type Level, PACK } from './lang';
import type { Lang, QuoteStyle, Register } from './types';

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
  new RegExp(`"(${BODY})"`, 'g'),
];
// A language may set pairs turned the other way round (German »…« and ›…‹, `turnedPairs` on its pack).
// Read as «…», the « that ends one quotation and the » that opens the next would pair (»a« und »b«),
// and so would ‹ › between two inner ones, so those pairs are matched only where the opening mark
// stands where a quotation opens and the closing one where it closes, and a text written «a» und «b»
// is read by where each mark stands, like any mark with no partner.
const turned = (open: string, close: string, before: string) =>
  new RegExp(`(?<=${before})${open}(?=\\S)(${BODY})(?<=\\S)${close}`, 'g');
/** Marks that are never an apostrophe; ’ is left out because it ends a possessive (dogs’). */
const LONE = '"„“”‚«»‹›‘';
const SPACED = '«‹';
const SPACED_CLOSING = '»›';
const NBSP = '\u00A0';
// After a digit only a curly or guillemet mark closes: the straight " is an inch (5'10").
const LONE_CLOSING = new RegExp(
  `(?<=[^\\s\\d(\\[])[${LONE}]|(?<=\\d)[${LONE.replace('"', '')}]|(?<=\\S)${NBSP}[${SPACED_CLOSING}]`,
  'g',
);

const trimInner = (s: string) => s.replace(/^[\s\u00A0]+|[\s\u00A0]+$/g, '');

// An apostrophe inside a word (don't, don’t, Maria’s) must not be taken for a quote mark, or
// the quotation around it would not pair. It is set aside as a placeholder and put back.
const APOSTROPHE = '\uE002';
// Words that start with an apostrophe for dropped letters ('til, 'em, 'cause), and 'n' as in rock 'n' roll,
// listed in `elisions` on the language pack. Each alternative holds the apostrophe in a group so the
// replacer can tell it from the others. A word that goes on (the 'emergency' exit) or is closed by
// another ' (the 'til' button) stays a quotation.
// An elision may also follow an opening quote mark: "'tis fine", “'s avonds”.
const EDGE = '(?<=^|[\\s(["“„«‘‚»›])';
const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const caseless = (word: string) => {
  const [first = ''] = word;
  return `${first.toLowerCase() === first.toUpperCase() ? escapeRegex(first) : `[${first.toUpperCase()}${first.toLowerCase()}]`}${escapeRegex(word.slice(first.length))}`;
};
function elisionOf(words: readonly string[]): { source: string; groups: number } {
  const plain = words.filter((word) => word !== 'n');
  const alternatives: string[] = [];
  if (plain.length) {
    alternatives.push(`${EDGE}(')(?=(?:${plain.map(caseless).join('|')})(?![\\p{L}'’]))`);
  }
  if (words.includes('n')) {
    alternatives.push(
      `${EDGE}(')(?=[Nn]'(?=$|[\\s).,;:!?\\]]))`,
      `(?<=${EDGE}'[Nn])(')(?=$|[\\s).,;:!?\\]])`,
    );
  }
  return { source: alternatives.join('|'), groups: alternatives.length };
}

/** What is read from a language's pack, built once per language. */
type Setup = {
  pairs: readonly RegExp[];
  single: RegExp;
  /** An opening mark may follow another (»„ at the start of a nested quotation), so it is read until none is left. French sets a no-break space inside « », which belongs to the mark. */
  loneOpening: RegExp;
  /** A mark that stands for an apostrophe: inside a word, on a year, or an elision. */
  apostrophe: RegExp;
  elisionGroups: number;
};
function setupOf(pack: LangPack): Setup {
  // What may stand before an opening mark: the start, a space, a bracket, another opening mark, and the
  // pack's `openers` (Spanish ¿ ¡).
  const extra = (pack.openers ?? '').replace(/[\\\]^-]/g, '\\$&');
  const before = `^|[\\s(\\[${OPEN}${extra}]`;
  const turnedPairs = pack.turnedPairs ?? [];
  const turnedMarks = turnedPairs.flat();
  const pairs = [
    ...turnedPairs.map(([open, close]) => turned(open, close, before)),
    ...PAIRS.filter(
      (pair) =>
        !(
          (pair === GUILLEMETS && turnedMarks.some((mark) => mark === '«' || mark === '»')) ||
          (pair === SINGLE_GUILLEMETS && turnedMarks.some((mark) => mark === '‹' || mark === '›'))
        ),
    ),
  ];
  const elision = elisionOf(pack.elisions ?? []);
  const made: Setup = {
    pairs,
    single: new RegExp(`(${before})'([^']+)'(?=[\\s).,;:!?\\]${CLOSE}]|$)`, 'g'),
    loneOpening: new RegExp(
      `(?<=${before})(?:[${LONE.replace(/[«‹]/g, '')}]|[${SPACED}]${NBSP}?)(?=\\S)`,
      'g',
    ),
    // Inside a word, or a leading apostrophe on a year (the ’90s: two digits). A straight ' there may open
    // a quoted number ('12'), a curly ’ cannot, so only the straight one is told apart by what follows.
    // The last alternatives are an apostrophe for dropped letters, rock 'n' roll and 'til: it is set curly
    // here, since the `apostrophe` rule only turns a straight ' after a letter or before a digit.
    apostrophe: new RegExp(
      `(?<=\\p{L})['’](?=\\p{L})|(?<=^|[\\s([])’(?=\\d{2}s?(?![\\d\\p{L}]))|(?<=^|[\\s([])'(?=\\d{2}s?(?![\\d'’\\p{L}]))${elision.source ? `|${elision.source}` : ''}`,
      'gu',
    ),
    elisionGroups: elision.groups,
  };
  return made;
}

/** `quoteStyle: 'us'`: “…” with ‘…’ inside, whatever the language and register. */
const US: readonly Level[] = [
  ['“', '”'],
  ['‘', '’'],
];

/** The quote setter of one pack: marks of its language, register and nesting level; source quotes may be of any style. */
export function quotesFor(
  pack: LangPack,
): (text: string, register?: Register, quoteStyle?: QuoteStyle) => string {
  const { pairs, single, loneOpening, apostrophe, elisionGroups } = setupOf(pack);
  return (text, register = 'display', quoteStyle = 'language') => {
    // The apostrophes are put back as they were; the `apostrophe` rule sets them.
    const kept: string[] = [];
    let out = text.replace(apostrophe, (mark: string, ...groups: (string | undefined)[]) => {
      kept.push(groups.slice(0, elisionGroups).some(Boolean) ? '’' : mark);
      return APOSTROPHE;
    });
    // Innermost pairs first, so a quotation inside a quotation resolves before its outer one.
    for (let changed = true; changed; ) {
      const before = out;
      for (const pair of pairs) {
        out = out.replace(pair, (_, inner: string) => `${OPEN}${trimInner(inner)}${CLOSE}`);
      }
      out = out.replace(
        single,
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
      out = out.replace(loneOpening, OPEN);
    }
    out = out.replace(LONE_CLOSING, CLOSE);
    const levels =
      quoteStyle === 'us' ? US : (register === 'literary' && pack.literary) || pack.quotes;
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
  };
}

const setters = new Map<Lang, ReturnType<typeof quotesFor>>();

/** Sets the quotation marks of the language, register and nesting level; source quotes may be of any style. */
export function quotes(
  text: string,
  lang: Lang,
  register: Register,
  quoteStyle: QuoteStyle = 'language',
): string {
  let set = setters.get(lang);
  if (!set) {
    set = quotesFor(PACK[lang]);
    setters.set(lang, set);
  }
  return set(text, register, quoteStyle);
}
