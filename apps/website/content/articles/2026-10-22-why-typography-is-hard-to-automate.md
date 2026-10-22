---
title: Why typographic correction is hard to automate
date: 2026-10-22
glyph: …
summary: Replacing straight quotes with curly ones looks like a dozen regexes. Here is what the dozen regexes get wrong, and what an engine has to do instead.
---

# Why typographic correction is hard to automate

Turning `"quotes"` into `«quotes»` looks like an afternoon of regexes. Every typographic engine starts as that afternoon, and every one that survives becomes something else. This is a tour of why, drawn from building this one.

## The same character means different things

A straight `'` is an apostrophe in `don't`, an opening quote in `'no'`, a closing quote two words later, a foot mark in `5'10"`. A hyphen joins `well-set`, ranges `5-9`, negates `-5`, and interrupts a sentence when spaced. Nothing about the character itself decides; only context does, and the context windows overlap. A regex per case works until two cases share an edge — `'90s` is at a word start like an opening quote and curls the other way.

## Quotes must balance

Quotation marks come in pairs and nest. A second-level quotation inside a first (`«we said „no“ twice»`) means the engine cannot decide any single mark locally: it tracks depth across the paragraph. The input makes it worse by arriving in any state — straight from a keyboard, curly from a word processor, guillemets from a previous run, all three in one file after a few copy-pastes. The engine reads every style, pairs what it finds, and sets the marks the language wants — which also makes it idempotent: running it twice changes nothing the second time.

## The language decides, not the rule

The same rule writes `«…»` for Ukrainian, `»…«` for German and `”…”` for Swedish; gives English a spaced em dash and German a spaced en; puts a no-break space before `%` in French and none in English. In this engine no rule names a language. Each of the 26 [language packs](/docs/languages/) declares its marks, dashes, orphan words and spacing, and the rules read the pack. Adding a language means writing one file, not touching 33 rules.

## Most of the text must not change

Prose is full of text that only looks like prose: code spans, URLs, email addresses. In HTML there are tags, attributes, `<code>` and `<pre>`; in Markdown, fenced blocks and inline code. One curled quote inside a code example breaks the example for every reader who copies it. The engine's text, HTML, Markdown and rehype modes exist mostly to draw this boundary — deciding what *not* to touch is as much work as the touching.

## Order is a dependency graph

The 33 rules run in a fixed order, each on the output of the one before, and the order encodes dependencies: apostrophes are claimed before quote-pairing sees them, quotes are set before the spacing rules count characters, the sentence dash is set before the rule that puts a no-break space in front of it. The order is pinned by a test, because swapping two rules is the kind of change that passes every example you thought of.

## And it has to be fast

Running 33 rules over a megabyte of text naively means 33 full passes. Each rule here carries a cheap trigger — no `%` in the text, skip the percent rule — and a comparison harness proves every fast path returns byte-identical output to the plain one. What still goes wrong is listed just as carefully in the [known limits](/docs/limits/).

## The moral

None of this is exotic computer science; it is a long tail of small truths about written language, each cheap alone and expensive to discover. That is the argument for an engine with tests and sources over a snippet from a gist: the snippet has not met the tail yet.
