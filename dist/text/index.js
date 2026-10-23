import { withPack } from '../core/resolve.js';
import { typesetText as set } from './text.js';
export function typesetText(text, options = {}) {
    return set(text, withPack(options));
}
