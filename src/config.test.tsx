import { describe, expect, test } from 'bun:test';
import type { ReactNode } from 'react';
import { renderToString } from 'react-dom/server';
import rehypeParse from 'rehype-parse';
import rehypeStringify from 'rehype-stringify';
import { unified } from 'unified';
import { type Io, run } from './cli/run.ts';
import {
  addRule,
  checkConfig,
  defineConfig,
  NBSP,
  RULES,
  type Rule,
  type TypographyConfig,
  typographic,
} from './core/index.ts';
import { typesetHtml } from './html/index.ts';
import { typesetMarkdown } from './markdown/index.ts';
import { Typeset, TypographyRoot } from './react/index.ts';
import rehypeTypography from './rehype/index.ts';
import { typesetText } from './text/index.ts';

/**
 * One config drives every site: the functions, the rehype plugin, React and the command line (from
 * `--config` and from `package.json`) set the same text. Between them the two configs move every
 * field away from its default, so a site that drops one shows.
 */
const site = defineConfig({
  lang: 'uk',
  quoteStyle: 'us',
  disable: ['dash.range'],
  enable: ['symbol.plusminus'],
  nbsp: 'char',
  hangAmount: 0.5,
});
/** The register only changes English: British quotes and a spaced en dash. */
const book = defineConfig({ register: 'literary', nbsp: 'char', hangAmount: 0 });
const CASES = [
  {
    name: 'site',
    config: site,
    input: '— Він сказав "так" - і пішов, 21-26 +-3...',
    // Dialogue dash and one-letter word (uk), US quotes, no range dash, ±.
    expected: '—~Він сказав “так”~— і~пішов, 21-26 ±3…',
  },
  {
    name: 'book',
    config: book,
    input: 'He said "yes" - and left, 21-26 +-3...',
    expected: 'He said ‘yes’~– and~left, 21–26 +-3…',
  },
] as const;

/** The text of rendered markup: scripts and tags out, the entities React and rehype write read back. */
const textOf = (html: string) =>
  html
    .replace(/<script[\s\S]*?<\/script>/g, '')
    .replace(/<[^>]*>/g, '')
    .replace(/&#x([0-9A-Fa-f]+);/g, (_, hex: string) =>
      String.fromCodePoint(Number.parseInt(hex, 16)),
    )
    .replace(/&#(\d+);/g, (_, dec: string) => String.fromCodePoint(Number(dec)))
    .replaceAll('&nbsp;', NBSP)
    .replaceAll('&quot;', '"')
    .replaceAll('&lt;', '<')
    .replaceAll('&gt;', '>')
    .replaceAll('&amp;', '&');

const viaRehype = (html: string, options: TypographyConfig) =>
  String(
    unified()
      .use(rehypeParse, { fragment: true })
      .use(rehypeTypography, options)
      .use(rehypeStringify)
      .processSync(html),
  );

function fake(files: Record<string, string>, modules: Record<string, unknown> = {}, stdin = '') {
  const out: string[] = [];
  const err: string[] = [];
  const io: Io = {
    readStdin: async () => stdin,
    readFile: async (path) => {
      const text = files[path];
      if (text === undefined) throw new Error('ENOENT');
      return text;
    },
    importModule: async (path) => {
      if (!(path in modules)) throw new Error(`Cannot find module "${path}"`);
      return modules[path];
    },
    writeFile: async () => {},
    out: (t) => out.push(t),
    err: (t) => err.push(t),
  };
  return { io, out: () => out.join(''), err: () => err.join('') };
}

describe.each(CASES)('one config drives every site: $name', ({ config, input, expected }) => {
  const EXPECTED = expected.replaceAll('~', NBSP);

  test('typographic, with the config spread in', () => {
    expect(typographic(input, config.lang, config)).toBe(EXPECTED);
  });

  test('text, HTML, Markdown', () => {
    expect(typesetText(input, config)).toBe(EXPECTED);
    expect(typesetHtml(`<p>${input}</p>`, config)).toBe(`<p>${EXPECTED}</p>`);
    expect(typesetMarkdown(input, config)).toBe(EXPECTED);
  });

  test('rehype', () => {
    expect(textOf(viaRehype(`<p>${input}</p>`, config))).toBe(EXPECTED);
  });

  test('React: TypographyRoot config, and the root carries --hang-amount', () => {
    const html = renderToString(
      <TypographyRoot config={config}>
        <p>
          <Typeset text={input} />
        </p>
      </TypographyRoot>,
    );
    expect(textOf(html)).toBe(EXPECTED);
    expect(html).toContain(`style="--hang-amount:${config.hangAmount}"`);
  });

  test('the command line, from --config (JSON and module) and from package.json', async () => {
    const json = fake({ 'site.json': JSON.stringify(config) }, {}, input);
    expect(await run(['--config', 'site.json'], json.io)).toBe(0);
    expect(json.out()).toBe(EXPECTED);

    const module = fake({}, { 'typography.config.ts': { default: config } }, input);
    expect(await run(['--config', 'typography.config.ts'], module.io)).toBe(0);
    expect(module.out()).toBe(EXPECTED);

    const pkg = fake(
      { 'package.json': JSON.stringify({ name: 'x', typography: config }) },
      {},
      input,
    );
    expect(await run([], pkg.io)).toBe(0);
    expect(pkg.out()).toBe(EXPECTED);
  });

  test('the command line writes the no-break space of the config in HTML', async () => {
    const t = fake({ 'site.json': JSON.stringify(config), 'a.html': `<p>${input}</p>` });
    await run(['--config', 'site.json', 'a.html'], t.io);
    expect(t.out()).toBe(`<p>${EXPECTED}</p>`);
  });
});

describe('precedence', () => {
  test('an option given to a call replaces the config value, lists included (no merging)', () => {
    expect(typesetText('"x" 1-2', { ...site, lang: 'de', quoteStyle: 'language' })).toBe('»x« 1-2');
    expect(typesetText('1-2 +-3', { ...site, disable: [] })).toBe('1–2 ±3');
    expect(typesetText('1-2 +-3', { ...site, enable: [] })).toBe('1-2 +-3');
    expect(typesetHtml('<p>a - b</p>', { ...site, nbsp: 'entity' })).toBe('<p>a&nbsp;— b</p>');
  });

  test('a command-line flag beats the config', async () => {
    const t = fake({ 'site.json': JSON.stringify(site) }, {}, '"x" 1-2 +-3');
    await run(['--config', 'site.json', '-l', 'de', '--quotes', 'language', '-d', 'quote'], t.io);
    expect(t.out()).toBe('"x" 1–2 ±3');
    const u = fake({ 'site.json': JSON.stringify(site) }, {}, '1-2 +-3');
    await run(['--config', 'site.json', '-e', 'symbol.implies'], u.io);
    expect(u.out()).toBe('1-2 +-3');
    const v = fake({ 'site.json': JSON.stringify(site), 'a.html': '<p>a - b</p>' });
    await run(['--config', 'site.json', '--nbsp', 'entity', 'a.html'], v.io);
    expect(v.out()).toBe('<p>a&nbsp;— b</p>');
  });

  test('--config wins over package.json, which is then not read', async () => {
    const t = fake(
      {
        'site.json': JSON.stringify({ lang: 'de' }),
        'package.json': JSON.stringify({ typography: { lang: 'pl', register: 'literary' } }),
      },
      {},
      '"x"',
    );
    await run(['--config', 'site.json'], t.io);
    expect(t.out()).toBe('»x«');
    const broken = fake({ 'site.json': '{}', 'package.json': '{' }, {}, '"x"');
    expect(await run(['--config', 'site.json'], broken.io)).toBe(0);
  });

  test('React: an explicit prop beats the config, which beats the outer root', () => {
    const text = (node: ReactNode) => textOf(renderToString(node));
    expect(
      text(
        <TypographyRoot lang="de" quoteStyle="language">
          <TypographyRoot config={{ lang: 'pl' }}>
            <Typeset text={'"x"'} />
          </TypographyRoot>
        </TypographyRoot>,
      ),
    ).toBe('„x”');
    expect(
      text(
        <TypographyRoot config={{ lang: 'pl' }} lang="de">
          <Typeset text={'"x"'} />
        </TypographyRoot>,
      ),
    ).toBe('»x«');
    // The inner root leaves quoteStyle and register to the outer one.
    expect(
      text(
        <TypographyRoot quoteStyle="us">
          <TypographyRoot config={{ lang: 'de' }}>
            <Typeset text={'"x"'} />
          </TypographyRoot>
        </TypographyRoot>,
      ),
    ).toBe('“x”');
    const html = renderToString(
      <TypographyRoot config={{ hangAmount: 0.3 }} hangAmount={0}>
        <Typeset text="x" />
      </TypographyRoot>,
    );
    expect(html).toContain('style="--hang-amount:0"');
    expect(renderToString(<TypographyRoot>x</TypographyRoot>)).not.toContain('style=');
  });

  test('Typeset takes a config too, below its own props and above the root', () => {
    const text = (node: ReactNode) => textOf(renderToString(node));
    expect(
      text(
        <TypographyRoot lang="de">
          <Typeset text={'"x"'} config={{ lang: 'pl' }} />
        </TypographyRoot>,
      ),
    ).toBe('„x”');
    expect(
      text(
        <TypographyRoot lang="de">
          <Typeset text={'"x"'} config={{ lang: 'pl' }} lang="en" />
        </TypographyRoot>,
      ),
    ).toBe('«x»');
  });
});

describe('defineConfig and checkConfig', () => {
  const shout: Rule = {
    id: 'extra.shout',
    about: 'Upper case',
    defaultOn: false,
    apply: (t) => t.replace(/\bloud\b/g, 'LOUD'),
  };
  const rules = addRule(RULES, shout, { last: true });

  test('returns the config as it is', () => {
    const config: TypographyConfig = { lang: 'de', rules, enable: ['extra.shout'] };
    expect(defineConfig(config)).toBe(config);
    expect(checkConfig({})).toEqual({});
    expect(checkConfig({ lang: 'de-CH' })).toEqual({ lang: 'de-CH' });
    expect(checkConfig({ lang: 'fr-CH' })).toEqual({ lang: 'fr-CH' });
  });

  test('throws on what it cannot use, saying what', () => {
    const bad = (value: unknown, message: RegExp) => {
      expect(() => checkConfig(value)).toThrow(message);
      expect(() => defineConfig(value as TypographyConfig)).toThrow(message);
    };
    bad({ language: 'en' }, /unknown key "language"/);
    bad({ lang: 'xx' }, /lang is .*"uk".*not "xx"/);
    // `ch` was the Swiss pack until 0.15.0; it is now de-CH and fr-CH, and the code is matched as written.
    bad({ lang: 'ch' }, /lang is .*"de-CH", "fr-CH".*not "ch"/);
    bad({ lang: 'de-ch' }, /lang is .*not "de-ch"/);
    bad({ register: 'book' }, /register is "display", "literary", not "book"/);
    bad({ quoteStyle: 'uk' }, /quoteStyle is "language", "us", not "uk"/);
    bad({ nbsp: 'raw' }, /nbsp is "entity", "char", not "raw"/);
    bad({ hangAmount: 2 }, /hangAmount is a number from 0 to 1, not 2/);
    bad({ hangAmount: '0.5' }, /hangAmount is a number from 0 to 1/);
    bad({ disable: 'dash.range' }, /disable is a list of rule ids or groups/);
    bad({ enable: [1] }, /enable is a list of rule ids or groups/);
    bad({ disable: ['dash.rnage'] }, /Unknown typography rule "dash.rnage"/);
    bad({ enable: ['extra.shout'] }, /Unknown typography rule "extra.shout"/);
    bad({ disable: ['quote'], enable: ['quote'] }, /in both disable and enable/);
    bad({ rules: [{ id: 'x' }] }, /rules is a list of rules .*module, not JSON/);
    bad(null, /expected an object/);
    bad(['lang'], /expected an object/);
  });

  test('a rule name is checked against the config’s own rules', () => {
    expect(() => checkConfig({ rules, enable: ['extra.shout'] })).not.toThrow();
  });

  test('the command line reports a bad config as a usage error', async () => {
    const t = fake({ 'site.json': JSON.stringify({ lang: 'xx' }) });
    expect(await run(['--config', 'site.json'], t.io)).toBe(2);
    expect(t.err()).toMatch(/typo: site\.json: config: lang is/);
    const p = fake({ 'package.json': JSON.stringify({ typography: { colour: 1 } }) });
    expect(await run([], p.io)).toBe(2);
    expect(t.err() + p.err()).toMatch(/package\.json: config: unknown key "colour"/);
    const m = fake({}, { 'a.ts': { lang: 'de' } });
    expect(await run(['--config', 'a.ts'], m.io)).toBe(2);
    expect(m.err()).toMatch(/a\.ts: .*default export/);
    const missing = fake({});
    expect(await run(['--config', 'nope.json'], missing.io)).toBe(2);
    expect(missing.err()).toMatch(/cannot read nope\.json/);
    const json = fake({ 'site.json': '{ lang: de }' });
    expect(await run(['--config', 'site.json'], json.io)).toBe(2);
    expect(json.err()).toMatch(/site\.json: /);
    const rulesInJson = fake({ 'site.json': JSON.stringify({ rules: [] }) });
    expect(await run(['--config', 'site.json'], rulesInJson.io)).toBe(2);
  });

  test('custom rules come only from a module config, and --rules lists them', async () => {
    const config = { default: { rules, enable: ['extra.shout'] } };
    const t = fake({}, { 'c.ts': config }, 'so loud');
    await run(['--config', 'c.ts'], t.io);
    expect(t.out()).toBe('so LOUD');
    const u = fake({}, { 'c.ts': config });
    await run(['--config', 'c.ts', '--rules'], u.io);
    expect(u.out()).toContain('extra.shout');
  });
});

describe('a config spreads into any call', () => {
  test('with an option of the call beside it (this is checked by tsc)', () => {
    const text = '"x"';
    expect(typographic(text, site.lang, { ...site, register: 'literary' })).toBe('“x”');
    expect(typesetText(text, { ...site, lang: 'de' })).toBe('“x”');
    expect(typesetHtml(text, { ...book, lang: 'de', nbsp: 'entity' })).toBe('»x«');
    expect(typesetMarkdown(text, { ...book, onChange: () => {} })).toBe('‘x’');
    expect(textOf(viaRehype(text, { ...site, quoteStyle: 'language' }))).toBe('«x»');
  });
});
