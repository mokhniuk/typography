import { describe, expect, test } from 'bun:test';
import { uk } from '../core/lang/uk.ts';
import { type DomNode, typesetElement } from './typeset.ts';

type Fake = DomNode & { attrs?: Record<string, string> };
const text = (value: string): Fake => ({ nodeType: 3, nodeValue: value, childNodes: [] });
const el = (name: string, children: Fake[], attrs: Record<string, string> = {}): Fake => ({
  nodeType: 1,
  nodeName: name.toUpperCase(),
  nodeValue: null,
  childNodes: children,
  getAttribute: (key) => attrs[key] ?? null,
});
const read = (node: Fake): string =>
  node.nodeType === 3
    ? (node.nodeValue ?? '')
    : Array.from(node.childNodes, (c) => read(c as Fake)).join('|');

describe('typesetElement', () => {
  test('typesets text nodes in place, keeping the nodes', () => {
    const a = text('He said "hi" - ok.');
    const p = el('p', [a]);
    typesetElement(p, { lang: uk });
    expect(a.nodeValue).toBe('He said «hi» — ok.');
  });

  test('a quotation pairs across an inline element', () => {
    const t1 = text('say "go ');
    const t2 = text('there');
    const t3 = text(' now" ok');
    const p = el('p', [t1, el('a', [t2]), t3]);
    typesetElement(p, { lang: uk });
    expect(read(p)).toBe('say «go |there| now» ok');
  });

  test('code, pre, script and data-typography="off" are left alone', () => {
    const code = text('"a" -> b');
    const pre = text('"a" -> b');
    const off = text('"a" -> b');
    const root = el('div', [
      el('code', [code]),
      el('pre', [pre]),
      el('p', [off], { 'data-typography': 'off' }),
    ]);
    typesetElement(root, { lang: uk });
    expect([code.nodeValue, pre.nodeValue, off.nodeValue]).toEqual([
      '"a" -> b',
      '"a" -> b',
      '"a" -> b',
    ]);
  });

  test('a block ends the text around it: quotes do not pair across paragraphs', () => {
    const a = text('"one');
    const b = text('two"');
    typesetElement(el('div', [el('p', [a]), el('p', [b])]), { lang: uk });
    expect(a.nodeValue).not.toContain('»');
    expect(b.nodeValue).not.toContain('«');
  });

  test('a second run writes nothing', () => {
    const a = text('He said "hi" - ok.');
    const p = el('p', [a]);
    typesetElement(p, { lang: uk });
    const once = a.nodeValue;
    let writes = 0;
    Object.defineProperty(a, 'nodeValue', {
      get: () => once,
      set: () => {
        writes++;
      },
    });
    typesetElement(p, { lang: uk });
    expect(writes).toBe(0);
  });
});
