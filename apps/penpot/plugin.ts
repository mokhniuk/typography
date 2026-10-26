/// <reference types="@penpot/plugin-types" />
import { readSettings, toOptions } from '../figma/settings.ts';
import { readMessage, type ToPanel } from './protocol.ts';
import { NOTHING_SELECTED, type Node, runLayers, textLayers } from './run.ts';
import type { TextLike } from './styles.ts';

const KEY = 'settings';

function savedSettings() {
  try {
    return readSettings(JSON.parse(penpot.localStorage.getItem(KEY)));
  } catch {
    return readSettings(undefined);
  }
}

const send = (message: ToPanel): void => penpot.ui.sendMessage(message);

/** Text layers under the selection or the page, formatted in one undo block. */
function format(scope: 'selection' | 'page'): void {
  const roots = (scope === 'page' ? (penpot.root ? [penpot.root] : []) : penpot.selection) as unknown as Node[];
  const layers = textLayers(roots) as unknown as TextLike[];
  if (scope === 'selection' && layers.length === 0) {
    send({ type: 'result', message: NOTHING_SELECTED, changed: false });
    return;
  }
  send({ type: 'result', ...runLayers(layers, toOptions(savedSettings()), penpot.history) });
}

penpot.ui.open('Typography', 'index.html', { width: 320, height: 560 });
penpot.ui.onMessage<unknown>((raw) => {
  const message = readMessage(raw);
  if (!message) return;
  if (message.type === 'ready') send({ type: 'init', settings: savedSettings(), theme: penpot.theme });
  else if (message.type === 'save') penpot.localStorage.setItem(KEY, JSON.stringify(readSettings(message.settings)));
  else format(message.scope);
});
penpot.on('themechange', (theme) => send({ type: 'theme', theme }));
