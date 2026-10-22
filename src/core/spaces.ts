import { CURRENCY_CODES, CURRENCY_SIGNS, CURRENCY_WORDS, EURO, PERCENT } from './currency';
import { PACK } from './lang';
import { ABBREVIATIONS, type Abbreviations, ORPHANS, SHORT_WORDS } from './profiles';
import { before, isLetter, isLetterOrNumber, replaceBehind } from './scan';
import { type Lang, NBSP } from './types';

/** `(?<![\p{L}\p{N}])` before `index`: no letter or number stands directly before it. */
const freeBefore = (text: string, index: number): boolean => !isLetterOrNumber(before(text, index));
const UPPER = /\p{Lu}/u;

export const collapse = (text: string): string => text.replace(/ {2,}/g, ' ');

const TITLE = /(Prof|Dr|Mr|Mrs|Ms|Mx|St|Hon|Rev|Sr|Jr)\.[ ]+(?=\p{L})/gu;

/**
 * Titles stay with the name: Prof. Dr. Oksana. Written as `(?<![\p{L}\p{N}])` + TITLE, with the
 * lookbehind checked by hand after the title is found (see scan.ts).
 */
export const titles = (text: string): string =>
  replaceBehind(text, TITLE, freeBefore, (m) => `${m[1]}.${NBSP}`);

const INITIAL_DOT = /\.[ ]+(?=\p{Lu})/gu;

/**
 * An initial stays with the surname: K. Słoboda. Written as `(?<![\p{L}\p{N}])(\p{Lu})\.[ ]+(?=\p{Lu})`:
 * the search is for the full stop and the spaces, and the capital before the stop and what stands
 * before the capital are read by hand (see scan.ts). Each match starts at its own stop, so two never overlap.
 */
export const initials = (text: string): string =>
  replaceBehind(
    text,
    INITIAL_DOT,
    (whole, at) => {
      const capital = before(whole, at);
      return UPPER.test(capital) && freeBefore(whole, at - capital.length);
    },
    () => `.${NBSP}`,
  );

/** A number and a short word, a percent sign, a degree sign or a currency sign after it. */
const NUMBER_UNIT = new RegExp(
  `(\\d)[ ]+(?=[\\p{L}]{1,9}(?![\\p{L}])|[${PERCENT}°${CURRENCY_SIGNS}])`,
  'gu',
);

/** The longest currency name read back from before an amount (`lei`, `USD`, `zł`). */
const SIGN_LETTERS = 3;
const CURRENCY_NAMES: ReadonlySet<string> = new Set<string>([...CURRENCY_CODES, ...CURRENCY_WORDS]);

/**
 * Whether a currency sign, code or letter name ends at `end`: `€`, `USD`, `zł`. A name of letters
 * must stand free (no letter or digit before it), and is read back by at most `SIGN_LETTERS`
 * characters, so a long word before an amount costs a fixed number of steps, not its length.
 */
function currencyEndsAt(text: string, end: number): boolean {
  // Nothing stands before the start of the text; `includes('')` is true, so this must be asked first.
  if (end <= 0) return false;
  if (CURRENCY_SIGNS.includes(text.charAt(end - 1))) return true;
  let start = end;
  while (start > 0 && end - start < SIGN_LETTERS && isLetter(text.charAt(start - 1))) start--;
  for (let from = start; from < end; from++) {
    if (CURRENCY_NAMES.has(text.slice(from, end))) return !isLetterOrNumber(before(text, from));
  }
  return false;
}

const DIGIT = /\d/g;

/**
 * A currency sign or code before the amount stays with it: `USD 5`, `€ 49.99`. The digit is found
 * first and the typed spaces and the sign before it are read back by hand (a forward `[ ]+` would be
 * tried from every space of a run and scan to its end each time, see `association`).
 */
function currencyBefore(text: string): string {
  let out = '';
  let from = 0;
  DIGIT.lastIndex = 0;
  for (let m = DIGIT.exec(text); m; m = DIGIT.exec(text)) {
    const at = m.index;
    let start = at;
    while (start > from && text.charCodeAt(start - 1) === 0x20) start--;
    if (start === at || !currencyEndsAt(text, start)) continue;
    out += text.slice(from, start) + NBSP;
    from = at;
  }
  DIGIT.lastIndex = 0;
  return from === 0 ? text : out + text.slice(from);
}

/**
 * The digit groups of a number written in threes (1 000 000), with nothing that would make the run
 * something else: no leading zero (a phone number or a code: 09 123 456), no digit, letter, sign or
 * separator directly before it, no digit group before it (+380 44 123 45 67), and no further digits
 * after it (555 123 4567).
 */
const GROUP_RUN = /[1-9]\d{0,2}(?:[ ]\d{3})+(?![\d\p{L}])(?![  ]\d)/gu;
const NOT_BEFORE_GROUPS = /[\d\p{L}+,.:/'’‑-]/u;
const isSpace = (code: number): boolean => code === 0x20 || code === 0xa0;

function groupsStandFree(text: string, at: number): boolean {
  const prev = before(text, at);
  if (prev === '') return true;
  if (NOT_BEFORE_GROUPS.test(prev)) return false;
  if (!isSpace(text.charCodeAt(at - 1))) return true;
  let start = at;
  while (start > 0 && isSpace(text.charCodeAt(start - 1))) start--;
  return !/[\d)]/.test(before(text, start));
}

/**
 * A number the writer grouped by hand keeps its groups on one line: `1 000 000`, `5 000 zł`. This is
 * what the opt-in `number.group` does to a number of its own, so the two agree on an amount that is
 * already grouped.
 */
const bindGroups = (text: string): string =>
  replaceBehind(text, GROUP_RUN, groupsStandFree, (m) => m[0].replaceAll(' ', NBSP));

/**
 * A number stays with a short word after it (a unit, a month): 21 September, 15 people, 5 %.
 * A longer word is left free, so a chain of bound words never outgrows a narrow column. Money is
 * kept whole as well: the sign or code before the amount (`USD 5 000`, `€ 49.99`) and the digit
 * groups of an amount written in threes (`1 000 грн`). The engine never moves or adds a sign.
 */
export const numberUnit = (text: string): string =>
  bindGroups(currencyBefore(text.replace(NUMBER_UNIT, `$1${NBSP}`)));

const ASSOCIATION = /e\.V\./g;

/**
 * No-break space before e.V. Was `text.replace(/[ ]+(?=e\.V\.)/g, NBSP)`, whose run of spaces is tried from
 * every space and scans to its end each time (quadratic on tens of thousands of spaces). The `e.V.` is
 * found first and the spaces before it read back by hand.
 */
export function association(text: string): string {
  return spacesBefore(text, ASSOCIATION);
}

/** Replaces the spaces (U+0020 only) directly before each match of the global literal `re` by one no-break space. */
function spacesBefore(text: string, re: RegExp): string {
  let out = '';
  let from = 0;
  re.lastIndex = 0;
  for (let m = re.exec(text); m; m = re.exec(text)) {
    let start = m.index;
    while (start > from && text.charCodeAt(start - 1) === 0x20) start--;
    if (start < m.index) {
      out += text.slice(from, start) + NBSP;
      from = m.index;
    }
  }
  re.lastIndex = 0;
  return from === 0 ? text : out + text.slice(from);
}

export const copyright = (text: string): string => text.replace(/©[ ]+(?=\d)/g, `©${NBSP}`);

/** A typed run of spaces and no-break spaces between § or ¶ (doubled for several) and a number (any script) becomes a no-break space; `§5` is left as typed. */
export const section = (text: string): string =>
  text.replace(/([§¶]{1,2})[ \u00a0]+(?=\p{N})/gu, `$1${NBSP}`);

/**
 * A lone `&`, `+` or `=` with a single typed space or no-break space on each side, a letter before
 * the first and a letter after the second, gets no-break spaces on both sides. `2 + 2`, `x = 5`,
 * `a == b`, `R&D` and `x+y` do not match. Matches do not overlap on the letter between two operators
 * because only the letter before and the one after (a lookahead) are read.
 */
export const operator = (text: string): string =>
  text.replace(/(\p{L})[ \u00a0]([&+=])[ \u00a0](?=\p{L})/gu, `$1${NBSP}$2${NBSP}`);

/**
 * The pack's orphan pattern without its leading `(?<![\p{L}\p{N}])`, when it has exactly that one
 * (every pack's does), as a forward regex that opens with the letter class; `null` for a pattern of
 * any other shape, which runs as it is. Derived from the pack's own regex, never written twice.
 */
const FREE_BEFORE = '(?<![\\p{L}\\p{N}])';
const forwardOrphans = new WeakMap<RegExp, RegExp | null>();

function forward(pattern: RegExp): RegExp | null {
  const known = forwardOrphans.get(pattern);
  if (known !== undefined) return known;
  const rest = pattern.source.startsWith(FREE_BEFORE)
    ? pattern.source.slice(FREE_BEFORE.length)
    : null;
  const made =
    rest !== null && !rest.includes('(?<') && !rest.includes('|') && pattern.flags === 'gu'
      ? new RegExp(rest, pattern.flags)
      : null;
  forwardOrphans.set(pattern, made);
  return made;
}

/** One-letter words a language must not strand at the end of a line. */
export const orphans = (text: string, lang: Lang): string => {
  const pattern = ORPHANS[lang];
  if (!pattern) return text;
  const fast = forward(pattern);
  return fast
    ? replaceBehind(text, fast, freeBefore, (m) => `${m[1] ?? ''}${NBSP}`)
    : text.replace(pattern, `$1${NBSP}`);
};

const escapeRegex = (text: string) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

const capitalised = (word: string) => word.charAt(0).toUpperCase() + word.slice(1);

/** The pattern of a language's short words, built once: the word in either case, its spaces, and a word after it. */
const shortWordPatterns = new Map<Lang, RegExp | null>();

function shortWordPattern(lang: Lang): RegExp | null {
  const cached = shortWordPatterns.get(lang);
  if (cached !== undefined) return cached;
  const list = SHORT_WORDS[lang];
  const made = list?.length
    ? new RegExp(
        `(?:${list
          .flatMap((word) => [word, capitalised(word)])
          .map(escapeRegex)
          .join('|')})(?![\\p{L}\\p{N}])[ ]+(?=[\\p{L}\\p{N}])`,
        'gu',
      )
    : null;
  shortWordPatterns.set(lang, made);
  return made;
}

/**
 * A short word (two or three letters) travels with the word after it: `to~the shop`. For titles and
 * headings, which is why the rule is off by default — the sources read say such a word may stay at a
 * line end in body text. Never more than two words in a row: a short word that follows one this rule
 * has just bound stays free, so a chain cannot grow into a whole line.
 */
export function shortWords(text: string, lang: Lang): string {
  const pattern = shortWordPattern(lang);
  if (!pattern) return text;
  pattern.lastIndex = 0;
  let out = '';
  let from = 0;
  let lastEnd = -1;
  for (let m = pattern.exec(text); m; m = pattern.exec(text)) {
    const at = m.index;
    // A word that already follows a no-break space stays free: that is how the chain is kept to two
    // words whether the space was bound on this pass (`lastEnd`) or on an earlier one (the character).
    if (!freeBefore(text, at) || at === lastEnd || before(text, at) === NBSP) {
      pattern.lastIndex = at + 1;
      continue;
    }
    out += text.slice(from, at) + m[0].replace(/[ ]+$/, NBSP);
    from = at + m[0].length;
    lastEnd = from;
  }
  pattern.lastIndex = 0;
  return from === 0 ? text : out + text.slice(from);
}

/**
 * The three abbreviation patterns of a language, each as the forward regex that stays once the
 * leading `(?<![\p{L}\p{N}])` is taken off (it is checked by hand, see scan.ts).
 */
const abbreviationPatterns = new Map<
  Lang,
  { together: RegExp | null; bind: RegExp | null; page: RegExp | null }
>();

function patternsFor(lang: Lang) {
  const cached = abbreviationPatterns.get(lang);
  if (cached) return cached;
  const list: Abbreviations = ABBREVIATIONS[lang] ?? {};
  const names = (words: readonly string[] | undefined) =>
    words?.length ? words.map(escapeRegex).join('|') : null;
  const together = list.together?.length
    ? new RegExp(
        `(?:${list.together.map((a) => escapeRegex(a).replace(/ /g, '[ ]+')).join('|')})(?![\\p{L}])`,
        'gu',
      )
    : null;
  const bind = names(list.bind);
  const page = names(list.page);
  const made = {
    together,
    bind: bind ? new RegExp(`(?:${bind})\\.[ ]+(?=[\\p{L}\\p{N}])`, 'gu') : null,
    page: page ? new RegExp(`(?:${page})\\.[ ]+(?=\\d)`, 'gu') : null,
  };
  abbreviationPatterns.set(lang, made);
  return made;
}

/**
 * Whether `abbreviations` can change `text` in `lang`: a cheap test for the rule table. `bind` and
 * `page` patterns need a full stop; `together` ones need it only if every entry has one (read from
 * the pack, not assumed), otherwise the rule always runs. No pattern at all: it never changes anything.
 */
export const mayAbbreviate = (text: string, lang: Lang): boolean => {
  const { together, bind, page } = patternsFor(lang);
  if (!together && !bind && !page) return false;
  const list: Abbreviations = ABBREVIATIONS[lang] ?? {};
  return !together || (list.together ?? []).every((a) => a.includes('.'))
    ? text.includes('.')
    : true;
};

/** The parts of an abbreviation stay together, and a short one stays with what it introduces. */
export const abbreviations = (text: string, lang: Lang): string => {
  const { together, bind, page } = patternsFor(lang);
  let out = text;
  if (together) out = replaceBehind(out, together, freeBefore, (m) => m[0].replace(/[ ]+/g, NBSP));
  if (bind) out = replaceBehind(out, bind, freeBefore, (m) => m[0].replace(/[ ]+$/, NBSP));
  if (page) out = replaceBehind(out, page, freeBefore, (m) => m[0].replace(/[ ]+$/, NBSP));
  return out;
};

/**
 * The marks `unitSymbol` spaces in a language: `%` with `percentSpace`, `€` with `currencySpace`.
 * The euro sign comes from the currency table (currency.ts), the one place a sign is named.
 */
const BOTH_MARKS = new RegExp(`[${PERCENT}${EURO}]`, 'g');
const PERCENT_ONLY = new RegExp(PERCENT, 'g');
const EURO_ONLY = new RegExp(EURO, 'g');

const unitMarks = (lang: Lang): RegExp | undefined => {
  const { percentSpace, currencySpace } = PACK[lang];
  if (percentSpace) return currencySpace ? BOTH_MARKS : PERCENT_ONLY;
  return currencySpace ? EURO_ONLY : undefined;
};

/**
 * A percent sign (in a language with `percentSpace`: German, French) or a euro sign after the number
 * (with `currencySpace`) stands apart from its number by a no-break space: 5 %, 49 €.
 */
export const unitSymbol = (text: string, lang: Lang): string => {
  const marks = unitMarks(lang);
  return marks
    ? // Was `(?<=\d)(?=[%€])`, tried at every position: the mark is found first, a digit before it read here.
      text.replace(marks, (mark, offset: number, whole: string) => {
        const prev = whole.charCodeAt(offset - 1);
        return prev >= 0x30 && prev <= 0x39 ? `${NBSP}${mark}` : mark;
      })
    : text;
};

/** An arrow stays with the word it points from or to: «Read more →», «← Back». */
const ARROW_RIGHT = /→/g;

/** Was `/\u0020+(?=→)/g` (quadratic on a long run of spaces, see `association`) and `/←\u0020+/g`. */
export const arrowSpace = (text: string): string =>
  spacesBefore(text, ARROW_RIGHT).replace(/←\u0020+/g, `←${NBSP}`);
