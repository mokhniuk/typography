# Contributing

Everything here runs from the project folder with Bun.

## Checks

```sh
bun test src apps/playground resources      # every test; this is the package's `test` script
bun run typecheck            # tsc -p tsconfig.json; tests are typechecked too
```

`bun test` does not typecheck; `bun run typecheck` does, and covers `src` and `apps/playground` (and `scripts` through the test that imports the docs generator).

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
| `resources/sources.ts` | The sources registry. `bun run docs:sources` generates `resources/sources.md`, `resources/sources.html` (decisions, with a filter) and `resources/bibliography.html` (every source in one table: author, link, what it is, where it is used); open the HTML ones in a browser |
| `scripts/gen-languages-doc.ts` | Generates `docs/languages/<code>.md` and `docs/languages/index.md` from the packs |
| `resources/` | The sources registry (below) and the pages generated from it; not part of the package |
| `apps/bench/` | The benchmark: a separate project, not tracked except `RESULTS.md` (see below) |
| `apps/playground/` | The web page (its own `package.json` for `dev`/`build`; uses the root's `vite`) |
| `docs/` | These pages. `rules.md` and `languages/` are generated; the others are written by hand |

## Adding a rule

1. Write the function in the file that fits: `dashes.ts`, `spaces.ts` or `marks.ts` (or `quotes.ts` for quotation). It takes the text and, if it needs it, a language or context, and returns the text.
2. Add one entry to `RULES` in `src/core/rules.ts`, in the place in the order where it should run: `{ id, category, about, apply }`, and `defaultOn: false` if the rule must run only when asked for (`enable`, `--enable`, a checkbox in the playground). Several places are reserved for planned rules (the comment block above `RULES`; `src/core/rules-order.test.ts` pins the order and checks a planned rule against its place). The id is `group.name`, or one word for a rule that stands alone. `about` is the one-line description that `typo --rules` prints and `docs/rules.md` shows. `category` is one of `RULE_CATEGORIES` (`tradition`, `symbols`, `math`, `data`; see [rules.md](rules.md#categories)): what the rule is for, shown as a column by `typo --rules` and `docs/rules.md` and as a group in the playground. `tsc` and `src/core/rules.category.test.ts` fail on a built-in rule without one.
3. Do not add a step inside `typographic()`. It only loops over `RULES`, which is what makes a rule switchable (`disable`) and reportable (`explain`, `onChange`).
4. Add examples to `EXAMPLES` in `scripts/gen-rules-doc.ts` (at least one, each of which must change its text when only that rule runs), then `bun run docs:rules`. For a `defaultOn: false` rule the example is run with the rule enabled. `src/docs.test.ts` fails if a rule has no examples, if an example changes nothing, or if `docs/rules.md` is out of date.
5. Add an entry for the rule to `RULE_SOURCES` in `resources/sources.ts` (sources read, why, what others do instead, confidence), then `bun run docs:sources`. Read every source before you enter it; a rule with no source read is `general-knowledge`. `resources/sources.test.ts` fails if the entry is missing or the page is stale.
6. Add tests in `src/core/typography.test.ts`. Run the property tests (below): a new rule must not lose or add a letter or digit, and must be stable on its own output.
7. Update [limits.md](limits.md) if the rule has a known limit, and add an entry to [../CHANGELOG.md](../CHANGELOG.md) saying whether it can change existing output (a new rule almost always can).

A custom list (`rules` option) is built with `addRule(RULES, rule, { before: 'space.number' })`; it never changes `RULES`, and `disable`/`enable` are checked against the list in use.

The order is part of the behaviour. For example, `dash.range` runs before `dash.sentence` so a spaced range is not read as a break in the sentence.

## Adding a language

A language is one object, a pack, and no code names a language: rules read the pack's fields.

1. Create `src/core/lang/<code>.ts` exporting the pack (`as const satisfies LangPack`, the type is in `src/core/lang/pack.ts`).
2. Add it to `PACKS` in `src/core/lang/index.ts`: one import, one list entry. `Lang`, `LANGS`, `PROFILES` and the other tables in `profiles.ts`, the command line, the rehype plugin and the playground all follow from the list.
3. Create `src/core/lang/<code>.test.ts`: call `wellFormed(pack, '<code>.test.ts')` from `pack-checks.ts` and add golden tests for what the pack sets. Golden tests for a language live in that file, not in `typography.test.ts`.
4. Run `bun run docs:languages` and commit `docs/languages/<code>.md` and `index.md`; `src/lang-docs.test.ts` fails if a page differs from its pack. Never edit them by hand.
5. If a rule acts on the new language, add an examples row to `scripts/gen-rules-doc.ts` and run `bun run docs:rules`.
6. Add a long example in the language to `LONG` in `apps/playground/examples.ts` (the playground's "Long example"; `tsc` fails while it is missing, and `apps/playground/examples.test.ts` checks that it gives the rules something to do).
7. Update the hand-written overview [languages.md](languages.md).

The pack:

| Field | Meaning |
|---|---|
| `code`, `name`, `sample` | The code (`Lang` is the union of every pack's code), the name shown in the playground (`German (Deutsch)`), and a sentence for the playground's "Short example" (the benchmark and the corpus also use it). The longer text lives in `apps/playground/examples.ts`. |
| `quotes` | Quote marks per nesting level, `[open, close][]`; deeper nesting starts over. |
| `literary` | The same for the literary register, if it differs. |
| `orphans` | A global regex with one capture group: one-letter words kept with the next word. |
| `abbreviations` | `{ together, bind, page }`, short lists, only from a style guide. |
| `sentenceDash`, `sentenceDashLiterary` | The spaced dash of a break in the sentence, when it is not an em dash. |
| `percentSpace` | A no-break space between a number and a `%` typed against it (`5%` becomes `5~%`). |
| `currencySpace` | A no-break space between a number and a `€` typed after it (`49€` becomes `49~€`); `€49` is never touched. Set it apart from `percentSpace`: a style guide may space `%` and write `€30` or only the code `EUR`. |
| `dialogueDash` | `{ mark, attached? }`: a paragraph opening with a dash is a line of dialogue, in both registers; the dash, and no space after it if `attached`. Only where a style guide says the language writes dialogue that way. |
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
- **The boundary test** (`src/boundary.test.ts`) scans `src` and `apps/playground` and fails if a file imports from outside the package (a relative path that leaves it, a monorepo alias, a workspace package) or from anything but `react`, `react/jsx-runtime` and `bun:test`. Test files may also import `node:` modules and the unified/remark/rehype dev dependencies; the command line may import `node:` modules. The playground's `vite.config.ts` is not scanned. `scripts/` and `resources/` are not scanned either, so keep them to imports from `../src` and `node:`.
- **The docs tests** (`src/docs.test.ts` for the rules page, `src/lang-docs.test.ts` for the language pages) are described above.
- **Quote style** (`src/core/quote-style.test.ts`, `src/properties.quotestyle.test.ts`): `quoteStyle: 'us'` goldens and the properties of `properties.test.ts` run for every language. The generators there are copied, not shared, so the seeded streams of `properties.test.ts` do not move.

## Checking a speed change

A change that is meant to make the engine faster must change no output and no `explain`/`onChange` record. Two tools prove it, both fed by one seeded corpus (`scripts/corpus.ts`: a fuzz vocabulary of every mark the rules care about, fixed prose in every language, quote soups).

```sh
bun run compare                  # this checkout against the git ref `speed-baseline` (the frozen engine)
bun run compare <ref> --n 20000  # against another ref; --slice N runs all N strings through every combination (slow)
bun run snapshot                 # ONLY for an intentional output change or a new language: rewrites src/snapshot.digests.json
cd apps/bench && bun run profile      # where the time goes, rule by rule
bun scripts/stress.ts [srcDir]   # every rule on long runs of one character at 20k, 40k and 80k: flags quadratic cost
```

- `bun run compare` extracts `src/` of the base ref into a temp directory with `git archive`, then, for every language, register (`display`, `literary`), `quoteStyle` (`language`, `us`), rule set (default; every opt-in rule enabled) and mode (`typographic` with `explain`, text, HTML, Markdown, hast), compares the output and every change record (rule id, `from`, `to`, order), the rule table and a thrown error. It prints the first ten differences with input, mode, language and both results, exits 1 on any difference, and ends with a timing table (best of 3, on a 1 MB paragraph and on 1000 paragraphs of 1 KB). Languages that exist here but not in the base are skipped. Expect `0 differences`.
- `src/snapshot.test.ts` (part of `bun test src apps/playground resources`) holds a SHA-256 per language and variant in `src/snapshot.digests.json` and fails on any change. A language without a digest fails with `run: bun run snapshot`. Never run `bun run snapshot` to make a speed change pass: a speed change must pass without it. The same test mutates a temp copy of `src/` to prove that both tools notice a changed regex and a changed rule attribution.
- What they cannot see: the React hooks and `HangText`, the DOM measuring, the CLI, inputs far outside the corpus (very long runs of one mark, megabyte inputs with changes, lone surrogates, text in scripts the rules do not know), and timing noise on a busy machine. Run the whole suite as well.

## The benchmark

The benchmark is a separate project in `apps/bench/` with its own `package.json` and dependencies. Git ignores it except `apps/bench/RESULTS.md`, so it lives on one machine (move it to its own repository when it needs to be shared). To run it: `cd apps/bench && bun install && bun run bench`. Its own checks: `cd apps/bench && bun run typecheck`.

```sh
cd apps/bench
bun run bench       # every tool over every case; writes RESULTS.md
bun run latency     # time per call on a paragraph
bun run profile     # our own rules one by one, with their share of the time
bun run features    # the same English inputs through every tool
```

`bun run bench` runs this package, typograf, typopo, richtypo, tipograph, smartypants and retext-smartypants over the same style-neutral checks and writes every case, check and output to `RESULTS.md`, with a speed table. The cases were written by the package author, so read them in `RESULTS.md` and contest them. Do not tune a rule to a case: a case says what is right, not what one tool produces. Commit `RESULTS.md` when it changes, and update the numbers in [limits.md](limits.md) and [backlog.md](backlog.md) if the speed table moved. What the other scripts showed, and what to build because of it, is in [backlog.md](backlog.md).

## The playground

```sh
bun run playground           # vite dev server for apps/playground/
bun run playground:build     # static site in apps/playground/dist
```

A client-side page: paste text, HTML or Markdown, pick the language, register, quote style (`language` or `us`) and how a no-break space is written, and see the result, a word-level diff of what changed with what each rule did, a switch for each rule (opt-in rules start off), and a preview with hanging punctuation at an amount set with a slider that stops at 0, 30%, 50% and 100% of the mark ( through `--hang-amount`); HTML is previewed in a sandboxed frame where no script runs, and the page marks and measures its opening punctuation from outside. "Short example" inserts the pack's `sample`; "Long example" inserts a longer text in the language, in the chosen format, from `apps/playground/examples.ts`. Nothing is sent anywhere. The page imports from `../../src` and is covered by the boundary test. Its markup and CSS follow [ui.md](ui.md).

## Releasing

Versions are semver while below 1.0.0.

- A **minor** release (0.1.0 to 0.2.0) may change the output of the engine or the API. Any entry in the changelog marked "Can change existing output: yes" needs a minor release.
- A **patch** release (0.1.0 to 0.1.1) fixes a bug without changing output you rely on.

From 1.0.0 the output stays out of the major version: the engine's output is not its API, and a better rule or a corrected language pack is a **minor** release (a **patch** if it fixes a bug). A **major** release is for a breaking change to the API: a removed or renamed export, option or rule id, or a changed signature.

To release:

1. Move the new entries of `CHANGELOG.md` under a heading `## X.Y.Z (date)`.
2. Set `version` in `package.json` (`typo --version` reads it).
3. Run `bun test src apps/playground resources`, `bun run typecheck`, `bun run docs:rules`, `bun run docs:languages` and, if `src/dom/hang.ts` changed, `bun run gen:script`, and commit with the message `release: X.Y.Z`.
4. Push or merge to `main`. `.github/workflows/release.yml` runs the tests and creates the plain tag `vX.Y.Z` from `version` in `package.json` if it does not exist yet. Do not tag by hand; if you must, use a plain `git tag vX.Y.Z` (not `-a`, see below) and `git push origin vX.Y.Z`.

## Using it from another project

- Depend on a release tag over SSH: `"@podiia/typography": "git+ssh://git@github.com/<owner>/typography.git#vX.Y.Z"` (it needs SSH access to the repository). The consumer takes a new version only when it changes the tag.
- Tag releases with a plain `git tag vX.Y.Z`, not `git tag -a`: Bun 1.3 cannot resolve an annotated tag by name, and it cannot resolve a version range (`#semver:`) either.
- Bun keeps its own copy of a git repository and does not see tags pushed after it made that copy. If the consumer's install says "no commit matching", run `bun pm cache rm` once and retry. A consumer that already installed a tag keeps working: `bun.lock` holds the commit.
- The package ships `.ts` sources with no build step. A consumer needs Bun or a TypeScript-aware bundler. If the consumer's dev server shows an old copy after an update, clear its bundler cache (for Vite, `node_modules/.vite`).
- `react` is an optional peer dependency (`>=18`), needed only by the `./react` entry.
