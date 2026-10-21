import './style.css';
import {
  type Change,
  diff,
  type Lang,
  LANGS,
  PACKS,
  type QuoteStyle,
  type Register,
  REGISTERS,
  RULES,
  splitHangs,
} from '../../src/core';
import { hangPunctuation } from '../../src/dom';
import { typesetHtml } from '../../src/html';
import { typesetMarkdown } from '../../src/markdown';
import { typesetText } from '../../src/text';
import { example, exampleIn, type Mode, type Size } from './examples';
import { isOn, readSaved, reset, ruleBadge, setRule } from './rules-state';

type View = 'result' | 'changes' | 'preview';
type State = {
  mode: Mode;
  lang: Lang;
  register: Register;
  quoteStyle: QuoteStyle;
  nbsp: 'entity' | 'char';
  view: View;
  mark: boolean;
  /** Rules that are on by default and were switched off. */
  disable: string[];
  /** Rules that are off by default and were switched on. */
  enable: string[];
  input: string;
  /** The example in the input while it is unedited, so a new format or language swaps it. */
  example: Size | null;
};

const LANG_NAMES = Object.fromEntries(PACKS.map((pack) => [pack.code, pack.name])) as Record<
  Lang,
  string
>;

const STORAGE = 'typeset-playground';

function load(): State {
  const fallback: State = {
    mode: 'text',
    lang: 'en',
    register: 'display',
    quoteStyle: 'language',
    nbsp: 'entity',
    view: 'result',
    mark: false,
    ...reset(),
    input: example('text', 'en', 'long'),
    example: 'long',
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
      quoteStyle: saved.quoteStyle === 'us' ? 'us' : 'language',
      nbsp: saved.nbsp === 'char' ? 'char' : 'entity',
      view: saved.view === 'changes' || saved.view === 'preview' ? saved.view : 'result',
      mark: saved.mark === true,
      ...readSaved(saved, RULES),
      input: known ? example(mode, lang, known) : input,
      example: known,
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
const mark = el<HTMLInputElement>('mark');
const markField = el<HTMLLabelElement>('markField');
const copy = el<HTMLButtonElement>('copy');

for (const lang of LANGS) langSelect.add(new Option(LANG_NAMES[lang], lang));
for (const option of registerSelect.options) {
  if (!REGISTERS.includes(option.value as Register)) throw new Error('register list out of date');
}

const state = load();

const ruleList = el<HTMLDivElement>('ruleList');
const ruleCount = el<HTMLSpanElement>('ruleCount');
for (const rule of RULES) {
  const label = document.createElement('label');
  const box = document.createElement('input');
  box.type = 'checkbox';
  box.dataset.id = rule.id;
  const name = document.createElement('code');
  name.textContent = rule.id;
  const about = document.createElement('small');
  about.textContent = rule.defaultOn === false ? `${rule.about} (off by default)` : rule.about;
  label.append(box, name, about);
  ruleList.append(label);
  box.addEventListener('change', () => {
    Object.assign(state, setRule(state, rule, box.checked));
    schedule();
  });
}
el('rulesAll').addEventListener('click', () => {
  Object.assign(state, reset());
  schedule();
});

const escapeHtml = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const visible = (text: string) => text.replaceAll(' ', '⍽');

function convert(): { output: string; changes: Change[] } {
  const { lang, register, quoteStyle, disable, enable } = state;
  const changes: Change[] = [];
  const options = { lang, register, quoteStyle, disable, enable, onChange: (change: Change) => changes.push(change) };
  const output =
    state.mode === 'html'
      ? typesetHtml(state.input, { ...options, nbsp: state.nbsp })
      : state.mode === 'markdown'
        ? typesetMarkdown(state.input, options)
        : typesetText(state.input, options);
  return { output, changes };
}

let stopHanging: (() => void) | null = null;

function renderPreview(output: string) {
  stopHanging?.();
  stopHanging = null;
  preview.replaceChildren();
  if (state.mode === 'html') {
    const frame = document.createElement('iframe');
    // No scripts, no same-origin access: pasted HTML is shown, never run.
    frame.setAttribute('sandbox', '');
    frame.title = 'Preview of the HTML result';
    frame.srcdoc = `<!doctype html><meta charset="utf-8"><style>body{font:19px/1.55 Georgia,serif;max-width:34em;margin:1em;color:#1b1b1a}code,pre{font-size:.85em}</style>${output}`;
    preview.append(frame);
    return;
  }
  for (const block of output.split(/\r?\n[ \t]*\r?\n/)) {
    if (!/\S/.test(block)) continue;
    const p = document.createElement('p');
    for (const part of splitHangs(block, true)) {
      if (part.hang) {
        const span = document.createElement('span');
        span.dataset.hang = '';
        if (part.lead) span.style.marginLeft = '-0.5em';
        span.textContent = part.text;
        p.append(span);
      } else {
        p.append(part.text);
      }
    }
    preview.append(p);
  }
  stopHanging = hangPunctuation(preview);
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
  mark.checked = state.mark;
  nbspField.hidden = state.mode !== 'html';
  for (const box of ruleList.querySelectorAll<HTMLInputElement>('input')) {
    const rule = RULES.find((r) => r.id === box.dataset.id);
    if (rule) box.checked = isOn(state, rule);
  }
  ruleCount.textContent = ruleBadge(state);
  ruleCount.hidden = !ruleCount.textContent;
  if (input.value !== state.input) input.value = state.input;

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
  if (state.view === 'preview') renderPreview(output);
  else {
    stopHanging?.();
    stopHanging = null;
  }
  const untagged = state.mode === 'html' && /\S/.test(state.input) && !/<[a-z]/i.test(state.input);
  note.hidden = !(state.view === 'preview' && state.mode === 'html');
  note.textContent = untagged
    ? 'This text has no HTML tags, so the preview shows it as one run of text, the way a browser would. For plain text, pick Text.'
    : 'Opening punctuation hangs in the margin in the text and Markdown previews; the HTML preview does not show it.';
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
  state.quoteStyle = quoteStyleSelect.value === 'us' ? 'us' : 'language';
  schedule();
});
nbspSelect.addEventListener('change', () => {
  state.nbsp = nbspSelect.value === 'char' ? 'char' : 'entity';
  schedule();
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

render();
