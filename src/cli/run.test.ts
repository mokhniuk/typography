import { describe, expect, test } from 'bun:test';
import { addRule, DEFAULT_RULES, RULES, type Rule } from '../core';
import { formatRules, type Io, run } from './run';

function fake(files: Record<string, string> = {}, stdin = '') {
  const out: string[] = [];
  const err: string[] = [];
  const written: Record<string, string> = {};
  const io: Io = {
    readStdin: async () => stdin,
    readFile: async (path) => {
      const text = files[path];
      if (text === undefined) throw new Error('ENOENT');
      return text;
    },
    importModule: async (path) => {
      throw new Error(`no module ${path}`);
    },
    writeFile: async (path, data) => {
      written[path] = data;
    },
    out: (t) => out.push(t),
    err: (t) => err.push(t),
  };
  return { io, out: () => out.join(''), err: () => err.join(''), written };
}

const nb = (s: string) => s.replaceAll(' ', '~');

describe('typo', () => {
  test('typesets standard input to standard output', async () => {
    const t = fake({}, 'He said "hi" - and left.\n');
    expect(await run([], t.io)).toBe(0);
    expect(nb(t.out())).toBe('He said «hi»~— and left.\n');
  });

  test('reads the language and register from the options', async () => {
    const t = fake({}, '"x"\n');
    await run(['-l', 'de'], t.io);
    expect(t.out()).toBe('»x«\n');
    const u = fake({}, '"x"\n');
    await run(['--register', 'literary'], u.io);
    expect(u.out()).toBe('‘x’\n');
  });

  test('--avoid keeps the text as typed where a rule would insert a character the font lacks', async () => {
    const t = fake({}, 'He said "hi"... ok\n');
    expect(await run(['--avoid', '«»'], t.io)).toBe(0);
    expect(nb(t.out())).toBe('He said "hi"… ok\n');
    const u = fake({ 'package.json': JSON.stringify({ typography: { avoid: '…' } }) }, '"x"... ok\n');
    await run([], u.io);
    expect(nb(u.out())).toBe('«x»... ok\n');
  });

  test('a Ukrainian dialogue dash is read at the start of every paragraph', async () => {
    const t = fake({}, '- Один\n\n- Два\n');
    await run(['-l', 'uk', '-r', 'literary'], t.io);
    expect(nb(t.out())).toBe('—~Один\n\n—~Два\n');
  });

  test('picks the format from the extension, and --format overrides it', async () => {
    const t = fake({ 'a.html': '<p>"x" - <code>"y"</code></p>', 'b.md': '# "x" - `"y"`\n' });
    await run(['a.html'], t.io);
    expect(t.out()).toBe('<p>«x»&nbsp;— <code>"y"</code></p>');
    const u = fake({ 'b.md': '# "x" - `"y"`\n' });
    await run(['b.md'], u.io);
    expect(nb(u.out())).toBe('# «x»~— `"y"`\n');
    const v = fake({ 'b.md': '"x"\n' });
    await run(['-f', 'text', 'b.md'], v.io);
    expect(v.out()).toBe('«x»\n');
  });

  test('--write rewrites only the files that change', async () => {
    const t = fake({ 'a.txt': '"x"\n', 'b.txt': 'plain\n' });
    expect(await run(['-w', 'a.txt', 'b.txt'], t.io)).toBe(0);
    expect(t.written).toEqual({ 'a.txt': '«x»\n' });
    expect(t.err()).toBe('a.txt: typeset\n');
  });

  test('--check changes nothing and exits 1 when a file would change', async () => {
    const t = fake({ 'a.txt': '"x"\n', 'b.txt': 'plain\n' });
    expect(await run(['-c', 'a.txt', 'b.txt'], t.io)).toBe(1);
    expect(t.written).toEqual({});
    expect(t.err()).toBe('a.txt: would change\n');
    const u = fake({ 'b.txt': 'plain\n' });
    expect(await run(['-c', 'b.txt'], u.io)).toBe(0);
  });

  test('usage errors exit 2', async () => {
    for (const argv of [
      ['-l', 'xx'],
      ['-r', 'x'],
      ['-w'],
      ['-w', '-c', 'a.txt'],
      ['--nbsp', 'x'],
      ['--nope'],
    ]) {
      const t = fake({ 'a.txt': 'x' });
      expect(await run(argv, t.io)).toBe(2);
    }
    const t = fake({ 'a.txt': 'x', 'b.txt': 'y' });
    expect(await run(['a.txt', 'b.txt'], t.io)).toBe(2);
    expect(await run(['missing.txt'], fake().io)).toBe(2);
  });

  test('--help and --version', async () => {
    const t = fake();
    expect(await run(['--help'], t.io)).toBe(0);
    expect(t.out()).toContain('Usage');
    const u = fake();
    expect(await run(['-v'], u.io)).toBe(0);
    expect(u.out()).toMatch(/^\d+\.\d+\.\d+\n$/);
  });

  test('--disable switches rules off; a typo in a rule is a usage error', async () => {
    const t = fake({}, 'wait... "x"\n');
    await run(['-d', 'ellipsis'], t.io);
    expect(t.out()).toBe('wait... «x»\n');
    const u = fake({}, '1-2 "x"\n');
    await run(['-d', 'dash.range,quote'], u.io);
    expect(u.out()).toBe('1-2 "x"\n');
    const v = fake({}, 'x');
    expect(await run(['-d', 'dash.rnge'], v.io)).toBe(2);
    expect(v.err()).toContain('Unknown typography rule');
  });

  test('--rules lists them', async () => {
    const t = fake();
    expect(await run(['--rules'], t.io)).toBe(0);
    expect(t.out()).toContain('dash.range');
    expect(t.out().split('\n').filter(Boolean).length).toBeGreaterThan(10);
  });

  test('--explain lists the changes instead of the text, --json as data', async () => {
    const t = fake({ 'a.txt': 'say "x"... now\n' });
    expect(await run(['--explain', 'a.txt'], t.io)).toBe(0);
    expect(t.out()).toContain('a.txt: quote: "\\"" -> "«"');
    expect(t.out()).toContain('a.txt: ellipsis: "..." -> "…"');
    expect(t.out()).not.toContain('say «x»');
    const u = fake({}, '"x"\n');
    await run(['--explain', '--json'], u.io);
    expect(JSON.parse(u.out())).toEqual([
      { file: null, rule: 'quote', from: '"', to: '«' },
      { file: null, rule: 'quote', from: '"', to: '»' },
    ]);
  });

  test('--json and --explain are used together, and --explain only reports', async () => {
    expect(await run(['--json'], fake({}, 'x').io)).toBe(2);
    expect(await run(['--explain', '-w', 'a.txt'], fake({ 'a.txt': 'x' }).io)).toBe(2);
  });

  test('--enable takes rule ids and groups; a typo, or a rule also in --disable, is a usage error', async () => {
    // No built-in rule is off by default yet: enabling one that is already on changes nothing.
    const t = fake({}, 'wait... "x"\n');
    expect(await run(['--enable', 'ellipsis,space'], t.io)).toBe(0);
    expect(t.out()).toBe('wait… «x»\n');
    const u = fake({}, 'x');
    expect(await run(['--enable', 'ellipsi'], u.io)).toBe(2);
    expect(u.err()).toContain('Unknown typography rule "ellipsi"');
    const v = fake({}, 'x');
    expect(await run(['--enable', 'ellipsis', '--disable', 'ellipsis'], v.io)).toBe(2);
    expect(v.err()).toContain('both');
  });

  test('--quotes us sets “…” and ‘…’ in any language; the default is the language', async () => {
    const t = fake({}, '"x \'y\'"\n');
    expect(await run(['--quotes', 'us'], t.io)).toBe(0);
    expect(t.out()).toBe('“x ‘y’”\n');
    const u = fake({}, '"x"\n');
    await run(['--quotes', 'us', '-l', 'de', '-r', 'literary'], u.io);
    expect(u.out()).toBe('“x”\n');
    const v = fake({}, '"x"\n');
    await run(['--quotes', 'language', '-l', 'de'], v.io);
    expect(v.out()).toBe('»x«\n');
    const w = fake({ 'a.html': '<p>"x"</p>', 'b.md': '"x"\n' });
    await run(['--quotes', 'us', 'a.html'], w.io);
    expect(w.out()).toBe('<p>“x”</p>');
  });

  test('--quotes with anything else is a usage error', async () => {
    const t = fake({}, 'x');
    expect(await run(['--quotes', 'uk'], t.io)).toBe(2);
    expect(t.err()).toContain('--quotes');
  });

  test('--help mentions --enable and --quotes', async () => {
    const t = fake();
    await run(['--help'], t.io);
    expect(t.out()).toContain('--enable');
    expect(t.out()).toContain('--quotes');
  });
});

describe('formatRules', () => {
  const shout: Rule = { id: 'extra.shout', about: 'Upper case', defaultOn: false, apply: (x) => x };

  test('lists every rule with its description, and says which are off by default', () => {
    const lines = formatRules(addRule(RULES, shout, { last: true })).split('\n');
    expect(lines.at(-1)).toMatch(
      /^extra\.shout +Upper case \(off by default; --enable extra\.shout\)$/,
    );
    expect(lines[0]).not.toContain('off by default');
    expect(lines.length).toBe(RULES.length + 1);
  });

  test('shows the category of each rule as a column, blank for a rule without one', () => {
    const lines = formatRules(addRule(RULES, shout, { last: true })).split('\n');
    expect(lines[0]).toMatch(/^quote +tradition +Quotation marks/);
    expect(lines.find((line) => line.startsWith('symbol.minus '))).toMatch(
      /^symbol\.minus +math +/,
    );
    expect(lines.at(-1)).toMatch(/^extra\.shout {2,}Upper case/);
  });

  test('is unchanged for the built-in list', () => {
    expect(formatRules(DEFAULT_RULES)).not.toContain('off by default');
  });
});
