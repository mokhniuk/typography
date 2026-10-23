import { withPack } from '../core/resolve.js';
import { typesetMarkdown as set } from './markdown.js';
export function typesetMarkdown(markdown, options = {}) {
    return set(markdown, withPack(options));
}
