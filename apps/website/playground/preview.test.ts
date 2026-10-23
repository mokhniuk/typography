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

  test('the only innerHTML assignment is the Changes view', () => {
    const assignments = [...source.matchAll(/^.*\.innerHTML\s*=.*$/gm)].map((m) => m[0].trim());
    expect(assignments).toHaveLength(1);
    expect(assignments[0]).toStartWith('changes.innerHTML =');
  });

  test('the text that feeds the Changes view passes through escapeHtml', () => {
    expect(source).toContain('const text = escapeHtml(visible(run.text));');
    expect(source).toMatch(/\.map\(\(e\) => escapeHtml\(e\)\)/);
  });
});
