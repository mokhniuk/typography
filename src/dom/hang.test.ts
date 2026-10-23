import { afterAll, beforeAll, describe, expect, test } from 'bun:test';
import { hangPunctuation } from './hang.ts';

/**
 * `hangPunctuation` runs in a browser; here the browser is a few stubs, enough to count the
 * observers a pass keeps on an element. What is checked is the contract between the inline
 * script and the React hook: both call `hangPunctuation` on the same root, and the second call
 * must stop the first, so one root never carries two passes.
 */
let observers = 0;
class FakeObserver {
  constructor() {
    observers++;
  }
  observe() {}
  disconnect() {
    observers--;
  }
}
const saved: Record<string, unknown> = {};
const globals = {
  ResizeObserver: FakeObserver,
  MutationObserver: FakeObserver,
  requestAnimationFrame: () => 0,
  cancelAnimationFrame: () => {},
  getComputedStyle: () => ({ fontSize: '16px', display: 'block' }),
  document: { fonts: undefined, createRange: () => ({}) },
};
beforeAll(() => {
  for (const [name, value] of Object.entries(globals)) {
    saved[name] = (globalThis as Record<string, unknown>)[name];
    (globalThis as Record<string, unknown>)[name] = value;
  }
});
afterAll(() => {
  for (const name of Object.keys(globals))
    (globalThis as Record<string, unknown>)[name] = saved[name];
});

const element = () => ({ querySelectorAll: () => [] }) as unknown as HTMLElement;

describe('hangPunctuation', () => {
  test('a second pass on the same element stops the first', () => {
    const el = element();
    hangPunctuation(el);
    expect(observers).toBe(2);
    const stop = hangPunctuation(el);
    expect(observers).toBe(2);
    stop();
    expect(observers).toBe(0);
  });

  test('passes on different elements are independent', () => {
    const a = hangPunctuation(element());
    const b = hangPunctuation(element());
    expect(observers).toBe(4);
    a();
    expect(observers).toBe(2);
    b();
    expect(observers).toBe(0);
  });
});
