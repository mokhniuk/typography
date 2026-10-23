import { diff, type TextOptions, typesetText } from '../../src/index.ts';

/** Replace `before[start, end)` with `text`: `start === end` is an insertion, an empty `text` a deletion. */
export type Edit = { start: number; end: number; text: string };

/** The two calls of a Figma text node that change characters and leave every other range's style alone. */
export type TextTarget = {
  insertCharacters(start: number, text: string, useStyle?: 'BEFORE' | 'AFTER'): void;
  deleteCharacters(start: number, end: number): void;
};

/**
 * The edits that turn `before` into `after`, last first, so applying one never moves the offsets of the
 * next. They come from the word-level `diff` the engine already exports.
 */
export function toEdits(before: string, after: string): Edit[] {
  const edits: Edit[] = [];
  let pos = 0;
  let open: Edit | null = null;
  const flush = () => {
    if (open) edits.push(open);
    open = null;
  };
  for (const run of diff(before, after)) {
    if (run.kind === 'same') {
      flush();
      pos += run.text.length;
    } else if (run.kind === 'del') {
      open ??= { start: pos, end: pos, text: '' };
      pos += run.text.length;
      open.end = pos;
    } else {
      open ??= { start: pos, end: pos, text: '' };
      open.text += run.text;
    }
  }
  flush();
  return edits.reverse();
}

/**
 * Applies edits made by `toEdits`, in order. New characters are inserted first, taking the style of the
 * last character they replace (or of the one before an insertion), and the old ones are deleted after;
 * assigning the node's whole `characters` string would flatten every mixed style.
 */
export function applyEdits(node: TextTarget, edits: readonly Edit[]): void {
  for (const { start, end, text } of edits) {
    if (text) {
      if (end > start) node.insertCharacters(end, text, 'BEFORE');
      else node.insertCharacters(start, text, start > 0 ? 'BEFORE' : 'AFTER');
    }
    if (end > start) node.deleteCharacters(start, end);
  }
}

/**
 * Sets the text of a node in place and returns how many spots changed (one per edit). Paragraph breaks
 * (`\n`) and the node's other characters are read by `typesetText`, which keeps the line count.
 */
export function formatText(
  node: TextTarget & { readonly characters: string },
  options: TextOptions,
): number {
  const before = node.characters;
  const edits = toEdits(before, typesetText(before, options));
  applyEdits(node, edits);
  return edits.length;
}
