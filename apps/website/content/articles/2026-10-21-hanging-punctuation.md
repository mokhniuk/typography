---
title: Hanging punctuation without measuring line breaks
date: 2026-10-21
glyph: “
summary: A quotation mark at the start of a line should hang in the margin so the letters line up. Finding out which marks start a line sounds like it needs measuring. It does not.
---

# Hanging punctuation without measuring line breaks

Look at a well-set page and you will see the left edge of the text is straight, except that the opening quotation marks stand outside it. The mark hangs in the margin, and the letter after it sits on the line. This is called *hanging punctuation* (or optical margin alignment), and print has done it for centuries. On the web, CSS has `hanging-punctuation`, but only Safari implements it, and only for the edges of a block (`first`, `last`) and for stops at a line end (`allow-end`), not for a mark at the start of any line.

## The obvious way, and why it fails

The obvious approach is to find the marks that start a line, and hang those. To know which marks start a line you must lay the text out, read where the lines break, then pull the marks out. But hanging a mark makes its word narrower, and that can move the word up to the line before. The line breaks have changed under you.

Before 0.4.1 the engine did this, and the page looped: it hung a mark, the word moved up, the mark was no longer at a line start, so it un-hung it, the word moved back. After four rounds it gave up and left whatever state it had reached. In a dialog we saw `(Camden` at the start of a line not hung, and `(AGS)` in the middle of a line hung over the space before it.

## Hang every mark, and give the space back

The fix, in 0.4.1, is to stop asking where lines break. Every opening mark gets a negative margin of its own width, so it always sits to the left of its box. The space beside it carries the same width as extra word spacing:

- in the middle of a line, the mark pulls left by its width and the space pushes right by the same amount, so the two cancel and every letter sits where plain text puts it;
- at a line break, the browser drops the space, the push goes with it, and the mark hangs.

Nothing is measured except the mark's own width, and that is measured once. Line breaks are never read, so nothing goes stale when they move: resize the window, rotate the phone, change the font size, and the answer is still right.

## Closing marks hang too

The same trick works on the other side. A closing run (`» ) “ ’`, with `.,;:!?…` after it, so `(AGS).` hangs as `).`) hangs to the right at a line end. You see it in right-aligned, centred and justified text. Justified text hangs in Chrome; Safari is the exception.

## Without a jump at first paint

The exact width needs the font, so before it is measured each mark carries a rough width of 0.4em, close for quotes and brackets in most text faces. The text hangs at first paint with that width and is refined when the real one arrives. On a prerendered page the inline script, about 2.2 kB, does this as the page is parsed, so the marks do not move when the bundle loads.

This article is set that way. Resize the window and watch the quotation marks at the start of a line: the letters stay on one edge.

> “A margin is not empty space. It is the part of the page that makes the rest of it look straight.”

## Use it

In React, `TypographyRoot` and `HangText` do it. Elsewhere, `markHangs(element)` wraps the marks in a page you already have, and `hangPunctuation(element)` measures them. See the [API reference](/docs/api/#dom) and the [limits](/docs/limits/) for what it does not handle.
