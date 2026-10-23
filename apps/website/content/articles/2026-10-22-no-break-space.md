---
title: The no-break space does the quiet work
date: 2026-10-22
glyph: ~
summary: The most useful typographic character is invisible. Where a no-break space belongs, why CSS cannot place it for you, and the rules that set it.
---

# The no-break space does the quiet work

The no-break space (U+00A0) looks exactly like a space and does one thing a space does not: it refuses to end a line. Typeset text is full of pairs that must not be separated — `21 September`, `Prof. Oksana`, `5 %` — and the only way to keep them together is a character the reader never sees. In this article a no-break space is shown as `~`, the same convention the [rules reference](/docs/rules/) uses.

## Where it belongs

Nineteen of the engine's 34 rules can place this one character:

- **A number and the short word after it.** `15~people`, `21~September`, `5~%`. A line that ends on `15` and begins on `people` makes the reader re-parse the number (`space.number`).
- **An initial and the surname.** `K.~Słoboda` — an initial stranded at a line end reads as a sentence that stopped (`space.initial`), and a title stays with the name: `Prof.~Dr.~Oksana` (`space.title`).
- **The parts of an abbreviation.** German `z.~B.`, Ukrainian `т.~д.`, English `Fig.~2` and `p.~14` (`space.abbreviation`).
- **One-letter words.** Polish, Czech, Slovak and Ukrainian typography does not let `i`, `w`, `z` end a line; English keeps `A~cat` together. Which words count comes from the language pack (`space.orphan`).
- **Percent and euro, by language.** German, French, Czech and sixteen other languages set `5~%`, and most of them, with Ukrainian and Polish, `49~€`; English `5%` is left alone (`space.percent`).
- **After ©** (`©~2026 Studio`), **after § and ¶** (`§~5`), **before a sentence dash** (`word~— word`, so a line never opens with the dash), **before →**, and **after the dialogue dash** in the languages that space it.
- **Around a lone operator** between words: `Tom~&~Jerry`, and around the `’n’` of `rock~’n’~roll`, an "and" with its letters dropped (`space.operator`).
- **Money.** A sign or code stays with its amount, and a number grouped by hand stays whole: `USD~5~000` (`space.number`).
- **A short word and the word after it.** `Welcome to~the city`, `Zapraszamy do~Gdańska` (`space.short-word`). On by default since 0.14.0, and worth a paragraph of its own below.
- **French high punctuation.** French sets a no-break space before `:` and a narrow no-break space (U+202F) before `;`, `!` and `?`, so a line never opens with the mark: `Voici~:`, `Pourquoi^?` (`space.high-punctuation`, new in 0.18.0).
- **One opt-in rule** goes further: `phone.bind` keeps an international phone number on one line (`+380~44~123~45~67`).

## Short words, and why they bind everywhere

Polish and Czech typography has a name for a preposition left at the end of a line, and two sources read for this engine say the same two things about it: in a title or a heading a two- or three-letter word must travel with the word it belongs to, and in body text it may stay where it is. "May" is a permission, not a recommendation. This engine sets display text, pages, headings, short copy, where a line that ends on `to` or `of` is the stumble a reader notices, so `space.short-word` runs unless you switch it off. Three limits keep it honest: it never binds more than two words in a row, so a chain cannot grow into a whole line; it binds only the words a language pack lists, and five packs have a list (Czech, English, Polish, Slovak, Ukrainian), this package's own enumeration, not read from a guide; and the other 22 languages have no list, for it or for the one-letter rule. For long body text in a narrow column, or where a native reader prefers the body-text convention, `disable: ['space.short-word']` restores it.

## Why CSS cannot do this

`text-wrap: pretty` fixes orphan words at a paragraph's end and `white-space: nowrap` can pin one phrase, but neither knows that Polish forbids a trailing `i`, that French spaces `%` and English does not, or that `Fig.` belongs to its number. These are language conventions, not layout preferences, and they live in the text itself — which also means they survive into RSS, email, and anywhere else your CSS does not follow.

One boundary worth knowing: since 0.18.0 the engine sets the French space before `:` `;` `!` `?` itself (`space.high-punctuation`), a no-break space before the colon and a narrow one before the others, as Lacroux's Orthotypographie describes it for France; the OQLF, from Québec, agrees on the colon. Swiss French (`fr-CH`) is left as typed: the Federal Chancellery's French instructions are silent and no Swiss typographers' guide has been read. The optional `space.before-punctuation` rule, which strips stray spaces before punctuation, keeps the French ones the writer typed.

## The nbsp option

A raw U+00A0 looks like a space in every diff and editor. In the HTML mode the `nbsp` option chooses how a changed block writes it: as `&nbsp;` (the default, visible in source; the narrow U+202F of French as `&#8239;`) or as the bare character; see the [API reference](/docs/api/).

## Try it

Paste `On 21 September, Prof. K. Słoboda paid 5 %` into the [playground](/playground/) and tick *Mark no-break spaces* to see every one the engine placed.
