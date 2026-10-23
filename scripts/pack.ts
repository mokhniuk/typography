/**
 * The files `bun pm pack` packs from `root` (the `files` list in package.json), as paths relative to
 * it: what a consumer installs and what a release tag holds (release-commit.ts). The pack test and the
 * benchmark's dependency table both read it from here, so they cannot disagree.
 */
export function packedFiles(root: string): string[] {
  return Bun.spawnSync({
    cmd: [process.execPath, 'pm', 'pack', '--dry-run'],
    cwd: root,
    stdout: 'pipe',
  })
    .stdout.toString()
    .split('\n')
    .map((line) => /^packed \S+ (.+)$/.exec(line.trim())?.[1])
    .filter((path): path is string => !!path);
}
