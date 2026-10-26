import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { DEFAULT_SETTINGS } from '../figma/settings.ts';
import { describeSettings, readMessage } from './protocol.ts';

describe('describeSettings', () => {
  test('names the language, the register and the quotes', () => {
    expect(describeSettings({ ...DEFAULT_SETTINGS, lang: 'de' })).toBe('German · Display · Language quotes');
    expect(describeSettings({ ...DEFAULT_SETTINGS, register: 'literary', quoteStyle: 'us' })).toBe('English · Literary · US quotes');
    expect(describeSettings({ ...DEFAULT_SETTINGS, lang: 'fr', quoteStyle: 'guillemets' })).toBe('French · Display · Guillemets');
  });
});

describe('readMessage', () => {
  test('accepts the three messages the panel sends', () => {
    expect(readMessage({ type: 'ready' })).toEqual({ type: 'ready' });
    expect(readMessage({ type: 'format', scope: 'page' })).toEqual({ type: 'format', scope: 'page' });
    expect(readMessage({ type: 'format', scope: 'selection' })).toEqual({ type: 'format', scope: 'selection' });
    expect(readMessage({ type: 'save', settings: { lang: 'de' } })).toEqual({ type: 'save', settings: { lang: 'de' } });
  });

  test('anything else is null', () => {
    for (const junk of [null, undefined, 'format', 3, {}, { type: 'format' }, { type: 'format', scope: 'all' }, { type: 'other' }])
      expect(readMessage(junk)).toBeNull();
  });
});

describe('manifest.json', () => {
  const manifest = JSON.parse(readFileSync(new URL('./manifest.json', import.meta.url), 'utf8'));

  test('asks for the three permissions it uses and no more', () => {
    expect(manifest.permissions).toEqual(['content:read', 'content:write', 'allow:localstorage']);
  });

  test('is version 2, with the code and icon next to it', () => {
    expect(manifest.version).toBe(2);
    expect(manifest.code).toBe('plugin.js');
    expect(manifest.icon).toBe('icon.png');
  });
});
