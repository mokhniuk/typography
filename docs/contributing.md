# Contributing

Everything here runs from the project folder with Bun.

## Checks

```sh
bun test src playground      # every test; this is the package's `test` script
bun run typecheck            # tsc -p tsconfig.json; tests are typechecked too
```

`bun test` does not typecheck; `bun run typecheck` does, and covers `src` and `playground` (and `scripts` through the test that imports the docs generator).

No lint configuration is included yet. The project used the Biome settings of the repository it was developed in; add a `biome.json` before relying on a formatter.

When you change a rule or its examples, regenerate the rules page and commit it with the change:

```sh
bun run docs:rules           # writes docs/rules.md
bun run docs:languages       # writes docs/languages/*.md from the packs
```

## Where things are

| Path | What it holds |
|---|---|
| `src/core/` | The engine: `typography.ts` (`typographic`, `explain`), `rules.ts` (the `RULES` table), `quotes.ts`, `dashes.ts`, `spaces.ts`, `marks.ts`, `zones.ts` (text set aside), `lang/` (one pack per language, and the registry), `profiles.ts` (the tables derived from the packs), `hang.ts` (`splitHangs`), `diff.ts` |
| `src/text`, `src/html`, `src/markdown`, `src/rehype` | The modes, each built on `typesetBlock` |
| `src/dom`, `src/react` | Hanging punctuation, framework-free and React |
| `src/cli` | The `typo` command; `run.ts` takes an `Io` object so it can be tested without a process |
| `scripts/gen-rules-doc.ts` | Generates `docs/rules.md` |
| `scripts/gen-languages-doc.ts` | Generates `docs/languages/<code>.md` and `docs/languages/index.md` from the packs |
| `bench/` | The benchmark: a separate project, not tracked except `RESULTS.md` (see below) |
| `playground/` | The web page |
| `docs/` | These pages. `rules.md` and `languages/` are generated; the others are written by hand |

## Adding a rule

1. Write the function in the file that fits: `dashes.ts`, `spaces.ts` or `marks.ts` (or `quotes.ts` for quotation). It takes the text and, if it needs it, a language or context, and returns the text.
2. Add one entry to `RULES` in `src/core/rules.ts`, in the place in the order where it should run: `{ id, about, apply }`, and `defaultOn: false` if the rule must run only when asked for (`enable`, `--enable`, a checkbox in the playground). Several places are reserved for planned rules (the comment block above `RULES`; `src/core/rules-order.test.ts` pins the order and checks a planned rule against its place). The id is `group.name`, or one word for a rule that stands alone. `about` is the one-line description that `typo --rules` prints and `docs/rules.md` shows.
3. Do not add a step inside `typographic()`. It only loops over `RULES`, which is what makes a rule switchable (`disable`) and reportable (`explain`, `onChange`).
4. Add examples to `EXAMPLES` in `scripts/gen-rules-doc.ts` (at least one, each of which must change its text when only that rule runs), then `bun run docs:rules`. For a `defaultOn: false` rule the example is run with the rule enabled. `src/docs.test.ts` fails if a rule has no examples, if an example changes nothing, or if `docs/rules.md` is out of date.
5. Add tests in `src/core/typography.test.ts`. Run the property tests (below): a new rule must not lose or add a letter or digit, and must be stable on its own output.
6. Update [limits.md](limits.md) if the rule has a known limit, and add an entry to [../CHANGELOG.md](../CHANGELOG.md) saying whether it can change existing output (a new rule almost always can).

A custom list (`rules` option) is built with `addRule(RULES, rule, { before: 'space.number' })`; it never changes `RULES`, and `disable`/`enable` are checked against the list in use.

The order is part of the behaviour. For example, `dash.range` runs before `dash.sentence` so a spaced range is not read as a break in the sentence.

## Adding a language

A language is one object, a pack, and no code names a language: rules read the pack's fields.

1. Create `src/core/lang/<code>.ts` exporting the pack (`as const satisfies LangPack`, the type is in `src/core/lang/pack.ts`).
2. Add it to `PACKS` in `src/core/lang/index.ts`: one import, one list entry. `Lang`, `LANGS`, `PROFILES` and the other tables in `profiles.ts`, the command line, the rehype plugin and the playground all follow from the list.
3. Create `src/core/lang/<code>.test.ts`: call `wellFormed(pack, '<code>.test.ts')` from `pack-checks.ts` and add golden tests for what the pack sets. Golden tests for a language live in that file, not in `typography.test.ts`.
4. Run `bun run docs:languages` and commit `docs/languages/<code>.md` and `index.md`; `src/lang-docs.test.ts` fails if a page differs from its pack. Never edit them by hand.
5. If a rule acts on the new language, add an examples row to `scripts/gen-rules-doc.ts` and run `bun run docs:rules`.
6. Update the hand-written overview [languages.md](languages.md).

The pack:

| Field | Meaning |
|---|---|
| `code`, `name`, `sample` | The code (`Lang` is the union of every pack's code), the name shown in the playground (`German (Deutsch)`), and a sentence for the playground. |
| `quotes` | Quote marks per nesting level, `[open, close][]`; deeper nesting starts over. |
| `literary` | The same for the literary register, if it differs. |
| `orphans` | A global regex with one capture group: one-letter words kept with the next word. |
| `abbreviations` | `{ together, bind, page }`, short lists, only from a style guide. |
| `sentenceDash`, `sentenceDashLiterary` | The spaced dash of a break in the sentence, when it is not an em dash. |
| `percentSpace` | A no-break space between a number and `%` or `€`. |
| `dialogueDash` | A line opening with a dash is dialogue in the literary register. |
| `turnedPairs` | Quote pairs written turned the other way (German `»…«`), read by position; they replace the usual pair of that shape. |
| `elisions` | Words that start with an apostrophe for dropped letters (`'em`, `'til`); `n` reads rock 'n' roll. The five packs other than English list English's, because the list was read for every language before packs existed; dropping it is an output change. |
| `openers` | Characters that may stand before an opening quote mark, besides a space and a bracket (Spanish `¿¡`). |
| `sameMarkQuotes` | The language opens and closes with the same mark (Swedish `”…”`). Carried and documented only: the engine does not act on it yet. |
| `numbers` | `{ group, decimal }`. |
| `reviewed`, `sources`, `notes` | Whether a native speaker has read the pack; the style guides it came from; what a reader should know. A pack that is `reviewed` must cite `sources`. |

Abbreviation lists and the like come from a style guide, not from memory; say in `sources` which, and keep `reviewed: false` until a native reader has seen the pack.

## Tests

- **Golden tests** sit beside each module (`*.test.ts`).
- **Property tests** (`src/properties.test.ts`) run on seeded random strings built from characters the rules care about, for every language and register: no letter or digit is lost or added; a second pass changes nothing, on text as it is written; addresses, emails and code spans come back exactly; HTML tags, attributes and `<pre>`/`<code>` are kept byte for byte; Markdown code is kept; the text mode keeps the number of lines; and nothing throws. A failure prints the input, so it can be turned into a golden case.
- **The boundary test** (`src/boundary.test.ts`) scans `src` and `playground` and fails if a file imports from outside the package (a relative path that leaves it, a monorepo alias, a workspace package) or from anything but `react`, `react/jsx-runtime` and `bun:test`. Test files may also import `node:` modules and the unified/remark/rehype dev dependencies; the command line may import `node:` modules. The playground's `vite.config.ts` is not scanned. `scripts/` is not scanned either, so keep it to imports from `../src` and `node:`.
- **The docs tests** (`src/docs.test.ts` for the rules page, `src/lang-docs.test.ts` for the language pages) are described above.
- **Quote style** (`src/core/quote-style.test.ts`, `src/properties.quotestyle.test.ts`): `quoteStyle: 'us'` goldens and the properties of `properties.test.ts` run for every language. The generators there are copied, not shared, so the seeded streams of `properties.test.ts` do not move.

## The benchmark

The benchmark is a separate project in `bench/` with its own `package.json` and dependencies. Git ignores it except `bench/RESULTS.md`, so it lives on one machine (move it to its own repository when it needs to be shared). To run it: `cd bench && bun install && bun run bench`. Its own checks: `cd bench && bun run typecheck`.

```sh
cd bench
bun run bench       # every tool over every case; writes RESULTS.md
bun run latency     # time per call on a paragraph
bun run profile     # our own rules one by one, with their share of the time
bun run features    # the same English inputs through every tool
```

`bun run bench` runs this package, typograf, typopo, richtypo, tipograph, smartypants and retext-smartypants over the same style-neutral checks and writes every case, check and output to `RESULTS.md`, with a speed table. The cases were written by the package author, so read them in `RESULTS.md` and contest them. Do not tune a rule to a case: a case says what is right, not what one tool produces. Commit `RESULTS.md` when it changes, and update the numbers in [limits.md](limits.md) and [backlog.md](backlog.md) if the speed table moved. What the other scripts showed, and what to build because of it, is in [backlog.md](backlog.md).

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
3. Run `bun test src playground`, `bun run typecheck`, `bun run docs:rules`, `bun run docs:languages` and, if `src/dom/hang.ts` changed, `bun run gen:script`, and commit with the message `release: X.Y.Z`.
4. Push or merge to `main`. `.github/workflows/release.yml` runs the tests and creates the plain tag `vX.Y.Z` from `version` in `package.json` if it does not exist yet. Do not tag by hand; if you must, use a plain `git tag vX.Y.Z` (not `-a`, see below) and `git push origin vX.Y.Z`.

## Using it from another project

- Depend on a release tag over SSH: `"@podiia/typography": "git+ssh://git@github.com/<owner>/typography.git#vX.Y.Z"` (it needs SSH access to the repository). The consumer takes a new version only when it changes the tag.
- Tag releases with a plain `git tag vX.Y.Z`, not `git tag -a`: Bun 1.3 cannot resolve an annotated tag by name, and it cannot resolve a version range (`#semver:`) either.
- Bun keeps its own copy of a git repository and does not see tags pushed after it made that copy. If the consumer's install says "no commit matching", run `bun pm cache rm` once and retry. A consumer that already installed a tag keeps working: `bun.lock` holds the commit.
- The package ships `.ts` sources with no build step. A consumer needs Bun or a TypeScript-aware bundler. If the consumer's dev server shows an old copy after an update, clear its bundler cache (for Vite, `node_modules/.vite`).
- `react` is an optional peer dependency (`>=18`), needed only by the `./react` entry.
