// A source pin, by design. The playground script needs far more of the DOM
// than the font checker's stub provides, so a stub-DOM smoke test would be
// brittle and would prove little. What must never regress is small and
// visible in the source: the preview iframe stays sandboxed without scripts,
// and the only place that writes markup is the Changes view, which escapes
// every piece of visitor text first.
import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';

const source = readFileSync(`${import.meta.dirname}/main.ts`, 'utf8');

describe('playground preview safety', () => {
  test('the preview iframe is sandboxed with allow-same-origin only, and no script is ever allowed', () => {
    const values = [...source.matchAll(/setAttribute\('sandbox',\s*'([^']*)'\)/g)].map((m) => m[1]);
    expect(values).toEqual(['allow-same-origin']);
    expect(source).not.toContain('allow-scripts');
  });

  test('the only markup sink is the Changes view assignment', () => {
    // Every way to turn a string into markup: innerHTML (`=` or `+=`), outerHTML, insertAdjacentHTML and
    // document.write. A new one must be a deliberate decision, not a quiet addition.
    const sinks = [
      ...source.matchAll(
        /^.*(?:\.innerHTML\s*\+?=|outerHTML|insertAdjacentHTML|document\.write).*$/gm,
      ),
    ].map((m) => m[0].trim());
    expect(sinks).toHaveLength(1);
    expect(sinks[0]).toStartWith('changes.innerHTML =');
  });

  test('the preview document is set once through srcdoc and the sandbox is never lifted', () => {
    expect(source.match(/\.srcdoc\s*=/g)).toHaveLength(1);
    expect(source).not.toMatch(/removeAttribute\(\s*['"]sandbox['"]/);
  });

  // These two pins are exact strings on purpose. When one fails, re-check that every visitor string in
  // the Changes template is escaped before it reaches the markup, then update the pin to the new code.
  test('the text that feeds the Changes view passes through escapeHtml', () => {
    expect(source).toContain('const text = escapeHtml(visible(run.text));');
    expect(source).toMatch(/\.map\(\(e\) => escapeHtml\(e\)\)/);
  });
});
