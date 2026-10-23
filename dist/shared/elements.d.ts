/** Which HTML elements hold text, which are left as they were, and which end a block of text. */
/** Content is not text: left as it was, and it ends the block around it. */
export declare const RAW_BLOCK: Set<string>;
/** Content is not text, but the element sits inside a line. */
export declare const RAW_INLINE: Set<string>;
/** Elements that start or end a block of text. */
export declare const BLOCK: Set<string>;
