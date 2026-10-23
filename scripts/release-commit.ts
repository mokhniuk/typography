/**
 * Builds the commit a release tag points at: the package as `bun pm pack` packs it and nothing else.
 * `bun pm pack` runs `prepack` (`bun run build`) first, so the pack holds a fresh build: the `files`
 * list in package.json (`dist/`, the compiled ESM and declarations, and CHANGELOG) plus what every
 * pack holds (package.json, README, LICENSE). Bun installs a git dependency as the whole tree of the
 * tagged commit and ignores `files`, so the tag must point at a tree that holds only the package; that
 * tree is also what npm publishes. The commit sits on the `release` branch, whose parent is the
 * previous release, and is made with git plumbing: the working tree and the current branch are not
 * touched (`dist/` is rebuilt, and git ignores it). The one change to the pack: the tree's package.json
 * has no `prepack`, since npm runs it when it installs a git dependency, and the tree has nothing to
 * build from.
 *
 *     bun scripts/release-commit.ts [parent]     prints the new commit's hash
 *
 * `.github/workflows/release.yml` runs it, tags the commit `vX.Y.Z` and pushes the tag and the
 * `release` branch. `parent` is the previous release commit (omitted for the first).
 */
import { existsSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { $ } from 'bun';

const root = join(import.meta.dir, '..');
const parent = process.argv[2];
const { version } = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  version: string;
};
const head = (await $`git -C ${root} rev-parse HEAD`.text()).trim();

const work = mkdtempSync(join(tmpdir(), 'typography-release-'));
try {
  await $`bun pm pack --quiet --destination ${work}`.cwd(root).quiet();
  const tarball = readdirSync(work).find((f) => f.endsWith('.tgz'));
  if (!tarball) throw new Error('bun pm pack wrote no tarball');
  const tree = join(work, 'tree');
  await $`mkdir ${tree} && tar -xzf ${join(work, tarball)} -C ${tree} --strip-components=1`;
  for (const required of ['dist/index.js', 'dist/index.d.ts', 'LICENSE'])
    if (!existsSync(join(tree, required))) throw new Error(`the pack has no ${required}`);
  const manifest = JSON.parse(readFileSync(join(tree, 'package.json'), 'utf8'));
  delete manifest.scripts?.prepack;
  writeFileSync(join(tree, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`);

  // A separate index, so the repository's own index and working tree stay as they are; `-f`, so the
  // repository's exclude file and the user's global ignore list cannot drop a file the pack holds.
  const env = {
    ...process.env,
    GIT_DIR: join(root, '.git'),
    GIT_INDEX_FILE: join(work, 'index'),
    GIT_WORK_TREE: tree,
  };
  await $`git add -A -f .`.cwd(tree).env(env).quiet();
  const treeId = (await $`git write-tree`.cwd(tree).env(env).text()).trim();
  const parents = parent ? ['-p', parent] : [];
  const commit = (
    await $`git commit-tree ${treeId} ${parents} -m ${`release: ${version} (packed from ${head})`}`
      .cwd(root)
      .text()
  ).trim();
  console.log(commit);
} finally {
  rmSync(work, { recursive: true, force: true });
}
