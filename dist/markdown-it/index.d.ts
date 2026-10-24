import { type ModeOptions } from '../core/index.js';
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
type Token = {
    type: string;
    content: string;
    children: Token[] | null;
};
type Rule = (state: {
    tokens: Token[];
}) => void;
type MarkdownItLike = {
    core: {
        ruler: {
            push(name: string, rule: Rule): void;
            before(beforeName: string, name: string, rule: Rule): void;
        };
    };
};
export default function markdownItTypography(md: MarkdownItLike, options?: MarkdownItOptions): void;
export {};
