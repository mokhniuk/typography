import { expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { packedFiles } from '../scripts/pack.ts';
import { PACKS } from './core/lang/index.ts';

/**
 * What a consumer installs is what `bun pm pack` packs (the `files` list in package.json): the build
 * in `dist/` (compiled ESM and declarations), README, CHANGELOG, LICENSE and package.json. A release
 * tag points at a commit that holds exactly that (scripts/release-commit.ts). Every source that is not
 * a test must ship as a `.js` and a `.d.ts`, every entry point and the command line must resolve
 * inside the pack, and nothing else may come along: no sources, tests, apps, docs or tooling.
 *
 * `bun pm pack` runs `prepack` (`bun run build`), so `packedFiles` builds `dist/` afresh: one build
 * per run, and the test fails if the build does.
 */
const ROOT = resolve(import.meta.dir, '..');
/** Not shipped: tests, their fixtures, and the prose of the language pages (read by the doc generators only). */
const TEST_ONLY =
  /\.test\.tsx?$|\.test-utils\.ts$|\.fixture\.json$|^src\/snapshot\.digests\.json$|^src\/core\/lang\/prose\//;
const OUTSIDE_DIST = new Set(['package.json', 'README.md', 'CHANGELOG.md', 'LICENSE']);

const packed = packedFiles(ROOT);
const shipped = new Set(packed);

const tree = (dir: string): string[] =>
  readdirSync(dir, { withFileTypes: true }).flatMap((e) =>
    e.isDirectory() ? tree(join(dir, e.name)) : [relative(ROOT, join(dir, e.name))],
  );
const sources = tree(join(ROOT, 'src')).filter((path) => !TEST_ONLY.test(path));
const built = (source: string, ext: '.js' | '.d.ts') =>
  source.replace(/^src\//, 'dist/').replace(/\.tsx?$/, ext);

test('the pack holds the build and four files, nothing else', () => {
  expect(packed.length).toBeGreaterThan(0);
  for (const path of packed)
    expect(path.startsWith('dist/') || OUTSIDE_DIST.has(path), path).toBe(true);
  for (const path of OUTSIDE_DIST) expect(shipped.has(path), path).toBe(true);
});

test('every source that is not a test ships as JavaScript and declarations', () => {
  expect(sources.length).toBeGreaterThan(0);
  for (const source of sources) {
    expect(source, 'a source the build does not compile').toMatch(/\.tsx?$/);
    expect(shipped.has(built(source, '.js')), built(source, '.js')).toBe(true);
    expect(shipped.has(built(source, '.d.ts')), built(source, '.d.ts')).toBe(true);
  }
});

test('every file of the build has its source', () => {
  const expected = new Set(sources.flatMap((s) => [built(s, '.js'), built(s, '.d.ts')]));
  for (const path of packed)
    if (path.startsWith('dist/')) expect(expected.has(path), path).toBe(true);
});

test('every entry point and the command line resolve inside the pack', () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
    main: string;
    types: string;
    exports: Record<string, string | { types: string; default: string }>;
    bin: Record<string, string>;
  };
  const targets = [
    pkg.main,
    pkg.types,
    ...Object.values(pkg.exports).flatMap((e) =>
      typeof e === 'string' ? [e] : [e.types, e.default],
    ),
    ...Object.values(pkg.bin),
  ];
  expect(Object.keys(pkg.exports).length).toBeGreaterThan(0);
  for (const target of targets) {
    expect(target, 'every target is a string').toBeString();
    expect(shipped.has(target.replace(/^\.\//, '')), target).toBe(true);
  }
});

test('one entry per language pack, `./lang/<code>`, and the pack-free `./lite`', async () => {
  const pkg = JSON.parse(readFileSync(join(ROOT, 'package.json'), 'utf8')) as {
    exports: Record<string, string | { types: string; default: string }>;
  };
  // No `./lang/*` pattern: it would expose lang/index (every pack) and lang/pack.
  const files = PACKS.map((pack) => pack.code.toLowerCase());
  const langKeys = Object.keys(pkg.exports).filter((key) => key.startsWith('./lang/'));
  expect(langKeys.sort()).toEqual(files.map((file) => `./lang/${file}`).sort());
  for (const file of files) {
    expect(pkg.exports[`./lang/${file}`]).toEqual({
      types: `./dist/core/lang/${file}.d.ts`,
      default: `./dist/core/lang/${file}.js`,
    });
  }
  // Each built pack gives the pack as its default export and under its own name.
  for (const pack of PACKS) {
    const file = join(ROOT, 'dist', 'core', 'lang', `${pack.code.toLowerCase()}.js`);
    const mod = (await import(file)) as { default: { code: string } } & Record<string, unknown>;
    expect(mod.default.code).toBe(pack.code);
    // The named export (`uk`, `deCH`, ...) is the very object the default export is.
    expect(Object.entries(mod).some(([k, v]) => k !== 'default' && v === mod.default)).toBe(true);
  }
  expect(pkg.exports['./lite']).toEqual({
    types: './dist/lite/index.d.ts',
    default: './dist/lite/index.js',
  });
});

test('no shipped code needs Bun', () => {
  for (const path of packed) {
    const text = readFileSync(join(ROOT, path), 'utf8');
    expect(text.includes('bun:test'), path).toBe(false);
    // The prose files (CHANGELOG, README) may name Bun's APIs; the build may not use them.
    if (path.startsWith('dist/'))
      expect(/bun:|import\.meta\.dir|\bBun\./.test(text), path).toBe(false);
  }
});
