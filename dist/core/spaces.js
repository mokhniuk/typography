import { CURRENCY_CODES, CURRENCY_SIGNS, CURRENCY_WORDS, EURO, PERCENT } from './currency.js';
import { before, isLetter, isLetterOrNumber, replaceBehind } from './scan.js';
import { NBSP } from './types.js';
/** `(?<![\p{L}\p{N}])` before `index`: no letter or number stands directly before it. */
const freeBefore = (text, index) => !isLetterOrNumber(before(text, index));
const UPPER = /\p{Lu}/u;
export const collapse = (text) => text.replace(/ {2,}/g, ' ');
const TITLE = /(Prof|Dr|Mr|Mrs|Ms|Mx|St|Hon|Rev|Sr|Jr)\.[ ]+(?=\p{L})/gu;
/**
 * Titles stay with the name: Prof. Dr. Oksana. Written as `(?<![\p{L}\p{N}])` + TITLE, with the
 * lookbehind checked by hand after the title is found (see scan.ts).
 */
export const titles = (text) => replaceBehind(text, TITLE, freeBefore, (m) => `${m[1]}.${NBSP}`);
const INITIAL_DOT = /\.[ ]+(?=\p{Lu})/gu;
/**
 * An initial stays with the surname: K. Słoboda. Written as `(?<![\p{L}\p{N}])(\p{Lu})\.[ ]+(?=\p{Lu})`:
 * the search is for the full stop and the spaces, and the capital before the stop and what stands
 * before the capital are read by hand (see scan.ts). Each match starts at its own stop, so two never overlap.
 */
export const initials = (text) => replaceBehind(text, INITIAL_DOT, (whole, at) => {
    const capital = before(whole, at);
    return UPPER.test(capital) && freeBefore(whole, at - capital.length);
}, () => `.${NBSP}`);
/**
 * What may follow the spaces after a number for them to become a no-break space: a word of one to
 * nine letters, a percent sign, a degree sign or a currency sign. Tried where the spaces end (sticky).
 */
const UNIT_AFTER = new RegExp(`[\\p{L}]{1,9}(?![\\p{L}])|[${PERCENT}°${CURRENCY_SIGNS}]`, 'yu');
/** The longest currency name read back from before an amount (`lei`, `USD`, `zł`). */
const SIGN_LETTERS = 3;
const CURRENCY_NAMES = new Set([...CURRENCY_CODES, ...CURRENCY_WORDS]);
/**
 * Whether a currency sign, code or letter name ends at `end`: `€`, `USD`, `zł`. A name of letters
 * must stand free (no letter or digit before it), and is read back by at most `SIGN_LETTERS`
 * characters, so a long word before an amount costs a fixed number of steps, not its length.
 */
function currencyEndsAt(text, end) {
    // Nothing stands before the start of the text; `includes('')` is true, so this must be asked first.
    if (end <= 0)
        return false;
    if (CURRENCY_SIGNS.includes(text.charAt(end - 1)))
        return true;
    let start = end;
    while (start > 0 && end - start < SIGN_LETTERS && isLetter(text.charAt(start - 1)))
        start--;
    for (let from = start; from < end; from++) {
        if (CURRENCY_NAMES.has(text.slice(from, end)))
            return !isLetterOrNumber(before(text, from));
    }
    return false;
}
/**
 * The digit groups of a number written in threes (1 000 000), with nothing that would make the run
 * something else: no leading zero (a phone number or a code: 09 123 456), no digit, letter, sign or
 * separator directly before it, no digit group before it (+380 44 123 45 67), and no further digits
 * after it (555 123 4567). Tried where a run of digits starts (sticky), the only place it can match
 * once `groupsStandFree` is asked: a start inside a run has a digit before it.
 */
const GROUP_RUN = /[1-9]\d{0,2}(?:[ ]\d{3})+(?![\d\p{L}])(?![  ]\d)/uy;
const NOT_BEFORE_GROUPS = /[\d\p{L}+,.:/'’‑-]/u;
const isSpace = (code) => code === 0x20 || code === 0xa0;
function groupsStandFree(text, at) {
    const prev = before(text, at);
    if (prev === '')
        return true;
    if (NOT_BEFORE_GROUPS.test(prev))
        return false;
    if (!isSpace(text.charCodeAt(at - 1)))
        return true;
    let start = at;
    while (start > 0 && isSpace(text.charCodeAt(start - 1)))
        start--;
    return !/[\d)]/.test(before(text, start));
}
const DIGITS = /\d+/g;
/**
 * A number stays with a short word after it (a unit, a month): 21 September, 15 people, 5 %.
 * A longer word is left free, so a chain of bound words never outgrows a narrow column. Money is
 * kept whole as well: the sign or code before the amount (`USD 5 000`, `€ 49.99`) and the digit
 * groups of an amount written in threes (`1 000 грн`, what the opt-in `number.group` does to a bare
 * number, so the two agree on an amount that is already grouped). The engine never moves or adds a sign.
 *
 * One scan over the runs of digits; at each run three things are read, in the order of the text:
 * the typed spaces before it and whether a currency sign or code ends before them (`USD 5`, `€ 49.99`:
 * the digit is found first and the spaces read back by hand, since a forward `[ ]+` would be tried from
 * every space of a run and scan to its end each time, see `association`); whether the run opens a
 * number grouped by hand; and the spaces after the number, with what follows them (`UNIT_AFTER`). Each
 * reads the text as typed: none of the three can change what another one reads, since each binds its
 * own spaces (after a sign, between digit groups, after the last digit) and a space or a no-break
 * space before a name or a group counts the same, which is what let the three passes this was become one.
 */
export function numberUnit(text) {
    let out = '';
    let from = 0;
    DIGITS.lastIndex = 0;
    for (let m = DIGITS.exec(text); m; m = DIGITS.exec(text)) {
        const start = m.index;
        let end = start + m[0].length;
        // The sign or code before the amount.
        let sign = start;
        while (sign > 0 && text.charCodeAt(sign - 1) === 0x20)
            sign--;
        if (sign < start && currencyEndsAt(text, sign)) {
            out += text.slice(from, sign) + NBSP;
            from = start;
        }
        // The digit groups of a number written in threes.
        GROUP_RUN.lastIndex = start;
        const group = GROUP_RUN.exec(text);
        if (group && groupsStandFree(text, start)) {
            out += text.slice(from, start) + group[0].replaceAll(' ', NBSP);
            end = start + group[0].length;
            from = end;
            DIGITS.lastIndex = end;
        }
        // The short word or unit after the number.
        let after = end;
        while (after < text.length && text.charCodeAt(after) === 0x20)
            after++;
        if (after > end) {
            UNIT_AFTER.lastIndex = after;
            if (UNIT_AFTER.test(text)) {
                out += text.slice(from, end) + NBSP;
                from = after;
            }
        }
    }
    DIGITS.lastIndex = 0;
    return from === 0 ? text : out + text.slice(from);
}
const ASSOCIATION = /e\.V\./g;
/**
 * No-break space before e.V. Was `text.replace(/[ ]+(?=e\.V\.)/g, NBSP)`, whose run of spaces is tried from
 * every space and scans to its end each time (quadratic on tens of thousands of spaces). The `e.V.` is
 * found first and the spaces before it read back by hand.
 */
export function association(text) {
    return spacesBefore(text, ASSOCIATION);
}
/** Replaces the spaces (U+0020 only) directly before each match of the global literal `re` by one no-break space. */
function spacesBefore(text, re) {
    let out = '';
    let from = 0;
    re.lastIndex = 0;
    for (let m = re.exec(text); m; m = re.exec(text)) {
        let start = m.index;
        while (start > from && text.charCodeAt(start - 1) === 0x20)
            start--;
        if (start < m.index) {
            out += text.slice(from, start) + NBSP;
            from = m.index;
        }
    }
    re.lastIndex = 0;
    return from === 0 ? text : out + text.slice(from);
}
export const copyright = (text) => text.replace(/©[ ]+(?=\d)/g, `©${NBSP}`);
/** A typed run of spaces and no-break spaces between § or ¶ (doubled for several) and a number (any script) becomes a no-break space; `§5` is left as typed. */
export const section = (text) => text.replace(/([§¶]{1,2})[ \u00a0]+(?=\p{N})/gu, `$1${NBSP}`);
/**
 * A lone `&`, `+` or `=`, or the `’n’` of rock ’n’ roll (an "and" with its letters dropped, set curly
 * by the quote rule before this one runs), with a single typed space or no-break space on each side,
 * a letter before the first and a letter after the second, gets no-break spaces on both sides.
 * `2 + 2`, `x = 5`, `a == b`, `R&D` and `x+y` do not match. Matches do not overlap on the letter
 * between two operators because only the letter before and the one after (a lookahead) are read.
 */
export const operator = (text) => text.replace(/(\p{L})[ \u00a0]([&+=]|’n’)[ \u00a0](?=\p{L})/gu, `$1${NBSP}$2${NBSP}`);
/**
 * The pack's orphan pattern without its leading `(?<![\p{L}\p{N}])`, when it has exactly that one
 * (every pack's does), as a forward regex that opens with the letter class; `null` for a pattern of
 * any other shape, which runs as it is. Derived from the pack's own regex, never written twice.
 */
const FREE_BEFORE = '(?<![\\p{L}\\p{N}])';
const forwardOrphans = new WeakMap();
function forward(pattern) {
    const known = forwardOrphans.get(pattern);
    if (known !== undefined)
        return known;
    const rest = pattern.source.startsWith(FREE_BEFORE)
        ? pattern.source.slice(FREE_BEFORE.length)
        : null;
    const made = rest !== null && !rest.includes('(?<') && !rest.includes('|') && pattern.flags === 'gu'
        ? new RegExp(rest, pattern.flags)
        : null;
    forwardOrphans.set(pattern, made);
    return made;
}
/** One-letter words a language must not strand at the end of a line. */
export const orphans = (text, pack) => {
    const pattern = pack.orphans;
    if (!pattern)
        return text;
    const fast = forward(pattern);
    return fast
        ? replaceBehind(text, fast, freeBefore, (m) => `${m[1] ?? ''}${NBSP}`)
        : text.replace(pattern, `$1${NBSP}`);
};
const escapeRegex = (text) => text.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const capitalised = (word) => word.charAt(0).toUpperCase() + word.slice(1);
/** The pattern of a language's short words, built once: the word in either case, its spaces, and a word after it. */
/**
 * Marks that may stand before the first letter of the next word: a quotation mark of any language
 * (German turns its pairs, so the closing shapes are openers there too), the apostrophe of ’90s, a
 * bracket, the Spanish opening marks. `to~“the”`, `the~’90s`, `of~(two)`.
 */
const OPENS_WORD = '«»„“”‚‘’‹›"\'(\\[¿¡';
/** Keyed by the pack's list, so a pack (built in or not) compiles its pattern once. */
const shortWordPatterns = new WeakMap();
function shortWordPattern(pack) {
    const list = pack.shortWords;
    if (!list?.length)
        return null;
    const cached = shortWordPatterns.get(list);
    if (cached)
        return cached;
    const made = new RegExp(`(?:${list
        .flatMap((word) => [word, capitalised(word)])
        .map(escapeRegex)
        .join('|')})(?![\\p{L}\\p{N}])[ ]+(?=[\\p{L}\\p{N}${OPENS_WORD}])`, 'gu');
    shortWordPatterns.set(list, made);
    return made;
}
/**
 * A short word (two or three letters) travels with the word after it: `to~the shop`. On by default
 * since 0.14.0 (it was opt-in, for titles): the sources read say such a word MAY stay at a line end in
 * body text and must not in a title, and this engine's default register is display text, where a line
 * ending on "to" reads as a stumble; `disable: ['space.short-word']` restores the body-text convention.
 * Never more than two words in a row: a short word that follows one this rule has just bound stays
 * free, so a chain cannot grow into a whole line.
 */
export function shortWords(text, pack) {
    const pattern = shortWordPattern(pack);
    if (!pattern)
        return text;
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
/** Keyed by the pack's lists, so a pack (built in or not) compiles its patterns once. */
const abbreviationPatterns = new WeakMap();
const NO_ABBREVIATIONS = {
    together: null,
    bind: null,
    page: null,
    bare: null,
};
function patternsFor(pack) {
    const list = pack.abbreviations;
    if (!list)
        return NO_ABBREVIATIONS;
    const cached = abbreviationPatterns.get(list);
    if (cached)
        return cached;
    const names = (words) => words?.length ? words.map(escapeRegex).join('|') : null;
    const together = list.together?.length
        ? new RegExp(`(?:${list.together.map((a) => escapeRegex(a).replace(/ /g, '[ ]+')).join('|')})(?![\\p{L}])`, 'gu')
        : null;
    const bind = names(list.bind);
    const page = names(list.page);
    const bare = names(list.bare);
    const made = {
        together,
        bind: bind ? new RegExp(`(?:${bind})\\.[ ]+(?=[\\p{L}\\p{N}])`, 'gu') : null,
        page: page ? new RegExp(`(?:${page})\\.[ ]+(?=\\d)`, 'gu') : null,
        // No full stop: the spaces after the name end it; the letter or digit before it is read by hand.
        bare: bare ? new RegExp(`(?:${bare})[ ]+(?=\\d)`, 'gu') : null,
    };
    abbreviationPatterns.set(list, made);
    return made;
}
const DIGIT = /\d/;
/**
 * Whether `abbreviations` can change `text` in `lang`: a cheap test for the rule table. `bind` and
 * `page` patterns need a full stop; `together` ones need it only if every entry has one (read from
 * the pack, not assumed), otherwise the rule always runs; `bare` ones need a digit. No pattern at
 * all: it never changes anything.
 */
export const mayAbbreviate = (text, pack) => {
    const { together, bind, page, bare } = patternsFor(pack);
    if (together && !(pack.abbreviations?.together ?? []).every((a) => a.includes('.')))
        return true;
    if ((together || bind || page) && text.includes('.'))
        return true;
    return bare !== null && DIGIT.test(text);
};
/**
 * The parts of an abbreviation stay together, and a short one stays with what it introduces: with a
 * full stop (Nr. 5, ul. Marszałkowska, S. 12), or without one before a number (klo 17, nr 5).
 */
export const abbreviations = (text, pack) => {
    const { together, bind, page, bare } = patternsFor(pack);
    let out = text;
    if (together)
        out = replaceBehind(out, together, freeBefore, (m) => m[0].replace(/[ ]+/g, NBSP));
    if (bind)
        out = replaceBehind(out, bind, freeBefore, (m) => m[0].replace(/[ ]+$/, NBSP));
    if (page)
        out = replaceBehind(out, page, freeBefore, (m) => m[0].replace(/[ ]+$/, NBSP));
    if (bare)
        out = replaceBehind(out, bare, freeBefore, (m) => m[0].replace(/[ ]+$/, NBSP));
    return out;
};
/**
 * The marks `unitSymbol` spaces in a language: `%` with `percentSpace`, `€` with `currencySpace`.
 * The euro sign comes from the currency table (currency.ts), the one place a sign is named.
 */
const BOTH_MARKS = new RegExp(`[${PERCENT}${EURO}]`, 'g');
const PERCENT_ONLY = new RegExp(PERCENT, 'g');
const EURO_ONLY = new RegExp(EURO, 'g');
const unitMarks = ({ percentSpace, currencySpace }) => {
    if (percentSpace)
        return currencySpace ? BOTH_MARKS : PERCENT_ONLY;
    return currencySpace ? EURO_ONLY : undefined;
};
/**
 * A percent sign (in a language with `percentSpace`: German, French) or a euro sign after the number
 * (with `currencySpace`) stands apart from its number by a no-break space: 5 %, 49 €.
 */
export const unitSymbol = (text, pack) => {
    const marks = unitMarks(pack);
    return marks
        ? // Was `(?<=\d)(?=[%€])`, tried at every position: the mark is found first, a digit before it read here.
            text.replace(marks, (mark, offset, whole) => {
                const prev = whole.charCodeAt(offset - 1);
                return prev >= 0x30 && prev <= 0x39 ? `${NBSP}${mark}` : mark;
            })
        : text;
};
/** An arrow stays with the word it points from or to: «Read more →», «← Back». */
const ARROW_RIGHT = /→/g;
/** Was `/\u0020+(?=→)/g` (quadratic on a long run of spaces, see `association`) and `/←\u0020+/g`. */
export const arrowSpace = (text) => spacesBefore(text, ARROW_RIGHT).replace(/←\u0020+/g, `←${NBSP}`);
