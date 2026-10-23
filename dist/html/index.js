import { withPack } from '../core/resolve.js';
import { typesetHtml as set } from './html.js';
export function typesetHtml(html, options = {}) {
    return set(html, withPack(options));
}
