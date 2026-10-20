/** A straight apostrophe after a letter, or before a year's two digits, becomes ’. */
export const apostrophe = (text: string): string =>
  text.replace(/(?<=\p{L})'/gu, '’').replace(/(?<=^|[\s([])'(?=\d)/g, '’');

export const ellipsis = (text: string): string => text.replace(/\.{3}/g, '…');

export const arrows = (text: string): string => text.replace(/->/g, '→').replace(/<-/g, '←');

/** © from (c) before a year or (C), ® from (R), ™ from (TM). */
export const legal = (text: string): string =>
  text
    .replace(/\((?:c)\)(?=\s*\d{4})|\(C\)/g, '©')
    .replace(/\(R\)/g, '®')
    .replace(/\(TM\)/gi, '™');

/** A hyphen straight before a digit, after a space or a parenthesis, is a minus sign: -5 becomes −5. */
export const minus = (text: string): string => text.replace(/(?<=^|[\s(])-(?=\d)/g, '\u2212');

/**
 * The letter x between numbers is a multiplication sign: 1920x1080 becomes 1920×1080,
 * 3 x 4 becomes 3 × 4. Not a hex number (0x1F), and not an identifier that runs on
 * (v2x3, a.1x2).
 */
export const multiply = (text: string): string =>
  text
    .replace(
      /(?<![\w.,-])(?!0[xX])(\d+(?:[.,]\d+)?)((?:x\d+(?:[.,]\d+)?)+)(?![A-Za-z]*\d)/g,
      (_m, first: string, rest: string) => `${first}${rest.replaceAll('x', '\u00D7')}`,
    )
    .replace(/(?<=\d)[ ]+x[ ]+(?=\d)/g, '\u00A0\u00D7 ');
