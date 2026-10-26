# Penpot plugin: design

## Intent

The Figma plugin (`apps/figma`, published) runs the typography engine over text layers. The author uses Penpot
for many projects, and Penpot is open source, which is the reason to be there. This is the same job in Penpot:
select text layers (or take the whole page), press a button, get curly quotes, dashes and no-break spaces by
language, written back into the layers with their styling kept.

## Goals

- Same engine, rules, 27 languages and settings as the Figma plugin; the settings read the same ("Dash range",
  "Rules (24 of 34 on)").
- A text layer with mixed styling (a bold word, an italic run, a coloured span) keeps it after a run.
- Installable by manifest URL from the typography website, with no step by hand when the site is deployed.
- Safe by default: a layer that cannot be restored is left as it was and counted, never half changed.

## Non-goals (first version)

- A Penpot Hub catalogue submission (a later, separate step).
- A glyph check against the layer's font, a language per layer or page, use of a layer's own language tag (the
  same gaps the Figma plugin has; they stay in `docs/backlog.md`).
- A preview before a run. An Undo button (Penpot has no toast; Cmd+Z is the undo).

## Anti-goals

- Flattening a layer's styles (what a plain assignment to `characters` does) and calling it fixed.
- Changing the text of a layer that is hidden or locked.
- A network request of any kind.

## What Penpot gives (read on 2026-10-26)

Sources: help.penpot.app/plugins, doc.plugins.penpot.app, the `plugin-types` package and
`frontend/src/app/plugins/text.cljs` in github.com/penpot/penpot (develop).

- One entry per plugin, no command menu: `penpot.ui.open(name, url, {width, height})` opens a panel (default
  285 x 540). Plugin code and panel talk with `penpot.ui.sendMessage` / `penpot.ui.onMessage` (plugin side) and
  `window` `message` events plus `parent.postMessage` (panel side).
- `manifest.json`: `name`, `description`, `version: 2` (then `code` and `icon` are relative to the manifest),
  `code`, `icon` (56 px advised), `permissions`. Needed here: `content:read`, `content:write`,
  `allow:localstorage`. The host serves manifest, code and panel with `Access-Control-Allow-Origin: *`.
- Text: `shape.characters` is readable and writable; its setter rebuilds the whole content with the style of the
  first paragraph and first run (`change-text`), so every other style is lost. There is no insert or delete.
  `shape.getRange(start, end)` returns a `TextRange` whose `characters` is read-only and whose
  `fontId`, `fontFamily`, `fontVariantId`, `fontSize`, `fontWeight`, `fontStyle`, `lineHeight`, `letterSpacing`,
  `textTransform`, `textDecoration`, `direction`, `align` and `fills` can be read (`'mixed'` when the range holds
  several values) and set. The shape has the same properties for the whole text.
- Events: `themechange` (`light` | `dark`), `selectionchange`. `penpot.selection` is the selection;
  `penpot.root` / `penpot.currentPage` give the tree (`children` on boards and groups); shapes have `hidden` and
  `blocked`. `penpot.localStorage` (string values) keeps the settings.

## The plugin

A new project, `apps/penpot` (own `package.json`, like `apps/figma` and `apps/bench`: not part of the package or
of the root `bun test`). The engine is bundled into the plugin code, as in Figma's `bundle.ts`.

**Panel (the user chose two tabs).** Format tab: the buttons "Format selection" and "Format page", the result
line, and one line naming the current settings ("German · Display · Language quotes. Change in Settings.").
Settings tab: language, register (display, literary), quotes (language, us, guillemets), the rule list grouped by
category with the labels and "Rules (N of M on)" heading the Figma plugin has, "Reset rules". Settings save as
they change, in `penpot.localStorage`; the panel follows `themechange`. Semantic HTML, one `style.css` with
theme values as CSS variables, no runtime dependency (`docs/ui.md`).

**Result line.** The same sentences as the Figma toast: "Fixed 14 spots in 3 layers", "Nothing to fix in 3
layers", "Select a text layer, or use Format page", and a tail "Skipped 1: <reason>" for layers left alone
(reasons: styles could not be restored, text could not be changed). It says Cmd+Z undoes the run (my guess; the spike checks whether one run is one undo step; until it does, the line says "Cmd+Z undoes it" and the README says how many steps it takes).

**Format selection / page.** Text layers under the selection (or under the page root), skipping hidden and
locked ones and anything a plain walk of `children` does not reach.

**A layer, with styles kept (the user chose this over skipping mixed layers).**
1. Fast path: if no style property of the shape reads `'mixed'` (including `fills` and `align`), set `characters`
   and stop; the flattened result is the same as the original style.
2. Otherwise read the style runs: split the text by asking `getRange(a, b)` for each style property and halving
   any range that reads `'mixed'` until every piece is uniform; join neighbours with equal styles. (My call:
   halving keeps the calls near the number of runs, not the number of characters.)
3. Compute the edits with the engine's diff, exactly as `apps/figma/edits.ts` does (`toEdits`), and move every
   run through them: an inserted character takes the style of the run it lands in or follows (the same rule as
   Figma's `BEFORE`), a deleted character leaves its run, a run whose characters are all deleted disappears.
   This mapping is a pure function, tested without Penpot.
4. Set `characters`, then for each new run apply to `getRange(start, end)` only the style properties that differ
   from the style the setter left (the first run's), via the range setters.
5. Any error, or a text that does not read back as expected, restores the original text and original runs the
   same way and counts the layer as skipped. (My call.)

Paragraph breaks: the setter splits on `\n` into paragraphs and gives all of them the first paragraph's
attributes, so `align`, `direction` and `lineHeight` are handled like any style: read per range, put back per
range.

## Distribution

Hosted on the typography website at `/penpot/`: `manifest.json`, `plugin.js`, the panel (`index.html`, `ui.js`,
`style.css`) and an icon, with `Access-Control-Allow-Origin: *`. The site's nginx (`apps/website/nginx.conf`)
sets a Content-Security-Policy with `frame-ancestors 'self'` and `X-Frame-Options: SAMEORIGIN` on every
response; the panel is an iframe inside penpot.app (or a self-hosted Penpot), so `/penpot/` needs its own
header set that allows that, and `nginx.test.ts` must pin it (a location that adds a header drops the server
block's, see the comment in the file). The deployed site must contain the built plugin with no manual step: the
website build includes it (how is the builder's call; `apps/penpot/out/` is not tracked, as in Figma's
project). A page on the website says how to install it (the manifest URL, Penpot's Plugin Manager, `Ctrl+Alt+P`)
and is linked from the landing page's "In design tools" section.

## Tests

Bun tests inside `apps/penpot`, run with `bun test .`, none in the root run: the run-mapping function and the
edit mapping (golden cases: bold word kept, a run inside an edit, a deleted run, an inserted character at a run
edge, newlines), the settings module, and the whole layer routine against a fake `Text` that mimics Penpot's
documented behaviour (setter flattens, ranges read and write). A real Penpot is the only check of the real
setter: a manual test list ships in the README, and the plugin is not announced until the author has run it on
real files.

## Order of work

1. **Spike first, on a real Penpot (the author runs it).** A throwaway plugin served from localhost: on a text
   layer with a bold word, a coloured span and two paragraphs, (a) set `characters`, (b) re-apply styles with
   `getRange(...)` setters (all thirteen properties, `fontId`, `fontFamily` and `fontVariantId` alone and
   together), (c) read back, (d) press Cmd+Z and count steps. Its findings fix the behaviour of the fake `Text`
   used in the tests and the undo wording. If a range setter does not work as documented, the style-restoring
   path is redesigned before anything else is built; if it cannot be made to work, the fallback is the first
   option the author weighed: skip mixed layers and say so.
2. The pure parts (run mapping, settings, messages) with tests, then the layer routine against the fake.
3. The panel, the build, the website wiring and the install page.
4. The manual test list on real files; only then the announcement (website link, CHANGELOG).

## Calls I made (the reviewer's questions that the project or the author could not or need not settle)

- A style is a plain object of the thirteen properties; two runs are equal when their JSON is equal (`fills` is
  an array of plain objects, so deep equality by JSON is enough). A range that reads `'mixed'` is split, never
  compared. `fontId`, `fontFamily` and `fontVariantId` are set together whenever any of them differs, until the
  spike shows they need not be.
- Paragraph attributes are styles like the rest. A deletion never removes a newline: the engine keeps the line
  count (`typesetText` is line by line), so two paragraphs never merge.
- If the restore after a failure also fails, the layer is counted apart ("could not restore 1: check it") and
  named in the result line; this is the only outcome that can leave a layer half changed, and it is reported.
- `apps/figma` is not changed. `apps/penpot` imports its pure files (`edits.ts`, `settings.ts`) by relative path;
  if that proves awkward, a shared directory is a later refactor of both.
- `/penpot/` sends `frame-ancestors *` and no `X-Frame-Options`, because a self-hosted Penpot's origin cannot be
  listed; the panel holds no secret and makes no request. The headers on every other path stay as they are, and
  `nginx.test.ts` pins both.
- The rule list is read from the engine's `RULES` and the counts are computed, never typed.

## Left to the builder

- The exact way the panel's URL is given to `penpot.ui.open` for a manifest at a hosted address.
- Whether `fontId`, `fontFamily` and `fontVariantId` must be set together on a range.
- How to share `apps/figma/edits.ts` and `settings.ts` (import across apps, or move the shared files to one
  place); `docs/contributing.md`'s layout table and `src/boundary.test.ts` (it scans only `src` and the
  playground) bound the choice.
- Whether the panel is one HTML file with inline script (then the CSP hash rules apply) or separate files.
- The icon (56 px) and the website page's text.

## Written down for later

`docs/backlog.md` "Design-tool plugins" loses its Penpot item when this ships and keeps the Figma gaps; add the
Penpot gaps (the same three) and "submit to the Penpot Hub". CHANGELOG gets an Unreleased entry (package
unchanged); the website landing page and comparison page change from "Penpot is next" to the install link;
`CLAUDE.md` and `docs/contributing.md` list `apps/penpot`.
