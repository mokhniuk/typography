/** A run of digits is grouped only when it has at least this many (so 2026 and 9999 stay whole). */
export const GROUP_MIN_DIGITS = 5;
const DIGITS = /\d+/g;
const SPACE = /[    ]/;
const SEPARATOR = /[.,]/;
/** Whether the run at `[start, end)` of `text` is a bare integer that may be grouped. */
function groupable(text, start, end, decimal) {
    if (end - start < GROUP_MIN_DIGITS)
        return false;
    // A leading zero is a code or an identifier (007), not an amount.
    if (text[start] === '0')
        return false;
    const prev = text.charAt(start - 1);
    const before = text.charAt(start - 2);
    const next = text.charAt(end);
    const after = text.charAt(end + 1);
    const digit = /\d/;
    // Glued to a letter, an underscore, a sign or a marker: v1000000, ID123456, 0x1F4A2B, +380..., #123456, &#12345;
    if (/[\p{L}_+#\uE003]/u.test(prev) || /[\p{L}_\uE003]/u.test(next))
        return false;
    // After a separator: a fraction, a version, or a number already grouped (1,000000).
    if (SEPARATOR.test(prev) || /['’‘]/.test(prev))
        return false;
    // After a hyphen that joins it to a word or digit (ID-1234567, 044-1234567); a lone minus is fine.
    if (prev === '-' && /[\p{L}\p{N})]/u.test(before))
        return false;
    // After a digit and a space (1 12345, +49 12345678), or a closing bracket (a phone number).
    if (SPACE.test(prev) && /[\d)]/.test(before))
        return false;
    // After a colon or slash that joins it to a digit (12345/67890, 10:12345).
    if (/[:/]/.test(prev) && digit.test(before))
        return false;
    if (prev === ')')
        return false;
    // Before a hyphen, colon or slash and a digit (a phone number, a date, a time, a ratio).
    if (/[-:/]/.test(next) && digit.test(after))
        return false;
    // A five-digit postal code: before a capitalised word (75001 Paris) or after ZIP, PLZ and the like.
    if (end - start === 5 && /^[ \u00A0]+\p{Lu}/u.test(text.slice(end)))
        return false;
    if (/(?:^|[^\p{L}])(?:ZIP|zip|PLZ|CAP|CP|PIN)[ \u00A0]*$/u.test(text.slice(Math.max(0, start - 8), start)))
        return false;
    // Before a space and a three-digit group (a number grouped by hand), or a closing bracket and a digit.
    if (SPACE.test(next) && /^\d{3}(?!\d)/.test(text.slice(end + 1)))
        return false;
    if (next === ')' && /^\s?\d/.test(text.slice(end + 1)))
        return false;
    // Before a separator and digits: the decimal mark leaves a fraction to leave alone; any other
    // separator (1234,000 in English, a version number) means the number is written for another language.
    if (SEPARATOR.test(next) && digit.test(after)) {
        if (next !== decimal)
            return false;
        if (/^[.,]\d+[.,]\d/.test(text.slice(end)))
            return false;
    }
    return true;
}
/**
 * `run` (digits only) in threes from the right, joined by `separator`. Was
 * `run.replace(/\B(?=(?:\d{3})+$)/g, separator)`, whose lookahead reads to the end of the run at every
 * position (quadratic on a long run of digits).
 */
export function groupDigits(run, separator) {
    const head = run.length % 3 || 3;
    let out = run.slice(0, head);
    for (let i = head; i < run.length; i += 3)
        out += separator + run.slice(i, i + 3);
    return out;
}
/** Groups the digits of every integer of five or more digits in threes from the right, with the separator of the pack. */
export function groupNumbers(text, pack) {
    const format = pack.numbers;
    if (!format)
        return text;
    return text.replace(DIGITS, (run, offset, whole) => groupable(whole, offset, offset + run.length, format.decimal)
        ? groupDigits(run, format.group)
        : run);
}
