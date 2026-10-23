/** A run of text that stayed, left, or arrived. */
export type DiffRun = { kind: 'same' | 'del' | 'ins'; text: string };

const tokenize = (text: string): string[] => text.match(/[\p{L}\p{N}]+|\s|[^\p{L}\p{N}\s]/gu) ?? [];

/** Above this many table cells the middle is aligned window by window (`windowed`), not by one table. */
const LIMIT = 4_000_000;
/** How many tokens of both texts must agree again for a window to have reached past a change. */
const SETTLED = 2;
/** The first window, in tokens of each text; it doubles up to `REACH`. */
const FIRST_WINDOW = 8;
/** The widest window tried before the rest of both texts is given up as one deletion and one insertion. */
const REACH = 256;

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
export function diff(before: string, after: string): DiffRun[] {
  const a = tokenize(before);
  const b = tokenize(after);
  let start = 0;
  while (start < a.length && start < b.length && a[start] === b[start]) start++;
  let end = 0;
  while (
    end < a.length - start &&
    end < b.length - start &&
    a[a.length - 1 - end] === b[b.length - 1 - end]
  )
    end++;
  const midA = a.slice(start, a.length - end);
  const midB = b.slice(start, b.length - end);

  const out: DiffRun[] = [];
  const push = (kind: DiffRun['kind'], text: string) => {
    if (!text) return;
    const last = out[out.length - 1];
    if (last?.kind === kind) last.text += text;
    else out.push({ kind, text });
  };

  push('same', a.slice(0, start).join(''));
  const runs = midA.length * midB.length > LIMIT ? windowed(midA, midB) : table(midA, midB);
  for (const run of runs) push(run.kind, run.tokens.join(''));
  push('same', a.slice(a.length - end).join(''));
  return out;
}

type TokenRun = { kind: DiffRun['kind']; tokens: string[] };

/** Longest common subsequence of two token lists, by the full table, as runs of tokens. */
function table(a: readonly string[], b: readonly string[]): TokenRun[] {
  const w = b.length + 1;
  const cells = new Uint32Array((a.length + 1) * w);
  for (let i = a.length - 1; i >= 0; i--) {
    for (let j = b.length - 1; j >= 0; j--) {
      cells[i * w + j] =
        a[i] === b[j]
          ? (cells[(i + 1) * w + j + 1] ?? 0) + 1
          : Math.max(cells[(i + 1) * w + j] ?? 0, cells[i * w + j + 1] ?? 0);
    }
  }
  const runs: TokenRun[] = [];
  const add = (kind: DiffRun['kind'], token: string) => {
    const last = runs[runs.length - 1];
    if (last?.kind === kind) last.tokens.push(token);
    else runs.push({ kind, tokens: [token] });
  };
  let i = 0;
  let j = 0;
  while (i < a.length || j < b.length) {
    if (i < a.length && j < b.length && a[i] === b[j]) {
      add('same', a[i] ?? '');
      i++;
      j++;
    } else if (
      j >= b.length ||
      (i < a.length && (cells[(i + 1) * w + j] ?? 0) >= (cells[i * w + j + 1] ?? 0))
    ) {
      add('del', a[i] ?? '');
      i++;
    } else {
      add('ins', b[j] ?? '');
      j++;
    }
  }
  return runs;
}

/**
 * Aligns the middle change by change. Equal tokens are kept while they agree; at a difference, the
 * table is run on a window of both texts from there, doubling from `FIRST_WINDOW` tokens until its
 * alignment holds a run of `SETTLED` equal tokens (the change is over and both texts agree again) or
 * covers the rest of both texts. Everything up to and including that run is taken, and the walk goes
 * on after it. On the text a rule produces, where every change is local, this is what the full table
 * gives. A change that no window up to `REACH` tokens settles (no rule's output comes to that) gives
 * the rest of both texts as one deletion and one insertion.
 */
function windowed(a: readonly string[], b: readonly string[]): TokenRun[] {
  const n = a.length;
  const m = b.length;
  const out: TokenRun[] = [];
  const add = (run: TokenRun) => {
    const last = out[out.length - 1];
    if (last?.kind === run.kind) last.tokens.push(...run.tokens);
    else out.push({ kind: run.kind, tokens: [...run.tokens] });
  };
  let i = 0;
  let j = 0;
  while (i < n || j < m) {
    if (i < n && j < m && a[i] === b[j]) {
      add({ kind: 'same', tokens: [a[i] ?? ''] });
      i++;
      j++;
      continue;
    }
    let size = FIRST_WINDOW;
    for (;;) {
      const whole = i + size >= n && j + size >= m;
      const runs = table(a.slice(i, Math.min(n, i + size)), b.slice(j, Math.min(m, j + size)));
      let cut = runs.findIndex((run) => run.kind === 'same' && run.tokens.length >= SETTLED);
      if (cut < 0 && whole) cut = runs.length - 1;
      if (cut >= 0) {
        for (const run of runs.slice(0, cut + 1)) {
          add(run);
          if (run.kind !== 'ins') i += run.tokens.length;
          if (run.kind !== 'del') j += run.tokens.length;
        }
        break;
      }
      if (size >= REACH) {
        if (i < n) add({ kind: 'del', tokens: a.slice(i) });
        if (j < m) add({ kind: 'ins', tokens: b.slice(j) });
        i = n;
        j = m;
        break;
      }
      size *= 2;
    }
  }
  return out;
}
