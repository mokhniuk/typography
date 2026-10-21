---
title: Four lines, four jobs: hyphen, en dash, em dash, minus
date: 2026-10-22
glyph: —
summary: A keyboard has one horizontal line. Typeset text has four, and they are not interchangeable. What each one is for, and how the engine tells them apart.
---

# Four lines, four jobs: hyphen, en dash, em dash, minus

A keyboard has one horizontal line, the hyphen. Typeset text has four: the hyphen `-`, the en dash `–`, the em dash `—` and the minus sign `−`. They differ in width, in vertical position, and in meaning. A text that uses the hyphen for all four reads fine until it does not: `pages 5-9` looks like a compound word, `-5 °C` has a sign too short and too low for its digits.

## Who does what

| Character | Job | Typed |
|---|---|---|
| Hyphen `-` | joins words: `well-set`, `self-hosted` | stays as typed |
| En dash `–` | a range: `21–26 September`, `10:00–12:00` | `21-26` becomes `21–26` |
| Em dash `—` | a break in a sentence — like this | `word - word` becomes `word — word` |
| Minus `−` | negative numbers: `−5` | `-5` becomes `−5` |

Three of the engine's rules draw the lines. `dash.range` turns a hyphen between two numbers into an unspaced en dash, even when the writer spaced it (`5 - 9` becomes `5–9`). `dash.sentence` turns a spaced hyphen, dash or double hyphen into the sentence dash. `symbol.minus` turns a hyphen before a digit into a true minus. A hyphen inside a word is never touched: joining words is the hyphen's actual job.

## The sentence dash depends on the language

English display text gets a spaced em dash. German gets a spaced en dash — the em dash is simply not German practice. British literary text gets a spaced en dash too, which is why the engine's `literary` register changes the dash along with the quotation marks.

The space before the sentence dash is a no-break space, so a line never begins with a dash that belongs to the sentence before it.

Honesty requires a note: the spaced em dash is a choice, not a law. Butterick prefers the unspaced em (`word—word`), Chicago agrees, and plenty of fine books use the spaced en. The engine's sources registry records the decision instead of pretending there is consensus; `disable: ['dash.sentence']` opts out entirely.

## The dialogue dash

Languages that write dialogue with a dash each do it their own way, and the engine's `dash.dialogue` rule follows the language pack: Ukrainian opens a turn with an em dash and a no-break space (`— Привіт`), Spanish attaches the raya to the first word (`—¿Esperamos?`), Finnish uses an en dash. A paragraph where later lines also open with a dash is read as a list and left alone. The [quotation marks article](/articles/quotation-marks-by-language/) tells the same story for quotes: the character depends on the language, not just the rule.

## Try it

Paste `It was -5 - maybe -7 - on 21-26 September` into the [playground](/playground/) and watch the *Changes* tab assign each line its character: minus, em dash, en dash, each from its own rule.
