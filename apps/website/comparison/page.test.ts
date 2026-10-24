import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { FIXES, LANGS, REGEX, ROWS, SAMPLES, SCORE, SIZES, TOOLS, WHY } from './data.ts';

/**
 * The comparison page draws its tables from `data.ts` when it loads, so what can go wrong is a row
 * that does not match the tools, an id the script asks for that the markup lacks, or a number that
 * cannot be right. These checks stand in for loading it in a browser.
 */
const here = import.meta.dirname;
const markup = readFileSync(join(here, 'index.html'), 'utf8');
const script = readFileSync(join(here, 'page.ts'), 'utf8');

describe('comparison data', () => {
  test('every feature row has one mark per tool, each Y, P or N', () => {
    for (const row of ROWS) {
      if (row.length === 2) continue;
      expect(row[2], row[0]).toMatch(new RegExp(`^[YPN]{${TOOLS.length}}$`));
    }
  });

  test('no score passes more cases than it has', () => {
    for (const [name, pass, of] of SCORE) {
      expect(pass, name).toBeLessThanOrEqual(of);
      expect(pass, name).toBeGreaterThan(0);
    }
  });

  test('every speed size has a figure for every tool', () => {
    for (const [size, cfg] of Object.entries(SIZES))
      for (const tool of TOOLS) expect(cfg.data[tool], `${size} ${tool}`).toBeDefined();
  });

  test('every sample names only known tools', () => {
    for (const sample of SAMPLES)
      for (const tool of Object.keys(sample.out))
        expect(TOOLS as readonly string[]).toContain(tool);
  });

  test('every language row names tools the table has', () => {
    const known = new Set<string>([...TOOLS.slice(0, 6), 'retext']);
    for (const [code, , , who] of LANGS.rows)
      for (const w of who.split(' ')) expect(known.has(w), `${code} ${w}`).toBe(true);
  });

  test('cards and regex rows are filled in', () => {
    for (const row of [...WHY, ...FIXES]) for (const cell of row) expect(cell).not.toBe('');
    for (const [tool] of REGEX) expect(tool).not.toBe('');
  });
});

describe('comparison page', () => {
  test('the markup has every element the script asks for by id', () => {
    const ids = [...script.matchAll(/\$\('([A-Za-z]+)'\)/g)].map((m) => m[1] as string);
    expect(ids.length).toBeGreaterThan(8);
    for (const id of new Set(ids)) expect(markup, id).toContain(`id="${id}"`);
  });

  test('it is a page of the site: its own chrome, no inline style or font links', () => {
    expect(markup).toContain('<!--header-->');
    expect(markup).toContain('<!--footer-->');
    expect(markup).toContain('data-page="comparison"');
    expect(markup).not.toContain('<style');
    expect(markup).not.toContain('fonts.googleapis.com');
  });
});
