import { NBSP } from '../types.ts';
import type { LangPack } from './pack.ts';

export const it = {
  code: 'it',
  name: 'Italian (italiano)',
  sample:
    'Disse "siamo qui" - e uscì... Il laboratorio dura 21-26 settembre, 10:00-12:00. Leggi di più ->',
  // «livello 1 “livello 2 ‘livello 3’ livello 2” livello 1», ISG 4.2.3.
  quotes: [
    ['«', '»'],
    ['“', '”'],
    ['‘', '’'],
  ],
  // The abbreviations of ISG annex A3 that introduce a number (n. 5, pag. 12) or that are written
  // in two parts (p. es.), the ones the ISG shows with a fixed space (4.2.3: n.• pag.•).
  abbreviations: {
    together: ['p. es.', 'ad es.', 'op. cit.'],
    page: ['n', 'pag', 'pagg', 'art', 'par', 'parr', 'vol', 'voll'],
  },
  // ISG 6.4 (common to all languages): a fixed space before %.
  percentSpace: true,
  // ISG part 3, 7 (euro): the € sign follows the figure, separated by a space (30 €); read in the Italian edition.
  currencySpace: true,
  // ISG 6.5: a comma for the decimals, a fixed space between groups of three digits.
  numbers: { group: NBSP, decimal: ',' },
  dialogueDash: { mark: '—' },
  reviewed: false,
  sources: [
    'https://www.treccani.it/magazine/lingua_italiana/articoli/scritto_e_parlato/punteggiatura9.html',
    'https://publications.europa.eu/resource/cellar/01ed788a-d266-11ec-a95f-01aa75ed71a1.0021.01/DOC_1 (Manuale interistituzionale di convenzioni redazionali, PDF of 19 April 2022: 4.2.3 livelli di virgolette, apostrofo and spazi fissi, 6.4 spaziatura dei segni d’interpunzione, 6.5 interpunzione nelle cifre, 10.1.7 virgolette, 10.1.10 lineetta, allegato A3 abbreviazioni)',
    'https://op.europa.eu/en/web/eu-vocabularies/formex/physical-specifications/character-encoding/use-of-quotation-marks-in-the-different-languages (Publications Office, quotation marks per language: it «…» “…” ‘…’)',
    "https://www.treccani.it/enciclopedia/virgolette_(Enciclopedia-dell'Italiano)/ (Enciclopedia dell’italiano: virgolette basse, alte, singole; the usual order is bassa for the first quotation and alta for those inside)",
    "https://www.treccani.it/enciclopedia/apostrofo_(Enciclopedia-dell'Italiano)/ (Enciclopedia dell’italiano: apostrofo for elision l’amica, truncation po’, dropped digits of a year ’48)",
    'https://en.wikipedia.org/wiki/Quotation_mark (cross-check only: Italian «…» “…”)',
  ],
  notes: [
    'Dialogue: narrative dialogue may open with a spaced lineetta, and the same spaced dash sets off the narrator (F. Longo, Treccani Magazine 2020, "Lineette doppie e lineetta singola"); `« »` is an equally standard choice. The examples there set the en dash; the pack keeps one dash for the text, the em dash of ISG 10, so dialogue and the narrator match.',
    "Quotation: «…» then “…” then ‘…’ is the order of the Manuale interistituzionale (4.2.3) and of Treccani; some Italian publishers write “…” first, with ‘…’ inside, which quoteStyle: 'us' gives. The Accademia della Crusca was searched, but its editorial criteria PDF could not be read, so it is not cited.",
    "Apostrophe: the engine already reads an apostrophe inside a word (l’amico, dell’architetto), a closing apostrophe of a truncation (un po’) and a year of two digits (’48) as apostrophes, not quote marks; the goldens in it.test.ts pin that inside and outside a quotation. Known limit: a quotation written with straight single quotes that holds a truncation, 'dammi un po' di pane', is closed at po' because the pack has no field for a trailing apostrophe (po’, va’, da’, di’, fa’, be’, sta’ are listed by Treccani); double quotes are not affected. The elisions field lists only words that start with an apostrophe, and the only ones read in a source are the dropped digits of a year, so it is empty: ’800 and ’900 are not implemented, not verified (a single university handout lists them; no authoritative source was read).",
    'Not implemented, not verified: the ISG gives half a fixed space between digit groups (a thin space), set here as a no-break space; no source read gives a list of one-letter words (a, e, i, o) to keep off the end of a line, so there are no orphans; the lineetta of 10.1.10 is the em dash, which is the default; the abbreviation lists are only a part of annex A3, chosen for a number or a second part that follows them.',
  ].join(' '),
} as const satisfies LangPack;

export default it;
