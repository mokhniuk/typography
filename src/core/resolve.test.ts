import { describe, expect, test } from 'bun:test';
import { PACK } from './lang/index.ts';
import type { LangPack } from './lang/pack.ts';
import { explain, resolvePack, typographic, withPack } from './resolve.ts';

describe('resolvePack', () => {
  test('a code gives its pack, nothing gives English, a pack is returned as it is', () => {
    expect(resolvePack('uk')).toBe(PACK.uk);
    expect(resolvePack('de-CH')).toBe(PACK['de-CH']);
    expect(resolvePack()).toBe(PACK.en);
    const own: LangPack = { ...PACK.de, code: 'de-AT' };
    expect(resolvePack(own)).toBe(own);
  });

  test('an unknown code, or a value that is neither, throws an Error that lists the codes', () => {
    for (const bad of ['xx', 'toString', 'DE', null, 5, {}]) {
      expect(() => resolvePack(bad as never)).toThrow(/^lang is "en", "uk", .*, not /);
    }
    expect(() => typographic('x', 'xx' as never)).toThrow('not "xx"');
  });

  test('withPack resolves lang and keeps every other option', () => {
    const options = withPack({ lang: 'fr' as const, register: 'literary' as const, avoid: '…' });
    expect(options).toEqual({ lang: PACK.fr, register: 'literary', avoid: '…' });
    expect(withPack({}).lang).toBe(PACK.en);
  });

  test('a code and its pack give the same output and records', () => {
    const text = 'He said "it\'s 5-6 pm" -- and left...';
    for (const pack of [PACK.en, PACK.uk, PACK.de]) {
      expect(typographic(text, pack)).toBe(typographic(text, pack.code as never));
      expect(explain(text, pack)).toEqual(explain(text, pack.code as never));
    }
  });
});
