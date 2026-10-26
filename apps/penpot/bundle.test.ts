import { beforeAll, describe, expect, test } from 'bun:test';
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';

const OUT = join(import.meta.dir, 'out');
const SITE = join(import.meta.dir, '../website/public/penpot');
const read = (dir: string, file: string) => readFileSync(join(dir, file), 'utf8');

beforeAll(async () => {
  const build = Bun.spawn(['bun', 'bundle.ts'], { cwd: import.meta.dir, stdout: 'ignore', stderr: 'pipe' });
  expect(await build.exited, await new Response(build.stderr).text()).toBe(0);
}, 60_000);

describe('the built plugin', () => {
  test('every file the manifest names exists', () => {
    const manifest = JSON.parse(read(OUT, 'manifest.json'));
    for (const file of [manifest.code, manifest.icon, 'index.html', 'ui.js', 'style.css'])
      expect(existsSync(join(OUT, file)), file).toBe(true);
  });

  test('the same files are where the website serves them', () => {
    for (const file of ['manifest.json', 'plugin.js', 'index.html', 'ui.js', 'style.css', 'icon.png'])
      expect(existsSync(join(SITE, file)), file).toBe(true);
  });

  test('the code makes no request and loads no module', () => {
    for (const file of ['plugin.js', 'ui.js']) {
      const code = read(OUT, file);
      expect(code, file).not.toMatch(/\bfetch\(|XMLHttpRequest|WebSocket|sendBeacon|importScripts/);
      expect(code, file).not.toMatch(/^\s*(import|export)\s/m);
    }
  });

  test('the panel has no inline script and no inline handler, which the site policy would block', () => {
    const html = read(OUT, 'index.html');
    expect(html).not.toMatch(/<script(?![^>]*\ssrc=)/i);
    expect(html).not.toMatch(/\son[a-z]+\s*=\s*["']/i);
    expect(html).toContain('<script src="ui.js">');
  });
});
