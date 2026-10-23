import { parseArgs } from 'node:util';
import pkg from '../../package.json' with { type: 'json' };
import { checkConfig, LANGS, PACKS, REGISTERS, RULES, typographic, } from '../core/index.js';
import { typesetHtml } from '../html/index.js';
import { typesetMarkdown } from '../markdown/index.js';
import { typesetText } from '../text/index.js';
const HELP = `typo: typeset running text (quotes, dashes, no-break spaces)

Usage
  typo [options] [file...]        typeset the files (or standard input)
  cat note.txt | typo -l uk       read standard input, write standard output

Options
  -l, --lang <${LANGS.join('|')}>   language of the text (default en)
  -r, --register <${REGISTERS.join('|')}>   display (default) or literary
      --quotes <language|us|guillemets>   language (default): the quote marks of the
                                  language; us: “…” and ‘…’ in any language and register;
                                  guillemets: «…», „…“ and ‚…‘ in any language and register
  -f, --format <text|html|markdown>   how to read the input; by default from the
                                      file extension (.html, .md), else text
  -d, --disable <rules>           switch rules off: ids or groups, comma separated
                                  (e.g. dash.range,space); see --rules
  -e, --enable <rules>            switch on rules that are off by default, same form
                                  (--rules marks them); a rule in both is an error
      --rules                     list the rules (id, category, description) and exit
      --explain                   list every change and the rule that made it, instead
                                  of the typeset text; with --json as a JSON array
      --json                      JSON output for --explain
  -w, --write                     rewrite the files in place
  -c, --check                     change nothing; exit 1 if any file would change
      --avoid <characters>        characters the font cannot draw ("⇒½¼¾−"): a rule that would
                                  insert one of them leaves the text as it was typed
      --nbsp <entity|char>        HTML only: write a no-break space as &nbsp; (default) or the character
      --config <file>             read the options from a config: a .ts/.js/.mjs module with a
                                  default export, or a .json file. Without it, the "typography"
                                  key of ./package.json is read, if there is one. A flag beats both.
  -h, --help                      show this
  -v, --version                   show the version

With several files, use --write or --check. Exit status: 0 ok, 1 a file would
change (--check), 2 a usage or read error.`;
const VERSION = pkg.version;
/** Short English names of the packs that set `field` (an empty list sets nothing): `German and French`. */
function languagesWith(field) {
    const list = [];
    for (const pack of PACKS) {
        const value = pack[field];
        if (Array.isArray(value) ? !value.length : !value)
            continue;
        const short = pack.name.split(' (')[0] ?? pack.name;
        list.push(list.includes(short) ? pack.name : short);
    }
    return list.length > 1
        ? `${list.slice(0, -1).join(', ')} and ${list.at(-1)}`
        : (list[0] ?? 'none');
}
/**
 * One line per rule: id, category (blank for a rule without one), description, the languages of each
 * pack field it names (`Rule.packFields`), and a note on a rule that is off unless enabled.
 */
export function formatRules(rules) {
    const width = Math.max(...rules.map((r) => r.id.length));
    const categoryWidth = Math.max(0, ...rules.map((r) => r.category?.length ?? 0));
    return rules
        .map((r) => `${r.id.padEnd(width)}  ${(r.category ?? '').padEnd(categoryWidth)}  ${r.about}${(r.packFields ?? []).map((field) => ` [${field}: ${languagesWith(field)}]`).join('')}${r.defaultOn === false ? ` (off by default; --enable ${r.id})` : ''}`)
        .join('\n');
}
function formatOf(path, given) {
    if (given) {
        if (given === 'md')
            return 'markdown';
        return given === 'text' || given === 'html' || given === 'markdown' ? given : null;
    }
    if (path && /\.(?:html?|xhtml)$/i.test(path))
        return 'html';
    if (path && /\.(?:md|markdown)$/i.test(path))
        return 'markdown';
    return 'text';
}
export async function run(argv, io) {
    let parsed;
    try {
        parsed = parse(argv);
    }
    catch (error) {
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
    let config;
    try {
        config = await loadConfig(values.config, io);
    }
    catch (error) {
        return usage(io, error instanceof Error ? error.message : String(error));
    }
    // `--lang` is a code; a module config may give a pack.
    const lang = (values.lang ?? config.lang ?? 'en');
    const register = (values.register ?? config.register ?? 'display');
    if (typeof lang === 'string' && !LANGS.includes(lang))
        return usage(io, `unknown language "${values.lang}" (${LANGS.join(', ')})`);
    if (!REGISTERS.includes(register))
        return usage(io, `unknown register "${values.register}"`);
    if (values.quotes && !['language', 'us', 'guillemets'].includes(values.quotes)) {
        return usage(io, `--quotes is "language", "us" or "guillemets", not "${values.quotes}"`);
    }
    const quoteStyle = (values.quotes ?? config.quoteStyle ?? 'language');
    if (values.nbsp && values.nbsp !== 'entity' && values.nbsp !== 'char') {
        return usage(io, `--nbsp is "entity" or "char", not "${values.nbsp}"`);
    }
    if (values.write && values.check)
        return usage(io, '--write and --check cannot be used together');
    if (values.rules) {
        io.out(`${formatRules(config.rules ?? RULES)}\n`);
        return 0;
    }
    if (values.json && !values.explain)
        return usage(io, '--json goes with --explain');
    if (values.explain && (values.write || values.check)) {
        return usage(io, '--explain only reports; it cannot be used with --write or --check');
    }
    const names = (given) => (given ?? [])
        .flatMap((d) => d.split(','))
        .map((d) => d.trim())
        .filter(Boolean);
    // A flag replaces the config's list, as an option given to a call does.
    const disable = values.disable ? names(values.disable) : (config.disable ?? []);
    const enable = values.enable ? names(values.enable) : (config.enable ?? []);
    const rules = config.rules;
    try {
        typographic('', lang, { disable, enable, rules });
    }
    catch (error) {
        return usage(io, error instanceof Error ? error.message : String(error));
    }
    const nbsp = (values.nbsp ?? config.nbsp) === 'char' ? 'char' : 'entity';
    const avoid = values.avoid ?? config.avoid;
    const found = [];
    const typeset = (text, format, file) => {
        const options = {
            lang,
            register,
            quoteStyle,
            disable,
            enable,
            rules,
            avoid,
            onChange: values.explain ? (change) => found.push({ file, ...change }) : undefined,
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
            io.out(`${c.file ? `${c.file}: ` : ''}${c.rule}: ${JSON.stringify(c.from)} -> ${JSON.stringify(c.to)}\n`);
        }
    };
    const files = positionals.filter((p) => p !== '-');
    if (files.length === 0) {
        if (values.write)
            return usage(io, '--write needs files');
        const format = formatOf(null, values.format);
        if (!format)
            return usage(io, `unknown format "${values.format}"`);
        const input = await io.readStdin();
        const output = typeset(input, format, null);
        if (values.explain) {
            report();
            return 0;
        }
        if (values.check)
            return output === input ? 0 : 1;
        io.out(output);
        return 0;
    }
    if (files.length > 1 && !values.write && !values.check && !values.explain) {
        return usage(io, 'several files: use --write or --check');
    }
    let status = 0;
    for (const file of files) {
        const format = formatOf(file, values.format);
        if (!format)
            return usage(io, `unknown format "${values.format}"`);
        let input;
        try {
            input = await io.readFile(file);
        }
        catch (error) {
            io.err(`typo: cannot read ${file}: ${error instanceof Error ? error.message : String(error)}\n`);
            status = 2;
            continue;
        }
        const output = typeset(input, format, file);
        if (values.explain)
            continue;
        if (values.check) {
            if (output !== input) {
                io.err(`${file}: would change\n`);
                if (status === 0)
                    status = 1;
            }
        }
        else if (values.write) {
            if (output !== input) {
                await io.writeFile(file, output);
                io.err(`${file}: typeset\n`);
            }
        }
        else {
            io.out(output);
        }
    }
    if (values.explain)
        report();
    return status;
}
const message = (error) => (error instanceof Error ? error.message : String(error));
/** Reads JSON, naming the file in the error. */
function parseJson(path, text) {
    try {
        return JSON.parse(text);
    }
    catch (error) {
        throw new Error(`${path}: ${message(error)}`);
    }
}
/** Checks a config read as JSON, which cannot hold rules. */
function fromJson(path, value) {
    if (value && typeof value === 'object' && 'rules' in value) {
        throw new Error(`${path}: rules can only come from a module config (--config typography.config.ts)`);
    }
    try {
        return checkConfig(value);
    }
    catch (error) {
        throw new Error(`${path}: ${message(error)}`);
    }
}
/**
 * The config the options start from: the `--config` file if given (a module's default export, or a
 * JSON file), else the `typography` key of `package.json` in the current directory, else nothing.
 * The two are never merged.
 */
async function loadConfig(path, io) {
    if (path === undefined) {
        let text;
        try {
            text = await io.readFile('package.json');
        }
        catch {
            return {};
        }
        const pkg = parseJson('package.json', text);
        const value = pkg && typeof pkg === 'object' ? pkg.typography : undefined;
        return value === undefined ? {} : fromJson('package.json', value);
    }
    if (/\.json$/i.test(path)) {
        let text;
        try {
            text = await io.readFile(path);
        }
        catch (error) {
            throw new Error(`cannot read ${path}: ${message(error)}`);
        }
        return fromJson(path, parseJson(path, text));
    }
    if (!/\.[cm]?[jt]s$/i.test(path)) {
        throw new Error(`--config takes a .ts, .js, .mjs or .json file, not "${path}"`);
    }
    let loaded;
    try {
        loaded = await io.importModule(path);
    }
    catch (error) {
        throw new Error(`cannot read ${path}: ${message(error)}`);
    }
    const value = loaded && typeof loaded === 'object' ? loaded.default : undefined;
    if (value === undefined)
        throw new Error(`${path}: expected a default export (the config)`);
    try {
        return checkConfig(value);
    }
    catch (error) {
        throw new Error(`${path}: ${message(error)}`);
    }
}
function usage(io, message) {
    io.err(`typo: ${message}\nTry "typo --help".\n`);
    return 2;
}
function parse(argv) {
    return parseArgs({
        args: argv,
        allowPositionals: true,
        options: {
            lang: { type: 'string', short: 'l' },
            register: { type: 'string', short: 'r' },
            quotes: { type: 'string' },
            format: { type: 'string', short: 'f' },
            nbsp: { type: 'string' },
            avoid: { type: 'string' },
            config: { type: 'string' },
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
