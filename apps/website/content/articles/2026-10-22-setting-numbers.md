---
title: Setting numbers: groups, ranges, units and signs
date: 2026-10-22
glyph: ×
summary: Numbers carry more typography than prose does: digit grouping by language, en-dash ranges, no-break spaces before units, true minus and multiplication signs.
---

# Setting numbers: groups, ranges, units and signs

Prose forgives a wrong character; numbers do not. `1,5` and `1.5` differ by a factor of language, `10-15` is a range or a subtraction, and `-5` printed with a hyphen has a sign shorter than its digits. The engine's `data` and `math` rules set numbers the way the language and the SI brochure want them.

## Grouping depends on the language

English groups thousands with a comma, German and Ukrainian with a (no-break) space: `1,234,567` against `1 234 567`. The `number.group` rule reads the separator from the language pack and only touches integers of five digits or more, so years (`2026`) and version strings (`v1000000`) survive. It is off by default — regrouping digits is the riskiest edit an engine can make, so you switch it on deliberately with `enable`.

## Ranges take an en dash

`21-26 September`, `10:00-12:00`, `pages 5 - 9`: a hyphen between two numbers becomes an unspaced en dash (`21–26`), even when the writer spaced it. Only a range that ascends is set, so `10-5` keeps its hyphen, and a local phone number such as `555-1234` stays as typed. The en dash is the range character; the hyphen only looks like one.

## Units stay with their number

A line must not break between `15` and `people`, `21` and `September`, `5` and `%`. The `space.number` rule sets a no-break space between a number and the short word after it. On top of that, `space.percent` knows the languages whose guides space the percent sign — German, French, Czech and fourteen others set `5 %`, while English keeps `5%` — and several of them also set `49 €`.

## Money stays whole

An amount and the money it counts belong together, on either side of the figure: `100 USD` and `49 €` after it, `USD 5 000` and `€ 49.99` before it. The same rule also binds the group spaces of a number the writer grouped by hand, so `1 000 грн` can no longer break inside the number — which is what `number.group` does to a bare number, so the two agree. The signs and codes come from one table (ISO 4217 codes and the signs of our audience's currencies), and the engine never moves, adds or removes a sign: where it stands is the writer's choice, and it differs by language (`€49.99` in English, `49,99 €` in German).

A phone number has the same problem and its own rule, `phone.bind` (off by default): an international number keeps its groups on one line, with no-break spaces and a non-breaking hyphen, and its digits exactly as typed — `+380 44 123 45 67`, `+1 (555) 123-4567`. A local number, a date and an IBAN are left alone, because a number that does not say what it is should not be guessed at.

Temperatures get their own rule, `symbol.degree` (off by default): `20 C`, `20°C` and `20 °C` all become `20 °C` — number, no-break space, degree sign, unit — while `Vitamin C` stays a vitamin.

## True signs

- `symbol.minus`: a hyphen before a digit becomes a real minus, `−5` (U+2212) — same width as the digits, aligned with the horizontal bar of `+`.
- `symbol.multiply`: the letter x between numbers becomes `×`: `1920×1080`, `3 × 4`.
- `symbol.plusminus` (off by default): `+-5` becomes `±5`.
- `symbol.fraction` (off by default): `1/2`, `1/4` and `3/4` become `½ ¼ ¾` — whole numbers only, so `11/2`, `1/20` and the date `1/2/2026` are left alone.

## Why some of these are off by default

The default rule set only makes edits that are safe on arbitrary text. Grouping digits, collapsing `1/2`, reading `+-` — each has a legitimate text it could damage, so each waits for `enable`. The [rules reference](/docs/rules/) shows every rule with before-and-after examples and whether it is on.

## Try it

Paste `In 2026 we sold 1234567 units at -5 °C, a 3 x 4 grid, pages 10-15, 5% off` into the [playground](/playground/), switch the extra rules on, and compare English with German.
