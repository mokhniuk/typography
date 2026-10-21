import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderAll, renderPack } from '../scripts/gen-languages-doc';
import { PACKS } from './core';

const DIR = join(import.meta.dir, '..', 'docs', 'languages');

describe('docs/languages', () => {
  for (const pack of PACKS) {
    test(`${pack.code}.md is what \`bun run docs:languages\` writes`, () => {
      expect(readFileSync(join(DIR, `${pack.code}.md`), 'utf8')).toBe(renderPack(pack));
    });
  }

  test('index.md is what `bun run docs:languages` writes', () => {
    expect(readFileSync(join(DIR, 'index.md'), 'utf8')).toBe(renderAll()['index.md'] as string);
  });

  test('there is a page for every pack and no other page', () => {
    expect(readdirSync(DIR).sort()).toEqual(Object.keys(renderAll()).sort());
  });

  test('a page says whether a native speaker has read the pack', () => {
    for (const pack of PACKS) {
      expect(renderPack(pack)).toContain(
        pack.reviewed ? 'Read by a native speaker' : 'Not reviewed by a native speaker',
      );
    }
  });
});
