import { resolvePack } from '../core/index.js';
import { typesetBlock } from '../core/typography.js';
/** Stands between the text children of an inline token while they are typeset together. */
const SEP = '￼';
export default function markdownItTypography(md, options = {}) {
    const lang = resolvePack(options.lang);
    const rule = (state) => {
        for (const token of state.tokens) {
            if (token.type !== 'inline' || !token.children)
                continue;
            const children = token.children;
            const texts = children.filter((child) => child.type === 'text');
            if (!texts.some((child) => /\S/.test(child.content)))
                continue;
            const joined = children
                .map((child) => (child.type === 'text' ? child.content : ''))
                .join(SEP);
            const { text, keep } = typesetBlock(joined, { ...options, lang });
            if (text === joined)
                continue;
            const pieces = text.split(SEP);
            // A rule that lost or added a separator cannot be mapped back: keep the block as it came.
            if (pieces.length !== children.length)
                continue;
            keep();
            children.forEach((child, i) => {
                if (child.type === 'text' && pieces[i] !== undefined)
                    child.content = pieces[i];
            });
        }
    };
    // Before `text_join`, which folds an escaped character (`\"`) into the text around it: until then
    // it is a token of its own, and so a gap that the rules leave as it was typed. markdown-it before
    // 13 has no such rule; there the plugin runs last.
    try {
        md.core.ruler.before('text_join', 'typography', rule);
    }
    catch {
        md.core.ruler.push('typography', rule);
    }
}
