/**
 * Builds the commit a release tag points at: the package as `bun pm pack` packs it (the `files`
 * list in package.json: the engine's sources, README, CHANGELOG, package.json) and nothing else.
 * Bun installs a git dependency as the whole tree of the tagged commit and ignores `files`, so the
 * tag must point at a tree that holds only the package. The commit sits on the `release` branch,
 * whose parent is the previous release, and is made with git plumbing: the working tree and the
 * current branch are not touched.
 *
 *     bun scripts/release-commit.ts [parent]     prints the new commit's hash
 *
 * `.github/workflows/release.yml` runs it, tags the commit `vX.Y.Z` and pushes the tag and the
 * `release` branch. `parent` is the previous release commit (omitted for the first).
 */
import { mkdtempSync, readdirSync, readFileSync, rmSync } from 'node:fs';
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

  // A separate index, so the repository's own index and working tree stay as they are.
  const env = {
    ...process.env,
    GIT_DIR: join(root, '.git'),
    GIT_INDEX_FILE: join(work, 'index'),
    GIT_WORK_TREE: tree,
  };
  await $`git add -A .`.cwd(tree).env(env).quiet();
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
