import { describe, expect, test } from 'bun:test';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { SITE_ROOT, SITE_URL } from './build/site';

describe('the Penpot plugin page', () => {
  const page = readFileSync(join(SITE_ROOT, 'content/docs/penpot-plugin.md'), 'utf8');

  test('gives the address of the manifest the site serves under /penpot/', () => {
    expect(page).toContain(`${SITE_URL}/penpot/manifest.json`);
  });

  test('says what the plugin asks for, as the manifest lists it', () => {
    const manifest = JSON.parse(readFileSync(join(SITE_ROOT, '../penpot/manifest.json'), 'utf8'));
    expect(manifest.permissions).toEqual(['content:read', 'content:write', 'allow:localstorage']);
    expect(page).toContain('read and write content');
    expect(page).toContain('local storage');
  });
});
