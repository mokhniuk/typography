import { type Lang, NBSP } from '../src/core';
import type { Format } from './tools';

/**
 * What a typography tool should do, as checks anyone can read. A check says what
 * is right, not what one tool happens to produce: it accepts every convention in
 * use for the language (a German quotation is „…“ or »…«), and it never asks for
 * one tool's house style. Where a tool's default is a different but defensible
 * style, that shows as a failure here and is reported as one.
 */
export type Case = {
  id: string;
  group: string;
  lang: Lang;
  format?: Format;
  input: string;
  /** What is expected, in words. */
  expect: string;
  pass: (output: string, input: string) => boolean;
  /** Only these tools are scored; the others show "–" (no such feature). */
  only?: string[];
};

const NNBSP = String.fromCharCode(0x202f);
const SP = `[ ${NBSP}${NNBSP}]?`;
const esc = (s: string) => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Quotation marks in use, by language: opening, closing. */
const PAIRS: Record<string, [string, string][]> = {
  en: [
    ['“', '”'],
    ['‘', '’'],
  ],
  de: [
    ['„', '“'],
    ['»', '«'],
  ],
  uk: [
    ['«', '»'],
    ['„', '“'],
  ],
  pl: [
    ['„', '”'],
    ['«', '»'],
  ],
  fr: [['«', '»']],
};

/** Outer and inner pair for a quotation inside a quotation. */
const NEST: Record<string, [string, string, string, string][]> = {
  en: [
    ['“', '”', '‘', '’'],
    ['‘', '’', '“', '”'],
  ],
  de: [
    ['„', '“', '‚', '‘'],
    ['»', '«', '›', '‹'],
  ],
  uk: [['«', '»', '„', '“']],
  pl: [['„', '”', '«', '»']],
  fr: [['«', '»', '“', '”']],
};

const quoted = (lang: Lang, word: string) => (out: string) =>
  !out.includes('"') &&
  (PAIRS[lang] ?? []).some(([o, c]) =>
    new RegExp(`${esc(o)}${SP}${word}${SP}${esc(c)}`, 'u').test(out),
  );

const nested = (lang: Lang) => (out: string) =>
  !/["']/.test(out.replace(/[’‘]/g, '')) &&
  (NEST[lang] ?? []).some(([o1, c1, o2, c2]) =>
    new RegExp(`${esc(o1)}${SP}outer ${esc(o2)}inner${esc(c2)} outer${SP}${esc(c1)}`, 'u').test(
      out,
    ),
  );

const spaces = (s: string) => s.replace(new RegExp(`[${NBSP}${NNBSP}]`, 'g'), ' ');
const unchanged = (out: string, input: string) => spaces(out) === input;
const has =
  (...parts: string[]) =>
  (out: string) =>
    parts.every((p) => out.includes(p));
const matches = (re: RegExp) => (out: string) => re.test(out);

const alnum = (s: string) =>
  s
    .replace(/\((?:c|R|TM)\)/gi, '')
    .replace(/[^\p{L}\p{N}]/gu, '')
    .replace(/[xX×]/g, '');

const CASES: Case[] = [];
const add = (c: Case) => CASES.push(c);

const LEAD: Record<string, string> = {
  en: 'He said',
  de: 'Er sagte',
  uk: 'Він сказав',
  pl: 'Powiedział',
  fr: 'Il a dit',
};

// Quotes
for (const [lang, input, word] of [
  ['en', 'He said "stone" and left', 'stone'],
  ['de', 'Er sagte "Haus" und ging', 'Haus'],
  ['uk', 'Він сказав "камінь" і пішов', 'камінь'],
  ['pl', 'Powiedział "dom" i wyszedł', 'dom'],
  ['fr', 'Il a dit "maison" et il est parti', 'maison'],
] as [Lang, string, string][]) {
  add({
    id: `quote-${lang}`,
    group: 'Quotes',
    lang,
    input,
    expect: `the straight pair around ${word} becomes a quotation pair of the language`,
    pass: quoted(lang, word),
  });
  add({
    id: `quote-nested-${lang}`,
    group: 'Nested quotes',
    lang,
    input: `${LEAD[lang]} "outer 'inner' outer" and left`,
    expect: 'an inner quotation is set in other marks than the outer one',
    pass: nested(lang),
  });
}

// Apostrophes, ellipsis
add({
  id: 'apostrophe-en',
  group: 'Apostrophes and ellipsis',
  lang: 'en',
  input: "They don't know Maria's house",
  expect: '’ in don’t and Maria’s',
  pass: has('don’t', 'Maria’s'),
});
add({
  id: 'apostrophe-uk',
  group: 'Apostrophes and ellipsis',
  lang: 'uk',
  input: "пам'ять і м'яч",
  expect: 'пам’ять, м’яч with ’',
  pass: has('пам’ять', 'м’яч'),
});
add({
  id: 'ellipsis',
  group: 'Apostrophes and ellipsis',
  lang: 'en',
  input: 'Wait... and then',
  expect: '... becomes …',
  pass: has('Wait…'),
});

// Dashes
for (const [lang, input] of [
  ['en', 'Stone - memory - and time'],
  ['de', 'Stein - Gedächtnis - und Zeit'],
  ['uk', 'Камінь - пам’ять - і час'],
  ['pl', 'Kamień - pamięć - i czas'],
  ['fr', 'Pierre - mémoire - et temps'],
] as [Lang, string][]) {
  add({
    id: `dash-sentence-${lang}`,
    group: 'Dashes',
    lang,
    input,
    expect: 'a spaced hyphen between words becomes an en or em dash, the words kept',
    pass: (out) =>
      /\S[\s  ][–—][\s  ]\S/u.test(out) && !/ - /.test(out) && alnum(out) === alnum(input),
  });
}

// Ranges
for (const [lang, input] of [
  ['en', 'pages 21-26 and 10:00-12:00'],
  ['de', 'Seiten 21-26 und 10:00-12:00'],
  ['uk', 'сторінки 21-26 і 10:00-12:00'],
  ['pl', 'strony 21-26 i 10:00-12:00'],
  ['fr', 'pages 21-26 et 10:00-12:00'],
] as [Lang, string][]) {
  add({
    id: `range-${lang}`,
    group: 'Ranges',
    lang,
    input,
    expect: '21-26 and 10:00-12:00 get an en dash',
    pass: has('21–26', '10:00–12:00'),
  });
}

// Left alone
for (const [id, input] of [
  ['iso-date', 'on 2026-10-19 we met'],
  ['phone', 'call +49 30 1234-5678 now'],
  ['identifier', 'see ISO 9001-2 here'],
  ['score', 'the score was 3-1 today'],
  ['compound', 'a one-week, value-based lab'],
] as [string, string][]) {
  add({
    id: `alone-${id}`,
    group: 'Left alone',
    lang: 'en',
    input,
    expect: 'no character changes except spaces',
    pass: unchanged,
  });
}

// No-break spaces
add({
  id: 'nbsp-number-unit-en',
  group: 'No-break spaces',
  lang: 'en',
  input: 'It is 5 km to the lab',
  expect: 'no-break space in 5 km',
  pass: has(`5${NBSP}km`),
});
add({
  id: 'nbsp-number-unit-de',
  group: 'No-break spaces',
  lang: 'de',
  input: 'Es sind 5 km bis zum Labor',
  expect: 'no-break space in 5 km',
  pass: has(`5${NBSP}km`),
});
add({
  id: 'nbsp-number-unit-uk',
  group: 'No-break spaces',
  lang: 'uk',
  input: 'До лабораторії 5 км',
  expect: 'no-break space in 5 км',
  pass: has(`5${NBSP}км`),
});
add({
  id: 'nbsp-month-en',
  group: 'No-break spaces',
  lang: 'en',
  input: 'The lab opens on 21 September',
  expect: 'no-break space in 21 September',
  pass: has(`21${NBSP}September`),
});
add({
  id: 'nbsp-one-letter-en',
  group: 'No-break spaces',
  lang: 'en',
  input: 'We found a stone in the lake',
  expect: 'no-break space after a',
  pass: has(`a${NBSP}stone`),
});
add({
  id: 'nbsp-one-letter-uk',
  group: 'No-break spaces',
  lang: 'uk',
  input: 'Камінь лежить в камені',
  expect: 'no-break space after в',
  pass: has(`в${NBSP}камені`),
});
add({
  id: 'nbsp-one-letter-pl',
  group: 'No-break spaces',
  lang: 'pl',
  input: 'Pamięć w kamieniu',
  expect: 'no-break space after w',
  pass: has(`w${NBSP}kamieniu`),
});
add({
  id: 'nbsp-initials-en',
  group: 'No-break spaces',
  lang: 'en',
  input: 'Invited: Prof. Dr. K. Smith',
  expect: 'no-break spaces in the title and initials',
  pass: has(`Dr.${NBSP}K.${NBSP}Smith`),
});
add({
  id: 'nbsp-before-dash',
  group: 'No-break spaces',
  lang: 'en',
  input: 'Stone - memory',
  expect: 'a no-break space before the dash, so a line never starts with it',
  pass: matches(new RegExp(`Stone${NBSP}[–—]`)),
});

// Abbreviations
add({
  id: 'abbr-de-zb',
  group: 'Abbreviations',
  lang: 'de',
  input: 'Das gilt z. B. hier und d. h. dort',
  expect: 'z. B. and d. h. kept together',
  pass: has(`z.${NBSP}B.`, `d.${NBSP}h.`),
});
add({
  id: 'abbr-de-nr',
  group: 'Abbreviations',
  lang: 'de',
  input: 'Siehe Nr. 5 und S. 12',
  expect: 'Nr. 5 and S. 12 kept together',
  pass: has(`Nr.${NBSP}5`, `S.${NBSP}12`),
});
add({
  id: 'abbr-uk',
  group: 'Abbreviations',
  lang: 'uk',
  input: 'вул. Хрещатик, і т. д.',
  expect: 'вул. Хрещатик and т. д. kept together',
  pass: has(`вул.${NBSP}Хрещатик`, `т.${NBSP}д.`),
});
add({
  id: 'abbr-pl',
  group: 'Abbreviations',
  lang: 'pl',
  input: 'Mieszka przy ul. Marszałkowska 5',
  expect: 'ul. Marszałkowska kept together',
  pass: has(`ul.${NBSP}Marszałkowska`),
});
add({
  id: 'abbr-en-fig',
  group: 'Abbreviations',
  lang: 'en',
  input: 'See Fig. 2 on p. 12',
  expect: 'Fig. 2 and p. 12 kept together',
  pass: has(`Fig.${NBSP}2`, `p.${NBSP}12`),
});

// Symbols
add({
  id: 'symbol-copyright',
  group: 'Symbols',
  lang: 'en',
  input: '(c) 2026 Podiia',
  expect: '(c) becomes ©',
  pass: has('©'),
});
add({
  id: 'symbol-arrow',
  group: 'Symbols',
  lang: 'en',
  input: 'Read more ->',
  expect: '-> becomes →',
  pass: has('→'),
});
add({
  id: 'symbol-arrow-nbsp',
  group: 'Symbols',
  lang: 'en',
  input: 'Read more ->',
  expect: 'no-break space before →, so it never wraps alone',
  pass: has(`${NBSP}→`),
});
add({
  id: 'symbol-multiply',
  group: 'Symbols',
  lang: 'en',
  input: 'A 1920x1080 screen',
  expect: '1920x1080 becomes 1920×1080',
  pass: has('1920×1080'),
});
add({
  id: 'symbol-minus',
  group: 'Symbols',
  lang: 'en',
  input: 'It was -5 degrees',
  expect: '-5 gets a minus sign',
  pass: has('−5'),
});
add({
  id: 'symbol-hex-alone',
  group: 'Symbols',
  lang: 'en',
  input: 'The value is 0x1F here',
  expect: '0x1F is not a multiplication',
  pass: has('0x1F'),
});
add({
  id: 'percent-de',
  group: 'Symbols',
  lang: 'de',
  input: 'Das sind 5% von 49€',
  expect: 'a (no-break) space before % and €',
  pass: matches(new RegExp(`5[ ${NBSP}${NNBSP}]%.*49[ ${NBSP}${NNBSP}]€`)),
});
add({
  id: 'percent-fr',
  group: 'Symbols',
  lang: 'fr',
  input: 'Cela fait 5% de 49€',
  expect: 'a (no-break) space before % and €',
  pass: matches(new RegExp(`5[ ${NBSP}${NNBSP}]%.*49[ ${NBSP}${NNBSP}]€`)),
});

// Protected text
add({
  id: 'protect-url',
  group: 'Protected text',
  lang: 'en',
  input: 'see https://example.com/12-15--x now',
  expect: 'the web address comes back exactly',
  pass: has('https://example.com/12-15--x'),
});
add({
  id: 'protect-email',
  group: 'Protected text',
  lang: 'en',
  input: 'write to a-b@example.org -> now',
  expect: 'the email comes back exactly',
  pass: has('a-b@example.org'),
});
add({
  id: 'protect-code',
  group: 'Protected text',
  lang: 'en',
  input: 'run `x -> y --force` now',
  expect: 'the code span comes back exactly',
  pass: has('`x -> y --force`'),
});

// HTML
add({
  id: 'html-pre',
  group: 'HTML',
  lang: 'en',
  format: 'html',
  input: '<p>"a" - b</p><pre>"x" - y</pre>',
  expect: '<pre> content unchanged',
  pass: has('<pre>"x" - y</pre>'),
});
add({
  id: 'html-code',
  group: 'HTML',
  lang: 'en',
  format: 'html',
  input: '<p>"a" - b <code>x -> y</code></p>',
  expect: '<code> content unchanged',
  pass: has('<code>x -> y</code>'),
});
add({
  id: 'html-attributes',
  group: 'HTML',
  lang: 'en',
  format: 'html',
  input: '<p>a - b <a href="https://a.b/1-2" title="a - b">link</a></p>',
  expect: 'attributes unchanged',
  pass: has('href="https://a.b/1-2"', 'title="a - b"'),
});
add({
  id: 'html-typeset-text',
  group: 'HTML',
  lang: 'en',
  format: 'html',
  input: '<p>He said "stone" and left</p>',
  expect: 'the text is typeset inside the tags',
  pass: (out) => quoted('en', 'stone')(out) && out.startsWith('<p>') && out.endsWith('</p>'),
});
add({
  id: 'html-quote-in-link',
  group: 'HTML',
  lang: 'en',
  format: 'html',
  input: '<p>See <a href="/x">"the docs"</a> now</p>',
  expect: 'a quotation written inside a link stays inside it',
  pass: matches(/<a href="\/x">[“‘«][^<]*the docs[^<]*[”’»]<\/a>/u),
});
add({
  id: 'html-quote-across-link',
  group: 'HTML',
  lang: 'en',
  format: 'html',
  input: '<p>"See <a href="/x">the docs</a> now"</p>',
  expect: 'a quotation pairs across a link, markup unchanged',
  pass: matches(/[“‘]See <a href="\/x">the docs<\/a> now[”’]/u),
});

// Stability and safety
const SAMPLE: Record<string, string> = {
  en: 'He said "we\'re here" - and left... It runs 21-26 September, 10:00-12:00 (c) 2026. Read more ->',
  de: 'Er sagte "wir sind da" - und ging... Es läuft 21-26 September, z. B. 5% mehr. Mehr ->',
  uk: 'Він сказав "ми тут" - і пішов... Триває 21-26 вересня, 10:00-12:00. Докладніше ->',
  pl: 'Powiedział "jesteśmy tu" - i wyszedł... Trwa 21-26 września, ul. Długa 5. Więcej ->',
  fr: 'Il a dit "nous voilà" - et il est parti... Cela dure 21-26 septembre, 5% de plus. Lire ->',
};
for (const lang of ['en', 'de', 'uk', 'pl', 'fr'] as Lang[]) {
  const input = SAMPLE[lang] ?? '';
  add({
    id: `no-letter-lost-${lang}`,
    group: 'Safety',
    lang,
    input,
    expect: 'no letter or digit is lost or added',
    pass: (out) => alnum(out) === alnum(input),
  });
}

/** Run twice, the second pass must change nothing: checked by the runner (it needs the tool). */
export const STABILITY: { id: string; lang: Lang; input: string }[] = (
  ['en', 'de', 'uk', 'pl', 'fr'] as Lang[]
).map((lang) => ({ id: `stable-${lang}`, lang, input: SAMPLE[lang] ?? '' }));

// Registers: only this package has them.
add({
  id: 'dialogue-uk',
  group: 'Registers',
  lang: 'uk',
  input: '- Привіт, - сказав він.\n\n- Як справи?',
  expect: 'a dialogue line opens with an em dash',
  pass: (out) => /^—[\s ]Привіт/u.test(out) && /\n\n—[\s ]Як/u.test(out),
  only: ['podiia literary'],
});
add({
  id: 'british-quotes',
  group: 'Registers',
  lang: 'en',
  input: 'She said "stone" and left',
  expect: 'British literary quotes ‘…’',
  pass: has('‘stone’'),
  only: ['podiia literary'],
});

export { CASES };
