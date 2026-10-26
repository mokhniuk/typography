import type { TextOptions } from '../../src/index.ts';
import { formatLayer } from './layer.ts';
import type { TextLike } from './styles.ts';

/** What of a Penpot shape the walk reads. */
export type Node = { type: string; hidden?: boolean; blocked?: boolean; children?: readonly Node[] };

/** What of `penpot.history` a run uses: everything between begin and finish is one Cmd+Z. */
export type History = { undoBlockBegin(): Symbol; undoBlockFinish(id: Symbol): void };

/** `unrestored` are the layers that may be half changed, so the caller can select them for the user. */
export type RunReport = { message: string; changed: boolean; unrestored: TextLike[] };

export const NOTHING_SELECTED = 'Select a text layer, or use Format page';

/** The text layers under `roots` (a root that is one counts), each once, without hidden or locked ones or what is under them. */
export function textLayers<N extends Node>(roots: readonly N[]): N[] {
  const found = new Set<N>();
  const visit = (node: N): void => {
    if (node.hidden || node.blocked) return;
    if (node.type === 'text') found.add(node);
    else for (const child of node.children ?? []) visit(child as N);
  };
  for (const root of roots) visit(root);
  return [...found];
}

const plural = (n: number, one: string, many: string): string => `${n} ${n === 1 ? one : many}`;

/** Typesets the layers inside one undo block and says what happened, in the sentences of the Figma toast. */
export function runLayers(layers: readonly TextLike[], options: TextOptions, history: History): RunReport {
  let spots = 0;
  let changed = 0;
  let skippedStyles = 0;
  let skippedText = 0;
  const unrestored: TextLike[] = [];
  const block = history.undoBlockBegin();
  try {
    for (const layer of layers) {
      let result: ReturnType<typeof formatLayer>;
      try {
        result = formatLayer(layer, options);
      } catch {
        result = { kind: 'skipped', reason: 'text' };
      }
      if (result.kind === 'changed') {
        changed++;
        spots += result.spots;
      } else if (result.kind === 'skipped') {
        if (result.reason === 'styles') skippedStyles++;
        else skippedText++;
      } else if (result.kind === 'unrestored') unrestored.push(layer);
    }
  } finally {
    history.undoBlockFinish(block);
  }
  const left = skippedStyles + skippedText + unrestored.length;
  const head =
    spots === 0
      ? `Nothing to fix in ${plural(layers.length - left, 'layer', 'layers')}`
      : `Fixed ${plural(spots, 'spot', 'spots')} in ${plural(changed, 'layer', 'layers')}`;
  const tail = [
    skippedStyles ? `Skipped ${skippedStyles}: styles could not be restored` : '',
    skippedText ? `Skipped ${skippedText}: text could not be changed` : '',
    unrestored.length
      ? `Could not restore ${unrestored.length}: check ${unrestored.map((layer) => JSON.stringify(layer.name ?? 'unnamed layer')).join(', ')}`
      : '',
  ].filter(Boolean);
  return { message: [head, ...tail].join('. '), changed: spots > 0, unrestored };
}
