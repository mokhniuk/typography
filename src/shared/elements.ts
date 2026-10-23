/** Which HTML elements hold text, which are left as they were, and which end a block of text. */

/** Content is not text: left as it was, and it ends the block around it. */
export const RAW_BLOCK = new Set(['pre', 'script', 'style', 'template']);
/** Content is not text, but the element sits inside a line. */
export const RAW_INLINE = new Set(['code', 'kbd', 'samp', 'textarea', 'svg', 'math']);
/** Elements that start or end a block of text. */
export const BLOCK = new Set(
  (
    'html head body address article aside blockquote br caption dd details div dl dt fieldset ' +
    'figcaption figure footer form h1 h2 h3 h4 h5 h6 header hr li main nav ol p section summary ' +
    'table tbody td tfoot th thead tr ul title meta link base option optgroup select legend button'
  ).split(' '),
);
