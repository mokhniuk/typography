import { describe, expect, test } from 'bun:test';
import { presets } from '../core/presets.ts';
import typography, { createDirective, vTypography } from './index.ts';

const text = (value: string) => ({ nodeType: 3, nodeValue: value, childNodes: [] as never[] });
const p = (value: string) => {
  const node = text(value);
  return {
    node,
    el: { nodeType: 1, nodeName: 'P', nodeValue: null, childNodes: [node] },
  };
};

describe('vue directive', () => {
  test('mounted typesets the element; the plugin registers it with its options as defaults', () => {
    const registered: Record<string, { mounted: (el: unknown, b: object) => void }> = {};
    typography.install(
      { directive: (name, def) => (registered[name] = def as never) },
      { lang: 'uk' },
    );
    const { node, el } = p('Він сказав "привіт"');
    registered.typography?.mounted(el, {});
    expect(node.nodeValue).toBe('Він сказав «привіт»');
  });

  test('the binding value replaces the defaults, and updated runs again', () => {
    const directive = createDirective({ lang: 'uk' });
    const { node, el } = p('He said "hi"');
    directive.mounted(el, { value: { lang: 'en', register: 'literary' } });
    expect(node.nodeValue).toBe('He said ‘hi’');
    node.nodeValue = 'He said "bye"';
    directive.updated(el, { value: { ...presets.book, lang: 'en' } });
    expect(node.nodeValue).toBe('He said ‘bye’');
  });

  test('the bare directive is English with the default rules', () => {
    const { node, el } = p('He said "hi"');
    vTypography.mounted(el, {});
    expect(node.nodeValue).toBe('He said “hi”');
  });

  test('a wrong language throws the engine’s error', () => {
    const { el } = p('x');
    expect(() => vTypography.mounted(el, { value: { lang: 'xx' as never } })).toThrow(/lang is/);
  });
});
