/**
 * The published build (`bun run build`, and `prepack`, so every pack builds first): ESM and
 * declarations in `dist/`, from `src/` without tests (`tsconfig.build.json`).
 *
 * `dist/` is emptied first, so a file whose source is gone cannot ship. `tsc` rewrites the relative
 * `.ts`/`.tsx` specifiers of the emitted JavaScript to `.js` (`rewriteRelativeImportExtensions`) but
 * leaves them as they are in the declarations; they are rewritten here, so a `.d.ts` names the file
 * that sits next to it in the pack, which any TypeScript version resolves. The command line,
 * `dist/cli/main.js`, is made executable, so the release tree and the tarball carry it as 0755.
 */
import { chmodSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { join } from 'node:path';

const root = join(import.meta.dir, '..');
const dist = join(root, 'dist');

rmSync(dist, { recursive: true, force: true });
const tsc = Bun.spawnSync({
  cmd: [join(root, 'node_modules', '.bin', 'tsc'), '-p', 'tsconfig.build.json'],
  cwd: root,
  stdout: 'inherit',
  stderr: 'inherit',
});
if (tsc.exitCode !== 0) process.exit(tsc.exitCode ?? 1);

const SPECIFIER = /((?:from|import)\s*\(?\s*)(['"])(\.\.?\/[^'"]*?)\.tsx?\2/g;
for (const entry of readdirSync(dist, { recursive: true, withFileTypes: true })) {
  if (!entry.isFile() || !entry.name.endsWith('.d.ts')) continue;
  const path = join(entry.parentPath, entry.name);
  const text = readFileSync(path, 'utf8');
  const fixed = text.replace(SPECIFIER, '$1$2$3.js$2');
  if (fixed !== text) writeFileSync(path, fixed);
}

chmodSync(join(dist, 'cli', 'main.js'), 0o755);
