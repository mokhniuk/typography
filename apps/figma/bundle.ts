/**
 * Bundles the plugin's sandbox code into one file, `out/code.js`, which `manifest.json` names. Figma runs it
 * without a module loader, so the engine and the 27 language packs are inlined.
 */
import { mkdirSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';

const OUT = fileURLToPath(new URL('./out/', import.meta.url));

rmSync(OUT, { recursive: true, force: true });
mkdirSync(OUT, { recursive: true });

const result = await Bun.build({
  entrypoints: [fileURLToPath(new URL('./code.ts', import.meta.url))],
  target: 'browser',
  format: 'iife',
  minify: true,
  outdir: OUT,
  naming: 'code.js',
});
if (!result.success) {
  for (const log of result.logs) console.error(String(log));
  process.exit(1);
}
const size = result.outputs[0]?.size ?? 0;
console.log(`out/code.js ${(size / 1024).toFixed(1)} KB`);

// The window is one file: Figma serves `ui` as it is, with no neighbours to load a stylesheet or script from.
const here = (name: string) => fileURLToPath(new URL(`./${name}`, import.meta.url));
const ui = await Bun.build({
  entrypoints: [here('ui.ts')],
  target: 'browser',
  format: 'iife',
  minify: true,
});
if (!ui.success) {
  for (const log of ui.logs) console.error(String(log));
  process.exit(1);
}
const script = (await ui.outputs[0]?.text()) ?? '';
const html = readFileSync(here('ui.html'), 'utf8')
  .replace('/*style*/', () => readFileSync(here('style.css'), 'utf8'))
  // `</script>` inside the code would end the element early.
  .replace('/*script*/', () => script.replaceAll('</script', '<\\/script'));
writeFileSync(`${OUT}ui.html`, html);
console.log(`out/ui.html ${(html.length / 1024).toFixed(1)} KB`);
