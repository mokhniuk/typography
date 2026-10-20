import Typograf from 'typograf';
import { fixTypos } from 'typopo';
import { type Lang, NBSP } from '../src/core';
import { typesetHtml } from '../src/html';
import { typesetText } from '../src/text';

export type Format = 'text' | 'html';

/** Returns the typeset text, or null when the tool does not do this language or format. */
export type Run = (input: string, lang: Lang, format: Format) => string | null;

export type Tool = { name: string; version: string; about: string; run: Run };

const TYPOGRAF_LOCALE: Record<Lang, string[] | null> = {
  en: ['en-US'],
  de: ['de'],
  uk: ['uk'],
  pl: ['pl'],
  fr: ['fr'],
  ch: null,
};

const TYPOPO_LOCALE: Partial<Record<Lang, string>> = { en: 'en-us', de: 'de-de' };

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
    return (require(`${name}/package.json`) as { version: string }).version;
  } catch {
    return '?';
  }
};

export const TOOLS: Tool[] = [
  {
    name: 'podiia',
    version: 'this repo',
    about: 'default (display register)',
    run: (input, lang, format) =>
      format === 'html' ? typesetHtml(input, { lang, nbsp: 'char' }) : typesetText(input, { lang }),
  },
  {
    name: 'podiia literary',
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
    about: 'locales en-US, de, uk, pl, fr; default rules; handles HTML',
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
    about: 'locales en-us, de-de only; text only',
    run: typopoRun,
  },
];

export { NBSP };
