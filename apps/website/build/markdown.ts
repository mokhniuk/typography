import rehypeStringify from 'rehype-stringify';
import remarkGfm from 'remark-gfm';
import remarkParse from 'remark-parse';
import remarkRehype from 'remark-rehype';
import { unified } from 'unified';
import { diff, NBSP } from '../../../src/core';
import { highlight } from './highlight';

type Node = {
  type: string;
  tagName?: string;
  value?: string;
  properties?: Record<string, unknown>;
  children?: Node[];
  data?: { wrapped?: boolean };
};

export type Heading = { depth: number; id: string; text: string };
export type Rendered = { html: string; headings: Heading[]; title: string; lead: string };

const textOf = (node: Node): string => node.value ?? (node.children ?? []).map(textOf).join('');

const el = (tagName: string, properties: Record<string, unknown>, children: Node[]): Node => ({
  type: 'element',
  tagName,
  properties,
  children,
});
const text = (value: string): Node => ({ type: 'text', value });

/** An example of `docs/rules.md`: `(en, literary)`, then `before  …` and `after   …`. */
const EXAMPLE =
  /^\((?<setting>[^)\n]+)\)\nbefore {2}(?<before>[\s\S]*?)\nafter {3}(?<after>[\s\S]*?)\n?$/;

/**
 * A rules example as a figure: what you type (`kbd`) and what the rule gives (`samp`), each changed
 * run marked. The page is typeset as a whole, and `kbd` and `samp` are left alone by it, so the
 * example shows the rule's own output. A `~` the rule put in is a no-break space, drawn boxed.
 */
function ruleExample(code: string): Node | null {
  const match = EXAMPLE.exec(code);
  if (!match?.groups) return null;
  const { setting = '', before = '', after = '' } = match.groups;
  const was: Node[] = [];
  const now: Node[] = [];
  for (const run of diff(before, after)) {
    if (run.kind === 'same') {
      was.push(text(run.text));
      now.push(text(run.text));
    } else if (run.kind === 'del') {
      was.push(el('del', {}, [text(run.text)]));
    } else {
      for (const part of run.text.split(/(~)/)) {
        if (part === '~') now.push(el('ins', { dataNbsp: '' }, [text(NBSP)]));
        else if (part) now.push(el('ins', {}, [text(part)]));
      }
    }
  }
  const lang = setting.split(',')[0]?.trim() ?? '';
  return el('figure', { dataRuleExample: '' }, [
    el('figcaption', {}, [text(setting)]),
    el('dl', {}, [
      el('div', {}, [el('dt', {}, [text('Before')]), el('dd', {}, [el('kbd', {}, was)])]),
      el('div', {}, [el('dt', {}, [text('After')]), el('dd', { lang }, [el('samp', {}, now)])]),
    ]),
  ]);
}

export const slugify = (text: string): string =>
  text
    .toLowerCase()
    .replace(/[`’'"]/g, '')
    .replace(/[^\p{L}\p{N}]+/gu, '-')
    .replace(/^-+|-+$/g, '');

/** Splits `---` front matter (flat `key: value` lines) off a document. */
export function frontMatter(source: string): { data: Record<string, string>; body: string } {
  const match = /^---\n([\s\S]*?)\n---\n?/.exec(source);
  if (!match) return { data: {}, body: source };
  const data: Record<string, string> = {};
  for (const line of (match[1] ?? '').split('\n')) {
    const at = line.indexOf(':');
    if (at > 0) data[line.slice(0, at).trim()] = line.slice(at + 1).trim();
  }
  return { data, body: source.slice(match[0].length) };
}

/**
 * Markdown to HTML. Headings get ids (and are collected for a table of contents), and every link
 * goes through `link`, which maps a path in the repository to a page of the site.
 */
export function render(markdown: string, link: (href: string) => string): Rendered {
  const headings: Heading[] = [];
  const seen = new Map<string, number>();
  let title = '';
  let lead = '';

  const walk = (node: Node): void => {
    if (node.type === 'element') {
      const tag = node.tagName ?? '';
      if (/^h[1-6]$/.test(tag)) {
        const text = textOf(node);
        const depth = Number(tag[1]);
        const base = slugify(text) || 'section';
        const count = seen.get(base) ?? 0;
        seen.set(base, count + 1);
        const id = count ? `${base}-${count}` : base;
        node.properties = { ...node.properties, id };
        if (depth === 1 && !title) title = text;
        if (depth === 2 || depth === 3) headings.push({ depth, id, text });
      } else if (tag === 'p' && !lead && title) {
        lead = textOf(node).replace(/\s+/g, ' ').trim();
      } else if (tag === 'a' && typeof node.properties?.href === 'string') {
        node.properties.href = link(node.properties.href);
      } else if (tag === 'pre') {
        const code = node.children?.[0];
        const classes = code?.properties?.className;
        const lang = Array.isArray(classes)
          ? String(classes.find((c) => String(c).startsWith('language-')) ?? '').slice(9)
          : '';
        const source = code ? textOf(code) : '';
        const example = lang === 'text' ? ruleExample(source) : null;
        if (example) {
          Object.assign(node, example);
          return;
        }
        const tokens = code && highlight(source, lang);
        if (code && tokens)
          code.children = tokens.map((t) =>
            t.kind ? el('span', { dataTok: t.kind }, [text(t.text)]) : text(t.text),
          );
        return;
      } else if (tag === 'table' && !node.data?.wrapped) {
        // A table scrolls on its own on a narrow screen instead of widening the page.
        node.tagName = 'div';
        node.properties = { 'data-scroll': '', tabindex: 0, role: 'region', 'aria-label': 'Table' };
        node.children = [
          {
            type: 'element',
            tagName: 'table',
            data: { wrapped: true },
            children: node.children ?? [],
          },
        ];
      }
    }
    for (const child of node.children ?? []) walk(child);
  };

  const processor = unified()
    .use(remarkParse)
    .use(remarkGfm)
    .use(remarkRehype)
    .use(() => (tree: Node) => walk(tree))
    .use(rehypeStringify);
  const html = String(processor.processSync(markdown));
  return { html, headings, title, lead };
}
