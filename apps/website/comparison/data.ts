/**
 * The numbers and words the comparison page shows, from the benchmark (`apps/bench/RESULTS.md`) and
 * by hand where the page says so. Strings may hold markup (`<code>`): they are ours, set with
 * \`innerHTML\`. A change to a score, a speed or a feature row is made here and nowhere else.
 */

export const TOOLS = [
  '@mokhniuk/typography',
  'typograf',
  'typopo',
  'richtypo',
  'tipograph',
  'smartypants',
  'retext-smartypants',
] as const;
export type Tool = (typeof TOOLS)[number];

export const SCORE: readonly (readonly [name: string, pass: number, of: number, mine: boolean])[] =
  [
    ['@mokhniuk/typography literary', 260, 260, true],
    ['@mokhniuk/typography', 260, 260, true],
    ['tipograph', 127, 169, false],
    ['typopo', 86, 112, false],
    ['typograf + nbsp rule', 141, 236, false],
    ['typograf', 135, 236, false],
    ['richtypo', 70, 107, false],
    ['smartypants', 53, 90, false],
    ['retext-smartypants', 52, 90, false],
  ];

/* Y = does it, P = partly, N = no. Order matches TOOLS. */
export const ROWS: readonly (
  | readonly [string, string]
  | readonly [feature: string, note: string, marks: string]
)[] = [
  ['g', 'Quotes and punctuation'],
  [
    'US-style “ ” ‘ ’ quotes',
    "@mokhniuk/typography: option quoteStyle 'us'; the default for English since 0.15.0 is “…” (house style «…»: quoteStyle 'guillemets'), British ‘…’ in the literary register",
    'YYYYYYY',
  ],
  ['Nested quotes resolved', 'a quote inside a quote gets the right marks', 'YNYNYYY'],
  ['Apostrophes (it’s, ’90s, ’n’)', 'typograf misses ’90s and ’n’', 'YPYNYYY'],
  ['Ellipsis …', '', 'YYYYYYY'],
  [
    'Em dash for a spaced hyphen or --',
    'tipograph sets an en dash; the smartypants pair only handle --',
    'YYYYPPP',
  ],
  ['En dash in ranges (21–26)', '', 'YNYNYNN'],
  ['Real minus sign −', '', 'YNNNYNN'],
  ['Multiplication sign ×', '', 'YYYNNNN'],
  ['© ® ™', '', 'YYYNYNN'],
  ['Arrows → ←', '=> is converted by nobody', 'YYNNYNN'],
  [
    'Fractions ½ and ±',
    '@mokhniuk/typography: opt-in rules; typopo and tipograph do ± only',
    'YYPNPNN',
  ],
  ['Degree sign (20 °C)', '@mokhniuk/typography: opt-in rule', 'YYNNNNN'],
  [
    'Space before punctuation removed',
    'word , → word, (@mokhniuk/typography: opt-in rule)',
    'YYYNNNN',
  ],
  ['Repeated spaces collapsed', 'richtypo turns them into a no-break space', 'YYYPYNN'],
  [
    'Trailing spaces trimmed',
    '@mokhniuk/typography: opt-in rule, kept by default in text mode',
    'YYYNPNN',
  ],
  ['g', 'No-break spaces'],
  ['After short words (a, in, the)', '', 'YYYYNNN'],
  ['Number + unit (5 km)', 'typograf has the rule, off by default', 'YNYYNNN'],
  ['After titles (Dr. Smith, e.g.)', '', 'YNYNNNN'],
  ['After initials (J. R. R. Tolkien)', '', 'YNNPNNN'],
  ['Before a dash, so a line never starts with it', '', 'YYNPNNN'],
  [
    'Money kept whole (USD 5 000, € 49.99)',
    'the sign or code bound to the amount, and the groups of a hand-grouped number',
    'YNNNNNN',
  ],
  [
    'Phone numbers kept whole',
    '@mokhniuk/typography: opt-in rule phone.bind, international numbers, digits unchanged; typograf has a Russian-format rule',
    'YPNNNNN',
  ],
  [
    'Short words bound to the next word (to the)',
    '@mokhniuk/typography: space.short-word, on by default since 0.14.0, five languages; the sources read say a title must bind them and body text may',
    'YPNPNNN',
  ],
  ['g', 'Safe on code and markup'],
  ['URLs and emails left alone', 'richtypo keeps emails, breaks URLs', 'YYYPNNN'],
  ['`code` spans left alone (plain text)', '', 'YNNYNNN'],
  [
    'HTML tags, attributes and &lt;pre&gt; kept',
    'typopo, smartypants and retext take text only',
    'YYNYYNN',
  ],
  [
    'Markdown mode',
    'richtypo says it works on Markdown; retext works on parsed text nodes',
    'YNNPNNP',
  ],
  ['rehype / hast plugin', '', 'YNNNNNN'],
  ['Stable on a second run', 'richtypo changes its own output', 'YYYNYYY'],
  ['g', 'Engine and tooling'],
  ['Rules switchable by name', 'ours: 34 rules, 10 of them opt-in; typograf: 107', 'YYPYPPP'],
  ['Reports what it changed', 'explain() and onChange, with the rule id', 'YNNNNNN'],
  [
    'Keeps the text as typed where the font lacks the glyph',
    "@mokhniuk/typography: the avoid option, measured from the page's own font in the browser, plus a font checker on the website",
    'YNNNNNN',
  ],
  ['Custom rules and plugins', '@mokhniuk/typography: addRule and a rules list', 'YYNYNNN'],
  ['Registers (display / literary)', '', 'YNNNNNN'],
  ['Hanging punctuation (DOM, React)', '', 'YNNNNNN'],
  ['React component', '', 'YNNNNNN'],
  ['Command line', 'typograf’s is a separate package', 'YNNNYYN'],
  ['TypeScript types', '', 'YYYYNNY'],
  ['g', 'Distribution'],
  ['On npm', '', 'YYYYYYY'],
  ['Licence', 'ours is MIT', 'YYYYYYY'],
  ['No runtime dependencies', 'tipograph: yargs; retext: unified and three more', 'YYYYNYN'],
];

export const SIZES: Record<
  string,
  { unit: string; note: string; data: Record<Tool, number | readonly [number, string]> }
> = {
  '1 KB paragraph': {
    unit: 'µs',
    note: 'time per call',
    data: {
      '@mokhniuk/typography': 85,
      typograf: 135,
      typopo: 3783,
      richtypo: 51053,
      tipograph: 26,
      smartypants: 25,
      'retext-smartypants': 327,
    },
  },
  '100 KB': {
    unit: 'ms',
    note: 'median of seven runs',
    data: {
      '@mokhniuk/typography': 4,
      typograf: 6,
      typopo: 1089,
      richtypo: [249000, 'est. 249 s'],
      tipograph: 1,
      smartypants: 1,
      'retext-smartypants': 27,
    },
  },
  '1 MB': {
    unit: 'ms',
    note: 'median of three runs',
    data: {
      '@mokhniuk/typography': 38,
      typograf: 58,
      typopo: 98742,
      richtypo: [24835000, 'est. 6.9 h'],
      tipograph: 11,
      smartypants: 10,
      'retext-smartypants': 577,
    },
  },
};

export const REGEX: readonly (readonly [
  tool: string,
  classes: number | null,
  lookbehinds: number,
  time: string,
])[] = [
  ['@mokhniuk/typography', 103, 42, '38 ms'],
  ['typograf', 0, 0, '58 ms'],
  ['tipograph', 0, 0, '11 ms'],
  ['typopo', 70, 0, '99 s'],
  ['richtypo', null, 10, '3.2 s at 10 KB'],
];

export const PROFILE: readonly (readonly [rule: string, share: number, ms: number])[] = [
  ['space.short-word', 17, 7.9],
  ['quote', 12, 5.6],
  ['space.abbreviation', 11, 5.1],
  ['space.title', 7, 3.3],
  ['space.number', 6, 2.7],
  ['symbol.degree (opt-in)', 5, 2.6],
  ['symbol.multiply', 5, 2.6],
  ['space.operator', 4, 2.0],
  ['the other rules', 32, 15.2],
];

export const WHY: readonly (readonly [title: string, tag: string, text: string])[] = [
  [
    'smartypants and tipograph',
    '10–11 ms/MB',
    'Few rules and plain-character regular expressions, no lookbehinds, no Unicode classes. smartypants only does quotes, dashes and ellipses. They are the speed ceiling for a regex tool, and they also score worst on no-break spaces and symbols.',
  ],
  [
    'typograf',
    '58 ms/MB',
    '53 rules for English and no <code>\\p{…}</code> classes or lookbehinds in its source. In 0.1.1 it was 5.4× faster than our 20 rules; the lesson that how a rule is written matters more than how many there are is what 0.2.0 applied. We are now about 1.5× faster (38 ms/MB against 58 in the 0.16.1 run), with the short-word rule on. Inferred from the source, not profiled.',
  ],
  [
    'retext-smartypants',
    '577 ms/MB',
    'The text is parsed into a syntax tree, walked and printed back. The rules are cheap; the tree is the cost. It buys you the unified ecosystem, which we also serve through rehype.',
  ],
  [
    'typopo',
    '99 s/MB',
    'Time grows about 50× from 10 KB to 100 KB and about 90× from 100 KB to 1 MB (21 ms, 1.1 s, 99 s, measured in full in the 0.16.1 run), so the cost is worse than linear. It carries 70 Unicode property classes. We did not diagnose the exact cause. Unusable on long documents.',
  ],
  [
    'richtypo',
    '3.2 s at 10 KB',
    'Read from the source: each rule starts with a lookbehind <code>(?&lt;!&lt;[^&gt;]*)</code>, meaning “not inside a tag”. On text with no tags the engine scans back to the start for every match, so the work is quadratic. A fixed-length or one-pass check would remove it.',
  ],
  [
    '@mokhniuk/typography',
    '38 ms/MB',
    'Linear (the 0.16.1 run, short-word rule on; the 0.15.0 run gave 49, the 0.14.0 run 74 on a busier machine, the 0.12.0 run 30). In 0.1.1 (324 ms) the cost was regular expressions that open with a lookbehind, tried at every position, plus a quote rule that looped until nothing changed (about 190 ms/MB). Now a rule finds a literal first and reads the character before it, a rule is skipped when a cheap test shows its trigger is absent, and the quote rule rebuilds the text in one pass (about 5 ms/MB). Output is identical to 0.1.1 where the rules have not changed, checked by a differential run. 1 KB takes 85 µs in the latency run (not re-run for 0.15.0).',
  ],
];

export const FIXES: readonly (readonly [state: string, title: string, text: string])[] = [
  [
    'done',
    'The zone scan without a flag it did not need, space.number in one pass (0.12.0)',
    'The regex that sets code spans, addresses and emails aside carried the <code>u</code> flag; under it JavaScriptCore reads a negated class in a slow path, 300 ms per MB from each lone backtick to the next. No benchmark text has one, so the bench never showed it; the profile and the stress tool now time the scan as a row and run on the fuzz corpus too. <code>space.number</code> reads its three concerns in one scan over the digit runs (2.7 ms per MB, from 5.3). Output identical, by <code>bun run compare</code>.',
  ],
  [
    'done',
    'Skip rules that cannot fire',
    'Each rule has a cheap trigger (<code>Rule.when</code>), and the pass is skipped when the text lacks it. Most prose has no <code>(c)</code>, no arrow, no <code>x</code> between digits.',
  ],
  [
    'done',
    'Literal first, then the character before it',
    'Regexes that opened with a lookbehind were tried at every position. <code>src/core/scan.ts</code> finds the literal and reads the character before it. This is the main cause of the 324 to 33 ms change.',
  ],
  [
    'done',
    'Quote rule in one pass',
    'It returns early and rebuilds the text once instead of looping until nothing changes: about 190 ms per MB to about 5 ms.',
  ],
  [
    'done',
    'Speed budget in the tests',
    '<code>src/speed.test.ts</code> checks that cost scales linearly and that 1 MB stays under a ceiling. It is loose, not a measurement. React already memoises per component, so no paragraph cache was added.',
  ],
  [
    'done',
    'The three opt-in lookbehind rules',
    '<code>space.before-punctuation</code>, <code>punctuation.double</code> and <code>symbol.degree</code> no longer open with a lookbehind (0.2.1): about 1, 2 and 5 ms per MB, from 40, 40 and 200 before the 0.2.1 rewrite.',
  ],
  [
    'done',
    'Quadratic corners',
    'The quote rule reads lone marks in one scan, and every other rule is linear on a long run of one character (0.2.1). Output and <code>explain</code> records are identical, checked by <code>bun run compare</code>.',
  ],
];

export const LANGS: {
  rows: readonly (readonly [code: string, name: string, state: string, who: string])[];
} = {
  // [code, name, tier, who covers]
  rows: [
    [
      'en',
      'English',
      'covered',
      '@mokhniuk/typography typograf typopo richtypo tipograph smartypants retext',
    ],
    [
      'en-US',
      'US English (“ ” quotes)',
      'covered',
      '@mokhniuk/typography typograf typopo richtypo tipograph smartypants retext',
    ],
    ['uk', 'Ukrainian', 'covered', '@mokhniuk/typography typograf'],
    ['de', 'German', 'covered', '@mokhniuk/typography typograf typopo tipograph'],
    ['fr', 'French', 'covered', '@mokhniuk/typography typograf richtypo tipograph'],
    ['pl', 'Polish', 'covered', '@mokhniuk/typography typograf tipograph'],
    ['es', 'Spanish', 'covered', '@mokhniuk/typography typograf tipograph'],
    ['it', 'Italian', 'covered', '@mokhniuk/typography typograf tipograph'],
    ['pt', 'Portuguese', 'covered', '@mokhniuk/typography tipograph'],
    ['nl', 'Dutch', 'covered', '@mokhniuk/typography typograf'],
    ['cs', 'Czech', 'covered', '@mokhniuk/typography typograf typopo tipograph'],
    ['sk', 'Slovak', 'covered', '@mokhniuk/typography typograf typopo'],
    ['ro', 'Romanian', 'covered', '@mokhniuk/typography typograf'],
    ['hu', 'Hungarian', 'covered', '@mokhniuk/typography typograf'],
    ['sv', 'Swedish', 'covered', '@mokhniuk/typography typograf tipograph'],
    ['da', 'Danish', 'covered', '@mokhniuk/typography typograf tipograph'],
    ['fi', 'Finnish', 'covered', '@mokhniuk/typography typograf tipograph'],
    ['el', 'Greek', 'covered', '@mokhniuk/typography typograf'],
    ['bg', 'Bulgarian', 'covered', '@mokhniuk/typography typograf'],
    ['hr', 'Croatian', 'covered', '@mokhniuk/typography'],
    ['sl', 'Slovenian', 'covered', '@mokhniuk/typography typograf'],
    ['et', 'Estonian', 'covered', '@mokhniuk/typography typograf'],
    ['lv', 'Latvian', 'covered', '@mokhniuk/typography typograf'],
    ['lt', 'Lithuanian', 'covered', '@mokhniuk/typography'],
    ['ga', 'Irish', 'covered', '@mokhniuk/typography typograf'],
    ['mt', 'Maltese', 'covered', '@mokhniuk/typography'],
  ],
};

export const SAMPLES: readonly { name: string; in: string; out: Record<string, string | null> }[] =
  [
    {
      name: 'nested quotes',
      in: 'He said "she said \'go\' to me" now',
      out: {
        '@mokhniuk/typography': 'He said “she said ‘go’ to~me” now',
        typograf: "He~said “she said 'go' to~me” now",
        typopo: 'He said “she said ‘go’ to me” now',
        richtypo: "He~said “she said 'go' to~me”~now",
        tipograph: 'He said “she said ‘go’ to me” now',
        smartypants: 'He said “she said ‘go’ to me” now',
        'retext-smartypants': 'He said “she said ‘go’ to me” now',
      },
    },
    {
      name: 'apostrophe',
      in: "It's the '90s, rock 'n' roll, don't",
      out: {
        '@mokhniuk/typography': 'It’s the~’90s, rock~’n’~roll, don’t',
        typograf: "It’s the~'90s, rock 'n' roll, don’t",
        typopo: 'It’s the ’90s, rock~’n’~roll, don’t',
        richtypo: "It's the~'90s, rock 'n' roll,~don't",
        tipograph: 'It’s the ’90s, rock ‘n’ roll, don’t',
        smartypants: 'It’s the ’90s, rock ‘n’ roll, don’t',
        'retext-smartypants': 'It’s the ’90s, rock ‘n’ roll, don’t',
      },
    },
    {
      name: 'number range',
      in: 'pages 21-26 and 10:00-12:00',
      out: {
        '@mokhniuk/typography': 'pages 21–26~and 10:00–12:00',
        typograf: 'pages 21-26 and~10:00-12:00',
        typopo: 'pages 21–26~and 10:00–12:00',
        richtypo: 'pages 21-26~and~10:00-12:00',
        tipograph: 'pages 21–26 and 10:00–12:00',
        smartypants: 'pages 21-26 and 10:00-12:00',
        'retext-smartypants': 'pages 21-26 and 10:00-12:00',
      },
    },
    {
      name: 'minus',
      in: 'result 5 - 3 = 2 and -4 C',
      out: {
        '@mokhniuk/typography': 'result 5~— 3 = 2~and −4~C',
        typograf: 'result 5~— 3 = 2 and~-4 °C',
        typopo: 'result 5–3 = 2~and -4~C',
        richtypo: 'result 5 — 3~= 2~and~-4~C',
        tipograph: 'result 5 – 3 = 2 and −4 C',
        smartypants: 'result 5 - 3 = 2 and -4 C',
        'retext-smartypants': 'result 5 - 3 = 2 and -4 C',
      },
    },
    {
      name: 'multiply',
      in: '3x4 and 1920x1080',
      out: {
        '@mokhniuk/typography': '3×4~and 1920×1080',
        typograf: '3×4 and~1920×1080',
        typopo: '3~×~4 and 1920~×~1080',
        richtypo: '3x4~and~1920x1080',
        tipograph: '3x4 and 1920x1080',
        smartypants: '3x4 and 1920x1080',
        'retext-smartypants': '3x4 and 1920x1080',
      },
    },
    {
      name: 'arrows',
      in: 'a -> b <- c => d',
      out: {
        '@mokhniuk/typography': 'a~→ b ←~c => d',
        typograf: 'a~→ b~← c~=> d',
        typopo: 'a~-> b~<- c~=> d',
        richtypo: 'a~-> b~<- c =>~d',
        tipograph: 'a → b ← c => d',
        smartypants: 'a -> b <- c => d',
        'retext-smartypants': 'a -> b <- c => d',
      },
    },
    {
      name: 'plus-minus',
      in: '+-5 and 1/2',
      out: {
        '@mokhniuk/typography': '+-5~and 1/2',
        typograf: '±5 and~½',
        typopo: '±5~and 1/2',
        richtypo: '+-5~and~1/2',
        tipograph: '±5 and 1/2',
        smartypants: '+-5 and 1/2',
        'retext-smartypants': '+-5 and 1/2',
      },
    },
    {
      name: 'degree',
      in: '20 C and 5 degrees',
      out: {
        '@mokhniuk/typography': '20~C and~5~degrees',
        typograf: '20 °C and~5 degrees',
        typopo: '20~C and 5~degrees',
        richtypo: '20~C~and~5~degrees',
        tipograph: '20 C and 5 degrees',
        smartypants: '20 C and 5 degrees',
        'retext-smartypants': '20 C and 5 degrees',
      },
    },
    {
      name: 'nbsp number+unit',
      in: 'it is 5 km or 10 kg or 3 GB',
      out: {
        '@mokhniuk/typography': 'it is 5~km or~10~kg or~3~GB',
        typograf: 'it~is~5 km~or~10 kg~or~3 GB',
        typopo: 'it is 5~km or 10~kg or 3~GB',
        richtypo: 'it~is~5~km~or~10~kg~or~3~GB',
        tipograph: 'it is 5 km or 10 kg or 3 GB',
        smartypants: 'it is 5 km or 10 kg or 3 GB',
        'retext-smartypants': 'it is 5 km or 10 kg or 3 GB',
      },
    },
    {
      name: 'nbsp abbreviation',
      in: 'Dr. Smith and Mr. Jones, e.g. this',
      out: {
        '@mokhniuk/typography': 'Dr.~Smith and~Mr.~Jones, e.g. this',
        typograf: 'Dr. Smith and~Mr. Jones, e.g. this',
        typopo: 'Dr.~Smith and Mr.~Jones, e.g. this',
        richtypo: 'Dr. Smith and~Mr. Jones, e.g.~this',
        tipograph: 'Dr. Smith and Mr. Jones, e.g. this',
        smartypants: 'Dr. Smith and Mr. Jones, e.g. this',
        'retext-smartypants': 'Dr. Smith and Mr. Jones, e.g. this',
      },
    },
    {
      name: 'nbsp initials',
      in: 'J. R. R. Tolkien',
      out: {
        '@mokhniuk/typography': 'J.~R.~R.~Tolkien',
        typograf: 'J. R. R. Tolkien',
        typopo: 'J.R.R. Tolkien',
        richtypo: 'J. R. R.~Tolkien',
        tipograph: 'J. R. R. Tolkien',
        smartypants: 'J. R. R. Tolkien',
        'retext-smartypants': 'J. R. R. Tolkien',
      },
    },
    {
      name: 'space before punct',
      in: 'word , and word .',
      out: {
        '@mokhniuk/typography': 'word , and~word .',
        typograf: 'word, and~word.',
        typopo: 'word, and word.',
        richtypo: 'word , and~word~.',
        tipograph: 'word , and word .',
        smartypants: 'word , and word .',
        'retext-smartypants': 'word , and word .',
      },
    },
    {
      name: 'URL/email kept',
      in: 'see https://a.com/x-y--z "q" and me@a-b.com',
      out: {
        '@mokhniuk/typography': 'see https://a.com/x-y--z “q” and me@a-b.com',
        typograf: 'see https://a.com/x-y--z “q” and~me@a-b.com',
        typopo: 'see https://a.com/x-y--z “q” and me@a-b.com',
        richtypo: 'see https://a.com/x-y — z “q” and~me@a-b.com',
        tipograph: 'see https://a.com/x-y–z “q” and me@a-b.com',
        smartypants: 'see https://a.com/x-y—z “q” and me@a-b.com',
        'retext-smartypants': 'see https://a.com/x-y—z “q” and me@a-b.com',
      },
    },
    {
      name: 'code span kept',
      in: 'use `a -> b "x"` here',
      out: {
        '@mokhniuk/typography': 'use `a -> b "x"` here',
        typograf: 'use `a → b~“x"` here',
        typopo: 'use ’a -> b~“x”’ here',
        richtypo: 'use `a -> b "x"`~here',
        tipograph: 'use `a → b “x”` here',
        smartypants: 'use `a -> b “x”` here',
        'retext-smartypants': 'use `a -> b “x”` here',
      },
    },
    {
      name: 'ISO date / identifiers',
      in: '2026-10-20 and 555-1234 and foo-bar',
      out: {
        '@mokhniuk/typography': '2026-10-20~and 555-1234~and foo-bar',
        typograf: '2026-10-20 and~555-1234 and~foo-bar',
        typopo: '2026–10–20~and 555–1234 and foo-bar',
        richtypo: '2026-10-20~and~555-1234~and~foo-bar',
        tipograph: '2026–10–20 and 555–1234 and foo-bar',
        smartypants: '2026-10-20 and 555-1234 and foo-bar',
        'retext-smartypants': '2026-10-20 and 555-1234 and foo-bar',
      },
    },
  ];
