import { type ModeOptions, resolvePack } from '../core/index.ts';
import { typesetBlock } from '../core/typography.ts';

/**
 * A markdown-it plugin that typesets the text of a document. It needs no dependency: the parts of
 * markdown-it it touches are described below as plain data.
 *
 *     const md = new MarkdownIt().use(markdownItTypography, { lang: 'uk' });
 *
 * It runs once the document is parsed, on the children of every `inline` token (a paragraph, a
 * heading, a table cell, a list item). The text of one inline token is typeset as a block, with
 * every other child (a link, emphasis, a code span, a line break) standing in as a gap, so a
 * quotation pairs across a link. Code blocks, fences, code spans, raw HTML and escaped characters are
 * never touched, and neither are attributes or URLs. Leave markdown-it's own `typographer` off: it
 * sets quotes and dashes before this plugin runs, and the two disagree about the details.
 */
export type MarkdownItOptions = ModeOptions;

type Token = { type: string; content: string; children: Token[] | null };
type Rule = (state: { tokens: Token[] }) => void;
type MarkdownItLike = {
  core: {
    ruler: {
      push(name: string, rule: Rule): void;
      before(beforeName: string, name: string, rule: Rule): void;
    };
  };
};

/** Stands between the text children of an inline token while they are typeset together. */
const SEP = '￼';

export default function markdownItTypography(md: MarkdownItLike, options: MarkdownItOptions = {}) {
  const lang = resolvePack(options.lang);
  const rule: Rule = (state) => {
    for (const token of state.tokens) {
      if (token.type !== 'inline' || !token.children) continue;
      const children = token.children;
      const texts = children.filter((child) => child.type === 'text');
      if (!texts.some((child) => /\S/.test(child.content))) continue;
      const joined = children
        .map((child) => (child.type === 'text' ? child.content : ''))
        .join(SEP);
      const { text, keep } = typesetBlock(joined, { ...options, lang });
      if (text === joined) continue;
      const pieces = text.split(SEP);
      // A rule that lost or added a separator cannot be mapped back: keep the block as it came.
      if (pieces.length !== children.length) continue;
      keep();
      children.forEach((child, i) => {
        if (child.type === 'text' && pieces[i] !== undefined) child.content = pieces[i] as string;
      });
    }
  };
  // Before `text_join`, which folds an escaped character (`\"`) into the text around it: until then
  // it is a token of its own, and so a gap that the rules leave as it was typed. markdown-it before
  // 13 has no such rule; there the plugin runs last.
  try {
    md.core.ruler.before('text_join', 'typography', rule);
  } catch {
    md.core.ruler.push('typography', rule);
  }
}
