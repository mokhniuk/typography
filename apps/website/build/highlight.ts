/**
 * A small highlighter for the code blocks of the docs, run at build time: each language is one
 * sticky regex whose named groups are the kinds of token. Enough for the snippets we write (ts,
 * tsx, js, json, sh, css, html); not a parser. The page gets `<span data-tok="kind">`.
 */

const STRING = String.raw`'(?:\\.|[^'\\\n])*'|"(?:\\.|[^"\\\n])*"`;
const SCRIPT = new RegExp(
  [
    String.raw`(?<comment>//[^\n]*|/\*[\s\S]*?\*/)`,
    String.raw`(?<string>${STRING}|\`(?:\\.|[^\`\\])*\`)`,
    String.raw`(?<keyword>\b(?:import|export|from|const|let|var|function|return|if|else|for|of|in|new|type|interface|as|await|async|default|class|extends|typeof|satisfies)\b)`,
    String.raw`(?<literal>\b(?:true|false|null|undefined)\b|\b\d[\d_.]*\b)`,
    String.raw`(?<fn>\b[A-Za-z_$][\w$]*(?=\())`,
    String.raw`(?<tag></?[A-Z][\w.]*)`,
  ].join('|'),
  'gy',
);
const SHELL = new RegExp(
  [
    String.raw`(?<comment>(?:^|(?<=\s))#[^\n]*)`,
    `(?<string>${STRING})`,
    String.raw`(?<fn>(?<=^[ \t]*(?:\$ )?)[\w./@-]+)`,
    String.raw`(?<keyword>(?<=\s)--?[\w-]+)`,
  ].join('|'),
  'gmy',
);
const CSS = new RegExp(
  [
    String.raw`(?<comment>/\*[\s\S]*?\*/)`,
    `(?<string>${STRING})`,
    String.raw`(?<keyword>(?:--)?[\w-]+(?=\s*:[^:]))`,
    String.raw`(?<literal>-?\b\d[\d.]*[a-z%]*)`,
  ].join('|'),
  'gy',
);
const HTML = new RegExp(
  [
    String.raw`(?<comment><!--[\s\S]*?-->)`,
    String.raw`(?<tag></?[\w-]+>?|/?>)`,
    String.raw`(?<keyword>[\w-]+(?==))`,
    `(?<string>${STRING})`,
  ].join('|'),
  'gy',
);

const GRAMMARS: Record<string, RegExp> = {
  ts: SCRIPT,
  tsx: SCRIPT,
  js: SCRIPT,
  json: SCRIPT,
  sh: SHELL,
  bash: SHELL,
  css: CSS,
  html: HTML,
};

export type Token = { kind?: string; text: string };

/** Cuts `code` into tokens; plain text has no kind. `null` for a language it does not know. */
export function highlight(code: string, lang: string): Token[] | null {
  const grammar = GRAMMARS[lang];
  if (!grammar) return null;
  const out: Token[] = [];
  let plain = '';
  let at = 0;
  while (at < code.length) {
    grammar.lastIndex = at;
    const match = grammar.exec(code);
    const kind = match && Object.entries(match.groups ?? {}).find(([, v]) => v !== undefined)?.[0];
    if (!match || !kind || !match[0]) {
      plain += code[at];
      at++;
      continue;
    }
    if (plain) out.push({ text: plain });
    plain = '';
    out.push({ kind, text: match[0] });
    at += match[0].length;
  }
  if (plain) out.push({ text: plain });
  return out;
}

const ENTITIES: Record<string, string> = { amp: '&', lt: '<', gt: '>', quot: '"', '#39': "'" };
const esc = (text: string) =>
  text.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');

/** Highlights every `<pre><code class="language-…">` in a page written as HTML (the landing page). */
export function highlightHtml(html: string): string {
  return html.replace(
    /<pre><code class="language-(\w+)">([\s\S]*?)<\/code><\/pre>/g,
    (block, lang: string, body: string) => {
      // Escaped code holds no `<`: a block with markup in it is highlighted already (the docs).
      if (body.includes('<')) return block;
      const code = body.replace(
        /&(amp|lt|gt|quot|#39);/g,
        (_, name: string) => ENTITIES[name] ?? '',
      );
      const tokens = highlight(code, lang);
      if (!tokens) return block;
      const inner = tokens
        .map((t) =>
          t.kind ? `<span data-tok="${t.kind}">${esc(t.text)}</span>` : esc(t.text),
        )
        .join('');
      return `<pre><code class="language-${lang}">${inner}</code></pre>`;
    },
  );
}
