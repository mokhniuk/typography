import { expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';

/**
 * What a consumer installs is what `bun pm pack` packs (the `files` list in package.json), and a
 * release tag points at a commit that holds exactly that (scripts/release-commit.ts). The engine's
 * sources must all be in it, every entry point and the command line must resolve inside it, and
 * nothing else may come along: no tests, no fixtures, no apps, docs or tooling.
 */
const ROOT = resolve(import.meta.dir, '..');
const TEST_ONLY = /\.test\.tsx?$|\.fixture\.json$|^src\/snapshot\.digests\.json$/;
const OUTSIDE_SRC = new Set(['package.json', 'README.md', 'CHANGELOG.md']);

const packed = Bun.spawnSync({ cmd: ['bun', 'pm', 'pack', '--dry-run'], cwd: ROOT, stdout: 'pipe' })
  .stdout.toString()
  .split('\n')
  .map((line) => /^packed \S+ (.+)$/.exec(line.trim())?.[1])
  .filter((path): path is string => !!path);
const shipped = new Set(packed);

const tree = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tree(join(dir, e.name)) : [relative(ROOT, join(dir, e.name))],
  );

test('the pack holds the sources and three files, nothing else', () => {
  expect(packed.length).toBeGreaterThan(0);
  for (const path of packed) {
    expect(path.startsWith('src/') || OUTSIDE_SRC.has(path), path).toBe(true);
    expect(TEST_ONLY.test(path), path).toBe(false);
  }
  for (const path of OUTSIDE_SRC) expect(shipped.has(path), path).toBe(true);
});

test('every source file that is not a test ships', () => {
  for (const path of tree(join(ROOT, 'src')))
    if (!TEST_ONLY.test(path)) expect(shipped.has(path), path).toBe(true);
});

test('every entry point and the command line resolve inside the pack', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
    main: string;
    exports: Record<string, string>;
    bin: Record<string, string>;
  };
  for (const target of [pkg.main, ...Object.values(pkg.exports), ...Object.values(pkg.bin)])
    expect(shipped.has(target.replace(/^\.\//, '')), target).toBe(true);
});
