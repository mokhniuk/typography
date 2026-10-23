import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { markHangsInPage } from './build/hang';
import { generatedPages } from './build/pages';
import { source } from './build/plugin';
import { fill, SITE_ROOT } from './build/site';

const conf = readFileSync(join(SITE_ROOT, 'nginx.conf'), 'utf8');

const header = (name: string): string | undefined =>
  new RegExp(`add_header ${name} "([^"]*)" always;`).exec(conf)?.[1];

const policy = (): Map<string, string[]> => {
  const directives = new Map<string, string[]>();
  for (const part of (header('Content-Security-Policy') ?? '').split(';')) {
    const [name, ...values] = part.trim().split(/\s+/);
    if (name) directives.set(name, values);
  }
  return directives;
};

// The pages that carry an inline script: the theme script sits in every head, and the build adds the
// hang script to a page with `data-hanging` content (`finish` in build/plugin.ts, by `markHangsInPage`).
const pages = [
  ...generatedPages().values(),
  ...['index.html', 'playground/index.html', 'font-checker/index.html'].map((file) =>
    fill(source(file)),
  ),
].map(markHangsInPage);

// A script block with a `type` other than JavaScript (JSON-LD) is data: browsers never run it and
// the policy ignores it.
const inlineScripts = (html: string): string[] =>
  [...html.matchAll(/<script([^>]*)>([\s\S]*?)<\/script>/g)]
    .filter(([, attributes]) => !/\ssrc=/.test(attributes ?? ''))
    .filter(([, attributes]) => {
      const type = /\stype="([^"]*)"/.exec(attributes ?? '')?.[1];
      return !type || /javascript|module/.test(type);
    })
    .map(([, , body]) => body ?? '');

const hash = (script: string): string =>
  `'sha256-${createHash('sha256').update(script, 'utf8').digest('base64')}'`;

describe('security headers', () => {
  test('every inline script is allowed by its hash', () => {
    const allowed = policy().get('script-src') ?? [];
    const scripts = new Set(pages.flatMap(inlineScripts));
    expect(scripts.size).toBe(2);
    for (const script of scripts)
      expect(allowed, `${script.slice(0, 40)}...`).toContain(hash(script));
  });

  test('script-src lists nothing but self and the two hashes', () => {
    const allowed = policy().get('script-src') ?? [];
    expect(allowed).not.toContain("'unsafe-inline'");
    expect(allowed.filter((value) => !value.startsWith("'sha256-"))).toEqual(["'self'"]);
    expect(allowed).toHaveLength(3);
  });

  test('plugins are off and everything else falls back to the site itself', () => {
    expect(policy().get('object-src')).toEqual(["'none'"]);
    expect(policy().get('default-src')).toEqual(["'self'"]);
  });

  test('the other security headers are set, always', () => {
    expect(header('X-Content-Type-Options')).toBe('nosniff');
    expect(header('X-Frame-Options')).toBe('SAMEORIGIN');
    expect(header('Referrer-Policy')).toBe('strict-origin-when-cross-origin');
    expect(header('Permissions-Policy')).toBe('camera=(), microphone=(), geolocation=()');
  });

  test('no location sets a header, which would drop the server-level ones', () => {
    const locations = conf.match(/location [^{]*\{[^}]*\}/g) ?? [];
    for (const block of locations) expect(block).not.toContain('add_header');
  });
});
