/**
 * The package as npm installs it, run under Node: builds, packs with `npm pack`, installs the tarball
 * and `react` into a temporary project, then imports every entry point in `exports`, typesets a line
 * of text and of HTML, checks the React entry, and runs the installed `typo` command.
 *
 *     bun scripts/smoke.ts [node-binary]     node-binary defaults to `node` on the path
 *
 * Exits non-zero, with a line saying what failed, on any failure. CI runs it under each supported
 * Node version (.github/workflows/release.yml).
 */
import { execFileSync } from 'node:child_process';
import { mkdirSync, mkdtempSync, readdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { delimiter, dirname, join } from 'node:path';

const root = join(import.meta.dir, '..');
const pkg = JSON.parse(readFileSync(join(root, 'package.json'), 'utf8')) as {
  name: string;
  version: string;
  exports: Record<string, unknown>;
};
const node = process.argv[2] ?? 'node';

function sh(
  cmd: string,
  args: string[],
  opts: { cwd: string; input?: string; env?: NodeJS.ProcessEnv },
) {
  return execFileSync(cmd, args, {
    cwd: opts.cwd,
    input: opts.input,
    env: opts.env ?? process.env,
    encoding: 'utf8',
    stdio: ['pipe', 'pipe', 'pipe'],
  });
}

class SmokeFailure extends Error {}

/** Runs one check; on failure prints `smoke: FAIL <what> (<why>)` and the command's stderr. */
function step<T>(what: string, run: () => T): T {
  try {
    const result = run();
    console.log(`smoke: ok ${what}`);
    return result;
  } catch (error) {
    const stderr = (error as { stderr?: string }).stderr;
    console.error(`smoke: FAIL ${what} (${(error as Error).message.split('\n')[0]})`);
    if (stderr) console.error(stderr.trim());
    throw new SmokeFailure(what);
  }
}

const work = mkdtempSync(join(tmpdir(), 'typography-smoke-'));
try {
  const nodeVersion = step('node runs', () => sh(node, ['--version'], { cwd: work }).trim());
  console.log(`smoke: node ${nodeVersion}`);

  step('build', () => sh('bun', ['run', 'build'], { cwd: root }));
  const tarball = step('npm pack', () => {
    sh('npm', ['pack', '--ignore-scripts', '--silent', '--pack-destination', work], { cwd: root });
    const file = readdirSync(work).find((f) => f.endsWith('.tgz'));
    if (!file) throw new Error('npm pack wrote no tarball');
    return join(work, file);
  });

  const project = join(work, 'project');
  step('install the tarball and react', () => {
    mkdirSync(project);
    writeFileSync(
      join(project, 'package.json'),
      '{ "name": "smoke", "private": true, "type": "module" }\n',
    );
    sh('npm', ['install', '--no-audit', '--no-fund', '--silent', tarball, 'react@19'], {
      cwd: project,
    });
  });

  // The code entry points (a `types` and a `default` each); `./package.json` is read on its own.
  const entries = Object.entries(pkg.exports)
    .filter(([, target]) => typeof target === 'object')
    .map(([key]) => pkg.name + key.slice(1));
  const probe = `
import { createRequire } from 'node:module';
const manifest = createRequire(import.meta.url)(${JSON.stringify(`${pkg.name}/package.json`)});
if (manifest.version !== ${JSON.stringify(pkg.version)}) throw new Error('package.json gave ' + manifest.version);
const entries = ${JSON.stringify(entries)};
for (const entry of entries) {
  const mod = await import(entry);
  if (Object.keys(mod).length === 0) throw new Error(entry + ' exports nothing');
}
const { typographic } = await import(${JSON.stringify(pkg.name)});
const text = typographic('He said "hi" - ok', 'en');
if (!text.includes('\\u201chi\\u201d')) throw new Error('typographic gave ' + JSON.stringify(text));
const { typesetHtml } = await import(${JSON.stringify(`${pkg.name}/html`)});
const html = typesetHtml('<p>"hi"</p>', { lang: 'en' });
if (!html.includes('\\u201chi\\u201d')) throw new Error('typesetHtml gave ' + JSON.stringify(html));
const { Typeset } = await import(${JSON.stringify(`${pkg.name}/react`)});
if (typeof Typeset !== 'function') throw new Error('Typeset is ' + typeof Typeset);
console.log(entries.length + ' entries; ' + text + '; ' + html);
`;
  writeFileSync(join(project, 'probe.mjs'), probe);
  const probed = step('import every entry point, typeset text and HTML, React entry', () =>
    sh(node, ['probe.mjs'], { cwd: project }).trim(),
  );
  console.log(`smoke: ${probed}`);

  // The installed bin, through its shebang, with the given Node first on the path.
  const typo = join(project, 'node_modules', '.bin', 'typo');
  const path = node.includes('/')
    ? [dirname(node), process.env.PATH].join(delimiter)
    : process.env.PATH;
  const env = { ...process.env, PATH: path };
  step(`typo --version prints ${pkg.version}`, () => {
    const out = sh(typo, ['--version'], { cwd: project, env }).trim();
    if (!out.includes(pkg.version)) throw new Error(`printed ${JSON.stringify(out)}`);
  });
  step('typo -l uk sets «привіт»', () => {
    const out = sh(typo, ['-l', 'uk'], { cwd: project, env, input: 'Він сказав "привіт"\n' });
    if (!out.includes('«привіт»')) throw new Error(`printed ${JSON.stringify(out)}`);
  });
  // A --config file is read relative to the cwd: JSON on every Node, TypeScript where Node strips types.
  writeFileSync(join(project, 'typography.config.json'), '{ "lang": "uk" }\n');
  step('typo --config typography.config.json sets «привіт»', () => {
    const out = sh(typo, ['--config', 'typography.config.json'], {
      cwd: project,
      env,
      input: '"привіт"\n',
    });
    if (!out.includes('«привіт»')) throw new Error(`printed ${JSON.stringify(out)}`);
  });
  const [major = 0, minor = 0] = nodeVersion.replace(/^v/, '').split('.').map(Number);
  if (major > 22 || (major === 22 && minor >= 18)) {
    writeFileSync(join(project, 'typography.config.ts'), "export default { lang: 'uk' };\n");
    step('typo --config typography.config.ts sets «привіт»', () => {
      const out = sh(typo, ['--config', 'typography.config.ts'], {
        cwd: project,
        env,
        input: '"привіт"\n',
      });
      if (!out.includes('«привіт»')) throw new Error(`printed ${JSON.stringify(out)}`);
    });
  } else {
    console.log(`smoke: skipped: a .ts config needs Node 22.18 or later (this is ${nodeVersion})`);
  }
  console.log('smoke: all passed');
} catch (error) {
  if (!(error instanceof SmokeFailure)) console.error(`smoke: FAIL ${(error as Error).message}`);
  process.exitCode = 1;
} finally {
  rmSync(work, { recursive: true, force: true });
}
