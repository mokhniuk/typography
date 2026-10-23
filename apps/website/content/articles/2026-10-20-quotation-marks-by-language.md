---
title: Quotation marks differ, and so should your software
date: 2026-10-20
glyph: „“
summary: Twenty-seven languages, a dozen ways to open and close a quotation. What the engine sets, and why a straight " is never the right answer.
---

# Quotation marks differ, and so should your software

The straight quotation mark `"` on a keyboard is a typewriter compromise: one key for opening, closing and inches. Typeset text has two marks, and which two depends on the language. A tool that turns `"` into `“` and `”` has solved the problem for English readers only.

## What the engine sets

The pack for each language lists its marks by nesting level. A few, from the generated [language pages](/docs/languages/all/):

| Language | Quotation | Inside it |
|---|---|---|
| English | `“…”` | `‘…’` |
| Ukrainian | `«…»` | `„…“` |
| Spanish, Italian | `«…»` | `“…”` |
| German | `»…«` | `›…‹` |
| Polish, Romanian | `„…”` | `«…»` |
| Croatian | `„…”` | `‚…’` |
| Czech, Slovak | `„…“` | `‚…‘` |
| Swedish, Finnish | `”…”` | `’…’` |

Two options set one style for every language. `quoteStyle: 'us'` gives `“…”` with `‘…’` inside, and `quoteStyle: 'guillemets'` gives this package's house style, `«…»` with `„…“` inside. Until 0.15.0 the house style was the English default.

The table is a summary. The language pages hold the exact marks per level, the sources each pack was written from, and the status: **no pack has been read by a native speaker yet**. They were written from published style guides, and some of those could only be read in part. Where the engine and the Unicode CLDR data disagree (German, French, Swiss German), the sources registry marks the decision `disputed` rather than hiding it.

## Registers

The engine has two registers. `display`, the default, is for marketing and interface text. `literary` is for book-like text and has its own rules only for English: British `‘…’` with `“…”` inside, and a spaced en dash. Every other language, Ukrainian included, sets the same marks in both registers.

## Reading what you wrote

The input may already be curly, low, straight or guillemets, in any mix. The engine reads all of them, pairs them, and sets the marks of the language and level. It handles an apostrophe (`we're`, `п'ять`) differently from a closing single quote, and does not take an inch mark (`5"`) for a quotation.

That last case is the hard one. A quotation glued to a digit (`5"a"`) is kept exactly as typed since 0.8.0, and since 0.18.0 an inch mark inside a quotation stays an inch mark when a later mark in the paragraph closes the quotation: `"a 5" hole"` gives `“a 5" hole”`. What is still open is unbalanced text, where a stray later mark takes the quotation over. It is listed in the [known limits](/docs/limits/) rather than guessed at.

## Try it

Open the [playground](/playground/), pick a language, and paste a paragraph with quotations in it. The *Changes* tab shows each mark that changed and the rule behind it.
