import { describe, expect, test } from 'bun:test';
import { FakeText, fullStyle } from './fake-text.ts';
import { NOTHING_SELECTED, type Node, runLayers, textLayers } from './run.ts';
import type { TextLike } from './styles.ts';

const BOLD = fullStyle({ fontWeight: '700', fontVariantId: 'bold' });
const layer = (text: string) => new FakeText(text, [{ start: 0, end: text.length, style: fullStyle({}) }]);
const mixed = (text: string) =>
  new FakeText(text, [
    { start: 0, end: 1, style: BOLD },
    { start: 1, end: text.length, style: fullStyle({}) },
  ]);

const history = () => {
  const log: string[] = [];
  return {
    log,
    undoBlockBegin: () => {
      log.push('begin');
      return Symbol('block');
    },
    undoBlockFinish: () => {
      log.push('finish');
    },
  };
};

describe('textLayers', () => {
  type Flags = { hidden?: boolean; blocked?: boolean };
  const text = (name: string, flags: Flags = {}): Node & { name: string } => ({ type: 'text', name, ...flags });
  const group = (children: Node[], flags: Flags = {}): Node => ({ type: 'group', children, ...flags });

  test('finds text layers in order, at any depth', () => {
    const a = text('a');
    const b = text('b');
    const c = text('c');
    expect(textLayers([a, group([b, group([c])])])).toEqual([a, b, c]);
  });

  test('skips hidden and locked layers, and everything under a hidden or locked parent', () => {
    const ok = text('ok');
    const found = textLayers([
      text('hidden', { hidden: true }),
      text('locked', { blocked: true }),
      group([text('under hidden')], { hidden: true }),
      group([text('under locked')], { blocked: true }),
      ok,
    ]);
    expect(found).toEqual([ok]);
  });

  test('a layer reachable twice, as itself and through its group, comes once', () => {
    const a = text('a');
    expect(textLayers([group([a]), a])).toEqual([a]);
  });
});

describe('runLayers', () => {
  test('reports the fixes and the layers that changed', () => {
    const h = history();
    const report = runLayers([layer('Say "hi"'), mixed('Say "hi" now'), layer('plain')], { lang: 'en' }, h);
    expect(report).toEqual({ message: 'Fixed 4 spots in 2 layers', changed: true });
  });

  test('uses singular forms', () => {
    expect(runLayers([layer("it's")], { lang: 'en' }, history()).message).toBe('Fixed 1 spot in 1 layer');
    expect(runLayers([layer('plain')], { lang: 'en' }, history())).toEqual({ message: 'Nothing to fix in 1 layer', changed: false });
  });

  test('says nothing to fix for layers that are already right', () => {
    expect(runLayers([layer('a'), layer('b')], { lang: 'en' }, history()).message).toBe('Nothing to fix in 2 layers');
  });

  test('names the layers it skipped, and why', () => {
    const colored = new FakeText('Say "hi"', [
      { start: 0, end: 1, style: fullStyle({ fills: [{ fillColor: '#ff0000', fillOpacity: 1 }] }) },
      { start: 1, end: 8, style: fullStyle({}) },
    ]);
    colored.failOn('fills');
    const stuck = layer('Say "hi"');
    stuck.failOn('characters');
    const report = runLayers([colored, stuck, layer('Say "x"')], { lang: 'en' }, history());
    expect(report.message).toBe('Fixed 2 spots in 1 layer. Skipped 1: styles could not be restored. Skipped 1: text could not be changed');
    expect(report.changed).toBe(true);
  });

  test('names a layer it could not put back', () => {
    const colored = new FakeText('Say "hi"', [
      { start: 0, end: 1, style: fullStyle({ fills: [{ fillColor: '#ff0000', fillOpacity: 1 }] }) },
      { start: 1, end: 8, style: fullStyle({}) },
    ]);
    colored.failOn('fills', 2);
    expect(runLayers([colored], { lang: 'en' }, history()).message).toBe('Nothing to fix in 0 layers. Could not restore 1: check it');
  });

  test('the whole run is one undo block, and a layer that throws does not leave it open', () => {
    const h = history();
    const broken: TextLike = {
      get characters(): string {
        throw new Error('gone');
      },
      set characters(_value: string) {},
      getRange: () => ({}),
    };
    const report = runLayers([layer('Say "hi"'), broken, layer('Say "x"')], { lang: 'en' }, h);
    expect(h.log).toEqual(['begin', 'finish']);
    expect(report.message).toBe('Fixed 4 spots in 2 layers. Skipped 1: text could not be changed');
  });

  test('has a sentence for an empty selection', () => {
    expect(NOTHING_SELECTED).toBe('Select a text layer, or use Format page');
  });
});
