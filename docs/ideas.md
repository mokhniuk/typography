# Ideas

Things that are not the engine's job today, kept so they are not forgotten. Nothing here is planned; the backlog is [backlog.md](backlog.md).

## Accessibility checker

A tool that tells whether text is readable: too small, too little contrast, a line too long or too short, too tight a leading, a font that lacks glyphs (see the glyph item). It is a different kind of tool from the engine (it needs rendered styles, not a string), so decide first where it lives: a separate entry (`@mokhniuk/typography/a11y`), a function over the DOM that reads computed styles, or a lint step in the playground. Starting points to research: WCAG 2.2 contrast (1.4.3, 1.4.6, 1.4.11), text spacing (1.4.12), resize text (1.4.4), and readable line length (about 45 to 90 characters). Open: which checks need only strings and CSS values, and which need a browser; how it reports (a list of findings like `explain`, not a score). Not started.

