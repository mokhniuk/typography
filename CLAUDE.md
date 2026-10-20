# Typography

Package `@podiia/typography`, consumed from other projects as a git dependency on a tag. Full release rules are in `docs/contributing.md`.

Bun project, TypeScript sources shipped as they are (no build step). Details: `README.md` (entry points), `docs/contributing.md` (layout, adding a rule or language, tests), `docs/api.md`.

## Commands

- `bun test src playground`: all tests. `bun run typecheck`: `tsc`, covers src, playground, scripts.
- `bun run docs:rules`: regenerate `docs/rules.md` (generated, never edit by hand; `src/docs.test.ts` fails if stale).
- `bun run docs:languages`: regenerate `docs/languages/*.md` from the language packs (generated; `src/lang-docs.test.ts` fails if stale).
- `bun run gen:script`: regenerate `src/dom/script.ts` (generated) after changing `src/dom/hang.ts`.
- Speed changes must keep output and `explain` records identical: `bun run compare` against `speed-baseline` must report 0 differences; see "Checking a speed change" in `docs/contributing.md`.
- Benchmark: a separate project in `bench/`, ignored by git except `bench/RESULTS.md`. `cd bench && bun install`, then `bun run bench` (regenerates `RESULTS.md`; commit it if it changes), `latency`, `profile`, `features`. Not part of `bun test` or the root `typecheck`; `bun run typecheck` inside `bench/` checks it.

## Rules of the codebase

- Rules live in the `RULES` table in `src/core/rules.ts`; never add a step inside `typographic()`. Order matters (places for planned rules are reserved in the comment above `RULES`, pinned by `src/core/rules-order.test.ts`). A rule with `defaultOn: false` runs only when named in `enable`. Adding a rule or language: follow `docs/contributing.md`.
- A language is one pack, `src/core/lang/<code>.ts`, listed in `src/core/lang/index.ts`; `Lang`, `LANGS` and the tables in `profiles.ts` are derived from it, and no rule names a language (it reads a pack field: `percentSpace`, `dialogueDash`, `turnedPairs`, `elisions`, `openers`, `sameMarkQuotes`, `numbers`, ...). Golden tests for a language live in `src/core/lang/<code>.test.ts`. The contract is in `docs/contributing.md`.
- Options are `register`, `quoteStyle` (`'language'` or `'us'`), `disable`, `enable` and `rules` (a custom list, see `addRule`/`selectRules`). A new option must be threaded through every site: `typographic`, `typesetBlock` (it destructures by name), the text, HTML, Markdown and rehype modes, `src/react` (`Typeset`, `TypographyRoot`, context), the CLI, the playground and `scripts/gen-rules-doc.ts`.
- Nothing in `src/` or `playground/` may import from outside the package except `react` (`src/boundary.test.ts`).
- Every change to engine output or API gets a `CHANGELOG.md` entry saying whether it can change existing output.
- Hand-written docs: `api.md`, `cli.md`, `languages.md`, `limits.md`, `contributing.md`, `README.md`. Update them when behaviour they describe changes (rule count, languages, exports, speed numbers).

## Backlog

`docs/backlog.md` is the list of what we lack against the other tools (P0 to P2). When you finish an item, move it to `CHANGELOG.md` and delete it there; when a benchmark shows a new gap, add it with the measurement.

## Comparison page

The benchmark findings are published as an artifact: https://claude.ai/artifact/4GjMbDUzengRYRAv97de87. Its source is `bench/comparison.html` (untracked, with the benchmark). After every update that changes what it shows (a fixed bug, a new rule or language, new benchmark numbers, a finished backlog item), edit that file to match and republish it to that URL with the Artifact tool (`url` set, so the link stays), without being asked.

## Before pushing to main (or opening a PR into it)

If the changes since the last tag touch `src/` (anything that ships), check that a release is prepared. If it is not, prepare it first and tell me what you chose:

1. Find the last tag: `git describe --tags --abbrev=0`, then `git log <tag>..HEAD --oneline` and `git diff <tag>..HEAD --stat -- src`.
2. If `src/` changed and `version` in `package.json` still equals that tag, the release is missing. Pick the bump by the rules in `docs/contributing.md`: minor if output or API can change ("Can change existing output: yes"), patch for a fix that keeps output. Ask me if unsure.
3. Move the new `CHANGELOG.md` entries under `## X.Y.Z (date)`, set `version` in `package.json`.
4. Run `bun test src playground`, `bun run typecheck`, `bun run docs:rules`, and `bun run gen:script` if `src/dom/hang.ts` changed.
5. Commit as `release: X.Y.Z`.
6. Push `main`. Do NOT tag by hand: `.github/workflows/release.yml` creates the plain tag `vX.Y.Z` from `package.json` after the push. If a tag is ever needed manually, use a plain `git tag vX.Y.Z`, never `git tag -a` (Bun 1.3 cannot resolve annotated tags).

Skip the release steps for changes that touch only docs, tests, playground or CI.

Never push to `main` without my go-ahead; preparing the release commit is fine, pushing is not.
