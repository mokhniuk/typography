# Typography for Figma (work in progress)

> **WIP.** Not published to the Figma Community, not tested by the maintainers' users, not covered by
> the package's semver or by `bun test`. Behaviour, command names and the settings format may change
> without a CHANGELOG entry. The text below describes what the current build in `out/` does.

A Figma plugin that runs the `@mokhniuk/typography` engine over text layers: quotation marks by
language, dashes, non-breaking spaces and the rest of the [rules](../../docs/rules.md), written back
into the layer.

## Commands

| Command | What it does |
| --- | --- |
| Format selection | Fixes the text layers in the selection (groups and frames are searched; hidden and locked layers are skipped). With no text layer selected it says "Select a text layer, or use Format page". |
| Format page | The same for every text layer on the current page. |
| Settings | Opens the settings panel (below). |

Each run ends with a notification: `Fixed 12 spots in 3 layers`, or `Nothing to fix in 5 layers`.
A layer whose font is missing or cannot be loaded is skipped and counted: `Skipped 1: font not available`.

## Settings

The panel (320 x 520, follows Figma's light and dark theme) saves as you change it, per user, in
Figma's client storage. It applies to both format commands.

- **Language**: any of the 27 language packs (see [languages](../../docs/languages.md)).
- **Register**: `display` (UI and marketing) or `literary` (books). See [practices](../../docs/practices.md).
- **Quotes**: `language` (the pack's own marks), `us` (`“…”` and `‘…’`) or `guillemets` (`«…»` and `„…“`).
- **Rules**: a checkbox per rule, grouped by category. The defaults are the engine's; ticking an opt-in
  rule enables it, clearing a default rule disables it. The badge counts the changes (`2 off, 1 on`),
  and "Reset rules" returns to the defaults.

These are the engine's options `lang`, `register`, `quoteStyle`, `disable` and `enable`
([API](../../docs/api.md)).

## How a layer is changed

The plugin does not replace a layer's text. It computes a character-level diff between the old and the
new text and applies only the inserted and deleted characters, so font, size, colour and other styling
applied to ranges of the layer survive. Lines are set one at a time and blank-line-separated
paragraphs separately, with leading and trailing whitespace kept.

## Files

- `out/code.js`: the plugin code (runs in Figma's sandbox).
- `out/ui.html`: the settings panel, one file with its CSS and script inlined.
- `bun.lock`: dev dependencies only (`@figma/plugin-typings`, `bun-types`, `typescript`).

## Known gaps

- The sources and the `manifest.json` are not in the repository yet; only the build in `out/` is.
  Until they are, there is no documented way to rebuild the plugin or to load it in Figma
  (Plugins > Development > Import plugin from manifest).
- The command list above is read from the build; the menu names in the manifest were not checked.
- The engine is bundled into `code.js` and `ui.html`, so a plugin build is as old as the package
  version it was built from; the build in `out/` was not checked against 0.18.0.
- One setting set for the whole file: no per-layer or per-page language, and no use of a layer's
  own language tag.
- No undo grouping or preview: use Figma's undo after a run.
