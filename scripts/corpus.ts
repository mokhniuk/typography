/**
 * The shared, deterministic corpus for checking that a change to the engine changes no output
 * (see `compare-engines.ts`, `update-snapshot.ts`, `src/snapshot.test.ts`).
 *
 * It has its own seeded generator and uses no `Math.random`, so the same `(n, seed)` gives the same
 * strings on every machine and Bun version. Pieces: the fuzz vocabulary of `src/properties.test.ts`
 * widened, realistic prose per language, and adversarial quote soups.
 */
import { createHash } from 'node:crypto';
import { pathToFileURL } from 'node:url';
import { PACKS } from '../src/core/lang';

export type Engine = {
  core: typeof import('../src/core');
  text: typeof import('../src/text');
  html: typeof import('../src/html');
  markdown: typeof import('../src/markdown');
  rehype: typeof import('../src/rehype');
};

/** Loads the engine from a `src/` directory (the repository's, or an extracted copy of another ref). */
export async function loadEngine(srcDir: string): Promise<Engine> {
  const load = (name: string) => import(pathToFileURL(`${srcDir}/${name}/index.ts`).href);
  const [core, text, html, markdown, rehype] = await Promise.all(
    ['core', 'text', 'html', 'markdown', 'rehype'].map(load),
  );
  return { core, text, html, markdown, rehype };
}

/** A small linear congruential generator; the constants are fixed here so nothing depends on the runtime. */
export function lcg(seed: number): () => number {
  let state = seed >>> 0;
  return () => {
    state = (Math.imul(state, 1664525) + 1013904223) >>> 0;
    return state / 2 ** 32;
  };
}

const PIECES = [
  // letters, words, one-letter words
  'a',
  'I',
  'z',
  'x',
  'X',
  'o',
  'u',
  'w',
  'i',
  'k',
  'y',
  'e',
  'à',
  'ç',
  'word',
  'stone',
  'memory',
  'l',
  'd',
  'qu',
  'dell',
  'jo',
  'nas',
  // titles, initials, abbreviations
  'Prof.',
  'Dr.',
  'Mr.',
  'Mrs.',
  'K.',
  'J. R. R.',
  'z. B.',
  'd. h.',
  'Nr.',
  'Abb.',
  'S.',
  'ul.',
  'e.V.',
  'p.',
  'No.',
  'Fig.',
  'etc.',
  'tj.',
  'np.',
  'např.',
  'pl.',
  'U.S.A.',
  'ca.',
  // units, months, short words after numbers
  'km',
  'kg',
  'cm',
  'GB',
  'September',
  'people',
  'Uhr',
  'jours',
  'roků',
  'stycznia',
  // Cyrillic and Greek
  'и',
  'в',
  'з',
  'до',
  'а',
  'слово',
  'Привіт',
  'їжак',
  'Сергій',
  'γειά',
  'λόγος',
  'Ωμέγα',
  'є',
  'ґ',
  // numbers
  '1',
  '5',
  '9',
  '10',
  '21',
  '26',
  '100',
  '2026',
  '1999',
  '12345',
  '123456789',
  '1234567890123',
  '1,000',
  '1 000',
  '3.14',
  '3,14',
  '10:00',
  '12:30',
  '0x1F',
  '1920x1080',
  '3x4x5',
  'v2x3',
  '+-5',
  '-5',
  '(-5)',
  '1/2',
  '3/4',
  '1/4',
  '11/2',
  '1/20',
  '1/2/2026',
  '20 C',
  '20°C',
  '20 °C',
  '5°',
  '90°',
  '5%',
  '5 %',
  '49 €',
  '€',
  '$',
  '£',
  '₴',
  // whitespace
  ' ',
  ' ',
  ' ',
  ' ',
  '  ',
  '   ',
  '\t',
  ' \t',
  '\n',
  '\n\n',
  '\r\n',
  ' ',
  '  ',
  ' ',
  // quotes of every style, apostrophes, elisions
  '"',
  '"',
  '""',
  "'",
  "''",
  '’',
  '‘',
  '“',
  '”',
  '„',
  '‟',
  '«',
  '»',
  '‹',
  '›',
  '‚',
  '`',
  '′',
  '″',
  "don't",
  "l'amour",
  "d'un",
  "dell'arte",
  '’90s',
  "'90s",
  "the dogs' bone",
  "rock 'n' roll",
  "o'clock",
  "ma'am",
  "n'est",
  "qu'il",
  // dashes, hyphens, ranges
  '-',
  '-',
  '--',
  '---',
  '–',
  '—',
  '−',
  '‐',
  '‑',
  '->',
  '<-',
  '=>',
  '<=>',
  '→',
  '←',
  '21-26',
  '21–26',
  '10-5',
  '2026-10',
  '2026-10-21',
  '555-1234',
  '+380-44-123',
  'A-1',
  'Ost-West',
  'e-mail',
  // ellipses and punctuation
  '...',
  '....',
  '…',
  '..',
  '!',
  '!!!',
  '?',
  '??',
  '?!',
  '!?',
  ',',
  ',,',
  '.',
  ':',
  ';',
  ' ,',
  ' .',
  ' !',
  ' ?',
  ' :',
  ' ;',
  'a,b',
  'ok,fine',
  '(',
  ')',
  '[',
  ']',
  '{',
  '}',
  '(c)',
  '(C)',
  '(c) 2026',
  '(R)',
  '(TM)',
  '(tm)',
  '©',
  '®',
  '™',
  '¿',
  '¡',
  '¿Qué?',
  '¡Hola!',
  '¡',
  '„',
  '‼',
  '§',
  '&',
  '&amp;',
  '&nbsp;',
  '<',
  '>',
  '/',
  '\\',
  '*',
  '_',
  '#',
  '|',
  '~',
  // zones that must come back as written
  'https://a.b/1-2',
  'https://a.b/1-2--x?q="1"&r=a b',
  'http://x.org/a_(b)',
  'www.a-b.com/2-3',
  'info@a-b.org',
  'a@b.co',
  '`x -> y`',
  '`12-15 "q"`',
  '``a ` b``',
  '`',
  'file.ts',
  'a.b.c',
  // misc
  'x',
  'x',
  '×',
  '5 x 3',
  '3 x 4',
  'A4',
  'COVID-19',
  'U-Bahn',
  '24/7',
  'a/b',
  'AT&T',
  'C++',
  'M&M',
  '￼',
  '',
];

const TOKENS = [
  'stone',
  'memory',
  'Prof. Dr. Oksana',
  '21-26 September',
  "don't",
  'the ’90s',
  '5 km',
  '10:00-12:00',
  'https://a.b/1-2',
  '`x -> y`',
  'a',
  'I',
  'в',
  'z. B.',
  '...',
  'Read more ->',
  '(c) 2026',
  '-',
  '--',
  '5%',
  '3 x 4',
  'l’amour',
  'der',
  'das Labor',
  'будинок',
  'cień',
  'ünd',
  '12 345',
  '1/2',
  '20 C',
  'Wow!!!',
  'a,b',
  'x ',
];

const WRAPS: readonly (readonly [string, string])[] = [
  ['"', '"'],
  ['“', '”'],
  ['„', '“'],
  ['„', '”'],
  ['«', '»'],
  ['»', '«'],
  ['‘', '’'],
  ['‚', '‘'],
  ['‹', '›'],
  ["'", "'"],
];

const pick = <T>(rand: () => number, list: readonly T[]): T =>
  list[Math.floor(rand() * list.length)] as T;

/** Mostly words set apart by spaces, now and then run together, as text goes wrong. */
function fuzz(rand: () => number, length: number): string {
  let out = '';
  for (let i = 0; i < length; i++) {
    if (i > 0 && rand() < 0.7) out += ' ';
    out += pick(rand, PIECES);
  }
  return out;
}

/** A sentence as it is written: words, with quotations around some, nested now and then, a lone mark at an end. */
function sentence(rand: () => number): string {
  const words = Array.from({ length: 3 + Math.floor(rand() * 8) }, () => pick(rand, TOKENS));
  const isDash = (i: number) => words[i] === '-' || words[i] === '--';
  let outer = -1;
  const wrap = (from: number, to: number, sequel = false) => {
    if (isDash(from) || isDash(to)) return;
    let style = Math.floor(rand() * WRAPS.length);
    if (style === outer && !sequel) style = (style + 1) % WRAPS.length;
    outer = style;
    const [open, close] = WRAPS[style] as readonly [string, string];
    words[from] = `${open}${words[from]}`;
    words[to] = `${words[to]}${close}`;
  };
  let nested = false;
  let first = -1;
  let last = -1;
  if (rand() < 0.6) {
    first = Math.floor(rand() * (words.length - 1));
    last = first + 1 + Math.floor(rand() * (words.length - first - 1));
    wrap(first, last);
    if (rand() < 0.4 && last - first >= 2) {
      wrap(first + 1, last - 1);
      nested = true;
    }
  }
  if (!nested && first >= 0 && last < words.length - 2 && rand() < 0.4) {
    const next = last + 1 + Math.floor(rand() * (words.length - last - 2));
    wrap(next, next + Math.floor(rand() * (words.length - next)), true);
  }
  if (!nested) {
    const [open, close] = WRAPS[
      (outer + 1 + Math.floor(rand() * (WRAPS.length - 1))) % WRAPS.length
    ] as readonly [string, string];
    const roll = rand();
    if (roll < 0.1 && first !== 0) words[0] = `${open}${words[0]}`;
    else if (roll > 0.9 && last !== words.length - 1)
      words[words.length - 1] = `${words[words.length - 1]}${close}`;
  }
  return words.join(' ');
}

const MARKS = ['"', "'", '“', '”', '„', '‘', '’', '‚', '«', '»', '‹', '›', '‟', '‛'];
const SOUP_WORDS = ['a', 'bc', 'dé', 'в', '5', "n't", 's', 'x-y', '--', '-', '...', 'Dr.', ','];

/** Quote soups: nested, same-mark, turned, unbalanced, with and without spaces between marks and words. */
function soup(rand: () => number): string {
  const kind = Math.floor(rand() * 5);
  if (kind === 0) {
    // Properly nested in one or two styles, up to four deep.
    const depth = 1 + Math.floor(rand() * 4);
    let out = '';
    const closes: string[] = [];
    for (let i = 0; i < depth; i++) {
      const [open, close] = pick(rand, WRAPS);
      out += `${open}${pick(rand, SOUP_WORDS)} `;
      closes.push(close);
    }
    out += pick(rand, SOUP_WORDS);
    while (closes.length)
      out += `${closes.pop()}${rand() < 0.5 ? ' ' : ''}${rand() < 0.3 ? pick(rand, SOUP_WORDS) : ''}`;
    return out;
  }
  if (kind === 1) {
    // The same mark everywhere: straight quotes, which only position can pair.
    const mark = pick(rand, ['"', "'", '“', '”', '«', '»']);
    const parts: string[] = [];
    for (let i = 0; i < 2 + Math.floor(rand() * 8); i++)
      parts.push(`${rand() < 0.5 ? mark : ''}${pick(rand, SOUP_WORDS)}${rand() < 0.5 ? mark : ''}`);
    return parts.join(' ');
  }
  if (kind === 2) {
    // Turned: closing mark where an opening one belongs (»a« and «a»).
    const [open, close] = pick(rand, WRAPS);
    return `${close}${pick(rand, SOUP_WORDS)} ${pick(rand, SOUP_WORDS)}${open} ${open}${pick(rand, SOUP_WORDS)}${close}`;
  }
  // Random marks and words, with random gaps.
  let out = '';
  for (let i = 0; i < 3 + Math.floor(rand() * 10); i++) {
    out += rand() < 0.55 ? pick(rand, MARKS) : pick(rand, SOUP_WORDS);
    if (rand() < 0.5) out += ' ';
  }
  return out;
}

/** Fixed realistic prose: three short paragraphs for each of nine languages. The rest use their pack's `sample`. */
const PROSE: Readonly<Record<string, readonly string[]>> = {
  en: [
    'The workshop runs 21-26 September, 10:00-12:00, in Room 4B. Prof. Dr. K. Brown said "we\'re ready" - and left... Nobody asked why, but 15 people stayed to hear the reply.',
    'She called it "the best talk of the year, and I mean \'best\' in the old sense" -- then laughed. A 5% discount applies to orders over 49 €; see https://shop.example/offers-2026 or write to hello@shop-example.org.',
    '"Where were you?" he asked. "At home," I said, "reading the \'90s reports." It took 3 x 4 hours, (c) 2026 Acme Inc. Read more ->',
  ],
  uk: [
    'Семінар триває 21-26 вересня, 10:00-12:00, в аудиторії 4Б. Проф. О. Коваленко сказала "ми готові" - і пішла... Ніхто не питав чому, але 15 людей залишилися.',
    '— Де ти був? — спитала вона. — Вдома, — відповів він, — читав "Лісову пісню". Це зайняло 3 години, 5% знижка діє для замовлень від 49 €. Докладніше ->',
    'Він назвав це "найкращим виступом року, і я кажу \'найкращим\' у старому розумінні" -- і засміявся. Пише на office@example.com, сайт https://example.ua/a-b.',
  ],
  de: [
    'Der Workshop läuft 21-26 September, 10:00-12:00, in Raum 4B. Prof. Dr. K. Braun sagte "wir sind bereit" - und ging... Niemand fragte warum, aber 15 Leute blieben, z. B. Frau Weiß.',
    'Er nannte es "den besten Vortrag des Jahres, und ich meine \'beste\' im alten Sinn" -- und lachte. Ab 49 € gibt es 5 % Rabatt, siehe Nr. 12 auf S. 4 und https://shop.example/angebote-2026.',
    '"Wo warst du?", fragte er. "Zu Hause", sagte ich, "ich las die Berichte." Das dauerte 3 x 4 Stunden, d. h. einen halben Tag. Mehr lesen ->',
  ],
  fr: [
    'L’atelier se tient du 21-26 septembre, 10:00-12:00, en salle 4B. Le Dr Martin a dit "nous sommes prêts" - et il est parti... Personne n’a demandé pourquoi, mais 15 personnes sont restées.',
    "Elle l’a appelé \"le meilleur exposé de l'année, et je dis 'meilleur' au sens ancien\" -- puis elle a ri. Une remise de 5 % s'applique dès 49 €; voir https://boutique.example/offres-2026 ou écrire à bonjour@boutique-example.fr.",
    '"Où étais-tu ?" demanda-t-il. "À la maison", dis-je, "je lisais les rapports d\'un autre temps." Cela a pris 3 x 4 heures, c\'est-à-dire une demi-journée! Lire la suite ->',
  ],
  pl: [
    'Warsztaty trwają 21-26 września, 10:00-12:00, w sali 4B. Prof. dr K. Słoboda powiedział "jesteśmy gotowi" - i wyszedł... Nikt nie zapytał dlaczego, ale 15 osób zostało.',
    'Nazwała to "najlepszym wystąpieniem roku, i mówię \'najlepsze\' w dawnym sensie" -- i się roześmiała. Rabat 5 % przysługuje od 49 zł, np. na ul. Długiej 7, zob. https://sklep.example/oferta-2026.',
    '"Gdzie byłeś?" zapytał. "W domu", powiedziałem, "czytałem sprawozdania z lat \'90." Zajęło to 3 x 4 godziny, tj. pół dnia. Czytaj więcej ->',
  ],
  es: [
    'El taller se celebra del 21-26 de septiembre, 10:00-12:00, en el aula 4B. El Dr. Pérez dijo "estamos listos" - y se fue... Nadie preguntó por qué, pero 15 personas se quedaron.',
    '¿Dónde estabas? preguntó él. "En casa", dije, "leyendo los informes de los \'90." ¡Tardó 3 x 4 horas, es decir, medio día! Un 5 % de descuento desde 49 €, véase https://tienda.example/ofertas-2026.',
    'Lo llamó "la mejor charla del año, y digo \'mejor\' en el sentido antiguo" -- y se rió. Escriba a hola@tienda-example.es o lea más ->',
  ],
  cs: [
    'Workshop probíhá 21-26 září, 10:00-12:00, v sále 4B. Prof. Dr. K. Novák řekl "jsme připraveni" - a odešel... Nikdo se neptal proč, ale 15 lidí zůstalo.',
    'Nazvala to "nejlepším vystoupením roku, a říkám \'nejlepším\' ve starém smyslu" -- a zasmála se. Sleva 5 % platí od 49 Kč, např. v ul. Dlouhé 7, viz https://obchod.example/nabidka-2026.',
    '"Kde jsi byl?" zeptal se. "Doma", řekl jsem, "četl jsem zprávy z let \'90." Trvalo to 3 x 4 hodiny, tj. půl dne. Číst dále ->',
  ],
  sv: [
    'Workshopen pågår 21-26 september, 10:00-12:00, i sal 4B. Prof. Dr. K. Berg sa "vi är redo" - och gick... Ingen frågade varför, men 15 personer blev kvar.',
    'Hon kallade det "årets bästa föredrag, och jag menar \'bästa\' i gammal bemärkelse" -- och skrattade. En rabatt på 5 % gäller från 49 kr, t.ex. på Storgatan 7, se https://butik.example/erbjudanden-2026.',
    '"Var var du?" frågade han. "Hemma", sa jag, "jag läste rapporterna från \'90-talet." Det tog 3 x 4 timmar, dvs. en halv dag. Läs mer ->',
  ],
  hu: [
    'A műhely szeptember 21-26., 10:00-12:00, a 4B teremben zajlik. Dr. K. Nagy Prof. azt mondta "készen állunk" - és elment... Senki sem kérdezte miért, de 15 ember maradt.',
    'Ő "az év legjobb előadásának" nevezte, és a "legjobb" szót a régi értelemben mondta -- majd nevetett. 49 €-tól 5 % kedvezmény jár, pl. a Hosszú utca 7. alatt, lásd https://bolt.example/ajanlat-2026.',
    '"Hol voltál?" kérdezte. "Otthon", mondtam, "a \'90-es évek jelentéseit olvastam." 3 x 4 órába telt, azaz fél napba. Tovább ->',
  ],
};

/** The fixed prose, plus each remaining pack's `sample`. Same list on every call. */
export function paragraphs(): string[] {
  const out: string[] = [];
  for (const lines of Object.values(PROSE)) out.push(...lines);
  for (const pack of PACKS) if (!(pack.code in PROSE)) out.push(pack.sample);
  return out;
}

/** The prose of one language, or all of it. */
export function proseOf(lang?: string): string[] {
  if (lang && PROSE[lang]) return [...(PROSE[lang] as readonly string[])];
  if (lang) {
    const pack = PACKS.find((p) => p.code === lang);
    return pack ? [pack.sample] : [];
  }
  return paragraphs();
}

/** Text of about `bytes` UTF-16 units, made of the prose paragraphs, with a fuzz line now and then. */
export function longText(bytes: number, seed = 1, lang?: string): string {
  const rand = lcg(seed);
  const base = proseOf(lang);
  let out = '';
  let i = 0;
  while (out.length < bytes) {
    out += `${base[i++ % base.length]} `;
    if (i % 5 === 0) out += `${fuzz(rand, 6)} `;
  }
  return out.trimEnd();
}

/** `n` deterministic strings: fuzz, sentences with quotations, soups, and prose with fuzz spliced in. */
export function corpus(n: number, seed = 1): string[] {
  const rand = lcg(seed * 2654435761);
  const prose = paragraphs();
  const out: string[] = [];
  for (let i = 0; i < n; i++) {
    switch (i % 8) {
      case 0:
      case 1:
      case 2:
        out.push(fuzz(rand, 1 + Math.floor(rand() * 14)));
        break;
      case 3:
      case 4:
        out.push(sentence(rand));
        break;
      case 5:
        out.push(soup(rand));
        break;
      case 6: {
        const text = pick(rand, prose);
        const at = Math.floor(rand() * (text.length + 1));
        out.push(`${text.slice(0, at)}${fuzz(rand, 1 + Math.floor(rand() * 4))}${text.slice(at)}`);
        break;
      }
      default:
        // A longer run with whole prose sentences between fuzz.
        out.push(`${fuzz(rand, 3)} ${pick(rand, prose)} ${soup(rand)} ${fuzz(rand, 8)}`);
    }
  }
  return out;
}

/** A character-safe split of `text` into three parts (never inside a surrogate pair). */
export function thirds(text: string): [string, string, string] {
  const cut = (at: number) => {
    const code = text.charCodeAt(at - 1);
    return code >= 0xd800 && code <= 0xdbff ? at + 1 : at;
  };
  const a = cut(Math.floor(text.length / 3));
  const b = Math.max(a, cut(Math.floor((text.length * 2) / 3)));
  return [text.slice(0, a), text.slice(a, b), text.slice(b)];
}

const htmlText = (text: string) =>
  text.replaceAll('&', '&amp;').replaceAll('<', '&lt;').replaceAll('>', '&gt;');

/** HTML for the HTML mode: a plain `<p>`, or one with inline elements, an entity, a comment and code. */
export function htmlOf(s: string, i: number): string {
  if (i % 3 === 0) return `<p>${htmlText(s)}</p>`;
  const [a, b, c] = thirds(s);
  if (i % 3 === 1)
    return `<p>${htmlText(a)}<a href="https://a.b/1-2" title="a - b">${htmlText(b)}</a>${htmlText(c)} &amp; &quot;x&quot; &mdash; &copy;</p>`;
  return `<div><p>${htmlText(a)}<em class="x-1">${htmlText(b)}</em><code>a -> b</code><!-- c -- d -->${htmlText(c)}</p><pre>"${htmlText(a)}"</pre></div>`;
}

/** Markdown for the Markdown mode: a paragraph, a heading with a list and a quote, or text around a fence. */
export function markdownOf(s: string, i: number, other: string): string {
  if (i % 3 === 0) return s;
  if (i % 3 === 1)
    return `# ${s}\n\n- ${other}\n> ${s}\n\n1. ${other}  \n   *${s}* [a "b"](https://a.b/1-2 "t - u")\n`;
  return `${s}\n\n\`\`\`\n${other}\n\`\`\`\n\n${other} \`x -> y\` ${s}\n`;
}

type HastNode = {
  type: string;
  value?: string;
  tagName?: string;
  properties?: Record<string, unknown>;
  children?: HastNode[];
};
const t = (value: string): HastNode => ({ type: 'text', value });
const el = (
  tagName: string,
  children: HastNode[],
  properties: Record<string, unknown> = {},
): HastNode => ({ type: 'element', tagName, properties, children });

/** A hand-built hast tree for the rehype mode; call it again for a fresh one. */
export function hastOf(s: string, i: number): HastNode {
  const [a, b, c] = thirds(s);
  if (i % 3 === 0) return { type: 'root', children: [el('p', [t(s)])] };
  if (i % 3 === 1) {
    return {
      type: 'root',
      children: [
        el('p', [t(a), el('em', [t(b)]), t(c), el('code', [t(s)])]),
        el('pre', [el('code', [t(s)])]),
      ],
    };
  }
  return {
    type: 'root',
    children: [
      el('div', [
        el('p', [t(a), el('span', [t(b)], { lang: 'uk-UA' }), t(c)]),
        el('p', [t(s)], { dataTypography: 'off' }),
        el('ul', [el('li', [t(b), el('a', [t(c)], { href: 'x' })])]),
      ]),
    ],
  };
}

/** Stable text of a value for comparison and hashing. */
export const show = (value: unknown): string => JSON.stringify(value);

/** The ids of the rules that are off by default. */
export const optInIds = (engine: Engine): string[] =>
  engine.core.RULES.filter((rule) => rule.defaultOn === false).map((rule) => rule.id);

/** Rule table, as it must match between engines: ids in order, with `defaultOn`. */
export const ruleTable = (engine: Engine): string[] =>
  engine.core.RULES.map((rule) => `${rule.id}:${rule.defaultOn === false ? 'off' : 'on'}`);

export const SNAPSHOT_N = 1000;
export const SNAPSHOT_VARIANTS = [
  'display',
  'literary',
  'us',
  'optin',
  'text',
  'html',
  'markdown',
] as const;
export type SnapshotVariant = (typeof SNAPSHOT_VARIANTS)[number];

/** SHA-256 of what the engine gives on the snapshot corpus, per variant, for one language. */
export function snapshotDigests(
  engine: Engine,
  lang: string,
  n = SNAPSHOT_N,
): Record<SnapshotVariant, string> {
  const { explain } = engine.core;
  const l = lang as never;
  const inputs = corpus(n, 17);
  const all = optInIds(engine);
  const hash = (parts: string[]) => createHash('sha256').update(parts.join('\u0000')).digest('hex');
  const records = (options: Parameters<typeof explain>[2]) =>
    inputs.map((s, i) => {
      const o = { ...options, blockStart: i % 4 !== 3 };
      const r = explain(s, l, o);
      return `${r.output}\u0001${show(r.changes)}`;
    });
  const viaMode = (run: (s: string, i: number, changes: unknown[]) => string) =>
    inputs.map((s, i) => {
      const changes: unknown[] = [];
      return `${run(s, i, changes)}\u0001${show(changes)}`;
    });
  const collect = (changes: unknown[]) => (c: unknown) => void changes.push(c);
  return {
    display: hash(records({ register: 'display' })),
    literary: hash(records({ register: 'literary' })),
    us: hash(records({ quoteStyle: 'us' })),
    optin: hash(records({ enable: all })),
    text: hash(
      viaMode((s, i, ch) =>
        engine.text.typesetText(`${s}\n${inputs[(i + 1) % n]}\n\n${inputs[(i + 2) % n]}`, {
          lang: l,
          onChange: collect(ch),
        }),
      ),
    ),
    html: hash(
      viaMode((s, i, ch) =>
        engine.html.typesetHtml(htmlOf(s, i), { lang: l, onChange: collect(ch) }),
      ),
    ),
    markdown: hash(
      viaMode((s, i, ch) =>
        engine.markdown.typesetMarkdown(markdownOf(s, i, inputs[(i + 1) % n] ?? ''), {
          lang: l,
          onChange: collect(ch),
        }),
      ),
    ),
  };
}
