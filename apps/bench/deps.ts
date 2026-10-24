/**
 * What installing each tool brings: its packages and their weight on disk, the licence, whether it
 * ships type declarations, its module format and when the installed version was published.
 * `bun apps/bench/deps.ts`; `run.ts` puts the table in RESULTS.md.
 */
import { existsSync, readdirSync, readFileSync, statSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { packedFiles } from '../../scripts/pack';

const BENCH = dirname(fileURLToPath(import.meta.url));
const REPO = join(BENCH, '../..');

type Pkg = {
  name: string;
  version: string;
  license?: string;
  type?: string;
  module?: string;
  types?: string;
  typings?: string;
  exports?: unknown;
  dependencies?: Record<string, string>;
};

const readPkg = (dir: string): Pkg => JSON.parse(readFileSync(join(dir, 'package.json'), 'utf8'));

/** The directory Node would load `name` from, looking up from `from` as far as the bench's own node_modules. */
function resolve(name: string, from: string): string {
  for (let dir = from; dir.startsWith(BENCH); dir = dirname(dir)) {
    const candidate = join(dir, 'node_modules', name);
    if (existsSync(join(candidate, 'package.json'))) return candidate;
  }
  throw new Error(`${name} is not installed under ${from}; run bun install in apps/bench`);
}

/** Bytes on disk under `dir`, not counting a nested node_modules (those packages are counted on their own). */
function bytes(dir: string): number {
  let total = 0;
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    if (entry.name === 'node_modules') continue;
    const path = join(dir, entry.name);
    total += entry.isDirectory() ? bytes(path) : entry.isFile() ? statSync(path).size : 0;
  }
  return total;
}

/** Every package `roots` pull in, the roots included, each counted once. */
function closure(roots: string[]): string[] {
  const seen = new Set<string>();
  const visit = (name: string, from: string) => {
    const dir = resolve(name, from);
    if (seen.has(dir)) return;
    seen.add(dir);
    for (const dep of Object.keys(readPkg(dir).dependencies ?? {})) visit(dep, dir);
  };
  for (const root of roots) visit(root, BENCH);
  return [...seen];
}

const hasTypes = (dir: string, pkg: Pkg) =>
  pkg.types || pkg.typings || existsSync(join(dir, 'index.d.ts')) || JSON.stringify(pkg.exports ?? '').includes('"types"')
    ? 'yes'
    : existsSync(join(BENCH, 'node_modules/@types', pkg.name))
      ? 'from @types'
      : 'no';

function format(pkg: Pkg): string {
  const exports = JSON.stringify(pkg.exports ?? '');
  const esm = pkg.type === 'module' || !!pkg.module || exports.includes('"import"');
  const cjs = pkg.type !== 'module' || exports.includes('"require"');
  return esm && cjs ? 'ESM and CommonJS' : esm ? 'ESM' : 'CommonJS';
}

async function published(name: string, version: string): Promise<string> {
  try {
    const res = await fetch(`https://registry.npmjs.org/${name}`, { signal: AbortSignal.timeout(10_000) });
    const time = ((await res.json()) as { time?: Record<string, string> }).time?.[version];
    return time ? time.slice(0, 10) : '?';
  } catch {
    return '?';
  }
}

const kb = (n: number) => (n >= 1024 * 1024 ? `${(n / 1024 / 1024).toFixed(1)} MB` : `${Math.round(n / 1024)} KB`);

/** The packages a user installs to use each tool; retext-smartypants needs unified and a parser around it. */
const TOOLS: [string, string[]][] = [
  ['typograf', ['typograf']],
  ['typopo', ['typopo']],
  ['richtypo', ['richtypo']],
  ['tipograph', ['tipograph']],
  ['smartypants', ['smartypants']],
  ['retext-smartypants', ['retext-smartypants', 'unified', 'retext-english', 'retext-stringify']],
];

/** This package installs from npm or from a git tag whose commit holds what `bun pm pack` packs (scripts/release-commit.ts). */
function enginePackage(): { files: number; bytes: number } {
  const listed = packedFiles(REPO);
  const bytes = listed.reduce((sum, file) => sum + statSync(join(REPO, file)).size, 0);
  return { files: listed.length, bytes };
}

export async function depsSection(): Promise<string[]> {
  const own = readPkg(REPO);
  const e = enginePackage();
  const date = await published(own.name, own.version);
  const ownPublished = date === '?' ? 'not published yet' : date;
  const rows = [
    '| Tool | Packages installed | Install footprint | Licence | Types | Format | Version published |',
    '|---|---|---|---|---|---|---|',
    `| @mokhniuk/typography | 1 (react is an optional peer) | ${kb(e.bytes)} (${e.files} files) | ${own.license ?? 'none'} | yes | ESM | ${ownPublished} (${own.version}) |`,
  ];
  for (const [tool, roots] of TOOLS) {
    const dirs = closure(roots);
    const root = resolve(roots[0] ?? tool, BENCH);
    const pkg = readPkg(root);
    const total = dirs.reduce((sum, dir) => sum + bytes(dir), 0);
    rows.push(
      `| ${tool} | ${dirs.length} | ${kb(total)} | ${pkg.license ?? 'none'} | ${hasTypes(root, pkg)} | ${format(pkg)} | ${await published(pkg.name, pkg.version)} (${pkg.version}) |`,
    );
  }
  return [
    '## Dependencies',
    '',
    "What `npm install` (or a git dependency) puts on disk for one tool: its package and everything it depends on, counted once each, read from `apps/bench/node_modules` (for this package, what `bun pm pack` packs, which is what a release tag holds). This is the developer's disk and install time; what reaches a reader of a page is in [Bundle size](#bundle-size). The licence, types and format are those of the tool's own package; the date is when the installed version was published to npm.",
    '',
    ...rows,
    '',
  ];
}

if (import.meta.main) console.log((await depsSection()).join('\n'));
