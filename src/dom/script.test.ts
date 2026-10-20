import { describe, expect, test } from 'bun:test';
import { buildHangScript } from '../../scripts/gen-hang-script';
import { hangScript } from './hang';

describe('hangScript', () => {
  test('is one self-contained expression that runs on the parent of the current script', () => {
    const source = hangScript();
    expect(source.startsWith('(')).toBe(true);
    expect(source.endsWith('(document.currentScript.parentElement)')).toBe(true);
    // Only browser globals may be free in it: run it against a stand-in for each, and nothing else.
    const calls: string[] = [];
    const stub = (name: string) =>
      class {
        constructor() {
          calls.push(name);
        }
        observe() {}
        disconnect() {}
      };
    const root = {
      querySelectorAll: () => [],
    };
    const run = new Function(
      'document',
      'getComputedStyle',
      'requestAnimationFrame',
      'cancelAnimationFrame',
      'ResizeObserver',
      'MutationObserver',
      `"use strict"; return ${source};`,
    );
    const dispose = run(
      { currentScript: { parentElement: root }, fonts: undefined },
      () => ({}),
      () => 0,
      () => {},
      stub('ResizeObserver'),
      stub('MutationObserver'),
    );
    expect(typeof dispose).toBe('function');
    expect(calls).toEqual(['ResizeObserver', 'MutationObserver']);
  });

  test('is the script generated from hangPunctuation, so it is not stale (bun run gen:script)', async () => {
    expect(hangScript()).toBe(await buildHangScript());
  });
});
