import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { LANGS } from '../../profiles.ts';
import { PROSE } from './index.ts';

/**
 * The sources and notes of the packs live here so that no bundle carries them. What this guards: every
 * language has them, and nothing that ships imports them (the build leaves this folder out, so an
 * import would break the package, not only grow it).
 */
const SRC = resolve(import.meta.dir, '..', '..', '..');
const tree = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tree(join(dir, e.name)) : [join(dir, e.name)],
  );

describe('pack prose', () => {
  test('there is one for every language, and no other', () => {
    expect(Object.keys(PROSE).sort()).toEqual([...LANGS].sort());
  });

  test('each has sources (a list) and notes (a sentence at least)', () => {
    for (const [code, prose] of Object.entries(PROSE)) {
      expect(Array.isArray(prose.sources), code).toBe(true);
      expect(prose.notes.length, code).toBeGreaterThan(20);
    }
  });

  test('the Swiss packs list the sources of the language they follow', () => {
    expect(PROSE['de-CH'].sources).toEqual(expect.arrayContaining([...PROSE.de.sources]));
    expect(PROSE['fr-CH'].sources).toEqual(expect.arrayContaining([...PROSE.fr.sources]));
  });

  test('no file that ships imports the prose', () => {
    const shipped = tree(SRC).filter(
      (file) =>
        /\.tsx?$/.test(file) &&
        !/\.test\.tsx?$|\.test-utils\.ts$/.test(file) &&
        !relative(SRC, file).startsWith(join('core', 'lang', 'prose')),
    );
    expect(shipped.length).toBeGreaterThan(50);
    const importing = shipped.filter((file) =>
      /(?:from|import)\s*\(?\s*['"][^'"]*prose[^'"]*['"]/.test(readFileSync(file, 'utf8')),
    );
    expect(importing.map((file) => relative(SRC, file))).toEqual([]);
  });
});
