import { LANGS, type Lang, type ModeOptions, type QuoteStyle, typesetBlock } from '../core';
import { BLOCK, RAW_BLOCK, RAW_INLINE } from '../shared/elements';

/**
 * A rehype plugin (and a function for any hast tree) that typesets the text of an
 * HTML syntax tree. It needs no dependency: a hast node is read as plain data.
 *
 *     unified().use(remarkParse).use(remarkRehype).use(rehypeTypography, { lang: 'uk' })
 *
 * Text is typeset a block at a time, with the inline elements (`a`, `em`, …) inside
 * it, so a quotation pairs across a link. Left alone: the content of `pre`, `code`,
 * `kbd`, `samp`, `textarea`, `script`, `style`, `svg`, `math`, `template`, anything
 * with `data-typography="off"`, and every attribute. An element's `lang` attribute
 * sets the language of its subtree, when it is one the package has a profile for (the
 * primary subtag is read, in any case: `uk-UA` is `uk`); `en-US` also sets
 * `quoteStyle: 'us'` for the subtree, and any other declared language goes back to the
 * `quoteStyle` option. An inline element in another language is typeset on its own, so a
 * quotation does not pair across it.
 *
 * hast text is already decoded, so entities are not a concern here: text comes back
 * as characters, and the serializer escapes what it must.
 */
export type RehypeOptions = ModeOptions;

type Node = { type: string; children?: Node[]; value?: string };
type Text = Node & { type: 'text'; value: string };
type Element = Node & {
  type: 'element';
  tagName: string;
  properties?: Record<string, unknown>;
  children: Node[];
};

/** Stands between the text nodes of a run while they are typeset together. */
const SEP = '￼';

const isElement = (node: Node): node is Element => node.type === 'element';
const isText = (node: Node): node is Text => node.type === 'text' && typeof node.value === 'string';

/** What an element's `lang` sets for its subtree: the language, and the quote style that goes with it. */
type Setting = { lang: Lang; quoteStyle: QuoteStyle | undefined };

/** The setting an element declares, if its language is one of ours: `uk-UA` is `uk`, `en-US` is `en` with US quotes. */
function declared(element: Element, quoteStyle: QuoteStyle | undefined): Setting | null {
  const raw = element.properties?.lang ?? element.properties?.xmlLang;
  if (typeof raw !== 'string') return null;
  const tag = raw.toLowerCase();
  const lang = LANGS.find((l) => l === tag.split('-')[0]);
  if (!lang) return null;
  return { lang, quoteStyle: tag === 'en-us' ? 'us' : quoteStyle };
}

const off = (element: Element) =>
  element.properties?.dataTypography === 'off' || element.properties?.['data-typography'] === 'off';

/** A run is the text nodes of one block, with a gap wherever an inline element begins or ends. */
type Entry = Text | null;

export function typesetHast<T extends Node>(tree: T, options: RehypeOptions = {}): T {
  const base: Setting = { lang: options.lang ?? 'en', quoteStyle: options.quoteStyle };
  let run: Entry[] = [];

  const flush = ({ lang, quoteStyle }: Setting) => {
    const entries = run;
    run = [];
    const nodes = entries.filter((e): e is Text => e !== null);
    if (!nodes.some((n) => /\S/.test(n.value))) return;
    const joined = entries.map((e) => e?.value ?? '').join(SEP);
    const { text, keep } = typesetBlock(joined, { ...options, lang, quoteStyle });
    if (text === joined) return;
    const pieces = text.split(SEP);
    // A rule that lost or added a separator cannot be mapped back: keep the block as it came.
    if (pieces.length !== entries.length) return;
    keep();
    entries.forEach((entry, i) => {
      if (entry && pieces[i] !== undefined) entry.value = pieces[i] as string;
    });
  };

  const walk = (node: Node, current: Setting) => {
    for (const child of node.children ?? []) {
      if (isText(child)) {
        run.push(child);
      } else if (isElement(child)) {
        const tag = child.tagName.toLowerCase();
        const inner = declared(child, options.quoteStyle) ?? current;
        if (off(child) || RAW_BLOCK.has(tag)) {
          flush(current);
        } else if (RAW_INLINE.has(tag)) {
          run.push(null);
        } else if (
          BLOCK.has(tag) ||
          inner.lang !== current.lang ||
          inner.quoteStyle !== current.quoteStyle
        ) {
          // A block, or an inline element in another language: text of its own.
          flush(current);
          walk(child, inner);
          flush(inner);
        } else {
          run.push(null);
          walk(child, inner);
          run.push(null);
        }
      } else if (child.children) {
        // A root, a doctype or a comment: structure only.
        walk(child, current);
      }
    }
  };

  walk(tree, base);
  flush(base);
  return tree;
}

/** The unified plugin: `.use(rehypeTypography, { lang, register, quoteStyle, disable, enable })`. */
export default function rehypeTypography(options: RehypeOptions = {}) {
  return (tree: Node) => {
    typesetHast(tree, options);
  };
}
