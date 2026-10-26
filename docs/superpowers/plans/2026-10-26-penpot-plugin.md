# Penpot Plugin Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** A Penpot plugin, `apps/penpot`, that runs the typography engine over text layers and writes the result back with each layer's mixed styling kept, hosted at `/penpot/` on the typography website.

**Architecture:** Pure parts first (run mapping from the engine's edits, style reading and restoring against a small fake of Penpot's `Text`), then the layer routine, the run over a selection or page in one undo block, then the panel, the build and the website wiring. The engine, `apps/figma/edits.ts` (`toEdits`, `Edit`) and `apps/figma/settings.ts` are imported by relative path; `apps/figma` is not changed.

**Tech Stack:** Bun (tests, `Bun.build`), TypeScript, `@penpot/plugin-types` (types only), plain HTML/CSS/TS for the panel, nginx.

**Spec:** `docs/superpowers/specs/2026-10-26-penpot-plugin-design.md` (read its "Spike findings": they are the behaviour of the fake `Text` in Task 2).

## Global Constraints

- Own project like `apps/figma`: `apps/penpot/package.json` (`"private": true`), tests with `bun test .` inside it, not part of the root `bun test src apps/website resources`, not part of the package.
- Nothing in `apps/penpot` makes a network request; manifest `permissions`: `content:read`, `content:write`, `allow:localstorage` only. Manifest `version: 2`, icon 56 px.
- The panel uses no runtime dependency and no `navigator.clipboard` (blocked in the panel iframe). UI follows `docs/ui.md`: semantic HTML, one `style.css`, theme values as CSS variables, tabs with `role="tablist"`/`role="tab"`/`aria-selected`, vertical rhythm 8px (line heights 24/32).
- Never flatten a layer and call it done; hidden and locked layers are never changed; a layer that cannot be restored is left as it was and counted.
- No Russian names, words or letters anywhere. No em dashes in prose.
- The rule list and counts come from the engine's `RULES`; never typed.
- Every engine-output or API change needs a CHANGELOG entry; this one changes neither (package unchanged), so the entry is "Unreleased, package unchanged". Release steps in `CLAUDE.md` are skipped (plugin, website, docs only).
- Commit messages end with `Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>`. Do not push; the user decides.

## Review Focus

- Empty text layer (`characters === ''`): no write, no error, counted as unchanged.
- A layer whose text the engine leaves unchanged: no `characters` write, no style calls, no undo step.
- Text with astral characters (emoji): offsets are UTF-16 units on both sides; runs and edits must agree.
- The selection holds a group and a text layer inside it (or the same layer twice): the layer is changed once.
- A locked or hidden group hides everything under it; a locked or hidden text layer alone is skipped.
- A setter that throws halfway: the original text and runs are put back, the layer is counted as skipped; if the restore also throws, the layer is counted apart and named.
- The undo block is closed when a layer throws (`finally`), so one bad layer never leaves Penpot in an open block.
- Saved settings that are junk or from an older version fall back field by field (`readSettings`).

---

### Task 1: Project scaffold and run mapping

**Files:**
- Create: `apps/penpot/package.json`, `apps/penpot/tsconfig.json`, `apps/penpot/runs.ts`, `apps/penpot/runs.test.ts`
- Modify: `.gitignore` (add `apps/penpot/out/`, `apps/penpot/bun.lock`, `apps/website/public/penpot/`)

**Interfaces:**
- Consumes: `Edit`, `toEdits` from `../figma/edits.ts` (`Edit = {start, end, text}`; `toEdits` returns edits last first, offsets in the original text).
- Produces (`runs.ts`):
  - `type Style = Record<string, unknown>` (the 13 properties' values; compared by `JSON.stringify`)
  - `type Run = { start: number; end: number; style: Style }`
  - `sameStyle(a: Style, b: Style): boolean`
  - `mapRuns(runs: readonly Run[], edits: readonly Edit[]): Run[]` (edits in `toEdits` order; result sorted, contiguous, neighbours with equal style merged)

- [ ] **Step 1:** `package.json` like `apps/figma/package.json` (name `typography-penpot`, scripts `bundle`, `test`, `typecheck`; devDependencies `@penpot/plugin-types`, `bun-types`, `typescript` at the versions `apps/figma` uses), `tsconfig.json` like `apps/figma/tsconfig.json` with `types: ["bun-types"]` and `include: [".", "../../src", "../figma"]`. Run `bun install` there.
- [ ] **Step 2: Write the failing tests** in `runs.test.ts`, runs built by a small `run(start, end, bold?)` helper. Cases (assert on `mapRuns` output):
  - same-length replace inside a run (`"` to `“`): runs unchanged.
  - insert right after a bold run (`start === end === bold.end`): the bold run grows by the inserted length; the next run shifts by it.
  - insert at 0: takes the style of the run at 0.
  - replace spanning the end of run A and the start of run B: inserted text takes the style of the last replaced character (A's, since the last replaced character is in B, B's): state it in the test name and assert B's.
  - shrink inside a run (3 characters to 1): that run shrinks by 2, later runs shift by -2.
  - a run whose characters are all deleted disappears; neighbours with equal style merge.
  - several edits (as `toEdits` returns them, last first) over `He said "it's only 5 - 10 minutes..."` leave the three styled runs on the right words; offsets after astral characters (`😀`, length 2) are in UTF-16 units.
  - empty edits returns the runs unchanged.
- [ ] **Step 3: Run** `cd apps/penpot && bun test runs.test.ts`. Expected: FAIL, module not found.
- [ ] **Step 4: Implement** `mapRuns`: apply each edit in the given order to a per-character style list view of the runs (or by splitting runs); inserted text takes the style of the character at `end - 1` when `end > start`, else of the character at `start - 1`, else of the character at `start`. Merge neighbours at the end.
- [ ] **Step 5: Run** `bun test runs.test.ts`. Expected: PASS. `bun run typecheck`. Expected: no errors.
- [ ] **Step 6: Commit** `penpot: project scaffold and the run mapping`.

### Task 2: Styles and a fake Penpot text

**Files:**
- Create: `apps/penpot/styles.ts`, `apps/penpot/fake-text.ts`, `apps/penpot/styles.test.ts`

**Interfaces:**
- Consumes: `Style`, `Run`, `sameStyle` from `./runs.ts`.
- Produces (`styles.ts`):
  - `const PROPS: readonly string[]`: `fontId`, `fontFamily`, `fontVariantId`, `fontSize`, `fontWeight`, `fontStyle`, `lineHeight`, `letterSpacing`, `textTransform`, `textDecoration`, `direction`, `align`, `fills`
  - `type TextLike = { characters: string; getRange(start: number, end: number): RangeLike }` and `type RangeLike = Record<string, unknown>` (each of `PROPS` readable and settable; `'mixed'` when the range holds several values)
  - `readRuns(text: TextLike): Run[]`: split by halving `getRange` over every property that reads `'mixed'`, join equal neighbours; empty text gives `[]`
  - `hasMixedStyle(text: TextLike): boolean`: any property of the whole text reads `'mixed'`
  - `applyRuns(text: TextLike, runs: readonly Run[]): void`: for each run, set on `getRange(start, end)` only the properties that differ from the style the setter left (the style of `getRange(0, 1)` read first); `fontId`, `fontFamily` and `fontVariantId` are set together when any of the three differs; setter errors propagate
- Produces (`fake-text.ts`, test helper): `class FakeText implements TextLike` built from `Run[]` plus text. It keeps one style per UTF-16 unit and a paragraph list; `getRange` returns an object whose getters give `'mixed'` for non-uniform ranges and whose setters write the range; the `characters` setter flattens every unit to the first unit's style (the spike's finding); `new FakeText(...).failOn(property)` makes the next setter of that property throw; `calls` counts range setter writes.

- [ ] **Step 1: Write the failing tests** in `styles.test.ts` using `FakeText`:
  - `readRuns` on the spike's sample (7 runs: bold, red fill, italic, two paragraphs) returns exactly those 7 runs; uniform text gives 1 run; `''` gives `[]`; `getRange` calls stay below 4 times the run count (halving, not per character).
  - `hasMixedStyle` is true when only `fills` differs, false for uniform text.
  - after `text.characters = after` the fake has 1 run (flattened), and `applyRuns(text, expected)` makes `readRuns` equal `expected` (the spike's MATCH) for same-length, insert-after-bold and shrink-inside-red cases built through `mapRuns`.
  - `applyRuns` writes nothing for a run equal to the base style (`calls` counts only differing runs).
  - a setter that throws propagates out of `applyRuns`.
- [ ] **Step 2: Run** `bun test styles.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `styles.ts` and `fake-text.ts` as specified; the fake is test-only and carries a comment citing the spike findings as its source of truth.
- [ ] **Step 4: Run** `bun test .` in `apps/penpot`. Expected: PASS; `bun run typecheck` clean.
- [ ] **Step 5: Commit** `penpot: reading and restoring text styles, with a fake text for tests`.

### Task 3: The layer routine

**Files:**
- Create: `apps/penpot/layer.ts`, `apps/penpot/layer.test.ts`

**Interfaces:**
- Consumes: `toEdits` (`../figma/edits.ts`), `typesetText`, `TextOptions` (`../../src/index.ts`), `mapRuns`, `readRuns`, `hasMixedStyle`, `applyRuns`, `Run`.
- Produces:
  - `type LayerResult = { kind: 'unchanged' } | { kind: 'changed'; spots: number } | { kind: 'skipped'; reason: 'styles' | 'text' } | { kind: 'unrestored' }`
  - `formatLayer(text: TextLike, options: TextOptions): LayerResult`: steps 1 to 5 of the spec ("A layer, with styles kept"): after = `typesetText(before)`; equal gives `unchanged` with no write; no mixed style gives one `characters` write; otherwise read runs, `toEdits`, `mapRuns`, write, `applyRuns`; check the text reads back as `after`; on any error write the original text back and re-apply the original runs, result `skipped` (`styles` when the restore of styles was the failing step, `text` when the text setter itself threw); if that restore also throws, `unrestored`. `spots` is `toEdits(...).length`.

- [ ] **Step 1: Write the failing tests** with `FakeText`: uniform layer changes with one write; mixed layer keeps all runs (golden: the spike sample with `He said "it's only 5 - 10 minutes..." and left.` under `lang: 'en'` ends with curly quotes, an ellipsis character and the three styled runs on the same words); text unchanged gives `unchanged` and `calls === 0` and no `characters` write; empty text gives `unchanged`; `failOn('fills')` gives `skipped` with the original text and original runs back; text setter that throws gives `skipped`/`text` and nothing changed; restore that throws again gives `unrestored`; emoji layer keeps runs aligned.
- [ ] **Step 2: Run** `bun test layer.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `formatLayer`; keep the original runs read before the first write so the restore needs no second read.
- [ ] **Step 4: Run** `bun test .`. Expected: PASS.
- [ ] **Step 5: Commit** `penpot: format one text layer, styles kept, restored on failure`.

### Task 4: Walking the tree and running a selection or page

**Files:**
- Create: `apps/penpot/run.ts`, `apps/penpot/run.test.ts`

**Interfaces:**
- Consumes: `formatLayer`, `LayerResult`, `TextLike`; `TextOptions`.
- Produces:
  - `type Node = { type: string; hidden?: boolean; blocked?: boolean; children?: readonly Node[] }` and `textLayers<N extends Node>(roots: readonly N[]): N[]`: text layers (`type === 'text'`) under the roots in order, each once, nothing under a hidden or blocked node, a hidden or blocked text layer skipped
  - `type History = { undoBlockBegin(): symbol; undoBlockFinish(id: symbol): void }`
  - `type RunReport = { message: string; changed: boolean }`
  - `runLayers(layers: readonly TextLike[], options: TextOptions, history: History): RunReport`: one undo block around everything, closed in `finally`; message sentences exactly as the Figma toast: `Fixed 14 spots in 3 layers`, `Nothing to fix in 3 layers` (singular `1 spot`, `1 layer`), tail `. Skipped 1: styles could not be restored` / `text could not be changed`, and `. Could not restore 1: check it` for `unrestored`; `changed` is true when any layer changed
  - `NOTHING_SELECTED = 'Select a text layer, or use Format page'`

- [ ] **Step 1: Write the failing tests:** `textLayers` skips under hidden/blocked parents, dedupes a layer reachable twice, keeps order; `runLayers` messages for fixed, nothing to fix, singular forms, skipped tail, unrestored tail; the history gets exactly one begin and one finish, and finish runs when `formatLayer` is made to throw (a `FakeText` whose `characters` getter throws).
- [ ] **Step 2: Run** `bun test run.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** both functions. A layer that throws is counted as skipped, not rethrown.
- [ ] **Step 4: Run** `bun test .`. Expected: PASS.
- [ ] **Step 5: Commit** `penpot: walk the tree, run a selection in one undo block`.

### Task 5: Plugin entry, messages and settings storage

**Files:**
- Create: `apps/penpot/protocol.ts`, `apps/penpot/protocol.test.ts`, `apps/penpot/plugin.ts`, `apps/penpot/manifest.json`, `apps/penpot/icon.png` (56 px, from the figma icon artwork)

**Interfaces:**
- Consumes: `readSettings`, `toOptions`, `DEFAULT_SETTINGS`, `Settings` (`../figma/settings.ts`); `textLayers`, `runLayers`, `NOTHING_SELECTED`.
- Produces (`protocol.ts`):
  - `type ToPlugin = { type: 'ready' } | { type: 'format'; scope: 'selection' | 'page' } | { type: 'save'; settings: unknown }`
  - `type ToPanel = { type: 'init'; settings: Settings; theme: 'light' | 'dark' } | { type: 'result'; message: string; changed: boolean } | { type: 'theme'; theme: 'light' | 'dark' }`
  - `describeSettings(settings: Settings): string`: `German · Display · Language quotes` (language by `Intl.DisplayNames`, register capitalised, quote style `language` as "Language quotes", `us` as "US quotes", `guillemets` as "Guillemets")
  - `readMessage(value: unknown): ToPlugin | null` (unknown shapes give `null`)
- `plugin.ts`: opens the panel with `penpot.ui.open('Typography', 'index.html', { width: 320, height: 560 })`, handles `ToPlugin`, keeps settings in `penpot.localStorage` under one key (JSON string, read through `readSettings`), sends `theme` on `penpot.on('themechange')`, formats `penpot.selection` or `penpot.root`/`penpot.currentPage` descendants through `runLayers(…, penpot.history)`.
- `manifest.json`: `{ "name": "Typography", "description": …, "version": 2, "code": "plugin.js", "icon": "icon.png", "permissions": ["content:read", "content:write", "allow:localstorage"] }`.

- [ ] **Step 1: Write the failing tests** for `describeSettings` (three registers/quote styles, a language code with a display name) and `readMessage` (valid messages, junk, wrong scope).
- [ ] **Step 2: Run** `bun test protocol.test.ts`. Expected: FAIL.
- [ ] **Step 3: Implement** `protocol.ts`, then `plugin.ts` (not unit tested: it only wires Penpot globals; keep it under about 80 lines) and `manifest.json`. A manifest test (in `protocol.test.ts` or `manifest.test.ts`) asserts the permission list is exactly the three and `version` is 2.
- [ ] **Step 4: Run** `bun test .` and `bun run typecheck` (types from `@penpot/plugin-types`). Expected: PASS, no errors.
- [ ] **Step 5: Commit** `penpot: plugin entry, messages, manifest`.

### Task 6: The panel and the build

**Files:**
- Create: `apps/penpot/index.html`, `apps/penpot/ui.ts`, `apps/penpot/style.css`, `apps/penpot/bundle.ts`, `apps/penpot/bundle.test.ts`

**Interfaces:**
- Consumes: `ToPlugin`, `ToPanel`, `describeSettings`, `readMessage`; `LANGS`, `RULES`; `groupRules`, `isOn`, `reset`, `setRule` from `../website/playground/rules-state.ts`; `ruleLabel`, `rulesSummary`, `readSettings` from `../figma/settings.ts`.
- Produces: `bun bundle.ts` writes `apps/penpot/out/` with `manifest.json`, `plugin.js` (IIFE, minified, engine inlined), `index.html`, `ui.js`, `style.css`, `icon.png`, then copies `out/` to `apps/website/public/penpot/` (both ignored by git).

- [ ] **Step 1: Panel.** Two tabs "Format | Settings" (`role="tablist"`, `aria-selected`, panels with `hidden`). Format: buttons "Format selection" and "Format page" (`primary` on the first), an `output` for the result line (`aria-live="polite"`), a line from `describeSettings` ending "Change in Settings.". Settings: language, register, quotes `select`s, the rule `fieldset`s with `ruleLabel`, the `Rules (N of M on)` heading, "Reset rules"; every change posts `save`. Theme: `data-theme` on `<html>` from `init`/`theme` messages, tokens as CSS variables, dark under the `:root[data-theme="dark"]` selector. A "Saved as you change it" hint. Panel code reads messages only through `window.addEventListener('message')` and posts with `parent.postMessage(message, '*')`.
- [ ] **Step 2: Write the failing build test** (`bundle.test.ts`): run `bun bundle.ts` through `Bun.spawn`, then assert `out/manifest.json` names files that all exist in `out/`; `out/plugin.js` and `out/ui.js` contain no `import ` or `require(` at top level and no `fetch(`/`XMLHttpRequest`/`WebSocket`; `out/index.html` contains no inline `<script>` body and no `on…=` attribute; the same files exist in `apps/website/public/penpot/`.
- [ ] **Step 3: Run** `bun test bundle.test.ts`. Expected: FAIL.
- [ ] **Step 4: Implement** `bundle.ts` after `apps/figma/bundle.ts` (empty `out/`, `Bun.build` for `plugin.ts` and `ui.ts`, copy the static files, then copy to the website's public folder).
- [ ] **Step 5: Run** `bun test .`, `bun run typecheck`. Expected: PASS.
- [ ] **Step 6: Manual check against the spike's setup:** serve `out/` with `bun --hot`-free static server (the spike's `serve.ts` pattern, scratchpad), install `http://localhost:4310/manifest.json` in Penpot, confirm the panel opens, the settings persist after reopening, and Format selection works on the spike's sample layer. Report what was seen.
- [ ] **Step 7: Commit** `penpot: panel and build`.

### Task 7: Website wiring and nginx headers

**Files:**
- Modify: `package.json` (`website` and `website:build` run `bun apps/penpot/bundle.ts` first), `apps/website/nginx.conf`, `apps/website/nginx.test.ts`, `Dockerfile` only if the build needs it (it copies the whole repository, so it should not)
- Create: the install page (see Step 4)

**Interfaces:**
- Consumes: the `out/` copy in `apps/website/public/penpot/` from Task 6 (Vite serves `public/` as is).
- Produces: `/penpot/manifest.json`, `/penpot/plugin.js`, `/penpot/index.html`, `/penpot/ui.js`, `/penpot/style.css`, `/penpot/icon.png` on the built site, with, for `/penpot/` only: `Access-Control-Allow-Origin: *`, CSP `frame-ancestors *`, no `X-Frame-Options`, `Cache-Control: no-cache`; every other path unchanged.

- [ ] **Step 1: Write the failing nginx tests** (in `nginx.test.ts`, same style): the conf has a `map $uri $frame_ancestors` giving `'self'` by default and `*` for `^/penpot/`; a map for `X-Frame-Options` giving `SAMEORIGIN` by default and an empty value for `^/penpot/`; a map for CORS giving an empty value by default and `*` for `^/penpot/`; the CSP header's `frame-ancestors` is that variable; the `/penpot/` cache value is `no-cache`; the existing test "no location sets a header" still passes (the maps keep every header in the server block); the existing `X-Frame-Options` header test is adapted to read the map's default. The other CSP directives stay as they are (`script-src` still lists the two hashes only, so the panel uses a separate `ui.js`).
- [ ] **Step 2: Run** `bun test apps/website`. Expected: FAIL.
- [ ] **Step 3: Implement** the three maps and the header lines in `nginx.conf` (extend the file's top comment: why `/penpot/` is open to framing), update the tests, add the script changes and `.gitignore` entries if not done.
- [ ] **Step 4: Install page.** A website page that says how to install: the manifest URL (built from `SITE_BASE`/the site's origin, never typed twice), Penpot's Plugin Manager (`Ctrl+Alt+P`), what the plugin does, its two commands, that it makes no network request. Follow how docs pages are generated from `docs/*.md` (`apps/website/build/content.ts`, `pages.ts`): add `docs/penpot.md` if that is the pattern, and link it from the landing page's "In design tools" section only in Task 8 (after the manual test).
- [ ] **Step 5: Run** `bun run website:build` then `bun test src apps/website resources` and `bun run typecheck`. Expected: PASS; `apps/website/dist/penpot/manifest.json` exists. Serve the build (or `docker build`) and `curl -I` `/penpot/manifest.json` and `/`: the first shows CORS `*`, no `X-Frame-Options`, `frame-ancestors *`; the second keeps `SAMEORIGIN` and `frame-ancestors 'self'`.
- [ ] **Step 6: Commit** `website: serve the Penpot plugin at /penpot/ with its own framing headers`.

### Task 8: Manual test list, docs and announcement (gated)

**Files:**
- Create: `apps/penpot/README.md`
- Modify: `docs/backlog.md`, `CHANGELOG.md`, `CLAUDE.md`, `docs/contributing.md`, `README.md`, `apps/website/index.html`, `apps/website/comparison/index.html` and `apps/website/comparison/data.ts` where they say Penpot is next

- [ ] **Step 1:** `apps/penpot/README.md`: what it is, install by URL, commands, settings, how a layer changes (undo block, one Cmd+Z), build and load locally, files, known gaps (no glyph check, no per-layer language, no preview; Hub submission pending), and the **manual test list** (the spike sample layer; a layer with a missing font; hidden and locked layers; 50 layers in one run and one Cmd+Z; a board with a nested group; a self-hosted Penpot; dark theme; settings kept after reopening).
- [ ] **Step 2: Hand the manual test list to the user** and stop. Do not do Steps 3 and 4 until the user says the list was run on real files (spec: "only then the announcement").
- [ ] **Step 3:** After the go-ahead: backlog loses the Penpot item and gains "submit to the Penpot Hub" and the three Penpot gaps; CHANGELOG "Unreleased" entry (package unchanged, "Can change existing output: no"); `CLAUDE.md` and `docs/contributing.md` list `apps/penpot` (layout table, build and test commands); root `README.md`, the landing page ("A Penpot plugin is next" becomes the install link) and the comparison page text and data change to match.
- [ ] **Step 4: Run** `bun test src apps/website resources`, `bun run typecheck`, `cd apps/penpot && bun test . && bun run typecheck`. Expected: all pass. Commit `penpot: README, docs and announcement`.
