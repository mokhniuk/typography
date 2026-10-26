# Typography for Penpot

> Not announced yet: run the manual test below on real files first (the install page `apps/website/content/docs/penpot-plugin.md` exists but is not listed in `DOC_FILES`, `apps/website/build/content.ts`, until then). Not covered by the package's semver or by
> the root `bun test`. The settings format may change.

A Penpot plugin that runs the `@mokhniuk/typography` engine over text layers: quotation marks by language,
dashes, no-break spaces and the rest of the [rules](../../docs/rules.md), written back into each layer with its
styling (a bold word, an italic run, a coloured span) kept. It makes no network request. The design is in
[`docs/superpowers/specs/2026-10-26-penpot-plugin-design.md`](../../docs/superpowers/specs/2026-10-26-penpot-plugin-design.md).

## Install

The website serves it at `/penpot/`: in Penpot press `Ctrl` + `Alt` + `P`, paste
`https://typography.mokhni.uk/penpot/manifest.json` and install. The page [Penpot plugin](https://typography.mokhni.uk/docs/penpot-plugin/)
says the same for users.

## Panel

Two tabs. **Format** has "Format selection" and "Format page", a line that says what happened (`Fixed 14 spots in
3 layers`, `Nothing to fix in 3 layers`, `Select a text layer, or use Format page`, and a tail such as
`Skipped 1: styles could not be restored`) and the current settings in one line. **Settings** has the language,
register, quote style and a checkbox per rule (`Rules (N of M on)`); changes are saved as they are made, in
`penpot.localStorage`. Hidden and locked layers, and everything under a hidden or locked group, are skipped (the walk goes down from the selection or the page; it does not check the parents of a layer you selected directly).

One run is one undo step (`penpot.history.undoBlockBegin()` around all layers): Cmd+Z takes the whole run back.

## How a layer changes

Penpot has no insert or delete for text, and setting `characters` gives every character the first one's style.
So for a layer with mixed styles the plugin reads the style runs (halving `getRange` until each piece is uniform),
moves them through the engine's word-level edits (`apps/figma/edits.ts`: new characters take the style of the
last character they replace, or of the one before an insertion), sets the text, and re-applies only the
properties that differ from the first run. Any error puts the original text and runs back and the layer is
counted as skipped; if that also fails the layer is named in the result (`Could not restore 1: check "Title"`) and selected.

## Build and load

```sh
cd apps/penpot
bun install
bun run bundle     # out/ (manifest, plugin.js, panel) and a copy in apps/website/public/penpot/
bun run serve      # http://localhost:4310/manifest.json, CORS on, never cached
bun test .         # tests (not part of the root bun test)
bun run typecheck
```

In Penpot, `Ctrl` + `Alt` + `P`, paste `http://localhost:4310/manifest.json`. The website build (`bun run
website:build`) runs the bundle first and serves it under `/penpot/`, with its own framing and CORS headers
(`apps/website/nginx.conf`, pinned by `nginx.test.ts`).

## Files

| File | What it is |
| --- | --- |
| `runs.ts` | `Style`, `Run`, `mapRuns`: runs moved through the engine's edits (pure) |
| `styles.ts` | the 13 style properties, `readRuns`, `hasMixedStyle`, `applyRuns` |
| `layer.ts` | `formatLayer`: one layer, styles kept, restored on failure |
| `run.ts` | `textLayers` (the walk), `runLayers` (one undo block, the result sentence) |
| `protocol.ts` | the messages between panel and plugin, `describeSettings` |
| `plugin.ts`, `manifest.json` | the plugin code and its manifest (permissions: `content:read`, `content:write`, `allow:localstorage`) |
| `index.html`, `ui.ts`, `style.css` | the panel |
| `fake-text.ts` | a stand-in for Penpot's `Text`, for tests; its behaviour is what the spike found |
| `bundle.ts`, `serve.ts` | build and local server |

Settings and the edit mapping come from `apps/figma` by relative import (`settings.ts`, `edits.ts`); that
project is not changed.

## Manual test (before it is announced)

The tests use a fake `Text`; only a real Penpot checks the real setters. On real files:

1. The sample layer: `He said "it's only 5 - 10 minutes..." and left.` and a second paragraph, "only" bold,
   "5 - 10" red, one word italic. Format selection: curly quotes, `5–10`, `…`, and the bold, red and italic words
   still bold, red and italic. One Cmd+Z brings the original text and styles back.
2. A layer with a font that is not installed or loaded: it is either changed with its styles or skipped and
   counted, never left half changed.
3. A hidden layer, a locked layer, a layer inside a locked group: none is changed.
4. A board with 50 text layers and a nested group: Format page, then one Cmd+Z takes back all of them.
5. A selection with no text layer: the panel says "Select a text layer, or use Format page".
6. A layer with right-to-left text, centred or right-aligned paragraphs, a larger line height and letter
   spacing: alignment and spacing are unchanged after a run.
7. Settings: change the language, register and quotes, close the plugin, open it again: they are kept; the
   panel follows Penpot's dark and light theme.
8. A layer with an emoji before a styled word: the style stays on the same word (checks that `getRange` counts UTF-16 units). Then a run on a file with nothing to fix, and Cmd+Z: it must not undo something earlier.
9. A self-hosted Penpot, if you have one: the install from the site address works.

## Known gaps

No check that the layer's font has the new glyphs (curly quotes, `…`), no language per layer or page, no use of a
layer's own language tag, no preview before a run, not yet in the Penpot Hub. See `docs/backlog.md`.
