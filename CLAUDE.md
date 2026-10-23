# Typography

Package `@mokhniuk/typography`, published on npm, and also installable from a git tag. Full release rules are in `docs/contributing.md`.

Bun project; the package ships compiled ESM with declarations (`bun run build`). Details: `README.md` (entry points), `docs/contributing.md` (layout, adding a rule or language, tests), `docs/api.md`.

## Commands

- `bun test src apps/website resources`: all tests. `bun run typecheck`: `tsc`, covers src, apps/website, scripts, resources.
- `bun run build`: `scripts/build.ts` empties `dist/` and compiles ESM and declarations into it (`tsc -p tsconfig.build.json`, then `.ts` specifiers in the `.d.ts` files to `.js`); what ships. `prepack` runs it, so `bun pm pack` and `bun test` (via `src/package.test.ts`) write `dist/` (ignored by git). `bun scripts/smoke.ts [node]` installs the pack and runs it under Node.
- `bun run docs:rules`: regenerate `docs/rules.md` (generated, never edit by hand; `src/docs.test.ts` fails if stale).
- `bun run docs:languages`: regenerate `docs/languages/*.md` from the language packs (generated; `src/lang-docs.test.ts` fails if stale).
- `bun run gen:script`: regenerate `src/dom/script.ts` (generated) after changing `src/dom/hang.ts`.
- Speed changes must keep output and `explain` records identical: `bun run compare` against a git ref of the previous engine (tag it `speed-baseline`) must report 0 differences, and `src/snapshot.test.ts` must pass without `bun run snapshot` (run that only for an intentional output change); see "Checking a speed change" in `docs/contributing.md`. A rule may carry `when` (a cheap trigger; false means `apply` returns the text unchanged, proved by `src/core/rules.when.test.ts`); prefer a forward regex plus `src/core/scan.ts` to a regex that opens with a lookbehind.
- Benchmark: a separate project in `apps/bench/`; its sources, cases and `RESULTS.md` are tracked, its `node_modules` and lockfile are not (`comparison.html`, the comparison page source, is tracked too). `cd apps/bench && bun install`, then `bun run bench` (regenerates `RESULTS.md`, including bundle size, dependencies, Bun/Node/Deno engines and hard inputs; commit it if it changes; Node and Deno must be installed for their columns), `size`, `deps`, `engines`, `probes`, `latency`, `profile`, `features`. Not part of `bun test` or the root `typecheck`; `bun run typecheck` inside `apps/bench/` checks it.

## Rules of the codebase

- Rules live in the `RULES` table in `src/core/rules.ts`; never add a step inside `typographic()`. Order matters (places for planned rules are reserved in the comment above `RULES`, pinned by `src/core/rules-order.test.ts`). A rule with `defaultOn: false` runs only when named in `enable`. Adding a rule or language: follow `docs/contributing.md`.
- A language is one pack, `src/core/lang/<code>.ts`, listed in `src/core/lang/index.ts`; `Lang`, `LANGS` and the tables in `profiles.ts` are derived from it, and no rule names a language (it reads a pack field: `percentSpace`, `dialogueDash`, `turnedPairs`, `elisions`, `openers`, `sameMarkQuotes`, `numbers`, ...). Golden tests for a language live in `src/core/lang/<code>.test.ts`. The contract is in `docs/contributing.md`.
- Options are `register`, `quoteStyle` (`'language'` or `'us'`), `disable`, `enable`, `rules` (a custom list, see `addRule`/`selectRules`), `nbsp` and `hangAmount`, gathered in `config` (`TypographyConfig`, `src/core/config.ts`). A new option goes into `TypographyConfig` and its check (`checkConfig`); `ModeOptions` derives from it and `typesetBlock` passes options on whole. Then thread it through every site: `typographic`, the text, HTML, Markdown and rehype modes, `src/react` (`Typeset`, `TypographyRoot`, context), the CLI (flag and config), the playground (its config export/import) and `scripts/gen-rules-doc.ts`.
- Nothing in `src/` or `apps/website/playground/` may import from outside the package except `react` (`src/boundary.test.ts`).
- Every change to engine output or API gets a `CHANGELOG.md` entry saying whether it can change existing output.
- Every rule has a decision record in `resources/sources.ts` (`RULE_SOURCES`); `bun run docs:sources` regenerates `resources/sources.md`, `resources/sources.html` and `resources/bibliography.html` (generated, never edit; `resources/sources.test.ts` checks all three; open the HTML pages to browse the decisions and the sources). A new `Source` needs `author`, `title`, `about`, `cite`, `claim`, `readVia`. Read a source before you cite it; no source read means `general-knowledge`.
- UI (playground, comparison page, `apps/website`): semantic HTML, one `style.css` with theme values as CSS variables, no runtime dependencies; see `docs/ui.md`.
- Hand-written docs: `api.md`, `cli.md`, `languages.md`, `limits.md`, `practices.md`, `contributing.md`, `ui.md`, `README.md`. Update them when behaviour they describe changes (rule count, languages, exports, speed numbers).

- Website: `bun run website` (dev), `bun run website:build`. Docs pages are generated from `docs/*.md`; articles are `apps/website/content/articles/*.md`. Details in `docs/ui.md`.

## Backlog

`docs/backlog.md` is the list of what we lack against the other tools (P0 to P2). When you finish an item, move it to `CHANGELOG.md` and delete it there; when a benchmark shows a new gap, add it with the measurement.

## Comparison page

The benchmark findings are published as an artifact: https://claude.ai/artifact/4GjMbDUzengRYRAv97de87. Its source is `apps/bench/comparison.html` (tracked, with the benchmark). After every update that changes what it shows (a fixed bug, a new rule or language, new benchmark numbers, a finished backlog item), edit that file to match and republish it to that URL with the Artifact tool (`url` set, so the link stays), without being asked.

## Before pushing to main (or opening a PR into it)

If the changes since the last tag touch `src/` (anything that ships), check that a release is prepared. If it is not, prepare it first and tell me what you chose:

1. Find the last release commit on `main` (tags sit on the `release` branch, so `git describe` does not see them): `last=$(git log --grep='^release: ' -1 --format=%H)`, then `git log $last..HEAD --oneline` and `git diff $last..HEAD --stat -- src`.
2. If `src/` changed and `version` in `package.json` still equals the version in that commit's message, the release is missing. Pick the bump by the rules in `docs/contributing.md`: minor if output or API can change ("Can change existing output: yes"), patch for a fix that keeps output. Ask me if unsure.
3. Move the new `CHANGELOG.md` entries under `## X.Y.Z (date)`, set `version` in `package.json`.
4. Run `bun test src apps/website resources`, `bun run typecheck`, `bun run docs:rules`, and `bun run gen:script` if `src/dom/hang.ts` changed.
5. Commit as `release: X.Y.Z`.
6. Push `main`. Do NOT tag by hand: `.github/workflows/release.yml` builds, tests, runs the Node smoke test, builds a commit on the `release` branch that holds only the packed package (`scripts/release-commit.ts`, the `files` list in `package.json`), puts the plain tag `vX.Y.Z` on it and then publishes that commit to npm if the version is not there yet (with provenance once the repository is public: trusted publishing adds it by itself). A failed publish is recovered by re-running the workflow ("Releasing" in `docs/contributing.md`). If a tag is ever needed manually, follow "Releasing" in `docs/contributing.md`, and use a plain `git tag`, never `git tag -a` (Bun 1.3 cannot resolve annotated tags).

Skip the release steps for changes that touch only docs, tests, playground or CI.

Never push to `main` without my go-ahead; preparing the release commit is fine, pushing is not.
