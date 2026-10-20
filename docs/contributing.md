# Contributing

Everything here runs from the project folder with Bun.

## Checks

```sh
bun test src playground      # every test; this is the package's `test` script
bun run typecheck            # tsc -p tsconfig.json; tests are typechecked too
```

`bun test` does not typecheck; `bun run typecheck` does, and covers `src`, `playground` and `bench` (and `scripts` through the test that imports the docs generator).

No lint configuration is included yet. The project used the Biome settings of the repository it was developed in; add a `biome.json` before relying on a formatter.

When you change a rule or its examples, regenerate the rules page and commit it with the change:

```sh
bun run docs:rules           # writes docs/rules.md
```

## Where things are

| Path | What it holds |
|---|---|
| `src/core/` | The engine: `typography.ts` (`typographic`, `explain`), `rules.ts` (the `RULES` table), `quotes.ts`, `dashes.ts`, `spaces.ts`, `marks.ts`, `zones.ts` (text set aside), `profiles.ts` (per-language data), `hang.ts` (`splitHangs`), `diff.ts` |
| `src/text`, `src/html`, `src/markdown`, `src/rehype` | The modes, each built on `typesetBlock` |
| `src/dom`, `src/react` | Hanging punctuation, framework-free and React |
| `src/cli` | The `typo` command; `run.ts` takes an `Io` object so it can be tested without a process |
| `scripts/gen-rules-doc.ts` | Generates `docs/rules.md` |
| `bench/` | The benchmark |
| `playground/` | The web page |
| `docs/` | These pages. `rules.md` is generated; the others are written by hand |

## Adding a rule

1. Write the function in the file that fits: `dashes.ts`, `spaces.ts` or `marks.ts` (or `quotes.ts` for quotation). It takes the text and, if it needs it, a language or context, and returns the text.
2. Add one entry to `RULES` in `src/core/rules.ts`, in the place in the order where it should run: `{ id, about, apply }`. The id is `group.name`, or one word for a rule that stands alone. `about` is the one-line description that `typo --rules` prints and `docs/rules.md` shows.
3. Do not add a step inside `typographic()`. It only loops over `RULES`, which is what makes a rule switchable (`disable`) and reportable (`explain`, `onChange`).
4. Add examples to `EXAMPLES` in `scripts/gen-rules-doc.ts` (at least one, each of which must change its text when only that rule runs), then `bun run docs:rules`. `src/docs.test.ts` fails if a rule has no examples, if an example changes nothing, or if `docs/rules.md` is out of date.
5. Add tests in `src/core/typography.test.ts`. Run the property tests (below): a new rule must not lose or add a letter or digit, and must be stable on its own output.
6. Update [limits.md](limits.md) if the rule has a known limit, and add an entry to [../CHANGELOG.md](../CHANGELOG.md) saying whether it can change existing output (a new rule almost always can).

The order is part of the behaviour. For example, `dash.range` runs before `dash.sentence` so a spaced range is not read as a break in the sentence.

## Adding a language

1. Add the code to `Lang` in `src/core/types.ts`.
2. Add its data to `src/core/profiles.ts`: its quote levels in `PROFILES` (a language is "in" the package when it is a key of `PROFILES`; `LANGS` is derived from it), and, where it has them, `ORPHANS`, `ABBREVIATIONS`, `SENTENCE_DASH`, and for the literary register `LITERARY` and `SENTENCE_DASH_LITERARY`. A language with no entry in one of those tables simply gets no rule from it.
3. If a rule keys on the language by name rather than by table (`space.percent` in `src/core/spaces.ts` lists `de` and `fr`), extend it.
4. Add tests (`src/core/typography.test.ts`) and an examples row in `scripts/gen-rules-doc.ts` for every rule that acts on the new language, then `bun run docs:rules`.
5. Update [languages.md](languages.md) by hand: it is not generated.
6. Abbreviation lists and the like come from a style guide, not from memory; say in `languages.md` whether a native reader has seen them.

The command line and the rehype plugin take the language list from `LANGS`, so they follow.

## Tests

- **Golden tests** sit beside each module (`*.test.ts`).
- **Property tests** (`src/properties.test.ts`) run on seeded random strings built from characters the rules care about, for every language and register: no letter or digit is lost or added; a second pass changes nothing, on text as it is written; addresses, emails and code spans come back exactly; HTML tags, attributes and `<pre>`/`<code>` are kept byte for byte; Markdown code is kept; the text mode keeps the number of lines; and nothing throws. A failure prints the input, so it can be turned into a golden case.
- **The boundary test** (`src/boundary.test.ts`) scans `src` and `playground` and fails if a file imports from outside the package (a relative path that leaves it, a monorepo alias, a workspace package) or from anything but `react`, `react/jsx-runtime` and `bun:test`. Test files may also import `node:` modules and the unified/remark/rehype dev dependencies; the command line may import `node:` modules. The playground's `vite.config.ts` is not scanned. `scripts/` is not scanned either, so keep it to imports from `../src` and `node:`.
- **The docs test** (`src/docs.test.ts`) is described above.

## The benchmark

```sh
bun run bench                # bun bench/run.ts
```

It runs this package, typograf and typopo over the same style-neutral checks and writes every case, check and output to `bench/RESULTS.md`, with a speed table. The cases are in `bench/cases.ts` and were written by the package author, so read them and contest them. Do not tune a rule to a case: a case says what is right, not what one tool produces. The results file is regenerated by the command; commit it when it changes, and update the numbers in [limits.md](limits.md) if the speed table moved.

## The playground

```sh
bun run playground           # vite dev server for playground/
bun run playground:build     # static site in playground/dist
```

A client-side page: paste text, HTML or Markdown, pick language, register and how a no-break space is written, and see the result, a word-level diff of what changed, a switch for each rule, and a preview with hanging punctuation (HTML is previewed in a sandboxed frame). Nothing is sent anywhere. The page imports from `../src` and is covered by the boundary test.

## Releasing

Versions are semver while below 1.0.0.

- A **minor** release (0.1.0 to 0.2.0) may change the output of the engine or the API. Any entry in the changelog marked "Can change existing output: yes" needs a minor release.
- A **patch** release (0.1.0 to 0.1.1) fixes a bug without changing output you rely on.

To release:

1. Move the new entries of `CHANGELOG.md` under a heading `## X.Y.Z (date)`.
2. Set `version` in `package.json` (`typo --version` reads it).
3. Run `bun test src playground`, `bun run typecheck`, `bun run docs:rules` and, if `src/dom/hang.ts` changed, `bun run gen:script`, and commit with the message `release: X.Y.Z`.
4. Tag it: `git tag vX.Y.Z`, then `git push --follow-tags`.

## Using it from another project

- Pinned: depend on a tag, `bun add git+ssh://git@github.com/<owner>/typography.git#vX.Y.Z` (it needs SSH access to the repository).
- While developing both: run `bun link` once in this folder, and `"@podiia/typography": "link:@podiia/typography"` in the consumer resolves to this folder, so edits show up at once.
- The package ships `.ts` sources with no build step. A consumer needs Bun or a TypeScript-aware bundler; with Vite's server-side build, list the package under `ssr.noExternal`.
- `react` is an optional peer dependency (`>=18`), needed only by the `./react` entry.
