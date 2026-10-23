// Escapes text for HTML element content and for quoted attribute values.
// The ampersand goes first, so the entities added below are not escaped again.
export const escapeHtml = (text: string) =>
  text
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#39;');
