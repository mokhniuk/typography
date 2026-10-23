# Command line: `typo`

```
typo [options] [file...]
```

The `typo` bin points at the compiled `dist/cli/main.js` and runs on Node 20 or later and on Bun: `npx typo ...` (or `bunx typo ...`) runs it without installing it globally, and `npm install -g @mokhniuk/typography` puts `typo` on the path (from 0.16.0). A `--config` file written in TypeScript (`typography.config.ts`) needs Bun or a Node that strips types (22.18 or later, 24); a `.json` config works everywhere. From a source checkout, run `bun run src/cli/main.ts ...` from the package folder (or `bun /path/to/typography/src/cli/main.ts`).

It typesets text, HTML or Markdown with the same engine as the library functions (`typesetText`, `typesetHtml`, `typesetMarkdown`).

## Options

| Flag | Short | Argument | Default | Meaning |
|---|---|---|---|---|
| `--lang` | `-l` | a pack code (the 24 EU languages, `uk`, `de-CH`, `fr-CH`; case matters) | `en` | Language of the text. |
| `--register` | `-r` | `display`, `literary` | `display` | Register. |
| `--format` | `-f` | `text`, `html`, `markdown` (`md` is accepted) | by extension | How to read the input. |
| `--quotes` | | `language`, `us`, `guillemets` | `language` | `language`: the quote marks of the language. `us`: `“…”` and `‘…’` in any language and register. `guillemets`: `«…»`, `„…“` and `‚…‘` in any language and register (the house style). |
| `--disable` | `-d` | rule ids or groups, comma separated | none | Switch rules off, for example `dash.range,space`. The flag may be given more than once. |
| `--enable` | `-e` | rule ids or groups, comma separated | none | Switch on rules that are off by default (`--rules` marks them). The flag may be given more than once. A rule named in both `--enable` and `--disable` is a usage error. |
| `--rules` | | | | List the rules (the config's `rules` when it has them), one per line: id, category (`tradition`, `symbols`, `math` or `data`, see [rules.md](rules.md#categories)) and description, and exit 0. A rule that is off by default is marked `(off by default; --enable <id>)`. |
| `--explain` | | | | Print every change and the rule behind it, instead of the typeset text. |
| `--json` | | | | JSON output for `--explain`. An error without `--explain`. |
| `--write` | `-w` | | | Rewrite the files in place. |
| `--check` | `-c` | | | Change nothing; exit 1 if any input would change. |
| `--avoid` | | characters | none | Characters the font cannot draw (`--avoid "⇒½¼¾−"`): a rule that would insert one of them leaves the text as it was typed, for that one change; quotation marks are kept whole, so if one mark of a quotation is avoided, every quotation mark stays as typed. See [api.md](api.md#avoid). |
| `--nbsp` | | `entity`, `char` | `entity` | HTML only: write a no-break space as `&nbsp;` or as the character. Checked for every format, used only for HTML. |
| `--config` | | a file | `typography` in `./package.json` | Read the options from a config (see [Config](#config) below). |
| `--help` | `-h` | | | Show the help and exit 0. |
| `--version` | `-v` | | | Print the version of the package (from `package.json`) and exit 0. |

## Input

- With no file (or `-` as the file), the command reads standard input to the end. A terminal with nothing piped in waits for input.
- With files, each is read as UTF-8.
- One file and no `--write`, `--check` or `--explain`: the typeset text goes to standard output.
- Several files need `--write`, `--check` or `--explain`; otherwise the command refuses (exit 2), because their outputs would run together.
- `--write` needs files; it does not work on standard input.

### Format by extension

When `-f` is not given:

| File | Format |
|---|---|
| `.html`, `.htm`, `.xhtml` (any case) | `html` |
| `.md`, `.markdown` (any case) | `markdown` |
| anything else, and standard input | `text` |

`-f` overrides the extension. An unknown format is a usage error.

## Exit codes

| Code | Meaning |
|---|---|
| 0 | Success. With `--check`: nothing would change. |
| 1 | `--check` only: at least one input would change. |
| 2 | A usage error (unknown flag, language, register, format, rule, `--quotes` or `--nbsp` value; a config that cannot be read or does not check; `--write` with `--check`; `--json` without `--explain`; `--explain` with `--write` or `--check`; `--write` without files; several files with no `--write`/`--check`/`--explain`) or a file that could not be read. |

Messages go to standard error, prefixed `typo:`. With `--check`, each file that would change is named on standard error as `<file>: would change`. With `--write`, each file that was rewritten is named as `<file>: typeset`; a file that needs no change is not written. When a file cannot be read, the command reports it, goes on to the next file and exits 2 at the end (a later `would change` does not lower it to 1).

`--write` and `--check` cannot be used together. `--explain` only reports.

## `--explain`

Prints one line per change, in the order the rules ran:

```
note.txt: quote: "\"" -> "“"
note.txt: dash.range: "-" -> "–"
```

The file name is left out when the input is standard input. With `--json` the output is an array of `{ file, rule, from, to }` objects, where `file` is the path or `null` for standard input:

```json
[
  { "file": null, "rule": "ellipsis", "from": "...", "to": "…" }
]
```

`--explain` accepts several files and prints one combined list at the end. It exits 0 unless a file could not be read.

## Examples

```sh
typo note.txt                       # typeset to standard output
cat note.txt | typo -l uk           # standard input, Ukrainian
typo -w docs/*.md                   # rewrite Markdown files in place
typo -r literary -l en story.txt    # British quotes, spaced en dash
typo -d dash.range,space page.html  # a rule and a whole group off
typo -f html --nbsp char < page.txt # read as HTML, write a real no-break space
typo --rules                        # the rule ids, their categories and what each does
typo --explain note.txt             # what would change, and why
typo --explain --json -l de < note.txt
```

### In CI

`--check` changes nothing and fails the build if a file is not already typeset:

```sh
npx typo --check -l en docs/*.md || exit 1
```

Exit 1 means "would change", exit 2 means the command was misused or a file is missing, so a CI step can tell the two apart. A second run on the output of `--write` reports nothing (the engine is stable on its own output).

## Config

The options can come from a config (`TypographyConfig`, see [api.md](api.md#config)), so a project writes them once:

- `--config <file>`: a module (`.ts`, `.mts`, `.cts`, `.js`, `.mjs`, `.cjs`) whose default export is the config, usually written with `defineConfig`, or a `.json` file holding the config object. A path is relative to the current directory.
- Without `--config`: the `typography` key of `package.json` in the current directory, if the file and the key exist.

```json
{
  "name": "site",
  "typography": { "lang": "uk", "quoteStyle": "us", "enable": ["symbol.plusminus"] }
}
```

Precedence: a flag beats the config, and `--config` beats `package.json`, which is then not read; nothing is merged, so `--disable quote` replaces the config's `disable` list rather than adding to it. The config is checked like `defineConfig` (unknown key, bad value, a rule name that matches no rule): a mistake is a usage error (exit 2) that names the file. Custom `rules` can only come from a module; in JSON they are an error. `nbsp` is used for HTML only, and `hangAmount` is accepted and ignored (it is for `TypographyRoot`).

```sh
typo --config typography.config.ts -w docs/*.md
typo -l de page.md                  # package.json's config, with the language replaced
```

## Rules and groups

`--disable`, `--enable` and `--rules` use the ids in [rules.md](rules.md). A name that matches no rule is a usage error (exit 2) and the message lists the ids. The category `--rules` shows (`tradition`, `symbols`, `math`, `data`) is a label, not a name `--disable` takes.
