import { readFileSync } from 'node:fs';
import richtypo from 'richtypo';
import richtypoEn from 'richtypo/rules/en';
import richtypoFr from 'richtypo/rules/fr';
import retextEnglish from 'retext-english';
import retextSmartypants from 'retext-smartypants';
import retextStringify from 'retext-stringify';
import { smartypantsu } from 'smartypants';
import tipograph from 'tipograph';
import { unified } from 'unified';
import Typograf from 'typograf';
import { fixTypos } from 'typopo';
import { type Lang, NBSP } from '../../src/core';
import { typesetHtml } from '../../src/html';
import { typesetText } from '../../src/text';

export type Format = 'text' | 'html';

/** Returns the typeset text, or null when the tool does not do this language or format. */
export type Run = (input: string, lang: Lang, format: Format) => string | null;

export type Tool = { name: string; version: string; about: string; run: Run };

// A language with no entry is one typograf has no locale for.
const TYPOGRAF_LOCALE: Partial<Record<Lang, string[]>> = {
  en: ['en-US'],
  de: ['de'],
  uk: ['uk'],
  pl: ['pl'],
  fr: ['fr'],
  // The other locales typograf ships that this package also has a pack for.
  bg: ['bg'],
  cs: ['cs'],
  da: ['da'],
  el: ['el'],
  es: ['es'],
  et: ['et'],
  fi: ['fi'],
  ga: ['ga'],
  hu: ['hu'],
  it: ['it'],
  lv: ['lv'],
  nl: ['nl'],
  ro: ['ro'],
  sk: ['sk'],
  sl: ['sl'],
  sv: ['sv'],
};

const TYPOPO_LOCALE: Partial<Record<Lang, string>> = { en: 'en-us', de: 'de-de', cs: 'cs', sk: 'sk' };

const typografCache = new Map<string, Typograf>();

/**
 * `extra` names rules that typograf ships switched off. They are the ones a user
 * would reach for first: of its twenty default-off rules, the only typographic one
 * for these languages is `common/nbsp/afterNumber` (the rest insert a final newline,
 * strip or escape HTML, wrap paragraphs, or are for a language this package does not cover).
 */
function typografRun(input: string, lang: Lang, extra: string[] = []): string | null {
  const locale = TYPOGRAF_LOCALE[lang];
  if (!locale) return null;
  const key = `${locale.join()}|${extra.join()}`;
  let tp = typografCache.get(key);
  if (!tp) {
    tp = new Typograf({ locale: locale as never });
    for (const rule of extra) tp.enableRule(rule);
    typografCache.set(key, tp);
  }
  return tp.execute(input);
}

function typopoRun(input: string, lang: Lang, format: Format): string | null {
  const locale = TYPOPO_LOCALE[lang];
  // A text library: it does not read HTML, and it has no locale for the other languages.
  if (!locale || format === 'html') return null;
  return fixTypos(input, locale as never);
}

const version = (name: string): string => {
  try {
    const url = new URL(`./node_modules/${name}/package.json`, import.meta.url);
    return (JSON.parse(readFileSync(url, 'utf8')) as { version: string }).version;
  } catch {
    return '?';
  }
};

// richtypo ships rules for English, French and Russian; it reads HTML and Markdown.
const RICHTYPO_RULES: Partial<Record<Lang, Parameters<typeof richtypo>[0]>> = {
  en: richtypoEn,
  fr: richtypoFr,
};

function richtypoRun(input: string, lang: Lang): string | null {
  const rules = RICHTYPO_RULES[lang];
  return rules ? richtypo(rules, input) : null;
}

const TIPOGRAPH_LANGUAGE: Partial<Record<Lang, string>> = {
  en: 'english',
  de: 'german',
  pl: 'polish',
  fr: 'french',
  es: 'spanish',
  it: 'italian',
  pt: 'portuguese',
  cs: 'czech',
  da: 'danish',
  fi: 'finnish',
  sv: 'swedish',
};

const tipographCache = new Map<string, (text: string) => string>();

function tipographRun(input: string, lang: Lang, format: Format): string | null {
  const language = TIPOGRAPH_LANGUAGE[lang];
  if (!language) return null;
  const key = `${language}|${format}`;
  let run = tipographCache.get(key);
  if (!run) {
    run = tipograph({ language, format: format === 'html' ? 'html' : 'plain' } as never) as (text: string) => string;
    tipographCache.set(key, run);
  }
  return run(input);
}

// Quotes, dashes and ellipses only, in the English style, whatever the language is: it has no locale.
function smartypantsRun(input: string, lang: Lang, format: Format): string | null {
  if (lang !== 'en' || format === 'html') return null;
  return smartypantsu(input, 'qde');
}

const retextProcessor = unified().use(retextEnglish).use(retextSmartypants).use(retextStringify);

// A retext plugin over plain text: English style, no locale, no HTML.
function retextSmartypantsRun(input: string, lang: Lang, format: Format): string | null {
  if (lang !== 'en' || format === 'html') return null;
  return String(retextProcessor.processSync(input));
}

export const TOOLS: Tool[] = [
  {
    name: 'typography-engine',
    version: 'this repo',
    about: 'default (display register)',
    run: (input, lang, format) =>
      format === 'html' ? typesetHtml(input, { lang, nbsp: 'char' }) : typesetText(input, { lang }),
  },
  {
    name: 'typography-engine literary',
    version: 'this repo',
    about: 'literary register (British English quotes)',
    run: (input, lang, format) =>
      format === 'html'
        ? typesetHtml(input, { lang, register: 'literary', nbsp: 'char' })
        : typesetText(input, { lang, register: 'literary' }),
  },
  {
    name: 'typograf',
    version: version('typograf'),
    about: 'every locale it ships that this package has a pack for (21 of 26; none for pt, hr, lt, mt, ch); default rules; handles HTML',
    run: (input, lang) => typografRun(input, lang),
  },
  {
    name: 'typograf +nbsp',
    version: version('typograf'),
    about: 'typograf with its one default-off typographic rule on: common/nbsp/afterNumber',
    run: (input, lang) => typografRun(input, lang, ['common/nbsp/afterNumber']),
  },
  {
    name: 'typopo',
    version: version('typopo'),
    about: 'locales en-us, de-de, cs, sk only; text only',
    run: typopoRun,
  },
  {
    name: 'richtypo',
    version: version('richtypo'),
    about: 'recommended rules for en and fr; handles HTML',
    run: richtypoRun,
  },
  {
    name: 'tipograph',
    version: version('tipograph'),
    about: 'languages english, german, polish, french, spanish, italian, portuguese, czech, danish, finnish, swedish; default presets; handles HTML',
    run: tipographRun,
  },
  {
    name: 'smartypants',
    version: version('smartypants'),
    about: "English only, text only; smartypantsu with quotes, dashes and ellipses ('qde')",
    run: smartypantsRun,
  },
  {
    name: 'retext-smartypants',
    version: version('retext-smartypants'),
    about: 'English only, text only; default options, through unified and retext',
    run: retextSmartypantsRun,
  },
];

export { NBSP };
