/**
 * Writes docs/sources.md and docs/sources.html from scripts/sources.ts.
 *
 *     bun scripts/gen-sources.ts        (or: bun run docs:sources)
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { render } from './sources';
import { renderHtml } from './sources-html';

const docs = join(import.meta.dir, '..', 'docs');
writeFileSync(join(docs, 'sources.md'), render());
writeFileSync(join(docs, 'sources.html'), renderHtml());
