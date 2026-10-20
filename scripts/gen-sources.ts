/**
 * Writes docs/sources.md, docs/sources.html and docs/bibliography.html from scripts/sources.ts.
 *
 *     bun scripts/gen-sources.ts        (or: bun run docs:sources)
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { renderBibliographyHtml } from './bibliography-html';
import { render } from './sources';
import { renderHtml } from './sources-html';

const docs = join(import.meta.dir, '..', 'docs');
writeFileSync(join(docs, 'sources.md'), render());
writeFileSync(join(docs, 'sources.html'), renderHtml());
writeFileSync(join(docs, 'bibliography.html'), renderBibliographyHtml());
