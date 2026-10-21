import { describe, expect, test } from 'bun:test';
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join, relative, resolve } from 'node:path';

/**
 * The package must stay liftable out of the monorepo as it stands: every import
 * in `src/` and `apps/playground/` either stays inside the package (relative) or is one of the few bare modules below.
 * No monorepo aliases (`@i18n/…`), no `@podiia/…` workspace packages, no reaching
 * out with `../../..`. This is the test that fails the day someone takes a shortcut.
 */
const ROOT = resolve(import.meta.dir, '..');
const SCANNED = ['src', 'apps/playground'].map((dir) => join(ROOT, dir));
const BARE_ALLOWED = new Set(['react', 'react/jsx-runtime', 'bun:test']);
/** Dev dependencies a test may use to run the library inside a real pipeline. */
const TEST_ONLY = new Set([
  'unified',
  'remark-parse',
  'remark-rehype',
  'rehype-parse',
  'rehype-stringify',
]);
/** Node built-ins are for tests and the command line only; the library itself needs none. */
const NODE_ALLOWED = /^(?:src\/cli\/|.*\.test\.tsx?$)/;

function sources(dir: string): string[] {
  return readdirSync(dir, { withFileTypes: true }).flatMap((entry) => {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) return sources(path);
    // The Vite config is a build file for the playground, not code that ships.
    return /\.(ts|tsx)$/.test(entry.name) && entry.name !== 'vite.config.ts' ? [path] : [];
  });
}

const IMPORT = /(?:from|import)\s*\(?\s*['"]([^'"]+)['"]/g;

describe('package boundary', () => {
  for (const file of SCANNED.flatMap(sources)) {
    const name = relative(ROOT, file);
    test(`${name} imports only from inside the package`, () => {
      const nodeOk = NODE_ALLOWED.test(name);
      const isTest = /\.test\.tsx?$/.test(name);
      const bad: string[] = [];
      for (const [, spec = ''] of readFileSync(file, 'utf8').matchAll(IMPORT)) {
        if (spec.startsWith('.')) {
          const target = resolve(dirname(file), spec);
          if (relative(ROOT, target).startsWith('..')) bad.push(spec);
        } else if (
          !BARE_ALLOWED.has(spec) &&
          !(nodeOk && spec.startsWith('node:')) &&
          !(isTest && TEST_ONLY.has(spec))
        ) {
          bad.push(spec);
        }
      }
      expect(bad).toEqual([]);
    });
  }
});
