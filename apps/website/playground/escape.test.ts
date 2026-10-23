import { describe, expect, test } from 'bun:test';
import { escapeHtml } from './escape';

describe('escapeHtml', () => {
  test('escapes each of the five characters', () => {
    expect(escapeHtml('&')).toBe('&amp;');
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('>')).toBe('&gt;');
    expect(escapeHtml('"')).toBe('&quot;');
    expect(escapeHtml("'")).toBe('&#39;');
  });

  test('escapes the ampersand first, so the entities it adds are not escaped again', () => {
    expect(escapeHtml('<')).toBe('&lt;');
    expect(escapeHtml('&lt;')).toBe('&amp;lt;');
    expect(escapeHtml('&amp;')).toBe('&amp;amp;');
  });

  test('leaves an empty string and plain text alone', () => {
    expect(escapeHtml('')).toBe('');
    expect(escapeHtml('Plain text, 12 % — “curly” ‘quotes’')).toBe(
      'Plain text, 12 % — “curly” ‘quotes’',
    );
  });

  test('escapes a string that holds all five', () => {
    expect(escapeHtml(`<a href="x" title='y'>&</a>`)).toBe(
      '&lt;a href=&quot;x&quot; title=&#39;y&#39;&gt;&amp;&lt;/a&gt;',
    );
  });
});
