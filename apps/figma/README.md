# Typography for Figma

> **Not yet published** to the Figma Community, and not covered by the package's semver or by the root
> `bun test`. Behaviour, command names and the settings format may change without a CHANGELOG entry.

A Figma plugin that runs the `@mokhniuk/typography` engine over text layers: quotation marks by
language, dashes, non-breaking spaces and the rest of the [rules](../../docs/rules.md), written back
into the layer.

## Commands

The plugin sits in the right-click menu (Plugins, Typography) and in the Plugins menu. After the first
run, Option+Command+P repeats the last command on a new selection.

| Command | What it does |
| --- | --- |
| Format selection | Fixes the text layers in the selection (groups and frames are searched; hidden and locked layers are skipped). With no text layer selected it says "Select a text layer, or use Format page". |
| Format page | The same for every text layer on the current page. |
| Settings… | Opens the settings panel (below). |

Format selection and Format page open no window. Each run ends with a toast:

- `Fixed 12 spots in 3 layers`, with an **Undo** button for six seconds. The plugin stays alive until the
  toast goes, then closes. One run is one undo step, so Cmd+Z works too.
- `Nothing to fix in 5 layers`, with no Undo button.
- A layer whose font is missing or cannot be loaded is skipped and counted:
  `Fixed 9 spots in 2 layers. Skipped 1: font not available`.

## Settings

The panel (320 x 520, follows Figma's light and dark theme) saves as you change it, per user, in
Figma's client storage, and stays open until Done. It applies to both format commands.

- **Language**: any of the 27 language packs (see [languages](../../docs/languages.md)).
- **Register**: `display` (UI and marketing) or `literary` (books). See [practices](../../docs/practices.md).
- **Quotes**: the language's own marks, `us` (`“…”` and `‘…’`) or `guillemets` (`«…»` and `„…“`).
- **Rules**: a checkbox per rule, grouped by category and named from its id (`dash.range` is "Dash
  range"; opt-in rules say so, and the rule's description is the hover title). The heading counts the
  rules that run (`Rules (24 of 34 on)`). The defaults are the engine's; ticking an opt-in rule enables
  it, clearing a default rule disables it. "Reset rules" returns to the defaults.

These are the engine's options `lang`, `register`, `quoteStyle`, `disable` and `enable`
([API](../../docs/api.md)).

## How a layer is changed

The plugin does not replace a layer's text. It computes a character-level diff between the old and the
new text and applies only the inserted and deleted characters, so font, size, colour and other styling
applied to ranges of the layer survive. Lines are set one at a time and blank-line-separated
paragraphs separately, with leading and trailing whitespace kept.

## Build and load

```
cd apps/figma
bun install
bun run bundle      # writes out/code.js and out/ui.html from the sources and the engine in ../../src
bun test .          # edits and settings
bun run typecheck
```

Then in the Figma **desktop app**: Plugins, Development, Import plugin from manifest…, and pick
`manifest.json`. After a rebuild, run the command again; Figma reads the new `out/`.

## Files

- `manifest.json`: menu and entry points.
- `code.ts`: the commands (runs in Figma's sandbox). `edits.ts`: the diff turned into insert and delete
  steps. `settings.ts`: reading, validating and labelling the saved settings.
- `ui.html`, `ui.ts`, `style.css`: the settings panel.
- `bundle.ts`: builds `out/` (not tracked: run `bun run bundle` before loading). The engine is bundled
  into `out/code.js` and `out/ui.html`, so a build is as old as the package version it was made from;
  rebuild after the engine changes.
- `listing/`: the Figma Community listing text, icon and cover image, and the steps for a first publish.

## Known gaps

- No check that the font has the new glyphs (curly quotes, `…`); a font without them shows fallback glyphs.
- One setting set for the whole file: no per-layer or per-page language, and no use of a layer's
  own language tag.
- No preview before a run; Undo or Cmd+Z after it.
- Not published to the Figma Community yet (listing text, images and the publish form answers are in `listing/listing.md`).
