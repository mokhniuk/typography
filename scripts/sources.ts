/**
 * The registry of why each rule exists: a bibliography (SOURCES) and one decision
 * record per rule (RULE_SOURCES). Writes docs/sources.md.
 *
 *     bun scripts/sources.ts        (or: bun run docs:sources)
 *
 * Every source is read before it is entered here; nothing is cited from memory.
 * A rule whose decision is not yet backed by a source read stays `general-knowledge`,
 * so the gap shows. Imports only from ../src and node:, so the package stays liftable.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Lang, RULES } from '../src';

export type Source = {
  /** `cldr-quotes`, `chicago-17`, `bringhurst`. */
  id: string;
  kind: 'standard' | 'style-guide' | 'orthography' | 'research' | 'tool';
  /** Author, title, edition, year, section. */
  cite: string;
  url?: string;
  /** ISO date on which the source was read. */
  accessed: string;
  /** What it says that we rely on, in one sentence. */
  claim: string;
};

export type Decision = {
  /** Ids from SOURCES. */
  sources: string[];
  /** The reason we do it. */
  why: string;
  /** What others do (other guides, typograf, typopo) and why we do not. */
  alternative: string;
  confidence: 'verified' | 'general-knowledge' | 'disputed';
  /** Source ids that apply to one language only, where languages differ. */
  langs?: Partial<Record<Lang, string[]>>;
};

export const SOURCES: readonly Source[] = [
  {
    id: 'cldr-delimiters',
    kind: 'standard',
    cite: 'Unicode CLDR 46, cldr-misc-full 46.0.0, main/<locale>/delimiters.json (quotationStart, quotationEnd, alternateQuotationStart, alternateQuotationEnd), locales en, uk, de, pl, fr, de-CH, fr-CH.',
    url: 'https://cdn.jsdelivr.net/npm/cldr-misc-full@46.0.0/main/de-CH/delimiters.json',
    accessed: '2026-10-20',
    claim:
      'Per locale: en “ ” and ‘ ’; uk « » and „ “; de „ “ and ‚ ‘; pl „ ” and « »; fr « » and « »; de-CH „ “ and ‚ ‘; fr-CH « » and ‹ ›.',
  },
  {
    id: 'butterick-dashes',
    kind: 'style-guide',
    cite: 'Matthew Butterick, Practical Typography, "Hyphens and dashes" (web page; no edition or year on the page).',
    url: 'https://practicaltypography.com/hyphens-and-dashes.html',
    accessed: '2026-10-20',
    claim:
      'The em dash marks a break within a sentence; em and en dashes are normally set without spaces, and adding a space on each side is acceptable when they look crushed; the en dash is for ranges of values.',
  },
  {
    id: 'butterick-nbsp',
    kind: 'style-guide',
    cite: 'Matthew Butterick, Practical Typography, "Nonbreaking spaces" (web page; no edition or year on the page).',
    url: 'https://practicaltypography.com/nonbreaking-spaces.html',
    accessed: '2026-10-20',
    claim:
      'Use a nonbreaking space after § and ¶, after abbreviations such as "Ex." and "Fig." before a letter or number, between a title and a name ("Ms."), and with the trademark and copyright symbols.',
  },
  {
    id: 'nist-si-checklist',
    kind: 'standard',
    cite: 'SI Unit rules and style conventions: Check List for Reviewing Manuscripts (web page at physics.nist.gov, items 9, 10, 12 and 15; page names no publisher or year).',
    url: 'https://physics.nist.gov/cuu/Units/checklist.html',
    accessed: '2026-10-20',
    claim:
      'There is a space between a numerical value and a unit symbol, and between a number and the percent sign ("10 %"); the page does not say the space is nonbreaking.',
  },
  {
    id: 'unicode-names',
    kind: 'standard',
    cite: 'The Unicode Standard 18.0.0, NamesList-18.0.0.txt (generated 2026-08-10), entries U+2212 and U+00D7.',
    url: 'https://www.unicode.org/Public/UNIDATA/NamesList.txt',
    accessed: '2026-10-20',
    claim:
      'U+2212 MINUS SIGN and U+00D7 MULTIPLICATION SIGN are characters of their own, cross-referenced to hyphen-minus (U+002D) and to latin small letter x (U+0078) as different characters.',
  },
  {
    id: 'cldr-numbers',
    kind: 'standard',
    cite: 'Unicode CLDR 46, cldr-numbers-full 46.0.0, main/<locale>/numbers.json (percentFormats standard, currencyFormats standard), locales en, uk, de, pl, fr, de-CH, fr-CH.',
    url: 'https://cdn.jsdelivr.net/npm/cldr-numbers-full@46.0.0/main/de/numbers.json',
    accessed: '2026-10-20',
    claim:
      'The percent pattern is "#,##0 %" with U+00A0 before the sign in de and fr, and "#,##0%" in en, uk, pl, de-CH and fr-CH; the currency pattern puts U+00A0 between the amount and the currency sign in de, fr, uk, pl and fr-CH.',
  },
];

const NOT_YET = 'Not yet researched.';

/** A decision no source has been read for yet. */
const general = (why: string): Decision => ({
  sources: [],
  why,
  alternative: NOT_YET,
  confidence: 'general-knowledge',
});

/** One entry for every id in `RULES`; src/sources.test.ts checks that none is missing or extra. */
export const RULE_SOURCES: Record<string, Decision> = {
  quote: {
    sources: ['cldr-delimiters'],
    why: 'Each language has its own quotation marks, and nesting alternates a second pair. uk (« » „ “) and pl („ ” « ») match CLDR; fr level one and ch (« » ‹ ›, as fr-CH) match too.',
    alternative:
      'CLDR gives English “ ” ‘ ’ (the engine default is « » „ “, a gap already in the backlog as P0), German „ “ ‚ ‘ (the engine sets » « › ‹ on display), French « » with « » inside (the engine uses “ ” inside), and de-CH „ “ ‚ ‘ (the engine ch profile is the fr-CH one). The backlog records that every other tool in the benchmark produces “ ” for English by default (bench/RESULTS.md). Not read: the Swiss Federal Chancellery Schreibweisungen (a PDF this work could not extract text from), Pravopys 2019 (server refused the fetch), Imprimerie nationale Lexique.',
    confidence: 'disputed',
    langs: { en: ['cldr-delimiters'], uk: ['cldr-delimiters'], de: ['cldr-delimiters'], pl: ['cldr-delimiters'], fr: ['cldr-delimiters'], ch: ['cldr-delimiters'] },
  },
  apostrophe: general('A typographic apostrophe is ’, not the straight typewriter mark.'),
  ellipsis: general('Three dots are one character, …, so they cannot break across lines.'),
  arrow: general('Typed ASCII arrows have a proper character.'),
  'symbol.legal': general('(c), (R) and (TM) have proper characters.'),
  'dash.dialogue': {
    ...general('Ukrainian dialogue opens a paragraph with a dash.'),
    alternative:
      'Not researched to a primary source: the Pravopys 2019 PDF (mon.gov.ua) refused the fetch (HTTP 403). A secondary page names Український правопис 2019, § 161 "Тире" (pp. 230–241) as the dash section; read that section before marking this verified.',
  },
  'dash.range': general('A range of numbers takes an en dash, not a hyphen.'),
  'dash.sentence': {
    sources: ['butterick-dashes'],
    why: 'A break in a sentence takes a dash, and its form depends on the language. For English the em dash is backed by the source; it is the engine default.',
    alternative:
      'The source sets the em dash flush against the words and calls spaces acceptable; the engine sets it spaced, with a no-break space before it. The spaced en dash for German and for British literary English is not backed by any source read yet.',
    confidence: 'verified',
    langs: { en: ['butterick-dashes'] },
  },
  'symbol.minus': {
    sources: ['unicode-names', 'butterick-dashes'],
    why: 'A minus sign is −, not a hyphen.',
    alternative:
      'Unicode only shows that the character exists; it does not say when to use it. Butterick calls an en dash an acceptable minus sign in spreadsheets and math, so a style guide that prefers − over – was not found. Still unchecked.',
    confidence: 'general-knowledge',
  },
  'symbol.multiply': {
    sources: ['unicode-names'],
    why: 'A dimension takes ×, not the letter x.',
    alternative:
      'Unicode only shows that the character exists. The NIST SI checklist, as summarised by the fetch tool, does not address the × character, so it is no help here. Still unchecked.',
    confidence: 'general-knowledge',
  },
  'space.collapse': general('A run of spaces is a typing accident, not a setting.'),
  'space.title': {
    sources: ['butterick-nbsp'],
    why: 'A title stays on the line of the name it belongs to.',
    alternative: 'Not compared with other tools or with guides for the other languages.',
    confidence: 'verified',
    langs: { en: ['butterick-nbsp'] },
  },
  'space.initial': general('An initial stays on the line of the surname it belongs to.'),
  'space.abbreviation': {
    sources: ['butterick-nbsp'],
    why: 'An abbreviation stays on the line of what it qualifies.',
    alternative:
      'Only the English case ("Fig." before a number) is backed by a source read. The German, Ukrainian and Polish lists (profiles.ts) are still from general knowledge and have not been read by a native speaker; they stay unchecked even though the decision as a whole reads verified.',
    confidence: 'verified',
    langs: { en: ['butterick-nbsp'] },
  },
  'space.number': {
    sources: ['nist-si-checklist'],
    why: 'A number stays on the line of its unit or month. The source backs a space between a value and a unit, percent included.',
    alternative:
      'The source does not say the space is nonbreaking, and says nothing about dates ("21 September"); both are our choice. It spaces % in English, while CLDR sets no space there (see space.percent) and the engine follows CLDR.',
    confidence: 'verified',
  },
  'space.percent': {
    sources: ['cldr-numbers'],
    why: 'German and French set a no-break space before % and a currency sign. CLDR agrees for % in de and fr, and for the currency sign in de and fr; it sets no space before % in en, uk, pl, de-CH and fr-CH, which is what the engine does.',
    alternative:
      'CLDR also puts a no-break space before the currency sign in uk, pl and fr-CH; the engine leaves 49€ alone there (a gap, in the backlog). The pattern is how software formats a number, not a printed style guide; no printed guide (Duden, Imprimerie nationale Lexique) was read.',
    confidence: 'verified',
    langs: { de: ['cldr-numbers'], fr: ['cldr-numbers'] },
  },
  'space.association': general('e.V. stays on the line of the name it follows.'),
  'space.copyright': {
    sources: ['butterick-nbsp'],
    why: '© stays on the line of the year or name after it.',
    alternative: 'Not compared with other tools or with guides for the other languages.',
    confidence: 'verified',
  },
  'space.orphan': {
    ...general('A one-letter word does not end a line.'),
    alternative:
      'No authoritative source found. Only secondary pages (a WebKit bug thread, a Czech nbsp generator, plugin pages) state the Polish and Czech practice; none is a style guide, so none is cited. A Polish or Ukrainian typography guide is needed, and the English a/I rule has no source at all.',
  },
  'space.arrow': general('An arrow stays on the line of the word it points from or to.'),
};

const KINDS: readonly Source['kind'][] = ['standard', 'style-guide', 'orthography', 'research', 'tool'];

const KIND_TITLES: Record<Source['kind'], string> = {
  standard: 'Standards',
  'style-guide': 'Style guides',
  orthography: 'Orthography',
  research: 'Research',
  tool: 'Other tools',
};

const anchor = (id: string): string => `src-${id}`;

export function render(): string {
  const link = (id: string): string => `[${id}](#${anchor(id)})`;
  const out: string[] = [
    '# Sources',
    '',
    'Why each rule exists: the sources it rests on, the reason it was chosen, and what others do instead. This file is generated by `bun run docs:sources` from `scripts/sources.ts`. Do not edit it by hand: `src/sources.test.ts` fails when it is out of date.',
    '',
    'Every source was read before it was entered, on the date given. The `confidence` of a decision is one of:',
    '',
    '- `verified`: at least one source read says what the rule does.',
    '- `general-knowledge`: no source read yet; the rule is what the author knows to be usual. Treat it as unchecked.',
    '- `disputed`: a source read says something else than the engine does. See [backlog.md](backlog.md).',
    '',
    '## Decisions',
    '',
  ];
  for (const rule of RULES) {
    const decision = RULE_SOURCES[rule.id];
    if (!decision) continue;
    out.push(`### \`${rule.id}\``, '', `Confidence: \`${decision.confidence}\`.`, '');
    out.push(`Why: ${decision.why}`, '', `Alternative: ${decision.alternative}`, '');
    if (decision.sources.length) out.push(`Sources: ${decision.sources.map(link).join(', ')}`, '');
    for (const [lang, ids] of Object.entries(decision.langs ?? {})) {
      out.push(`- \`${lang}\`: ${ids.map(link).join(', ')}`);
    }
    if (decision.langs && Object.keys(decision.langs).length) out.push('');
  }
  out.push('## Bibliography', '');
  if (!SOURCES.length) out.push('No source has been read yet.', '');
  for (const kind of KINDS) {
    const group = SOURCES.filter((source) => source.kind === kind);
    if (!group.length) continue;
    out.push(`### ${KIND_TITLES[kind]}`, '');
    for (const source of group) {
      out.push(`<a id="${anchor(source.id)}"></a>`, `**${source.id}**. ${source.cite}`, '');
      if (source.url) out.push(`<${source.url}>, read ${source.accessed}.`, '');
      else out.push(`Read ${source.accessed}.`, '');
      out.push(`Relied on: ${source.claim}`, '');
    }
  }
  return `${out.join('\n').trimEnd()}\n`;
}

if (import.meta.main) {
  writeFileSync(join(import.meta.dir, '..', 'docs', 'sources.md'), render());
}
