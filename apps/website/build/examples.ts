import { diff, type Lang, type QuoteStyle, typographic } from '../../../src/core';

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

/** The figure for the landing page: one tab per language, all of them in the HTML. */
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
      <div><dt>Before</dt><dd lang="${example.lang}">${before}</dd></div>
      <div><dt>After <output>${changes} ${changes === 1 ? 'change' : 'changes'}</output></dt><dd lang="${example.lang}">${after}</dd></div>
    </dl>
  </div>
</div>`;
  }).join('\n');
  return `<figure data-examples>
${items}
<figcaption>Set by the engine when this page was built. Green is what it added, red is what it replaced; a boxed space is a no-break space.</figcaption>
</figure>`;
}
