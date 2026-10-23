/** A run of text that stayed, left, or arrived. */
export type DiffRun = {
    kind: 'same' | 'del' | 'ins';
    text: string;
};
/**
 * A word-level diff of `before` against `after`: words, single spaces (a no-break
 * space is a different token from a space) and single punctuation marks are
 * compared, with the common start and end skipped first.
 *
 * The middle is aligned by a longest-common-subsequence table (a deletion is preferred to an
 * insertion where both are as good, so `" - "` against `" — "` is one change, not two). The
 * table is quadratic, so above `LIMIT` cells (about two thousand tokens on each side: one paragraph
 * of twenty kilobytes that a rule changed at both ends) the middle is aligned change by change by the
 * same table on a window around each change (`windowed`), which costs the changes, not the text.
 */
export declare function diff(before: string, after: string): DiffRun[];
