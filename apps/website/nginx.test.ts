import { describe, expect, test } from 'bun:test';
import { createHash } from 'node:crypto';
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { generatedPages } from './build/pages';
import { finish, source } from './build/plugin';
import { SITE_ROOT } from './build/site';

// Comment lines are dropped first, so a directive that was commented out cannot satisfy a check.
export const uncommented = (text: string): string => text.replace(/^\s*#.*$/gm, '');

const conf = uncommented(readFileSync(join(SITE_ROOT, 'nginx.conf'), 'utf8'));

export const headerIn = (text: string, name: string): string | undefined =>
  new RegExp(`add_header ${name} "([^"]*)" always;`).exec(uncommented(text))?.[1];

const header = (name: string): string | undefined => headerIn(conf, name);

const policy = (): Map<string, string[]> => {
  const directives = new Map<string, string[]>();
  for (const part of (header('Content-Security-Policy') ?? '').split(';')) {
    const [name, ...values] = part.trim().split(/\s+/);
    if (name) directives.set(name, values);
  }
  return directives;
};

// The pages that carry an inline script, as the build emits them: every page goes through `finish`
// (build/plugin.ts), so a build step that alters an inline script changes what is hashed here too.
// The paths are the ones `website()` gives it: generated pages by their own path, the hand-written
// ones by their directory.
const pages = [
  ...[...generatedPages()].map(([path, html]) => finish(html, path)),
  ...[
    ['', 'index.html'],
    ['playground/', 'playground/index.html'],
    ['font-checker/', 'font-checker/index.html'],
  ].map(([path, file]) => finish(source(file as string), path as string)),
];

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
  test('a commented-out directive is not found', () => {
    const text =
      '# add_header Content-Security-Policy "x" always;\n  # add_header X-Frame-Options "DENY" always;\n';
    expect(headerIn(text, 'Content-Security-Policy')).toBeUndefined();
    expect(
      headerIn(`${text}add_header X-Frame-Options "SAMEORIGIN" always;`, 'X-Frame-Options'),
    ).toBe('SAMEORIGIN');
  });

  test('no page has an inline event handler or a javascript: link, which script-src would not cover', () => {
    for (const html of pages) {
      const markup = html.replace(/<script[\s\S]*?<\/script>/gi, '');
      expect(markup).not.toMatch(/\son[a-z]+\s*=\s*["']/i);
      expect(markup).not.toMatch(/href=["']javascript:/i);
    }
  });

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
