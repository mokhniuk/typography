import { type TextOptions, typesetText } from '../../src/index.ts';
import { toEdits } from '../figma/edits.ts';
import { mapRuns } from './runs.ts';
import { applyRuns, hasMixedStyle, readRuns, type TextLike } from './styles.ts';

/** What happened to one layer. `unrestored` is the one outcome that can leave a layer half changed. */
export type LayerResult =
  | { kind: 'unchanged' }
  | { kind: 'changed'; spots: number }
  | { kind: 'skipped'; reason: 'styles' | 'text' }
  | { kind: 'unrestored' };

/**
 * Typesets a layer's text and writes it back with its styles kept. Penpot's `characters` setter gives every
 * character the first one's style, so for a layer with mixed styles the runs are read first, moved through the
 * engine's edits and set again over the new text. Any failure puts the original text and runs back.
 */
export function formatLayer(text: TextLike, options: TextOptions): LayerResult {
  const before = text.characters;
  const after = typesetText(before, options);
  if (after === before) return { kind: 'unchanged' };
  const edits = toEdits(before, after);
  const spots = edits.length;

  if (!hasMixedStyle(text)) {
    try {
      text.characters = after;
      return { kind: 'changed', spots };
    } catch {
      return { kind: 'skipped', reason: 'text' };
    }
  }

  let original: ReturnType<typeof readRuns>;
  let runs: ReturnType<typeof readRuns>;
  try {
    original = readRuns(text);
    runs = mapRuns(original, edits);
  } catch {
    return { kind: 'skipped', reason: 'styles' };
  }

  let reason: 'styles' | 'text' = 'text';
  try {
    text.characters = after;
    reason = 'styles';
    applyRuns(text, runs);
    if (text.characters !== after) throw new Error('the text did not read back as set');
    return { kind: 'changed', spots };
  } catch {
    // A setter that threw before it wrote leaves the layer as it was; anything else is put back.
    if (reason === 'text' && text.characters === before) return { kind: 'skipped', reason };
    try {
      text.characters = before;
      applyRuns(text, original);
      if (text.characters !== before) throw new Error('the text did not read back as it was');
      return { kind: 'skipped', reason };
    } catch {
      return { kind: 'unrestored' };
    }
  }
}
