import { diff, type Lang, type QuoteStyle, RULES, typographic } from '../../../src/core';

type Example = { lang: Lang; label: string; note: string; input: string; quoteStyle?: QuoteStyle };

/** The landing page's results: real input, set by the engine when the site is built. */
export const EXAMPLES: Example[] = [
  {
    lang: 'en',
    label: 'English',
    note: 'Curly quotes and apostrophes, a spaced dash, a real ellipsis, an en dash in ranges, and a number kept with its month.',
    quoteStyle: 'us',
    input: `"It's five o'clock," she said - "and we're late..." The workshop runs 21-26 September, 10:00-12:00, in room 4B.`,
  },
  {
    lang: 'uk',
    label: 'Українська',
    note: 'Ukrainian guillemets, the dialogue dash with its no-break space, and initials kept with the surname.',
    input: `- Зачекаємо? - спитав професор К. Новак. - Сказали: "вже п'ята година"... Квитки зі знижкою 15%.`,
  },
  {
    lang: 'de',
    label: 'Deutsch',
    note: 'German marks, nested the German way, and a range that is a range.',
    input: `Sie sagte: "Er rief 'Halt' - und blieb stehen" ... Seiten 12-14, ca. 20 Min. am Tag.`,
  },
  {
    lang: 'pl',
    label: 'Polski',
    note: 'Polish low-and-high quotes, and one-letter words held to the next word so no line ends on them.',
    input: `Powiedział: "Idę do domu" - i poszedł. W sali nr 5 jest 20 osób, a w drugiej a w trzeciej 12.`,
  },
];

const NBSP = ' ';
const esc = (text: string): string =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** A run of changed text: a no-break space alone is drawn as a marker, since it looks like a gap. */
const mark = (tag: 'ins' | 'del', text: string): string =>
  text === NBSP
    ? `<${tag} data-nbsp>${NBSP}</${tag}>`
    : `<${tag}>${esc(text).replaceAll(NBSP, `</${tag}><${tag} data-nbsp>${NBSP}</${tag}><${tag}>`)}</${tag}>`;

export function exampleResult(example: Example): {
  before: string;
  after: string;
  changes: number;
} {
  const options = example.quoteStyle ? { quoteStyle: example.quoteStyle } : {};
  const output = typographic(example.input, example.lang, options);
  const runs = diff(example.input, output);
  let before = '';
  let after = '';
  let changes = 0;
  for (const run of runs) {
    if (run.kind === 'same') {
      before += esc(run.text);
      after += esc(run.text);
    } else {
      changes++;
      if (run.kind === 'del') before += mark('del', run.text);
      else after += mark('ins', run.text);
    }
  }
  return { before, after, changes };
}

/**
 * The figure for the landing page: one tab per language, all of them in the HTML. Each output is in
 * `samp`, which the build's own typesetting (English) leaves alone, so it keeps its language's marks.
 */
export function examplesFigure(): string {
  const items = EXAMPLES.map((example, i) => {
    const { before, after, changes } = exampleResult(example);
    const id = `example-${example.lang}`;
    return `<div data-example>
  <input type="radio" name="example" id="${id}" value="${example.lang}"${i === 0 ? ' checked' : ''} />
  <label for="${id}">${example.label}</label>
  <div data-pane>
    <p data-note>${example.note}</p>
    <dl>
      <div><dt>Before</dt><dd lang="${example.lang}"><code data-raw>${before}</code></dd></div>
      <div><dt>After <output>${changes} ${changes === 1 ? 'change' : 'changes'}</output></dt><dd lang="${example.lang}"><samp>${after}</samp></dd></div>
    </dl>
  </div>
</div>`;
  }).join('\n');
  return `<figure data-examples>
${items}
<figcaption>Set by the engine when this page was built. Marked: what the engine replaced, and what it put in its place; a boxed space is a no-break space.</figcaption>
</figure>`;
}

/** A real paragraph (Carroll, 1865, public domain), as an e-text would have it: straight quotes and a hyphen for a dash. */
export const SPECIMEN = `"Curiouser and curiouser!" cried Alice (she was so much surprised, that for the moment she quite forgot how to speak good English); "now I'm opening out like the largest telescope that ever was! Good-bye, feet!" - for when she looked down at her feet, they seemed to be almost out of sight...`;

/**
 * The converter in the hero: the specimen in an editable box, and the engine's result under it with
 * every change marked. Set here at build time, so the page shows it before any script runs; main.ts
 * makes it live (it sets the text again as you type or pick a language).
 */
export function specimenFigure(): string {
  const output = typographic(SPECIMEN, 'en', { quoteStyle: 'us' });
  let after = '';
  for (const run of diff(SPECIMEN, output)) {
    if (run.kind === 'same') after += esc(run.text);
    else if (run.kind === 'ins') after += mark('ins', run.text);
  }
  return `<figure data-specimen>
  <div data-specimen-input>
    <label for="hero-in">Your text</label>
    <select id="hero-lang" aria-label="Language"><option value="en" selected>English</option></select>
    <textarea id="hero-in" spellcheck="false" rows="5">${esc(SPECIMEN)}</textarea>
  </div>
  <div id="hero-out" data-hanging data-after role="region" aria-label="Typeset" aria-live="polite"><p>${after}</p></div>
  <form data-specimen-options>
    <label><input type="checkbox" name="marks" checked /> Mark what changed</label>
    <label><input type="checkbox" name="hang" checked /> Hang the punctuation</label>
  </form>
  <figcaption>From <cite>Alice's Adventures in Wonderland</cite>. Edit it, or paste your own.</figcaption>
</figure>`;
}

type Sample = {
  rule: string;
  lang: Lang;
  input: string;
  options?: { enable?: string[]; quoteStyle?: QuoteStyle };
};

/** One row per rule worth showing: what you write, and what you get, from the engine. */
export const SAMPLES: Sample[] = [
  { rule: 'quote', lang: 'en', input: '"Hello"', options: { quoteStyle: 'us' } },
  { rule: 'apostrophe', lang: 'en', input: "don't" },
  { rule: 'ellipsis', lang: 'en', input: 'Wait...' },
  { rule: 'dash.range', lang: 'en', input: 'pages 21-26' },
  { rule: 'dash.sentence', lang: 'en', input: 'Wait - what?' },
  { rule: 'dash.dialogue', lang: 'uk', input: '- Привіт, - сказала вона.' },
  { rule: 'space.number', lang: 'en', input: '10 km' },
  { rule: 'space.number', lang: 'en', input: 'USD 5 000' },
  { rule: 'space.section', lang: 'en', input: '§ 5' },
  { rule: 'space.operator', lang: 'en', input: 'Tom & Jerry' },
  { rule: 'space.initial', lang: 'en', input: 'T. H. Shevchenko' },
  { rule: 'space.orphan', lang: 'pl', input: 'Jadę z Anią w góry' },
  { rule: 'symbol.legal', lang: 'en', input: '(c) 2026' },
  { rule: 'symbol.multiply', lang: 'en', input: '1920x1080' },
  { rule: 'symbol.minus', lang: 'en', input: '-5 C' },
  { rule: 'number.group', lang: 'en', input: '1000000', options: { enable: ['number.group'] } },
  {
    rule: 'phone.bind',
    lang: 'en',
    input: '+380 44 123 45 67',
    options: { enable: ['phone.bind'] },
  },
  {
    rule: 'space.short-word',
    lang: 'en',
    input: 'Welcome to the city',
    options: { enable: ['space.short-word'] },
  },
];

export function sampleResult(sample: Sample): { changed: boolean; html: string } {
  const output = typographic(sample.input, sample.lang, sample.options ?? {});
  let html = '';
  for (const run of diff(sample.input, output)) {
    if (run.kind === 'same') html += esc(run.text);
    else if (run.kind === 'ins') html += mark('ins', run.text);
  }
  return { changed: output !== sample.input, html };
}

export function samplesTable(): string {
  const rows = SAMPLES.map((sample) => {
    const { html } = sampleResult(sample);
    const off = RULES.find((rule) => rule.id === sample.rule)?.defaultOn === false;
    return `<tr>
  <th scope="row"><code>${sample.rule}</code>${off ? ' <small>opt-in</small>' : ''}</th>
  <td lang="${sample.lang}"><code data-raw>${esc(sample.input)}</code></td>
  <td lang="${sample.lang}"><samp>${html}</samp></td>
</tr>`;
  }).join('\n');
  return `<div data-scroll tabindex="0" role="region" aria-label="Rules with examples">
<table data-samples>
<thead><tr><th scope="col">Rule</th><th scope="col">You write</th><th scope="col">You get</th></tr></thead>
<tbody>
${rows}
</tbody>
</table>
</div>`;
}
