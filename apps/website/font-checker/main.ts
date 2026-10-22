/**
 * The font checker: is this font ready for these languages and for the engine's rules?
 *
 * Everything happens in the browser. A font file is read with `FontFace` and never leaves the
 * machine; an installed font is used by name. For every character a rule can insert, and for the
 * letters of each chosen language that fonts most often lack, the page asks the measuring in
 * `src/dom/glyphs.ts` whether the font draws it itself, borrows it from another font, or has
 * nothing to draw. What it cannot draw becomes the `avoid` list of a config, which makes the engine
 * keep the text as it was typed wherever a rule would insert one of those characters.
 */

import {
  LANGS,
  type Lang,
  NBSP,
  PACK,
  type QuoteStyle,
  type Register,
  RULES,
  ruleGlyphs,
  typographic,
} from '../../../src/core';
import { glyphStatus, hangPunctuation, markHangs } from '../../../src/dom';
import { example } from '../../playground/examples';
import { RISKY_LETTERS } from './letters';

type Status = 'own' | 'fallback' | 'none';

const el = <T extends HTMLElement>(id: string): T => {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id} is missing`);
  return found as T;
};

const file = el<HTMLInputElement>('file');
const installed = el<HTMLInputElement>('installed');
const fontState = el<HTMLParagraphElement>('fontState');
const languages = el<HTMLDivElement>('languages');
const registerSelect = el<HTMLSelectElement>('register');
const quoteStyleSelect = el<HTMLSelectElement>('quoteStyle');
const optIn = el<HTMLInputElement>('optIn');
const verdict = el<HTMLDivElement>('verdict');
const coverage = el<HTMLDivElement>('coverage');
const examples = el<HTMLDivElement>('examples');
const preset = el<HTMLDivElement>('preset');
const configText = el<HTMLTextAreaElement>('configText');
const configCopy = el<HTMLButtonElement>('configCopy');

/** The family name a loaded file is registered under; an installed font keeps its own name. */
const LOADED = 'TypographyFontChecker';
const STORAGE = 'typography-font-checker';

type State = {
  /** The CSS family list to measure and to set the examples in; empty until a font is chosen. */
  family: string;
  /** What the reader sees in the heading: the file name, or the name they typed. */
  label: string;
  langs: Lang[];
  register: Register;
  quoteStyle: QuoteStyle;
  optIn: boolean;
};

const state: State = {
  family: '',
  label: '',
  langs: ['en'],
  register: 'display',
  quoteStyle: 'language',
  optIn: false,
  ...read(),
};

function read(): Partial<State> {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) ?? 'null') as Partial<State> | null;
    if (!saved) return {};
    const langs = (saved.langs ?? []).filter((lang): lang is Lang => LANGS.includes(lang));
    return {
      langs: langs.length ? langs : ['en'],
      register: saved.register === 'literary' ? 'literary' : 'display',
      quoteStyle: saved.quoteStyle === 'us' ? 'us' : 'language',
      optIn: saved.optIn === true,
    };
  } catch {
    return {};
  }
}

function save() {
  try {
    const { langs, register, quoteStyle, optIn: on } = state;
    localStorage.setItem(STORAGE, JSON.stringify({ langs, register, quoteStyle, optIn: on }));
  } catch {
    // Private windows and blocked storage: the page works without it.
  }
}

// The languages, as checkboxes in the registry's order.
for (const lang of LANGS) {
  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.value = lang;
  box.checked = state.langs.includes(lang);
  const name = document.createElement('span');
  name.textContent = PACK[lang].name;
  label.append(box, name);
  languages.append(label);
  box.addEventListener('change', () => {
    state.langs = box.checked
      ? [...state.langs, lang].sort((a, b) => LANGS.indexOf(a) - LANGS.indexOf(b))
      : state.langs.filter((other) => other !== lang);
    render();
  });
}

const setLangs = (list: Lang[]) => {
  state.langs = list;
  for (const box of languages.querySelectorAll<HTMLInputElement>('input')) {
    box.checked = list.includes(box.value as Lang);
  }
  render();
};
el('langsAll').addEventListener('click', () => setLangs([...LANGS]));
el('langsNone').addEventListener('click', () => setLangs([]));

registerSelect.value = state.register;
quoteStyleSelect.value = state.quoteStyle;
optIn.checked = state.optIn;
registerSelect.addEventListener('change', () => {
  state.register = registerSelect.value === 'literary' ? 'literary' : 'display';
  render();
});
quoteStyleSelect.addEventListener('change', () => {
  state.quoteStyle = quoteStyleSelect.value === 'us' ? 'us' : 'language';
  render();
});
optIn.addEventListener('change', () => {
  state.optIn = optIn.checked;
  render();
});

/** The face of the file in use, so a second file replaces it instead of piling up. */
let loaded: FontFace | null = null;

file.addEventListener('change', async () => {
  const chosen = file.files?.[0];
  if (!chosen) return;
  fontState.textContent = `Reading ${chosen.name}…`;
  try {
    const face = new FontFace(LOADED, await chosen.arrayBuffer());
    await face.load();
    if (loaded) document.fonts.delete(loaded);
    document.fonts.add(face);
    loaded = face;
    installed.value = '';
    state.family = `"${LOADED}"`;
    state.label = chosen.name;
    fontState.textContent = `${chosen.name}: read in this browser only.`;
  } catch (error) {
    state.family = '';
    state.label = '';
    fontState.textContent = `${chosen.name} could not be read as a font (${
      error instanceof Error ? error.message : String(error)
    }).`;
  }
  render();
});

installed.addEventListener('input', () => {
  const name = installed.value.trim();
  if (!name) {
    state.family = '';
    state.label = '';
    fontState.textContent = '';
    render();
    return;
  }
  state.family = `"${name}"`;
  state.label = name;
  fontState.textContent = isInstalled(state.family)
    ? `${name}: found on this machine.`
    : `No font called ${name} on this machine, so everything below is a fallback font's.`;
  render();
});

/** Whether a family by this name draws plain letters itself: a name nothing matches draws none. */
const isInstalled = (family: string): boolean =>
  [...'Hamburgefonstiv'].some((letter) => glyphStatus(letter, family) === 'own');

/** The rules whose characters are counted: the opt-in ones only when the reader asks for them. */
const countedRules = () => RULES.filter((rule) => state.optIn || rule.defaultOn !== false);

/** Every character the counted rules can insert in a language, with the rules that insert it. */
function marksOf(lang: Lang): Map<string, string[]> {
  const glyphs = ruleGlyphs(lang);
  const found = new Map<string, string[]>();
  for (const rule of countedRules()) {
    for (const char of glyphs[rule.id] ?? '') {
      if (char === NBSP) continue;
      found.set(char, [...(found.get(char) ?? []), rule.id]);
    }
  }
  return found;
}

const codePoint = (char: string): string =>
  `U+${(char.codePointAt(0) ?? 0).toString(16).toUpperCase().padStart(4, '0')}`;

const STATUS_WORD: Record<Status, string> = {
  own: 'own',
  fallback: 'borrowed',
  none: 'none',
};

type Row = { char: string; status: Status; by: string };

/** One table: a caption, and a row per character with what draws it and which rules need it. */
function table(caption: string, rows: Row[]): HTMLTableElement {
  const grid = document.createElement('table');
  const cap = document.createElement('caption');
  cap.textContent = caption;
  const head = document.createElement('thead');
  head.innerHTML =
    '<tr><th scope="col">Character</th><th scope="col">Code</th><th scope="col">Drawn by</th><th scope="col">Needed for</th></tr>';
  const body = document.createElement('tbody');
  for (const row of rows) {
    const tr = document.createElement('tr');
    tr.dataset.status = row.status;
    const sample = document.createElement('th');
    sample.scope = 'row';
    sample.textContent = row.char;
    sample.dataset.specimen = '';
    if (state.family) sample.style.fontFamily = state.family;
    const code = document.createElement('td');
    code.textContent = codePoint(row.char);
    const status = document.createElement('td');
    status.textContent = STATUS_WORD[row.status];
    const by = document.createElement('td');
    by.textContent = row.by;
    tr.append(sample, code, status, by);
    body.append(tr);
  }
  grid.append(cap, head, body);
  return grid;
}

/** The characters the font cannot draw itself, over every language chosen: the `avoid` list. */
function missingFor(): { avoid: string; perLang: Map<Lang, Row[]>; letters: Map<Lang, Row[]> } {
  const perLang = new Map<Lang, Row[]>();
  const letters = new Map<Lang, Row[]>();
  let avoid = '';
  for (const lang of state.langs) {
    const rows: Row[] = [];
    for (const [char, rules] of marksOf(lang)) {
      const status = state.family ? glyphStatus(char, state.family) : 'own';
      rows.push({ char, status, by: rules.join(', ') });
      if (status !== 'own' && !avoid.includes(char)) avoid += char;
    }
    rows.sort((a, b) => (a.char < b.char ? -1 : 1));
    perLang.set(lang, rows);
    const own: Row[] = [];
    for (const char of RISKY_LETTERS[lang] ?? '') {
      const status = state.family ? glyphStatus(char, state.family) : 'own';
      own.push({ char, status, by: `letters of ${PACK[lang].name}` });
    }
    letters.set(lang, own);
  }
  return { avoid, perLang, letters };
}

/** The share of characters the font draws itself, as a percentage. */
const share = (rows: Row[]): number =>
  rows.length
    ? Math.round((rows.filter((row) => row.status === 'own').length / rows.length) * 100)
    : 100;

function renderVerdict(perLang: Map<Lang, Row[]>, letters: Map<Lang, Row[]>) {
  verdict.replaceChildren();
  if (!state.family) {
    const p = document.createElement('p');
    p.textContent = 'Load a font file, or name an installed font, to see how it stands.';
    verdict.append(p);
    return;
  }
  if (!state.langs.length) {
    const p = document.createElement('p');
    p.textContent = 'Pick at least one language.';
    verdict.append(p);
    return;
  }
  const list = document.createElement('dl');
  for (const lang of state.langs) {
    const rows = [...(perLang.get(lang) ?? []), ...(letters.get(lang) ?? [])];
    const score = share(rows);
    const borrowed = rows.filter((row) => row.status === 'fallback');
    const none = rows.filter((row) => row.status === 'none');
    const dt = document.createElement('dt');
    dt.textContent = PACK[lang].name;
    const dd = document.createElement('dd');
    dd.dataset.score = score === 100 ? 'ready' : score >= 90 ? 'close' : 'short';
    const headline =
      score === 100
        ? 'draws every mark and letter this language needs.'
        : `draws ${score}% of them: ${borrowed.length} borrowed from another font, ${none.length} nowhere to be found.`;
    dd.textContent = `${score}% — ${headline}`;
    list.append(dt, dd);
  }
  verdict.append(list);
}

function renderCoverage(perLang: Map<Lang, Row[]>, letters: Map<Lang, Row[]>) {
  coverage.replaceChildren();
  if (!state.langs.length) {
    const p = document.createElement('p');
    p.textContent = 'Pick a language to see its table.';
    coverage.append(p);
    return;
  }
  for (const lang of state.langs) {
    const marks = perLang.get(lang) ?? [];
    coverage.append(table(`${PACK[lang].name}: the marks the rules insert`, marks));
    const own = letters.get(lang) ?? [];
    if (own.length) coverage.append(table(`${PACK[lang].name}: letters fonts often lack`, own));
  }
}

/** The hanging passes of the examples, stopped before the examples are built again. */
let stopHanging: (() => void)[] = [];

/** The example of each language, typeset by the engine and set in the font at two measures. */
function renderExamples() {
  for (const stop of stopHanging) stop();
  stopHanging = [];
  examples.replaceChildren();
  if (!state.langs.length || !state.family) {
    const p = document.createElement('p');
    p.textContent = state.family
      ? 'Pick a language to see its example.'
      : 'Load a font to see the examples set in it.';
    examples.append(p);
    return;
  }
  for (const lang of state.langs) {
    const figure = document.createElement('figure');
    const caption = document.createElement('figcaption');
    caption.textContent = `${PACK[lang].name}, set in ${state.label}`;
    figure.append(caption);
    const text = typographic(example('text', lang, 'long'), lang, {
      register: state.register,
      quoteStyle: state.quoteStyle,
    });
    for (const measure of ['narrow', 'wide'] as const) {
      const block = document.createElement('div');
      block.dataset.measure = measure;
      block.lang = lang;
      block.style.fontFamily = state.family;
      for (const paragraph of text.split(/\r?\n[ \t]*\r?\n/)) {
        if (!/\S/.test(paragraph)) continue;
        const p = document.createElement('p');
        p.textContent = paragraph;
        block.append(p);
      }
      figure.append(block);
      markHangs(block);
      stopHanging.push(hangPunctuation(block));
    }
    examples.append(figure);
  }
}

/** The canvas the preset is measured on; one for the page. */
let measuring: CanvasRenderingContext2D | null = null;
const context = () => {
  measuring ??= document.createElement('canvas').getContext('2d');
  return measuring;
};

const round8 = (value: number) => Math.max(8, Math.round(value / 8) * 8);

/**
 * A starting point for body text in this font, measured from the font: a size that gives the
 * x-height of a comfortable 16px text, a line height on the 8px grid, the width of 45 and 90
 * characters, and how far the language's opening quote mark should hang (a wide guillemet hangs less
 * than a thin ‘). The numbers are a starting point for a designer, not a rule of typography.
 */
function renderPreset() {
  preset.replaceChildren();
  const ctx = context();
  if (!state.family || !ctx) {
    const p = document.createElement('p');
    p.textContent = 'Load a font to see a preset measured from it.';
    preset.append(p);
    return;
  }
  const at = (size: number, text: string) => {
    ctx.font = `${size}px ${state.family}`;
    return ctx.measureText(text);
  };
  const EM = 100;
  const xHeight = at(EM, 'x').actualBoundingBoxAscent / EM;
  const average = at(EM, 'abcdefghijklmnopqrstuvwxyz').width / 26 / EM;
  // 16px of a font with an x-height of 0.52em is the text this site is set in; keep that x-height.
  const size = Math.min(22, Math.max(15, Math.round((16 * 0.52) / (xHeight || 0.52))));
  const line = round8(size * 1.55);
  const narrow = Math.round(45 * average * size);
  const wide = Math.round(90 * average * size);
  const mark = PACK[lang0()].quotes[0]?.[0] ?? '“';
  const markWidth = at(EM, mark).width / EM;
  const hang = Math.min(1, Math.max(0.3, Math.round((0.45 / (markWidth || 0.45)) * 10) / 10));
  const rows: [string, string][] = [
    ['Size', `${size}px (x-height ${xHeight.toFixed(2)}em)`],
    ['Line height', `${line}px (${(line / size).toFixed(2)}, on the 8px grid)`],
    ['Measure', `${narrow}px to ${wide}px — 45 to 90 characters at this size`],
    ['--hang-amount', `${hang} for ${mark} (width ${markWidth.toFixed(2)}em)`],
  ];
  const list = document.createElement('dl');
  for (const [name, value] of rows) {
    const dt = document.createElement('dt');
    dt.textContent = name;
    const dd = document.createElement('dd');
    dd.textContent = value;
    list.append(dt, dd);
  }
  preset.append(list);
  const css = document.createElement('pre');
  css.textContent = [
    ':root {',
    `  --font-text: ${state.label || 'your font'};`,
    `  --size-md: ${size}px;`,
    `  --line-md: ${line}px;`,
    `  --measure: ${wide}px;`,
    `  --hang-amount: ${hang};`,
    '}',
  ].join('\n');
  preset.append(css);
}

const lang0 = (): Lang => state.langs[0] ?? 'en';

function render() {
  const { avoid, perLang, letters } = missingFor();
  renderVerdict(perLang, letters);
  renderCoverage(perLang, letters);
  renderExamples();
  renderPreset();
  const config = {
    ...(state.langs.length === 1 ? { lang: lang0() } : {}),
    ...(state.register === 'literary' ? { register: state.register } : {}),
    ...(state.quoteStyle === 'us' ? { quoteStyle: state.quoteStyle } : {}),
    ...(avoid ? { avoid } : {}),
  };
  configText.value = JSON.stringify(config, null, 2);
  save();
}

configCopy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(configText.value);
    configCopy.textContent = 'Copied';
  } catch {
    configText.select();
    configCopy.textContent = 'Select and copy';
  }
  setTimeout(() => {
    configCopy.textContent = 'Copy';
  }, 1500);
});

render();
