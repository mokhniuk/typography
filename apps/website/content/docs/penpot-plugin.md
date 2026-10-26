# Penpot plugin

The Typography plugin runs the engine over the text layers of a Penpot file: curly quotes by language, dashes, no-break spaces and the rest of [the rules](/docs/rules/), written back into each layer with its styling kept. A bold word, an italic run or a coloured span stays where it was. It makes no network request, and it only reads and writes the text layers you point it at.

## Install

1. In Penpot, open a file and press `Ctrl` + `Alt` + `P` to open the Plugin Manager.
2. Paste this address and install:

```text
https://typography.mokhni.uk/penpot/manifest.json
```

3. Run "Typography" from the Plugin Manager. Its panel opens on the right.

The plugin asks for permission to read and write content, and to keep its settings in the browser's local storage. That is all it asks for. A self-hosted Penpot installs it the same way.

## Use

- **Format selection** typesets the text layers you selected, and the text layers inside a selected board or group.
- **Format page** typesets every text layer on the page.

Hidden and locked layers are left alone, and so is everything inside a hidden or locked group. The line under the buttons says what happened: how many spots changed in how many layers, and which layers were skipped and why.

One run is one undo step: press `Cmd` + `Z` (`Ctrl` + `Z`) once to undo all of it.

## Settings

The Settings tab has the language, the register (display or literary), the quote style and a checkbox per rule, with a count of the rules that are on. Changes are saved as you make them and apply to both buttons. The same 27 languages and the same rules as the package.

## How a layer changes

Penpot has no call that inserts or deletes characters in a text layer, and setting its whole text gives every character the style of the first one. So the plugin reads the layer's runs of style first, sets the new text, then puts each run's style back on the same words. If any step fails, the layer gets its original text and styles back and is counted as skipped.

## Limits

- It does not check that a layer's font has the new characters (curly quotes, the ellipsis): a font without them shows fallback glyphs.
- The language is one setting for the whole run, not one per layer or page.
- There is no preview before a run; undo is how you take a run back.
