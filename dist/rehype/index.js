import { LANGS, typesetBlock, } from '../core/index.js';
import { BLOCK, RAW_BLOCK, RAW_INLINE } from '../shared/elements.js';
/** Stands between the text nodes of a run while they are typeset together. */
const SEP = '￼';
const isElement = (node) => node.type === 'element';
const isText = (node) => node.type === 'text' && typeof node.value === 'string';
/** Pack codes by their lower-case form: a language tag is matched without regard to case. */
const BY_TAG = new Map(LANGS.map((lang) => [lang.toLowerCase(), lang]));
/**
 * The pack of a language tag: the longest run of its leading subtags that is a pack code, so
 * `de-CH` and `de-ch-1996` are `de-CH`, `de-AT` is `de` and `uk-UA` is `uk`.
 */
function packOf(tag) {
    const subtags = tag.toLowerCase().split('-');
    for (let n = subtags.length; n > 0; n--) {
        const lang = BY_TAG.get(subtags.slice(0, n).join('-'));
        if (lang)
            return lang;
    }
    return undefined;
}
/** The setting an element declares, if its language is one of ours (see `packOf`). The quote style stays the option's. */
function declared(element, quoteStyle) {
    const raw = element.properties?.lang ?? element.properties?.xmlLang;
    if (typeof raw !== 'string')
        return null;
    const lang = packOf(raw);
    if (!lang)
        return null;
    return { lang, quoteStyle };
}
const off = (element) => element.properties?.dataTypography === 'off' || element.properties?.['data-typography'] === 'off';
export function typesetHast(tree, options = {}) {
    const base = { lang: options.lang ?? 'en', quoteStyle: options.quoteStyle };
    let run = [];
    const flush = ({ lang, quoteStyle }) => {
        const entries = run;
        run = [];
        const nodes = entries.filter((e) => e !== null);
        if (!nodes.some((n) => /\S/.test(n.value)))
            return;
        const joined = entries.map((e) => e?.value ?? '').join(SEP);
        const { text, keep } = typesetBlock(joined, { ...options, lang, quoteStyle });
        if (text === joined)
            return;
        const pieces = text.split(SEP);
        // A rule that lost or added a separator cannot be mapped back: keep the block as it came.
        if (pieces.length !== entries.length)
            return;
        keep();
        entries.forEach((entry, i) => {
            if (entry && pieces[i] !== undefined)
                entry.value = pieces[i];
        });
    };
    const walk = (node, current) => {
        for (const child of node.children ?? []) {
            if (isText(child)) {
                run.push(child);
            }
            else if (isElement(child)) {
                const tag = child.tagName.toLowerCase();
                const inner = declared(child, options.quoteStyle) ?? current;
                if (off(child) || RAW_BLOCK.has(tag)) {
                    flush(current);
                }
                else if (RAW_INLINE.has(tag)) {
                    run.push(null);
                }
                else if (BLOCK.has(tag) ||
                    inner.lang !== current.lang ||
                    inner.quoteStyle !== current.quoteStyle) {
                    // A block, or an inline element in another language: text of its own.
                    flush(current);
                    walk(child, inner);
                    flush(inner);
                }
                else {
                    run.push(null);
                    walk(child, inner);
                    run.push(null);
                }
            }
            else if (child.children) {
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
export default function rehypeTypography(options = {}) {
    return (tree) => {
        typesetHast(tree, options);
    };
}
