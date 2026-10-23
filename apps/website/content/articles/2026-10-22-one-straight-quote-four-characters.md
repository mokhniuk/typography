---
title: One key, four characters: apostrophe, quote, inch, prime
date: 2026-10-22
glyph: ’
summary: The straight ' stands for an apostrophe, a quotation mark, a foot mark and a prime, and software has to tell them apart by context alone.
---

# One key, four characters: apostrophe, quote, inch, prime

The typewriter gave one key the work of four characters, and we still type it. A straight `'` may be an apostrophe (`don't`), an opening or closing quotation mark (`'no'`), a foot mark (`5'10"`), or a prime (`48°51′`). The reader tells them apart without noticing. Software has only the surrounding characters to go on, and this is where most smart-quote implementations fail.

## The apostrophe is not a quote

The right character for an apostrophe is `’` (U+2019) — the same character as the English closing single quote, which is the whole problem. `It's` is easy: a `'` between letters is an apostrophe. The hard cases sit at word edges:

- `'90s` — the mark opens the word, but it is an apostrophe standing for the missing `19`, so it must curl right: `’90s`. A naive opener-by-position turns it into `‘90s`, and you will find that bug in shipped word processors.
- Ukrainian `п'ять` — an apostrophe between a consonant and an iotated vowel, inside a word that a Latin-only test does not recognise as one.

The `quote` rule runs first, and it sets apostrophes aside before it pairs anything, so pairing never sees them: the word-internal case, the year and the elisions of the language pack. The `apostrophe` rule, second, then curls them.

## Feet and inches stay straight

In `5'10"` the marks are measurements, not punctuation. A straight `"` right after a digit never opens a quotation (it can still close one, as in `"call 911"`), so `a 2" pipe and a 4" pipe` keeps both inch marks rather than turning the text between them into a quotation. Since 0.18.0 an inch mark inside a quotation stays an inch mark too, when a later `"` in the paragraph closes the quotation. The [known limits](/docs/limits/) page lists the case that still goes wrong — in unbalanced text a stray later `"` takes the quotation over — because listing it beats guessing.

Strictly set text uses the prime `′` (U+2032) and double prime `″` (U+2033) for feet, inches, minutes and seconds: `5′10″`, `48°51′24″`. The engine does not set primes for you — deciding that a `"` is an inch and not a quote is already the hard part, and it errs on the side of leaving measurements exactly as typed.

## What the right characters buy

Set side by side, the difference is not pedantry, and this example also shows where the engine stops. `"It's 5'10", maybe," she said` comes out as `“It’s 5'10", maybe,” she said`: the apostrophe curls, and the foot and inch marks stay as typed (until 0.18.0 the inch mark closed the quotation early). The engine still does not make them primes; for that, type the prime yourself: `"It's 5′10″, maybe," she said` becomes `“It’s 5′10″, maybe,” she said`, the engine leaves typed primes alone, and every mark now says what it is.

## Try it

Paste `The '90s called: it's a 5'10" frame, a 2" pipe and a 4" pipe.` into the [playground](/playground/) and check the *Changes* tab: the apostrophes curl, the foot and inch marks stay exactly as typed.
