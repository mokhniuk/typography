import { describe, expect, test } from 'bun:test';
import { typesetText } from '../../src/index.ts';
import { applyEdits, formatText, type TextTarget, toEdits } from './edits.ts';

/** A text node as Figma models it: one style per character. Insertion copies the style of the neighbour asked for. */
class FakeText implements TextTarget {
  // `characters` is read-only on purpose: formatText must edit through insert/delete, as the bold test shows.
  chars: { c: string; style: string }[];
  constructor(spans: [string, string][]) {
    this.chars = spans.flatMap(([text, style]) => [...text].map((c) => ({ c, style })));
  }
  get characters(): string {
    return this.chars.map((x) => x.c).join('');
  }
  insertCharacters(start: number, text: string, useStyle: 'BEFORE' | 'AFTER' = 'BEFORE'): void {
    const from = this.chars[useStyle === 'BEFORE' ? start - 1 : start];
    if (!from) throw new Error(`no ${useStyle} character at ${start}`);
    this.chars.splice(start, 0, ...[...text].map((c) => ({ c, style: from.style })));
  }
  deleteCharacters(start: number, end: number): void {
    this.chars.splice(start, end - start);
  }
  /** The text with a style change marked as `{style|text}`. */
  spans(): string {
    let out = '';
    let last = '';
    for (const { c, style } of this.chars) {
      if (style !== last) out += `${last ? '}' : ''}{${style}|`;
      out += c;
      last = style;
    }
    return `${out}}`;
  }
}

const run = (node: FakeText, after: string): void => applyEdits(node, toEdits(node.characters, after));

describe('toEdits', () => {
  test('no change gives no edits', () => {
    expect(toEdits('Hello world', 'Hello world')).toEqual([]);
  });

  test('a replacement is one edit with its range and its text', () => {
    expect(toEdits('say "hi"', 'say “hi”')).toEqual([
      { start: 7, end: 8, text: '”' },
      { start: 4, end: 5, text: '“' },
    ]);
  });
});

describe('applyEdits keeps the style of every run', () => {
  test('a quote inside bold stays bold, text outside stays regular', () => {
    const node = new FakeText([
      ['He said ', 'r'],
      ['"only"', 'b'],
      [' so.', 'r'],
    ]);
    run(node, 'He said “only” so.');
    expect(node.characters).toBe('He said “only” so.');
    expect(node.spans()).toBe('{r|He said }{b|“only”}{r| so.}');
  });

  test('a shortened text (three dots to one mark) keeps the neighbours styled', () => {
    const node = new FakeText([
      ['wait', 'b'],
      ['...', 'r'],
      [' ok', 'i'],
    ]);
    run(node, 'wait… ok');
    expect(node.characters).toBe('wait… ok');
    expect(node.spans()).toBe('{b|wait}{r|…}{i| ok}');
  });

  test('a pure insertion at the very start takes the style of the next character', () => {
    const node = new FakeText([['one', 'b']]);
    applyEdits(node, [{ start: 0, end: 0, text: 'x' }]);
    expect(node.spans()).toBe('{b|xone}');
  });

  test('the real engine output lands with every style intact', () => {
    const before = 'He said "it\'s only 5 - 10 minutes..." and left.';
    const node = new FakeText([
      ['He said "it\'s ', 'r'],
      ['only', 'b'],
      [' 5 - 10 minutes..." and left.', 'r'],
    ]);
    const after = typesetText(before, { lang: 'en' });
    run(node, after);
    expect(node.characters).toBe(after);
    // The bold run is still exactly the word "only".
    expect(node.spans()).toMatch(/\{b\|only\}/);
  });
});

describe('formatText', () => {
  test('returns the number of spots changed and types the node in its language', () => {
    const node = new FakeText([['Er sagte "ja" -- sofort', 'r']]);
    const spots = formatText(node, { lang: 'de' });
    expect(node.characters).toBe(typesetText('Er sagte "ja" -- sofort', { lang: 'de' }));
    expect(spots).toBeGreaterThan(0);
  });

  test('a node that is already typeset is not touched', () => {
    const node = new FakeText([['Hello “world”.', 'b']]);
    let calls = 0;
    const spy = Object.assign(node, {
      insertCharacters: () => void calls++,
      deleteCharacters: () => void calls++,
    });
    expect(formatText(spy, { lang: 'en' })).toBe(0);
    expect(calls).toBe(0);
  });
});
