import { type Lang, NBSP } from '../../src/core';
import { BENCH_LANGS, benchFor } from './langs';
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

const quoted = (lang: Lang, word: string) => (out: string) =>
  !out.includes('"') &&
  (benchFor(lang).pairs ?? []).some(([o, c]) =>
    new RegExp(`${esc(o)}${SP}${word}${SP}${esc(c)}`, 'u').test(out),
  );

const nested = (lang: Lang) => (out: string) =>
  !/["']/.test(out.replace(/[’‘]/g, '')) &&
  (benchFor(lang).nest ?? []).some(([o1, c1, o2, c2]) =>
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

// Quotes
for (const { code: lang, lead, quote } of BENCH_LANGS) {
  if (!quote) continue;
  add({
    id: `quote-${lang}`,
    group: 'Quotes',
    lang,
    input: quote.input,
    expect: `the straight pair around ${quote.word} becomes a quotation pair of the language`,
    pass: quoted(lang, quote.word),
  });
  add({
    id: `quote-nested-${lang}`,
    group: 'Nested quotes',
    lang,
    input: `${lead} "outer 'inner' outer" and left`,
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
for (const { code: lang, dash: input } of BENCH_LANGS) {
  if (!input) continue;
  add({
    id: `dash-sentence-${lang}`,
    group: 'Dashes',
    lang,
    input,
    expect: 'a spaced hyphen between words becomes an en or em dash, the words kept',
    pass: (out) =>
      /\S[\s  ][–—][\s  ]\S/u.test(out) && !/ - /.test(out) && alnum(out) === alnum(input),
  });
}

// Ranges
for (const { code: lang, range: input } of BENCH_LANGS) {
  if (!input) continue;
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
  input: '(c) 2026 Typography Engine',
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
for (const { code: lang, sample: input } of BENCH_LANGS) {
  if (!input) continue;
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
export const STABILITY: { id: string; lang: Lang; input: string }[] = BENCH_LANGS.flatMap(
  ({ code, sample }) => (sample ? [{ id: `stable-${code}`, lang: code, input: sample }] : []),
);

// Registers: only this package has them.
add({
  id: 'dialogue-uk',
  group: 'Registers',
  lang: 'uk',
  input: '- Привіт, - сказав він.\n\n- Як справи?',
  expect: 'a dialogue line opens with an em dash',
  pass: (out) => /^—[\s ]Привіт/u.test(out) && /\n\n—[\s ]Як/u.test(out),
  only: ['typography-engine literary'],
});
add({
  id: 'british-quotes',
  group: 'Registers',
  lang: 'en',
  input: 'She said "stone" and left',
  expect: 'British literary quotes ‘…’',
  pass: has('‘stone’'),
  only: ['typography-engine literary'],
});

// A wider English battery: statements of what is right, one per line.
// [id, group, input, expect, pass]
const nb = (x: string) => x.replaceAll(' ', NBSP);
const EN: [string, string, string, string, (o: string, i: string) => boolean][] = [
  ['quote-single-word', 'Quotes', 'She said "no"', 'a quoted word is paired', quoted('en', 'no')],
  ['quote-after-colon', 'Quotes', 'Note: "stone"', 'a quote after a colon opens', quoted('en', 'stone')],
  ['quote-in-parens', 'Quotes', 'It ("stone") ends', 'a quote inside parentheses pairs', quoted('en', 'stone')],
  ['quote-then-period', 'Quotes', 'He left "stone".', 'a quote before a full stop pairs', quoted('en', 'stone')],
  ['quote-two-pairs', 'Quotes', '"a" and "b"', 'two quotes on one line both pair', (o) => !o.includes('"') && /[“«‘].*[”»’].*[“«‘].*[”»’]/u.test(o)],
  ['quote-multiword', 'Quotes', 'He said "stone by stone" twice', 'a multi-word quote pairs', (o) => !o.includes('"')],
  ['quote-apostrophe-contraction', 'Quotes', "It's don't can't", 'contraction apostrophes stay apostrophes', (o) => o.split('’').length - 1 === 3 && !/[‘“«]/u.test(o)],
  ['quote-apostrophe-possessive', 'Quotes', "the dogs' bowls and Tom's", 'possessive apostrophes are not quotes', (o) => !/[‘“«„]/u.test(o)],
  ['quote-apostrophe-year', 'Quotes', "the '90s", 'an apostrophe before a decade is a closing mark, not an opening quote', has('’90s')],
  ['quote-rock-n-roll', 'Quotes', "rock 'n' roll", "the elided 'n' keeps apostrophes", (o) => !/[‘“«]/u.test(o)],
  ['quote-inches', 'Quotes', 'A 5\'10" frame', 'feet and inches are not quotes', (o) => !/[“”«»]/u.test(o)],
  ['quote-unbalanced', 'Quotes', 'He said "stone', 'an unclosed quote does not crash or lose text', (o) => o.includes('stone')],
  ['quote-empty', 'Quotes', 'An empty "" pair', 'an empty pair stays a pair', (o) => !o.includes('"')],
  ['quote-at-line-start', 'Quotes', '"Stone," he said.', 'a quote opening a line pairs', (o) => !o.includes('"')],
  ['quote-multiline', 'Quotes', '"one"\n"two"', 'each line pairs on its own', (o) => !o.includes('"')],
  ['dash-spaced-hyphen', 'Dashes', 'Stone - memory', 'a spaced hyphen between words is a dash', (o) => /[–—]/u.test(o) && !o.includes(' - ')],
  ['dash-double-hyphen', 'Dashes', 'Stone--memory', 'a double hyphen is a dash', (o) => /[–—]/u.test(o) && !o.includes('--')],
  ['dash-triple-hyphen-kept', 'Dashes', 'a --- b', 'a run of three hyphens is not turned into a double-hyphen dash', (o) => !/^a [–] b$/u.test(o.replaceAll(NBSP, ' '))],
  ['dash-range-pages', 'Dashes', 'pp. 21-26', 'a page range uses an en dash', has('21–26')],
  ['dash-range-years', 'Dashes', '1914-1918', 'a year range uses an en dash', has('1914–1918')],
  ['dash-range-time', 'Dashes', '10:00-12:00', 'a time range uses an en dash', has('10:00–12:00')],
  ['dash-iso-date-kept', 'Dashes', '2026-10-20', 'an ISO date is not a range', (o) => o === '2026-10-20'],
  ['dash-phone-kept', 'Dashes', 'Call 555-0123', 'a phone number keeps its hyphen', has('555-0123')],
  ['dash-compound-kept', 'Dashes', 'a well-known state-of-the-art tool', 'hyphenated compounds are untouched', unchanged],
  ['dash-negative-kept', 'Dashes', 'It was -5 degrees', 'a negative number keeps a sign, never a dash', (o) => /[-−]5/u.test(o)],
  ['dash-uk-range', 'Dashes', 'pages 21-26', 'a range is not an ordinary hyphen run', has('–')],
  ['ellipsis-three-dots', 'Ellipsis', 'Wait...', 'three dots become …', has('…')],
  ['ellipsis-four-dots', 'Ellipsis', 'Wait....', 'four dots keep a full stop after …', (o) => o.startsWith('Wait…')],
  ['ellipsis-two-dots-kept', 'Ellipsis', 'Wait..', 'two dots are not an ellipsis', (o) => !o.includes('…')],
  ['ellipsis-spaced', 'Ellipsis', 'Wait . . . now', 'spaced dots are left alone or joined, never lost', (o) => o.includes('now')],
  ['ellipsis-url-kept', 'Ellipsis', 'see http://a.com/x...y now', 'a URL is untouched', has('http://a.com/x...y')],
  ['symbol-trademark', 'Symbols', 'Typography Engine (TM)', '(TM) becomes ™', has('™')],
  ['symbol-registered', 'Symbols', 'Typography Engine (R)', '(R) becomes ®', has('®')],
  ['symbol-copyright-upper', 'Symbols', '(C) 2026', '(C) becomes ©', has('©')],
  ['symbol-arrow-left', 'Symbols', 'Back <-', '<- becomes ←', has('←')],
  ['symbol-arrow-code-kept', 'Symbols', 'Use `a -> b` here', 'an arrow in a code span is untouched', has('`a -> b`')],
  ['symbol-multiply-spaced', 'Symbols', '3 x 4', 'a spaced x between numbers becomes ×', has('×')],
  ['symbol-multiply-word-kept', 'Symbols', 'a box and an ox', 'x inside words is not a multiplication', unchanged],
  ['symbol-multiply-hex-kept', 'Symbols', 'color 0x1f', 'a hex literal keeps its x', has('0x1f')],
  ['symbol-minus', 'Symbols', 'Score 5 - 3 = 2', 'arithmetic keeps its numbers', (o) => /5.{1,3}3/u.test(o) && o.includes('2')],
  ['space-percent', 'Spacing', '50 %', 'a percent keeps its number', (o) => /50.?%/u.test(o)],
  ['space-number-unit', 'Spacing', '5 km away', 'no-break space between number and unit', has(nb('5 km'))],
  ['space-number-unit-glued', 'Spacing', '5km away', 'a glued unit is left readable', (o) => o.includes('km')],
  ['space-thousand-kept', 'Spacing', '1,000,000 people', 'thousands separators are untouched', has('1,000,000')],
  ['space-collapse', 'Spacing', 'a  b   c', 'repeated spaces collapse', (o) => !/ {2,}/u.test(o)],
  ['space-newline-kept', 'Spacing', 'a\n\nb', 'blank lines survive', has('\n\n')],
  ['space-leading-kept', 'Spacing', '  indented', 'text mode keeps a leading indent', (o) => o.endsWith('indented')],
  ['space-orphan-a', 'Spacing', 'I saw a cat in the yard', 'no short word is left at a line end', (o) => o.includes(nb('a cat')) || o.includes(nb('I saw'))],
  ['space-title-mr', 'Spacing', 'Mr. Smith left', 'a title stays with the name', has(nb('Mr. Smith'))],
  ['space-month-day', 'Spacing', 'on 21 September', 'a day stays with its month', has(nb('21 September'))],
  ['space-initials', 'Spacing', 'J. R. R. Tolkien', 'initials stay with the surname', (o) => /J\.[ ]R\./u.test(o) || o.includes(`J.${NBSP}R.`)],
  ['space-fig', 'Spacing', 'see Fig. 3', 'Fig. stays with its number', has(nb('Fig. 3'))],
  ['space-eg-kept', 'Spacing', 'e.g. this', 'e.g. is not split or lost', (o) => /e\.g\./u.test(o)],
  ['safety-url', 'Safety', 'Visit https://a.com/x-y--z?q=1&r=2 today', 'a URL is untouched', has('https://a.com/x-y--z?q=1&r=2')],
  ['safety-email', 'Safety', 'Mail a.b-c@x.org -- now', 'an email is untouched', has('a.b-c@x.org')],
  ['safety-code-span', 'Safety', 'Run `a -- b "c"` now', 'inline code is untouched', has('`a -- b "c"`')],
  ['safety-path', 'Safety', 'open C:\\a\\b-c.txt', 'a path is untouched', has('C:\\a\\b-c.txt')],
  ['safety-empty', 'Safety', '', 'empty text stays empty', (o) => o === ''],
  ['safety-emoji', 'Safety', 'Hi 👋 "x" 🎉', 'astral characters survive', has('👋', '🎉')],
  ['safety-cjk', 'Safety', '你好 "x" 世界', 'other scripts survive', has('你好', '世界')],
  ['safety-plain-unchanged', 'Safety', 'Plain words with no marks', 'text with nothing to fix is unchanged', unchanged],
];
for (const [id, group, input, expect, pass] of EN) {
  add({ id: `en-${id}`, group, lang: 'en', input, expect, pass });
}

// Cases only one language has (apps/bench/cases/<code>.ts), after the shared ones.
for (const { cases } of BENCH_LANGS) for (const c of cases ?? []) add(c);

export { CASES };
