/**
 * Rewrites `src/snapshot.digests.json`: one SHA-256 per language and variant over what the engine
 * gives on the seeded snapshot corpus (see `snapshotDigests` in corpus.ts). Run it only when output
 * changes on purpose, or a language is added (`bun run snapshot`), and commit the diff.
 */
import { resolve } from 'node:path';
import { SNAPSHOT_N, loadEngine, snapshotDigests } from './corpus';

const root = resolve(import.meta.dir, '..');
const engine = await loadEngine(resolve(root, 'src'));
const digests: Record<string, unknown> = {};
for (const lang of engine.core.LANGS) {
  digests[lang] = snapshotDigests(engine, lang);
  console.log(`${lang} done`);
}
const file = resolve(root, 'src/snapshot.digests.json');
await Bun.write(file, `${JSON.stringify({ n: SNAPSHOT_N, digests }, null, 2)}\n`);
console.log(`wrote ${file}`);
