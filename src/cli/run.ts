import { parseArgs } from 'node:util';
import pkg from '../../package.json';
import {
  type Change,
  LANGS,
  type Lang,
  type QuoteStyle,
  REGISTERS,
  type Register,
  RULES,
  type Rule,
  typographic,
} from '../core';
import { typesetHtml } from '../html';
import { typesetMarkdown } from '../markdown';
import { typesetText } from '../text';

/** What the command line touches in the world, so it can be tested without it. */
export type Io = {
  readStdin(): Promise<string>;
  readFile(path: string): Promise<string>;
  writeFile(path: string, data: string): Promise<void>;
  out(text: string): void;
  err(text: string): void;
};

type Format = 'text' | 'html' | 'markdown';

const HELP = `typo: typeset running text (quotes, dashes, no-break spaces)

Usage
  typo [options] [file...]        typeset the files (or standard input)
  cat note.txt | typo -l uk       read standard input, write standard output

Options
  -l, --lang <${LANGS.join('|')}>   language of the text (default en)
  -r, --register <${REGISTERS.join('|')}>   display (default) or literary
      --quotes <language|us>      language (default): the quote marks of the language;
                                  us: “…” and ‘…’ in any language and register
  -f, --format <text|html|markdown>   how to read the input; by default from the
                                      file extension (.html, .md), else text
  -d, --disable <rules>           switch rules off: ids or groups, comma separated
                                  (e.g. dash.range,space); see --rules
  -e, --enable <rules>            switch on rules that are off by default, same form
                                  (--rules marks them); a rule in both is an error
      --rules                     list the rules and exit
      --explain                   list every change and the rule that made it, instead
                                  of the typeset text; with --json as a JSON array
      --json                      JSON output for --explain
  -w, --write                     rewrite the files in place
  -c, --check                     change nothing; exit 1 if any file would change
      --nbsp <entity|char>        HTML only: write a no-break space as &nbsp; (default) or the character
  -h, --help                      show this
  -v, --version                   show the version

With several files, use --write or --check. Exit status: 0 ok, 1 a file would
change (--check), 2 a usage or read error.`;

const VERSION = pkg.version;

/** One line per rule: id, description, and a note on a rule that is off unless enabled. */
export function formatRules(rules: readonly Rule[]): string {
  const width = Math.max(...rules.map((r) => r.id.length));
  return rules
    .map(
      (r) =>
        `${r.id.padEnd(width)}  ${r.about}${r.defaultOn === false ? ` (off by default; --enable ${r.id})` : ''}`,
    )
    .join('\n');
}

function formatOf(path: string | null, given: string | undefined): Format | null {
  if (given) {
    if (given === 'md') return 'markdown';
    return given === 'text' || given === 'html' || given === 'markdown' ? given : null;
  }
  if (path && /\.(?:html?|xhtml)$/i.test(path)) return 'html';
  if (path && /\.(?:md|markdown)$/i.test(path)) return 'markdown';
  return 'text';
}

export async function run(argv: string[], io: Io): Promise<number> {
  let parsed: ReturnType<typeof parse>;
  try {
    parsed = parse(argv);
  } catch (error) {
    io.err(`typo: ${error instanceof Error ? error.message : String(error)}\n`);
    return 2;
  }
  const { values, positionals } = parsed;
  if (values.help) {
    io.out(`${HELP}\n`);
    return 0;
  }
  if (values.version) {
    io.out(`${VERSION}\n`);
    return 0;
  }
  const lang = (values.lang ?? 'en') as Lang;
  const register = (values.register ?? 'display') as Register;
  if (!LANGS.includes(lang))
    return usage(io, `unknown language "${values.lang}" (${LANGS.join(', ')})`);
  if (!REGISTERS.includes(register)) return usage(io, `unknown register "${values.register}"`);
  if (values.quotes && values.quotes !== 'language' && values.quotes !== 'us') {
    return usage(io, `--quotes is "language" or "us", not "${values.quotes}"`);
  }
  const quoteStyle = (values.quotes ?? 'language') as QuoteStyle;
  if (values.nbsp && values.nbsp !== 'entity' && values.nbsp !== 'char') {
    return usage(io, `--nbsp is "entity" or "char", not "${values.nbsp}"`);
  }
  if (values.write && values.check) return usage(io, '--write and --check cannot be used together');
  if (values.rules) {
    io.out(`${formatRules(RULES)}\n`);
    return 0;
  }
  if (values.json && !values.explain) return usage(io, '--json goes with --explain');
  if (values.explain && (values.write || values.check)) {
    return usage(io, '--explain only reports; it cannot be used with --write or --check');
  }
  const names = (given: string[] | undefined) =>
    (given ?? [])
      .flatMap((d) => d.split(','))
      .map((d) => d.trim())
      .filter(Boolean);
  const disable = names(values.disable);
  const enable = names(values.enable);
  try {
    typographic('', lang, { disable, enable });
  } catch (error) {
    return usage(io, error instanceof Error ? error.message : String(error));
  }
  const nbsp = values.nbsp === 'char' ? 'char' : 'entity';
  const found: (Change & { file: string | null })[] = [];
  const typeset = (text: string, format: Format, file: string | null) => {
    const options = {
      lang,
      register,
      quoteStyle,
      disable,
      enable,
      onChange: values.explain ? (change: Change) => found.push({ file, ...change }) : undefined,
    };
    return format === 'html'
      ? typesetHtml(text, { ...options, nbsp })
      : format === 'markdown'
        ? typesetMarkdown(text, options)
        : typesetText(text, options);
  };
  const report = () => {
    if (values.json) {
      io.out(`${JSON.stringify(found, null, 2)}\n`);
      return;
    }
    for (const c of found) {
      io.out(
        `${c.file ? `${c.file}: ` : ''}${c.rule}: ${JSON.stringify(c.from)} -> ${JSON.stringify(c.to)}\n`,
      );
    }
  };

  const files = positionals.filter((p) => p !== '-');
  if (files.length === 0) {
    if (values.write) return usage(io, '--write needs files');
    const format = formatOf(null, values.format);
    if (!format) return usage(io, `unknown format "${values.format}"`);
    const input = await io.readStdin();
    const output = typeset(input, format, null);
    if (values.explain) {
      report();
      return 0;
    }
    if (values.check) return output === input ? 0 : 1;
    io.out(output);
    return 0;
  }
  if (files.length > 1 && !values.write && !values.check && !values.explain) {
    return usage(io, 'several files: use --write or --check');
  }
  let status = 0;
  for (const file of files) {
    const format = formatOf(file, values.format);
    if (!format) return usage(io, `unknown format "${values.format}"`);
    let input: string;
    try {
      input = await io.readFile(file);
    } catch (error) {
      io.err(
        `typo: cannot read ${file}: ${error instanceof Error ? error.message : String(error)}\n`,
      );
      status = 2;
      continue;
    }
    const output = typeset(input, format, file);
    if (values.explain) continue;
    if (values.check) {
      if (output !== input) {
        io.err(`${file}: would change\n`);
        if (status === 0) status = 1;
      }
    } else if (values.write) {
      if (output !== input) {
        await io.writeFile(file, output);
        io.err(`${file}: typeset\n`);
      }
    } else {
      io.out(output);
    }
  }
  if (values.explain) report();
  return status;
}

function usage(io: Io, message: string): number {
  io.err(`typo: ${message}\nTry "typo --help".\n`);
  return 2;
}

function parse(argv: string[]) {
  return parseArgs({
    args: argv,
    allowPositionals: true,
    options: {
      lang: { type: 'string', short: 'l' },
      register: { type: 'string', short: 'r' },
      quotes: { type: 'string' },
      format: { type: 'string', short: 'f' },
      nbsp: { type: 'string' },
      disable: { type: 'string', short: 'd', multiple: true },
      enable: { type: 'string', short: 'e', multiple: true },
      rules: { type: 'boolean' },
      explain: { type: 'boolean' },
      json: { type: 'boolean' },
      write: { type: 'boolean', short: 'w' },
      check: { type: 'boolean', short: 'c' },
      help: { type: 'boolean', short: 'h' },
      version: { type: 'boolean', short: 'v' },
    },
  });
}
