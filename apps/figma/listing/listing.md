# Figma Community listing

Text and images for Plugins, Manage plugins, Publish. Not read by the build.

## Name

Typography

## Tagline (max 100 characters)

Curly quotes, proper dashes and no-break spaces for text layers, in 27 languages.

## Description

Typography fixes the small things that make set text look typed instead of designed. Select text
layers (or nothing, then use Format page) and run one command. The plugin writes the fixes back into
the layers.

What it fixes, by the language you pick in Settings:

- Quotation marks: “English”, »deutsch«, « français », nested levels and apostrophes.
- Dashes: 5–10 for ranges, spaced em or en dashes for breaks, minus signs.
- No-break spaces before units, after short words and titles, around numbers and symbols, so lines do
  not break in the wrong place.
- … for three dots, → for ->, © for (c), × between numbers.
- More rules in Settings, some off by default (fractions, thousands grouping, trailing spaces).

How it behaves:

- Only the changed characters are inserted or deleted, so a layer with a bold word or an italic run
  keeps its styling.
- Every run ends with a toast: "Fixed 14 spots in 3 layers", with Undo.
- Layers that are hidden or locked are skipped, and a layer whose font is missing is skipped and
  counted, never changed half way.
- Everything runs on your device. The plugin makes no network requests and keeps only its settings.

Commands: Format selection, Format page, Settings. Run it again on a new selection with Option+Command+P.

Built on the open-source @mokhniuk/typography engine, with the same rules and languages.

## Tags

typography, text, quotes, dashes, copywriting, localization, proofreading

## Images

- Icon, 128 x 128: `icon.png` (source `icon.html`).
- Cover, 1920 x 960: `cover.png` (source `cover.html`). Its sample sentences are real engine output.

Render again after an edit (macOS, Chrome installed):

```
CH="/Applications/Google Chrome.app/Contents/MacOS/Google Chrome"
"$CH" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=128,128 --screenshot=icon.png file://$PWD/icon.html
"$CH" --headless=new --hide-scrollbars --force-device-scale-factor=1 --window-size=1920,960 --screenshot=cover.png file://$PWD/cover.html
```

## Disclosures

- Network access: none (`networkAccess.allowedDomains` is `["none"]`).
- Data: settings only, in `figma.clientStorage`, on the user's device.
- Editor: Figma design files (`editorType: ["figma"]`).

## Before the first publish

1. Publish from Plugins, Manage plugins; Figma assigns the plugin `id`.
2. Put that id in `manifest.json` (it holds a placeholder) and commit it.
3. `bun run bundle`, then publish the new version if the build changed.
