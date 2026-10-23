/// <reference types="@figma/plugin-typings" />
import { formatText } from './edits.ts';
import { readSettings, toOptions } from './settings.ts';

const KEY = 'settings';

const savedSettings = async () => readSettings(await figma.clientStorage.getAsync(KEY));

/** Text layers under `roots` (a root that is one counts), without hidden or locked ones. */
function textLayers(roots: readonly SceneNode[]): TextNode[] {
  const found: TextNode[] = [];
  const visit = (node: SceneNode): void => {
    if (!node.visible || ('locked' in node && node.locked)) return;
    if (node.type === 'TEXT') found.push(node);
    else if ('children' in node) for (const child of node.children) visit(child);
  };
  for (const root of roots) visit(root);
  return found;
}

/** The fonts a node uses have to be loaded before its characters can change. */
async function loadFonts(node: TextNode): Promise<boolean> {
  if (node.hasMissingFont) return false;
  try {
    const fonts = node.getRangeAllFontNames(0, node.characters.length);
    await Promise.all(fonts.map((font) => figma.loadFontAsync(font)));
    return true;
  } catch {
    return false;
  }
}

function plural(n: number, one: string, many: string): string {
  return `${n} ${n === 1 ? one : many}`;
}

async function run(layers: readonly TextNode[]): Promise<string> {
  const options = toOptions(await savedSettings());
  let spots = 0;
  let changed = 0;
  let skipped = 0;
  for (const node of layers) {
    if (!(await loadFonts(node))) {
      skipped++;
      continue;
    }
    const n = formatText(node, options);
    if (n > 0) changed++;
    spots += n;
  }
  const tail = skipped ? `. Skipped ${skipped}: font not available` : '';
  if (spots === 0) return `Nothing to fix in ${plural(layers.length - skipped, 'layer', 'layers')}${tail}`;
  return `Fixed ${plural(spots, 'spot', 'spots')} in ${plural(changed, 'layer', 'layers')}${tail}`;
}

/** The settings window stays open until Done; every change is saved as it is made. */
async function openSettings(): Promise<void> {
  figma.showUI(__html__, { width: 320, height: 520, themeColors: true });
  figma.ui.postMessage({ type: 'init', settings: await savedSettings() });
  figma.ui.onmessage = async (message: { type: string; settings?: unknown }) => {
    if (message.type === 'save') await figma.clientStorage.setAsync(KEY, readSettings(message.settings));
    else if (message.type === 'close') figma.closePlugin();
  };
}

async function main(): Promise<void> {
  if (figma.command === 'settings') return openSettings();
  if (figma.command === 'format-page') {
    await figma.currentPage.loadAsync();
    figma.notify(await run(textLayers(figma.currentPage.children)));
  } else {
    const layers = textLayers(figma.currentPage.selection);
    figma.notify(layers.length ? await run(layers) : 'Select a text layer, or use Format page');
  }
  figma.closePlugin();
}

main().catch((error: unknown) => figma.closePlugin(`Typography failed: ${String(error)}`));
