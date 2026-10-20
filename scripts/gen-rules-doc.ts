/**
 * Writes docs/rules.md from RULES (ids, order, descriptions) and the examples below.
 * Every "after" line is produced by running the engine, with every rule except the
 * one being shown switched off, so an example shows that rule and nothing else.
 *
 *     bun scripts/gen-rules-doc.ts        (or: bun run docs:rules)
 *
 * Imports only from ../src and node:, so the package stays liftable.
 */
import { writeFileSync } from 'node:fs';
import { join } from 'node:path';
import { type Lang, NBSP, type Register, RULES, type Rule, typographic } from '../src';

export type Example = {
  input: string;
  lang?: Lang;
  register?: Register;
  blockStart?: boolean;
  /** One line about what the example shows. */
  note?: string;
};

/** The hand-written part: a few examples for every rule id. */
export const EXAMPLES: Record<string, readonly Example[]> = {
  quote: [
    { input: 'He said "stone" and left.', note: 'Display register, the default.' },
    {
      input: `He said "we said 'no' twice" and left.`,
      note: 'Nesting level two. Source marks may be straight, curly or guillemets.',
    },
    {
      input: `He said "we said 'no' twice" and left.`,
      register: 'literary',
      note: 'British English in the literary register.',
    },
    { input: `Er sagte "Sie rief 'Haus' laut" und ging.`, lang: 'de' },
  ],
  apostrophe: [
    { input: `It's Maria's turn, don't wait.`, note: 'Inside a word.' },
    { input: `The '90s were loud.`, note: 'Before a year.' },
  ],
  ellipsis: [{ input: 'Wait... what?' }],
  'space.before-punctuation': [
    { input: 'Hello , world . Is it ready ? (yes )', note: 'Off by default.' },
    { input: 'Oui : non , bon !', lang: 'fr', note: 'French keeps its space before : ; ! ?, the rest is tidied.' },
  ],
  'space.after-comma': [
    { input: 'apples,pears,plums', note: 'Digits are left alone: 1,5 stays.' },
    { input: 'Hallo,Welt und 3,14' , lang: 'de' },
  ],
  'punctuation.double': [
    { input: 'Wow!!! Really??' },
    { input: 'What?!! No!!!? Stop!!!', note: '?! and !? stay as a pair; a run beside one collapses.' },
  ],
  arrow: [{ input: 'Read more ->' }, { input: '<- Back' }],
  'symbol.legal': [
    { input: '(c) 2026 Studio (R) (TM)', note: '(c) needs a year after it; (C) does not.' },
  ],
  'dash.dialogue': [
    {
      input: '- Привіт, - сказав він.',
      lang: 'uk',
      register: 'literary',
      note: 'Only the dash that opens the paragraph; the second one belongs to dash.sentence.',
    },
  ],
  'dash.range': [
    { input: 'Open 21-26 September, 10:00-12:00.' },
    { input: 'Pages 5 - 9', note: 'Spaced, too.' },
  ],
  'dash.sentence': [
    { input: 'Wait - what happened -- really?', note: 'An em dash in English.' },
    { input: 'Warte - was ist passiert?', lang: 'de', note: 'A spaced en dash in German.' },
    {
      input: 'Wait - what happened?',
      register: 'literary',
      note: 'A spaced en dash in British English, literary register.',
    },
  ],
  'symbol.minus': [{ input: 'It was -5 degrees (-3 inside).' }],
  'symbol.multiply': [{ input: 'A 1920x1080 screen, a 3 x 4 grid.' }],
  'space.collapse': [{ input: 'Two   spaces,    four.' }],
  'space.title': [{ input: 'Prof. Dr. Oksana opens.' }],
  'space.initial': [{ input: 'Written by K. Słoboda.' }],
  'space.abbreviation': [
    { input: 'z. B. Nr. 5 auf S. 12', lang: 'de' },
    { input: 'вул. Хрещатик, т. д.', lang: 'uk' },
    { input: 'See Fig. 2 and p. 14.', lang: 'en' },
  ],
  'space.number': [{ input: 'On 21 September, 15 people paid 5 %.' }],
  'space.percent': [
    { input: '5% and 49€', lang: 'de', note: 'The rule does nothing in other languages.' },
    { input: '5% and 49€', lang: 'fr' },
  ],
  'space.association': [{ input: 'Kulturverein e.V.', lang: 'de' }],
  'space.copyright': [{ input: '© 2026 Studio' }],
  'space.orphan': [
    { input: 'A cat and I', lang: 'en' },
    { input: 'Він і я в домі', lang: 'uk' },
    { input: 'Idę w las i z nim', lang: 'pl' },
  ],
  'space.arrow': [{ input: 'Read more →' }, { input: '← Back' }],
  'space.trailing': [
    { input: 'First line   \nSecond line\t\nThird', note: 'Spaces and tabs at the end of a line; the lines stay.' },
    { input: 'One trailing space ' },
  ],
};

const show = (text: string): string => text.replaceAll(NBSP, '~');

/** The engine's output with only `id` switched on (a rule that is off by default is enabled). */
export function runOnly(id: string, example: Example, rules: readonly Rule[] = RULES): string {
  return typographic(example.input, example.lang ?? 'en', {
    register: example.register ?? 'display',
    blockStart: example.blockStart ?? true,
    rules,
    disable: rules.map((rule) => rule.id).filter((other) => other !== id),
    enable: rules.find((rule) => rule.id === id)?.defaultOn === false ? [id] : [],
  });
}

function setting(example: Example): string {
  const parts: string[] = [example.lang ?? 'en'];
  if (example.register) parts.push(example.register);
  if (example.blockStart === false) parts.push('not at block start');
  return parts.join(', ');
}

export function render(rules: readonly Rule[] = RULES): string {
  const optIn = rules.filter((rule) => rule.defaultOn === false).length;
  const count =
    optIn === 0
      ? `${rules.length} rules`
      : `${rules.length} rules, ${rules.length - optIn} on by default (the rest are off until named in \`enable\`)`;
  const out: string[] = [
    '# Rules',
    '',
    `The engine has ${count}. \`typographic\` runs them in the order below, each on the output of the one before. An id can be switched off with \`disable\` (see [api.md](api.md)); a group name switches off every rule that starts with it (\`space\` is every \`space.*\` rule, \`dash\` every \`dash.*\`, \`symbol\` every \`symbol.*\`).`,
    '',
    'This file is generated by `bun run docs:rules` from `RULES` in `src/core/rules.ts` and from the examples in `scripts/gen-rules-doc.ts`. Do not edit it by hand: `src/docs.test.ts` fails when it is out of date.',
    '',
    'Each example runs the engine with every rule except the one shown switched off, so it shows what that rule does and nothing else. In a full run the other rules also act (an English `"` is turned into a quote by `quote` before anything else sees it). The text of each example is plain; a no-break space is shown as `~` (the character U+00A0 in the real output; an ordinary space stays a space). Text in a code span, a web address and an email are never changed by any rule.',
    '',
    '## Order',
    '',
    ...rules.map(
      (rule, i) => `${i + 1}. \`${rule.id}\`${rule.defaultOn === false ? ' (off by default)' : ''}`,
    ),
  ];
  for (const rule of rules) {
    out.push('', `## \`${rule.id}\``, '', rule.about, '');
    if (rule.defaultOn === false) {
      out.push('Off by default: switch it on with `enable` (`--enable` on the command line).', '');
    }
    for (const example of EXAMPLES[rule.id] ?? []) {
      out.push(
        '```text',
        `(${setting(example)})`,
        `before  ${show(example.input)}`,
        `after   ${show(runOnly(rule.id, example, rules))}`,
        '```',
        '',
      );
      if (example.note) out.push(example.note, '');
    }
    out.pop();
  }
  return `${out.join('\n')}\n`;
}

if (import.meta.main) {
  writeFileSync(join(import.meta.dir, '..', 'docs', 'rules.md'), render());
}
