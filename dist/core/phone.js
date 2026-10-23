/**
 * Phone numbers, for the opt-in rule `phone.bind`: a number is never reformatted, only kept whole.
 * The groups of an international number are joined with no-break spaces and the hyphens inside it
 * with U+2011 (a hyphen that does not break), so a line never ends in the middle of a number.
 *
 * Only a number written as an international one is touched: it opens with `+` or `00` directly
 * followed by a digit, and holds between `MIN_DIGITS` and `MAX_DIGITS` digits (E.164 allows fifteen).
 * A local number (555-1234, 044-123-45-67) is left as it is; the engine already refuses to read its
 * hyphens as a range (see `dash.range`). A run with more digits than a phone number can have is left
 * alone whole, so a number that stands against a date or another figure is not joined to it.
 */
import { before, isLetterOrNumber } from './scan.js';
import { NBSP } from './types.js';
/** U+2011, the non-breaking hyphen. */
export const NB_HYPHEN = '‑';
/** A run holds at least this many digits to be a phone number and not a figure with a sign. */
export const MIN_DIGITS = 7;
/** The most digits an international number has (ITU-T E.164). */
export const MAX_DIGITS = 15;
const isGap = (code) => code === 0x20 || code === 0x00a0;
const isDigit = (code) => code >= 0x30 && code <= 0x39;
/** Characters that may stand inside a number without parting its groups. */
const isJoin = (code) => code === 0x2d || code === 0x2011 || code === 0x28 || code === 0x29;
const START = /(?:\+|00)\d/g;
const TEL = /tel:$/i;
/**
 * Whether a number may open at `at`: nothing of a word or a figure stands before it, it is not the
 * `00` inside a longer code, it does not follow the groups of an identifier (an IBAN: DE89 3704 0044
 * 0532), and it is not the number of a `tel:` link, which belongs to the markup and not to the prose.
 */
function opens(text, at) {
    const prev = before(text, at);
    if (prev === '')
        return true;
    if (isLetterOrNumber(prev) || prev === '-' || prev === NB_HYPHEN || prev === '.')
        return false;
    if (TEL.test(text.slice(Math.max(0, at - 4), at)))
        return false;
    if (!isGap(text.charCodeAt(at - 1)))
        return true;
    let start = at;
    while (start > 0 && isGap(text.charCodeAt(start - 1)))
        start--;
    return !/[\d)]/.test(before(text, start));
}
/**
 * Where the run whose digits start at `at` ends: after its last digit. A run of spaces parts two
 * groups only when digits or a bracket follow it, so the number does not reach into the sentence
 * after it.
 */
function runEnd(text, at) {
    let i = at;
    let lastDigit = at - 1;
    while (i < text.length) {
        const code = text.charCodeAt(i);
        if (isDigit(code)) {
            lastDigit = i;
            i++;
        }
        else if (isJoin(code)) {
            i++;
        }
        else if (isGap(code)) {
            let next = i;
            while (next < text.length && isGap(text.charCodeAt(next)))
                next++;
            const after = text.charCodeAt(next);
            if (!(isDigit(after) || after === 0x28))
                break;
            i = next;
        }
        else
            break;
    }
    return lastDigit + 1;
}
const digitsIn = (run) => {
    let n = 0;
    for (let i = 0; i < run.length; i++)
        if (isDigit(run.charCodeAt(i)))
            n++;
    return n;
};
const GAPS = /[  ]+/g;
/** The groups of an international phone number, joined so the number cannot break. */
export function bindPhones(text) {
    let out = '';
    let from = 0;
    START.lastIndex = 0;
    for (let m = START.exec(text); m; m = START.exec(text)) {
        const at = m.index;
        if (at < from || !opens(text, at))
            continue;
        const end = runEnd(text, at + (m[0] ?? '').length - 1);
        const run = text.slice(at, end);
        const digits = digitsIn(run);
        if (digits < MIN_DIGITS || digits > MAX_DIGITS)
            continue;
        out += text.slice(from, at) + run.replace(GAPS, NBSP).replace(/-/g, NB_HYPHEN);
        from = end;
        START.lastIndex = end;
    }
    START.lastIndex = 0;
    return from === 0 ? text : out + text.slice(from);
}
