/** A run of text that stayed, left, or arrived. */
export type DiffRun = { kind: 'same' | 'del' | 'ins'; text: string };

const tokenize = (text: string): string[] => text.match(/[\p{L}\p{N}]+|\s|[^\p{L}\p{N}\s]/gu) ?? [];

/** Above this many table cells the middle is shown as one deletion and one insertion. */
const LIMIT = 4_000_000;

/**
 * A word-level diff of `before` against `after`: words, single spaces (a no-break
 * space is a different token from a space) and single punctuation marks are
 * compared, with the common start and end skipped first.
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
  if (midA.length * midB.length > LIMIT) {
    push('del', midA.join(''));
    push('ins', midB.join(''));
  } else {
    // Longest common subsequence of the middle.
    const w = midB.length + 1;
    const table = new Uint32Array((midA.length + 1) * w);
    for (let i = midA.length - 1; i >= 0; i--) {
      for (let j = midB.length - 1; j >= 0; j--) {
        table[i * w + j] =
          midA[i] === midB[j]
            ? (table[(i + 1) * w + j + 1] ?? 0) + 1
            : Math.max(table[(i + 1) * w + j] ?? 0, table[i * w + j + 1] ?? 0);
      }
    }
    let i = 0;
    let j = 0;
    while (i < midA.length || j < midB.length) {
      if (i < midA.length && j < midB.length && midA[i] === midB[j]) {
        push('same', midA[i] ?? '');
        i++;
        j++;
      } else if (
        j >= midB.length ||
        (i < midA.length && (table[(i + 1) * w + j] ?? 0) >= (table[i * w + j + 1] ?? 0))
      ) {
        push('del', midA[i] ?? '');
        i++;
      } else {
        push('ins', midB[j] ?? '');
        j++;
      }
    }
  }
  push('same', a.slice(a.length - end).join(''));
  return out;
}
