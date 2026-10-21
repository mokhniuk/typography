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
const ANY_RAW = new RegExp(`[${RAW}]`, 'g');
const DIGIT_BEFORE = /\p{N}/u;
/**
 * Marks the straight pair `"…"`. A straight " cannot open a quotation straight after a digit: there it
 * is an inch mark (2" pipe), so two inch marks in one text do not pair. Closing after a digit is still
 * allowed ("call 911"). Found by a scan from one mark to the next, not by a regex: an opener with no
 * closer (an inch mark) would make a regex read on to the end of the text each time.
 */
const OPENS_HERE = /[\s([]/;
const STRAIGHT: unique symbol = Symbol('straight');
function pairStraight(text: string): string {
  let out = '';
  let last = 0;
  for (let at = text.indexOf('"'); at !== -1; ) {
    if (at > 0 && DIGIT_BEFORE.test(text[at - 1] as string)) {
      at = text.indexOf('"', at + 1);
      continue;
    }
    ANY_RAW.lastIndex = at + 1;
    const end = ANY_RAW.exec(text)?.index ?? -1;
    if (end === -1) break;
    if (text[end] !== '"') {
      at = text.indexOf('"', end);
      continue;
    }
    // The next " stands where a quotation opens (a space or a bracket before it, a word after it):
    // it is an opener of its own, so the one at `at` has no partner and is read by where it stands.
    if (
      OPENS_HERE.test(text[end - 1] as string) &&
      end + 1 < text.length &&
      NON_SPACE.test(text[end + 1] as string)
    ) {
      at = end;
      continue;
    }
    out += text.slice(last, at) + setPair(text.slice(at + 1, end), text[at - 1], text[end + 1]);
    last = end + 1;
    at = text.indexOf('"', last);
  }
  return last === 0 ? text : out + text.slice(last);
}
const PAIRS: readonly (RegExp | typeof STRAIGHT)[] = [
  new RegExp(`„(${BODY})[“”]`, 'g'),
  new RegExp(`“(${BODY})”`, 'g'),
  new RegExp(`‚(${BODY})[‘’]`, 'g'),
  new RegExp(`‘(${BODY})’`, 'g'),
  GUILLEMETS,
  SINGLE_GUILLEMETS,
  STRAIGHT,
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
const LONE_MARK = new RegExp(`[${LONE}]`, 'g');
// Closing: a mark, or a no-break space and a closing guillemet (« text » in French).
const LONE_CLOSING = new RegExp(`[${LONE}]|${NBSP}[${SPACED_CLOSING}]`, 'g');
const SPACE = /\s/;
const NON_SPACE = /\S/;
const DIGIT = /\d/;
const BEFORE_CLOSING_BLOCKED = /[\s([]/;
/** The HTML, Markdown and rehype modes put this where a tag stands; a lone mark reads past it. */
const TAG = '\uFFFC';
/** The character before `at`, past any tags; `undefined` at the start of the text. */
const charBefore = (text: string, at: number): string | undefined => {
  let i = at - 1;
  while (text[i] === TAG) i--;
  return text[i];
};

/**
 * Every opening mark that stands where a quotation opens (`openerBefore` tells which characters may
 * stand before it) and is followed by a non-space becomes OPEN, and so does each mark of a run directly
 * after it, since an OPEN is a place where a quotation opens. French « and ‹ may be followed by a
 * no-break space, which belongs to the mark. One scan, the cost of the marks, not of the text.
 */
function openLone(text: string, openerBefore: RegExp): string {
  let out = '';
  let last = 0;
  LONE_MARK.lastIndex = 0;
  for (let found = LONE_MARK.exec(text); found; found = LONE_MARK.exec(text)) {
    const at = found.index;
    const before = charBefore(text, at);
    if (before !== undefined && !openerBefore.test(before)) continue;
    let count = 0;
    let end = at;
    for (;;) {
      const mark = text[end];
      if (mark === undefined || !LONE.includes(mark)) break;
      let next = end + 1;
      if (text[next] === NBSP && SPACED.includes(mark)) next++;
      if (next >= text.length || SPACE.test(text[next] as string)) break;
      count++;
      end = next;
    }
    if (!count) continue;
    out += text.slice(last, at) + OPEN.repeat(count);
    last = end;
    LONE_MARK.lastIndex = end;
  }
  return last ? out + text.slice(last) : text;
}

/** After a digit only a curly or guillemet mark closes: the straight " is an inch (5'10"). */
function closeLone(text: string): string {
  return text.replace(LONE_CLOSING, (found: string, at: number) => {
    const before = charBefore(text, at);
    if (before === undefined) return found;
    if (found.length === 2) return NON_SPACE.test(before) ? CLOSE : found;
    if (DIGIT.test(before)) return found === '"' ? found : CLOSE;
    return BEFORE_CLOSING_BLOCKED.test(before) ? found : CLOSE;
  });
}

/**
 * The spaces just inside a pair go (`" stone "` is `«stone»`) where the mark is free on the outside:
 * an opener after the start, a space, a bracket or another opener, a closer before the end, a space, a
 * bracket, punctuation or another mark. Where the mark is glued to a word instead (`km‘ z`, `c ‘d`,
 * `Nr." %"`, a zone), the space was typed on the wrong side of it: it moves to the outside (`km «z`,
 * `c» d`), so that no two words are glued together and the mark is read the same way again.
 */
const FREE_BEFORE = /[\s([\uE000¿¡]/;
const FREE_AFTER = /[\s)\].,;:!?\uE000\uE001"„“”‚‘’«»‹›']/;
function setPair(inner: string, before: string | undefined, after: string | undefined): string {
  const leading = /^[\s\u00A0]+/.exec(inner)?.[0] ?? '';
  const body = inner.slice(leading.length);
  const trailing = /[\s\u00A0]+$/.exec(body)?.[0] ?? '';
  const kept = body.slice(0, body.length - trailing.length);
  const pre = before === undefined || FREE_BEFORE.test(before) ? '' : leading;
  const post = after === undefined || FREE_AFTER.test(after) ? '' : trailing;
  return `${pre}${OPEN}${kept}${CLOSE}${post}`;
}

// An apostrophe inside a word (don't, don’t, Maria’s) must not be taken for a quote mark, or
// the quotation around it would not pair. It is set aside as a placeholder and put back.
const APOSTROPHE = '\uE002';
const PLACEHOLDERS = new RegExp(`[${OPEN}${CLOSE}${APOSTROPHE}]`, 'g');
// The only characters the `apostrophe` regex of a language can match.
const APOSTROPHE_MARK = /['’]/g;
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
  pairs: readonly (RegExp | typeof STRAIGHT)[];
  single: RegExp;
  /** What may stand before an opening mark: a space, a bracket, an OPEN and the pack's `openers` (the start of the text is checked apart). */
  openerBefore: RegExp;
  /**
   * A mark that stands for an apostrophe: inside a word, on a year, or an elision. Sticky: every
   * alternative matches the one character ' or ’ and nothing after it, so it is tried only where
   * `APOSTROPHE_MARK` finds one, and the `\p{L}` lookbehinds are not run at every character of the text.
   */
  apostrophe: RegExp;
  elisionGroups: number;
  /**
   * Whether the text holds a character this rule can act on: a mark of a pair, a lone mark, an
   * apostrophe, or one of the three placeholders (a text that already holds one has it read as one).
   * Without any, every step below leaves the text as it is.
   */
  relevant: RegExp;
  /** Whether a pair, or a single-quote pair, can still match (they start with one of these). */
  pairable: RegExp;
  /** Whether a lone opening or closing mark is left (both read only the marks of `LONE`). */
  lone: RegExp;
};
const charClass = (chars: string) => new RegExp(`[${chars.replace(/[\\\]^-]/g, '\\$&')}]`);
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
    openerBefore: new RegExp(`[\\s(\\[${OPEN}${extra}]`),
    // Inside a word, or a leading apostrophe on a year (the ’90s: two digits). A straight ' there may open
    // a quoted number ('12'), a curly ’ cannot, so only the straight one is told apart by what follows.
    // The last alternatives are an apostrophe for dropped letters, rock 'n' roll and 'til: it is set curly
    // here, since the `apostrophe` rule only turns a straight ' after a letter or before a digit.
    apostrophe: new RegExp(
      `(?<=\\p{L})['’](?=\\p{L})|(?<=^|[\\s([])’(?=\\d{2}s?(?![\\d\\p{L}]))|(?<=^|[\\s([])'(?=\\d{2}s?(?![\\d'’\\p{L}]))${elision.source ? `|${elision.source}` : ''}`,
      'yu',
    ),
    elisionGroups: elision.groups,
    relevant: charClass(
      `${RAW}${LONE}${SPACED}${SPACED_CLOSING}'${turnedMarks.join('')}${OPEN}${CLOSE}${APOSTROPHE}`,
    ),
    pairable: charClass(`${RAW}'${turnedMarks.join('')}`),
    lone: charClass(`${LONE}${SPACED}${SPACED_CLOSING}`),
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
  const { pairs, single, openerBefore, apostrophe, elisionGroups, relevant, pairable, lone } =
    setupOf(pack);
  return (text, register = 'display', quoteStyle = 'language') => {
    if (!relevant.test(text)) return text;
    // The apostrophes are put back as they were; the `apostrophe` rule sets them.
    const kept: string[] = [];
    let out = text.replace(APOSTROPHE_MARK, (mark: string, at: number) => {
      apostrophe.lastIndex = at;
      const found = apostrophe.exec(text);
      if (!found) return mark;
      kept.push(found.slice(1, 1 + elisionGroups).some(Boolean) ? '’' : mark);
      return APOSTROPHE;
    });
    // Innermost pairs first, so a quotation inside a quotation resolves before its outer one.
    for (let changed = pairable.test(out); changed; ) {
      const before = out;
      for (const pair of pairs) {
        out =
          pair === STRAIGHT
            ? pairStraight(out)
            : out.replace(pair, (match: string, inner: string, offset: number, whole: string) =>
                setPair(inner, whole[offset - 1], whole[offset + match.length]),
              );
      }
      out = out.replace(
        single,
        (match: string, lead: string, inner: string, offset: number, whole: string) =>
          lead + setPair(inner, lead || undefined, whole[offset + match.length]),
      );
      changed = out !== before && pairable.test(out);
    }
    // A quotation mark that found no partner is read by where it stands: an opening one after
    // a space, a bracket or the start, before a word; a closing one after a word or a mark. Not
    // after a digit (5'10"), which is an inch. Quoting several paragraphs, books open the quote
    // in each and close it only in the last. Reading marks by position, not by shape, makes the
    // result stable: set once, a lone « or » is read the same way when it is typeset again.
    if (lone.test(out)) {
      out = closeLone(openLone(out, openerBefore));
    }
    const levels =
      quoteStyle === 'us' ? US : (register === 'literary' && pack.literary) || pack.quotes;
    let depth = 0;
    let next = 0;
    return out.replace(PLACEHOLDERS, (ch) => {
      if (ch === OPEN) {
        const mark = levels[depth % levels.length]?.[0] ?? '';
        depth++;
        return mark;
      }
      if (ch === CLOSE) {
        depth = Math.max(0, depth - 1);
        return levels[depth % levels.length]?.[1] ?? '';
      }
      return kept[next++] ?? '’';
    });
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
