import {
  type Change,
  diff,
  LANGS,
  type Lang,
  NBSP,
  PACKS,
  type QuoteStyle,
  REGISTERS,
  type Register,
  RULES,
  type Rule,
  ruleGlyphs,
} from '../../src/core';
import { hangPunctuation, markHangs } from '../../src/dom';
import { typesetHtml } from '../../src/html';
import { typesetMarkdown } from '../../src/markdown';
import { typesetText } from '../../src/text';
import { configText, fromConfig, quoteStyleOf } from './config-io';
import { example, exampleIn, type Mode, type Size } from './examples';
import {
  allOn,
  groupRules,
  isOn,
  type RuleGroup,
  readSaved,
  ruleBadge,
  setRule,
} from './rules-state';

type View = 'result' | 'changes' | 'preview';
/** The amounts the hanging slider stops at; its value is the index. */
const HANG_STOPS: readonly number[] = [0, 0.3, 0.5, 1];
/** The named amounts an earlier version saved, read as their share. */
const NAMED_HANGS: Record<string, number> = { off: 0, light: 0.3, medium: 0.5, full: 1 };
/** The stop nearest to an amount. */
const stopOf = (amount: number): number =>
  HANG_STOPS.reduce(
    (best, stop, i) =>
      Math.abs(stop - amount) < Math.abs((HANG_STOPS[best] ?? 1) - amount) ? i : best,
    0,
  );
type State = {
  mode: Mode;
  lang: Lang;
  register: Register;
  quoteStyle: QuoteStyle;
  nbsp: 'entity' | 'char';
  /** Characters the font cannot draw (`avoid`): a rule that would insert one leaves the text as typed. */
  avoid: string;
  view: View;
  mark: boolean;
  /** How far an opening mark hangs in the preview, from 0 to 1, as `--hang-amount`. */
  hang: number;
  /** Rules that are on by default and were switched off. */
  disable: string[];
  /** Rules that are off by default and were switched on. */
  enable: string[];
  input: string;
  /** The example in the input while it is unedited, so a new format or language swaps it. */
  example: Size | null;
  /** 2 since the playground starts with every rule on; state saved before it starts that way too. */
  rulesVersion?: number;
};

const LANG_NAMES = Object.fromEntries(PACKS.map((pack) => [pack.code, pack.name])) as Record<
  Lang,
  string
>;

const STORAGE = 'typeset-playground';

function readHang(value: unknown): number {
  const amount =
    typeof value === 'number' ? value : typeof value === 'string' ? (NAMED_HANGS[value] ?? 1) : 1;
  return HANG_STOPS[stopOf(amount)] ?? 1;
}

function load(): State {
  const fallback: State = {
    mode: 'text',
    lang: 'en',
    register: 'display',
    quoteStyle: 'language',
    nbsp: 'entity',
    avoid: '',
    view: 'result',
    mark: false,
    hang: 1,
    ...allOn(RULES),
    input: example('text', 'en', 'long'),
    example: 'long',
    rulesVersion: 2,
  };
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE) ?? 'null') as Partial<State> | null;
    if (!saved) return fallback;
    const mode: Mode = saved.mode === 'html' || saved.mode === 'markdown' ? saved.mode : 'text';
    const lang = LANGS.includes(saved.lang as Lang) ? (saved.lang as Lang) : 'en';
    const input = typeof saved.input === 'string' ? saved.input : fallback.input;
    // State saved before the example was remembered has no `example`: an example still in the input
    // is recognised and set again, so it is the current one and follows the format.
    const known =
      saved.example === 'short' || saved.example === 'long'
        ? saved.example
        : saved.example === undefined
          ? exampleIn(input, lang)
          : null;
    return {
      mode,
      lang,
      register: saved.register === 'literary' ? 'literary' : 'display',
      quoteStyle: quoteStyleOf(saved.quoteStyle),
      nbsp: saved.nbsp === 'char' ? 'char' : 'entity',
      avoid: typeof saved.avoid === 'string' ? saved.avoid : '',
      view: saved.view === 'changes' || saved.view === 'preview' ? saved.view : 'result',
      mark: saved.mark === true,
      hang: readHang(saved.hang),
      ...(saved.rulesVersion === 2 ? readSaved(saved, RULES) : allOn(RULES)),
      input: known ? example(mode, lang, known) : input,
      example: known,
      rulesVersion: 2,
    };
  } catch {
    return fallback;
  }
}

function save(state: State) {
  try {
    localStorage.setItem(STORAGE, JSON.stringify(state));
  } catch {
    // Private windows and blocked storage: the page works without it.
  }
}

function el<T extends HTMLElement>(id: string): T {
  const found = document.getElementById(id);
  if (!found) throw new Error(`#${id} is missing`);
  return found as T;
}

const input = el<HTMLTextAreaElement>('input');
const result = el<HTMLTextAreaElement>('result');
const changes = el<HTMLDivElement>('changes');
const preview = el<HTMLDivElement>('preview');
const note = el<HTMLParagraphElement>('note');
const count = el<HTMLSpanElement>('count');
const langSelect = el<HTMLSelectElement>('lang');
const registerSelect = el<HTMLSelectElement>('register');
const quoteStyleSelect = el<HTMLSelectElement>('quoteStyle');
const nbspSelect = el<HTMLSelectElement>('nbsp');
const nbspField = el<HTMLLabelElement>('nbspField');
const avoidInput = el<HTMLInputElement>('avoid');
const mark = el<HTMLInputElement>('mark');
const hangInput = el<HTMLInputElement>('hang');
const hangValue = el<HTMLOutputElement>('hangValue');
const hangField = el<HTMLLabelElement>('hangField');
const markField = el<HTMLLabelElement>('markField');
const copy = el<HTMLButtonElement>('copy');
/** The config box. Optional: on a page without `#configPanel` the playground runs without it. */
const config = document.getElementById('configPanel')
  ? {
      area: el<HTMLTextAreaElement>('configText'),
      error: el<HTMLParagraphElement>('configError'),
      copy: el<HTMLButtonElement>('configCopy'),
    }
  : null;
/** Whether the config box holds pasted text; until then it follows the switches. */
let configEdited = false;
/** Only on the website's playground. */
const report = document.getElementById('report') as HTMLAnchorElement | null;

for (const lang of LANGS) langSelect.add(new Option(LANG_NAMES[lang], lang));
for (const option of registerSelect.options) {
  if (!REGISTERS.includes(option.value as Register)) throw new Error('register list out of date');
}

const state = load();

const ruleList = el<HTMLDivElement>('ruleList');
const ruleCount = el<HTMLSpanElement>('ruleCount');
const CATEGORY_NAMES: Record<RuleGroup['category'], string> = {
  tradition: 'Tradition: quotes, dashes, punctuation, spaces',
  symbols: 'Symbols: arrows, ©, ®, ™',
  math: 'Math: minus, ×, ±, fractions',
  data: 'Data: numbers, ranges, units, currencies, dates',
  other: 'Other',
};
for (const group of groupRules(RULES)) {
  const set = document.createElement('fieldset');
  set.dataset.category = group.category;
  const legend = document.createElement('legend');
  legend.textContent = CATEGORY_NAMES[group.category];
  set.append(legend);
  ruleList.append(set);
  for (const rule of group.rules) addRuleBox(set, rule);
}
function addRuleBox(set: HTMLFieldSetElement, rule: Rule) {
  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.dataset.id = rule.id;
  const name = document.createElement('code');
  name.textContent = rule.id;
  const about = document.createElement('small');
  about.textContent = rule.defaultOn === false ? `${rule.about} (off by default)` : rule.about;
  label.append(box, name, about);
  // What the rule can put into the text, filled in by render() for the language in use: a reader
  // sees which characters a flag needs, and whether `avoid` is keeping them out.
  const glyphs = document.createElement('small');
  glyphs.dataset.glyphsFor = rule.id;
  label.append(glyphs);
  set.append(label);
  box.addEventListener('change', () => {
    Object.assign(state, setRule(state, rule, box.checked));
    schedule();
  });
}
el('rulesAll').addEventListener('click', () => {
  Object.assign(state, allOn(RULES));
  schedule();
});

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const visible = (text: string) => text.replaceAll(' ', '⍽');

function convert(): { output: string; changes: Change[] } {
  const { lang, register, quoteStyle, disable, enable, avoid } = state;
  const changes: Change[] = [];
  const options = {
    lang,
    register,
    quoteStyle,
    disable,
    enable,
    avoid,
    onChange: (change: Change) => changes.push(change),
  };
  const output =
    state.mode === 'html'
      ? typesetHtml(state.input, { ...options, nbsp: state.nbsp })
      : state.mode === 'markdown'
        ? typesetMarkdown(state.input, options)
        : typesetText(state.input, options);
  return { output, changes };
}

let stopHanging: (() => void) | null = null;
/** The element the hanging pass runs on: the preview, or the body of the HTML preview frame. */
let hangRoot: HTMLElement | null = null;

/** The amount beside the slider, also read out for it (its own value is the index of a stop). */
function showHang() {
  const text = `${Math.round(state.hang * 100)}%`;
  hangValue.value = text;
  hangInput.setAttribute('aria-valuetext', text);
}

/** Sets the amount on the preview and hangs its marks again, without rebuilding it. */
function applyHang() {
  stopHanging?.();
  stopHanging = null;
  if (!hangRoot) return;
  hangRoot.style.setProperty('--hang-amount', String(state.hang));
  stopHanging = hangPunctuation(hangRoot);
}

function renderPreview(output: string) {
  stopHanging?.();
  stopHanging = null;
  hangRoot = null;
  preview.replaceChildren();
  if (state.mode === 'html') {
    const frame = document.createElement('iframe');
    // No scripts run inside: pasted HTML is shown, never run. Same origin only so this page can
    // mark and measure the opening punctuation in it.
    frame.setAttribute('sandbox', 'allow-same-origin');
    frame.title = 'Preview of the HTML result';
    frame.addEventListener('load', () => {
      const body = frame.contentDocument?.body;
      if (!body) return;
      markHangs(body);
      hangRoot = body;
      applyHang();
    });
    frame.srcdoc = `<!doctype html><meta charset="utf-8"><style>body{font:19px/1.55 Georgia,serif;max-width:34em;margin:0;padding:1rem 1.25rem 1rem 2rem;color:#1b1b1a}body>:first-child{margin-top:0}code,pre{font-size:.85em}</style>${output}`;
    preview.append(frame);
    return;
  }
  for (const block of output.split(/\r?\n[ \t]*\r?\n/)) {
    if (!/\S/.test(block)) continue;
    const p = document.createElement('p');
    p.textContent = block;
    preview.append(p);
  }
  markHangs(preview);
  hangRoot = preview;
  applyHang();
}

function groups(runs: ReturnType<typeof diff>): number {
  let n = 0;
  let inside = false;
  for (const run of runs) {
    if (run.kind === 'same') inside = false;
    else if (!inside) {
      inside = true;
      n++;
    }
  }
  return n;
}

/** The longest input a report carries: a GitHub link must stay under about 8 000 characters. */
const REPORT_LIMIT = 1500;
/** A fenced block that holds `text` whatever backticks are in it. */
const fenced = (text: string): string => {
  const fence = '`'.repeat(Math.max(3, ...(text.match(/`+/g) ?? []).map((run) => run.length + 1)));
  return `${fence}\n${text}\n${fence}`;
};
/**
 * A link that opens a GitHub issue with the text, the settings and the result filled in, on a page
 * that has one (`#report`, its `href` the new-issue address; the website's playground).
 */
function reportUrl(base: string, output: string): string {
  const cut = (text: string) =>
    text.length > REPORT_LIMIT ? `${text.slice(0, REPORT_LIMIT)}\n… (cut)` : text;
  const settings = [
    `Language: ${state.lang} (${LANG_NAMES[state.lang]})`,
    `Format: ${state.mode}`,
    `Register: ${state.register}`,
    `Quote style: ${state.quoteStyle}`,
    state.disable.length ? `Switched off: ${state.disable.join(', ')}` : '',
    state.enable.length ? `Switched on: ${state.enable.join(', ')}` : '',
  ].filter(Boolean);
  const body = [
    settings.map((line) => `- ${line}`).join('\n'),
    `**Text**\n\n${fenced(cut(state.input))}`,
    `**Result**\n\n${fenced(cut(output))}`,
    '**What it should be**\n\n',
  ].join('\n\n');
  const title = `Playground (${state.lang}): `;
  return `${base.split('?')[0]}?${new URLSearchParams({ title, body })}`;
}

function render() {
  for (const radio of document.querySelectorAll<HTMLInputElement>('#mode input')) {
    radio.checked = radio.value === state.mode;
  }
  for (const tab of document.querySelectorAll<HTMLButtonElement>('[role="tab"]')) {
    tab.setAttribute('aria-selected', String(tab.dataset.view === state.view));
  }
  langSelect.value = state.lang;
  registerSelect.value = state.register;
  quoteStyleSelect.value = state.quoteStyle;
  nbspSelect.value = state.nbsp;
  if (avoidInput.value !== state.avoid) avoidInput.value = state.avoid;
  mark.checked = state.mark;
  hangInput.value = String(stopOf(state.hang));
  showHang();
  nbspField.hidden = state.mode !== 'html';
  for (const box of ruleList.querySelectorAll<HTMLInputElement>('input')) {
    const rule = RULES.find((r) => r.id === box.dataset.id);
    if (rule) box.checked = isOn(state, rule);
  }
  // The characters each rule can insert, in the language in use; a rule whose characters the font
  // cannot draw is marked, because its changes are kept out of the text.
  const glyphsOf = ruleGlyphs(state.lang);
  for (const small of ruleList.querySelectorAll<HTMLElement>('[data-glyphs-for]')) {
    const inserts = glyphsOf[small.dataset.glyphsFor ?? ''] ?? '';
    small.textContent = inserts
      ? `Inserts ${[...inserts].map((ch) => (ch === NBSP ? '~' : ch)).join(' ')}`
      : '';
    small.hidden = !inserts;
    const avoided = [...state.avoid].some((ch) => inserts.includes(ch));
    if (avoided) small.setAttribute('data-avoided', '');
    else small.removeAttribute('data-avoided');
  }
  ruleCount.textContent = ruleBadge(state);
  ruleCount.hidden = !ruleCount.textContent;
  if (input.value !== state.input) input.value = state.input;
  if (config && !configEdited) config.area.value = configText(state);

  const { output, changes: made } = convert();
  const runs = diff(state.input, output);
  count.textContent = String(groups(runs));

  result.value = state.mark ? visible(output) : output;
  const inline = runs
    .map((run) => {
      const text = escapeHtml(visible(run.text));
      return run.kind === 'ins'
        ? `<ins>${text}</ins>`
        : run.kind === 'del'
          ? `<del>${text}</del>`
          : text;
    })
    .join('');
  const used = RULES.flatMap((rule) => {
    const own = made.filter((c) => c.rule === rule.id);
    if (!own.length) return [];
    const examples = [
      ...new Set(own.map((c) => `${visible(c.from) || '∅'} → ${visible(c.to) || '∅'}`)),
    ]
      .slice(0, 3)
      .map((e) => escapeHtml(e))
      .join('; ');
    return [`<dt><code>${rule.id}</code></dt><dd>×${own.length} <small>${examples}</small></dd>`];
  });
  changes.innerHTML = `<p>${inline}</p>${used.length ? `<dl>${used.join('')}</dl>` : ''}`;
  result.hidden = state.view !== 'result';
  changes.hidden = state.view !== 'changes';
  preview.hidden = state.view !== 'preview';
  markField.hidden = state.view !== 'result';
  hangField.hidden = state.view !== 'preview';
  if (state.view === 'preview') renderPreview(output);
  else {
    stopHanging?.();
    stopHanging = null;
  }
  if (report) report.href = reportUrl(report.href, output);
  const untagged = state.mode === 'html' && /\S/.test(state.input) && !/<[a-z]/i.test(state.input);
  note.hidden = !(state.view === 'preview' && untagged);
  note.textContent =
    'This text has no HTML tags, so the preview shows it as one run of text, the way a browser would. For plain text, pick Text.';
  save(state);
}

let frame = 0;
const schedule = () => {
  cancelAnimationFrame(frame);
  frame = requestAnimationFrame(render);
};

/** An unedited example follows the format and the language. */
function swapExample() {
  if (state.example) state.input = example(state.mode, state.lang, state.example);
}

input.addEventListener('input', () => {
  state.input = input.value;
  state.example = null;
  schedule();
});
for (const radio of document.querySelectorAll<HTMLInputElement>('#mode input')) {
  radio.addEventListener('change', () => {
    state.mode = radio.value as Mode;
    swapExample();
    schedule();
  });
}
for (const tab of document.querySelectorAll<HTMLButtonElement>('[role="tab"]')) {
  tab.addEventListener('click', () => {
    state.view = tab.dataset.view as View;
    schedule();
  });
}
langSelect.addEventListener('change', () => {
  state.lang = langSelect.value as Lang;
  swapExample();
  schedule();
});
registerSelect.addEventListener('change', () => {
  state.register = registerSelect.value as Register;
  schedule();
});
quoteStyleSelect.addEventListener('change', () => {
  state.quoteStyle = quoteStyleOf(quoteStyleSelect.value);
  schedule();
});
nbspSelect.addEventListener('change', () => {
  state.nbsp = nbspSelect.value === 'char' ? 'char' : 'entity';
  schedule();
});
avoidInput.addEventListener('input', () => {
  state.avoid = avoidInput.value;
  schedule();
});
// Live while dragging: only the hanging pass runs again, the preview is not rebuilt.
hangInput.addEventListener('input', () => {
  state.hang = HANG_STOPS[Number(hangInput.value)] ?? 1;
  showHang();
  applyHang();
  save(state);
});
mark.addEventListener('change', () => {
  state.mark = mark.checked;
  schedule();
});
for (const button of document.querySelectorAll<HTMLButtonElement>('[data-size]')) {
  button.addEventListener('click', () => {
    state.example = button.dataset.size as Size;
    swapExample();
    schedule();
  });
}
el('clear').addEventListener('click', () => {
  state.input = '';
  state.example = null;
  schedule();
  input.focus();
});
copy.addEventListener('click', async () => {
  try {
    await navigator.clipboard.writeText(convert().output);
    copy.textContent = 'Copied';
  } catch {
    // Without clipboard access, select the text so it can be copied by hand.
    state.view = 'result';
    render();
    result.select();
    copy.textContent = 'Select and copy';
  }
  setTimeout(() => {
    copy.textContent = 'Copy';
  }, 1500);
});

if (config) {
  const { area: configArea, error: configError, copy: configCopy } = config;
  configArea.addEventListener('input', () => {
    configEdited = true;
  });
  el('configExport').addEventListener('click', () => {
    configEdited = false;
    configError.hidden = true;
    configArea.value = configText(state);
  });
  el('configImport').addEventListener('click', () => {
    try {
      const switches = fromConfig(configArea.value);
      Object.assign(state, switches, { hang: readHang(switches.hang) });
      swapExample();
      configEdited = false;
      configError.hidden = true;
      schedule();
    } catch (error) {
      configError.textContent = error instanceof Error ? error.message : String(error);
      configError.hidden = false;
    }
  });
  configCopy.addEventListener('click', async () => {
    try {
      await navigator.clipboard.writeText(configArea.value);
      configCopy.textContent = 'Copied';
    } catch {
      configArea.select();
      configCopy.textContent = 'Select and copy';
    }
    setTimeout(() => {
      configCopy.textContent = 'Copy';
    }, 1500);
  });
}

render();
