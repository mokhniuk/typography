---
title: The no-break space does the quiet work
date: 2026-10-22
glyph: ~
summary: The most useful typographic character is invisible. Where a no-break space belongs, why CSS cannot place it for you, and the rules that set it.
---

# The no-break space does the quiet work

The no-break space (U+00A0) looks exactly like a space and does one thing a space does not: it refuses to end a line. Typeset text is full of pairs that must not be separated — `21 September`, `Prof. Oksana`, `5 %` — and the only way to keep them together is a character the reader never sees. In this article a no-break space is shown as `~`, the same convention the [rules reference](/docs/rules/) uses.

## Where it belongs

More than half of the engine's rules exist to place this one character:

- **A number and the short word after it.** `15~people`, `21~September`, `5~%`. A line that ends on `15` and begins on `people` makes the reader re-parse the number (`space.number`).
- **An initial and the surname.** `K.~Słoboda` — an initial stranded at a line end reads as a sentence that stopped (`space.initial`), and a title stays with the name: `Prof.~Dr.~Oksana` (`space.title`).
- **The parts of an abbreviation.** German `z.~B.`, Ukrainian `т.~д.`, English `Fig.~2` and `p.~14` (`space.abbreviation`).
- **One-letter words.** Polish and Ukrainian typography does not let `i`, `w`, `z` end a line; English keeps `A~cat` together. Which words count comes from the language pack (`space.orphan`).
- **Percent and euro, by language.** German, French, Czech and fourteen other languages set `5~%` and most of them `49~€`; English `5%` is left alone (`space.percent`).
- **After ©** (`©~2026 Studio`), **after § and ¶** (`§~5`), **before a sentence dash** (`word~— word`, so a line never opens with the dash), **before →**, and **after the dialogue dash** in the languages that space it.

## Why CSS cannot do this

`text-wrap: pretty` fixes orphan words at a paragraph's end and `white-space: nowrap` can pin one phrase, but neither knows that Polish forbids a trailing `i`, that French spaces `%` and English does not, or that `Fig.` belongs to its number. These are language conventions, not layout preferences, and they live in the text itself — which also means they survive into RSS, email, and anywhere else your CSS does not follow.

One boundary worth knowing: French famously sets a space before `:` `;` `!` `?`. The engine does not insert one where the writer typed none — the French guides disagree with each other on which space and where, and the sources registry would rather record the dispute than guess. The optional `space.before-punctuation` rule, which strips stray spaces before punctuation, does keep the French ones the writer typed.

## The nbsp option

A raw U+00A0 looks like a space in every diff and editor. In the HTML mode the `nbsp` option chooses how a changed block writes it: as `&nbsp;` (the default, visible in source) or as the bare character; see the [API reference](/docs/api/).

## Try it

Paste `On 21 September, Prof. K. Słoboda paid 5 %` into the [playground](/playground/) and tick *Mark no-break spaces* to see every one the engine placed.
