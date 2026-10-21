import { PACK } from './lang';
import { ABBREVIATIONS, type Abbreviations, ORPHANS } from './profiles';
import { before, isLetterOrNumber, replaceBehind } from './scan';
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

/**
 * A number stays with a short word after it (a unit, a month): 21 September, 15 people, 5 %.
 * A longer word is left free, so a chain of bound words never outgrows a narrow column.
 */
export const numberUnit = (text: string): string =>
  text.replace(/(\d)[ ]+(?=[\p{L}]{1,9}(?![\p{L}])|[%°€$£])/gu, `$1${NBSP}`);

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

/** The marks `unitSymbol` spaces in a language: `%` with `percentSpace`, `€` with `currencySpace`. */
const unitMarks = (lang: Lang): RegExp | undefined => {
  const { percentSpace, currencySpace } = PACK[lang];
  if (percentSpace) return currencySpace ? /[%€]/g : /%/g;
  return currencySpace ? /€/g : undefined;
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
