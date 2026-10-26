/**
 * Builds the plugin into `out/` (what Penpot loads: the manifest, `plugin.js`, the panel) and copies it to
 * `apps/website/public/penpot/`, where the website serves it at `/penpot/`. Penpot loads the plugin code
 * without a module loader, so the engine and the 27 language packs are inlined; the panel is a separate
 * `ui.js` because the site's CSP forbids inline scripts.
 */
import { cpSync, mkdirSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const here = (name: string) => fileURLToPath(new URL(`./${name}`, import.meta.url));
const OUT = here('out/');
const SITE = fileURLToPath(new URL('../website/public/penpot/', import.meta.url));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

for (const [entry, name] of [['plugin.ts', 'plugin.js'], ['ui.ts', 'ui.js']] as const) {
  const result = await Bun.build({
    entrypoints: [here(entry)],
    target: 'browser',
    format: 'iife',
    minify: true,
    outdir: OUT,
    naming: name,
  });
  if (!result.success) {
    for (const log of result.logs) console.error(String(log));
    process.exit(1);
  }
  console.log(`out/${name} ${((result.outputs[0]?.size ?? 0) / 1024).toFixed(1)} KB`);
}
for (const file of ['manifest.json', 'index.html', 'style.css', 'icon.png']) cpSync(here(file), `${OUT}${file}`);

rmSync(SITE, { recursive: true, force: true });
cpSync(OUT, SITE, { recursive: true });
console.log('copied to apps/website/public/penpot/');
