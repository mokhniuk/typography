import { diff, type Lang, PACKS, typographic } from '../../src/core';
import { hangPunctuation, markHangs } from '../../src/dom';
import { example } from '../playground/examples';

const STORAGE = 'typography-theme';

/** Storage can be blocked (private windows, some embeds); the page works without it. */
const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

// The design grid: pink columns over the page. G toggles it (remembered); until then it is on in
// development (localhost) and off on the site, or on anywhere with ?grid.
const GRID = 'typography-grid';
const showGrid = (on: boolean) => {
  if (on) document.documentElement.dataset.grid = '';
  else delete document.documentElement.dataset.grid;
  save(GRID, on ? 'on' : 'off');
};
const local = ['localhost', '127.0.0.1'].includes(location.hostname);
let chosen: string | null = null;
try {
  chosen = localStorage.getItem(GRID);
} catch {}
if (new URLSearchParams(location.search).has('grid') || (chosen ?? (local ? 'on' : 'off')) === 'on')
  showGrid(true);
document.addEventListener('keydown', (event) => {
  if (event.key !== 'g' && event.key !== 'G') return;
  if (event.metaKey || event.ctrlKey || event.altKey) return;
  const target = event.target;
  if (target instanceof Element && target.closest('input, textarea, select, [contenteditable]'))
    return;
  showGrid(document.documentElement.dataset.grid === undefined);
});

// Theme: the switch sets `data-theme` on <html>; with none set, the system preference rules.
for (const toggle of document.querySelectorAll<HTMLButtonElement>('[data-theme-toggle]')) {
  toggle.addEventListener('click', () => {
    const root = document.documentElement;
    const dark =
      root.dataset.theme === 'dark' ||
      (!root.dataset.theme && matchMedia('(prefers-color-scheme: dark)').matches);
    root.dataset.theme = dark ? 'light' : 'dark';
    save(STORAGE, root.dataset.theme);
  });
}

async function copy(text: string, button: HTMLButtonElement) {
  const label = button.textContent;
  try {
    await navigator.clipboard.writeText(text);
    button.textContent = 'Copied';
  } catch {
    button.textContent = 'Press ⌘C';
  }
  setTimeout(() => {
    button.textContent = label;
  }, 1500);
}

// Install: the package manager picks the command, which stays readable without script.
const install = document.querySelector<HTMLElement>('[data-install]');
if (install) {
  const code = install.querySelector('code');
  for (const radio of install.querySelectorAll<HTMLInputElement>('input[name="pm"]')) {
    radio.addEventListener('change', () => {
      if (code) code.textContent = radio.value;
    });
  }
  const button = install.querySelector<HTMLButtonElement>('[data-copy]');
  button?.addEventListener('click', () => copy(code?.textContent ?? '', button));
}

// Every code block in the docs and articles gets a copy button.
for (const pre of document.querySelectorAll<HTMLPreElement>('article pre')) {
  const button = document.createElement('button');
  button.type = 'button';
  button.textContent = 'Copy';
  button.setAttribute('aria-label', 'Copy this code');
  button.addEventListener('click', () => copy(pre.textContent ?? '', button));
  pre.append(button);
}

// Hanging punctuation: the build wrapped the marks (build/hang.ts) and an inline script measured
// them as the page was parsed; this pass takes over from it and keeps them right as the page changes.
for (const root of document.querySelectorAll<HTMLElement>('[data-hanging]')) hangPunctuation(root);

// The converter in the hero: the build set its first result; this sets it again as you type or
// pick a language. English uses American quotes, like the rest of the site; an unedited text follows
// the language (the playground's short example for it).
const heroIn = document.querySelector<HTMLTextAreaElement>('#hero-in');
const heroOut = document.querySelector<HTMLElement>('#hero-out');
const heroLang = document.querySelector<HTMLSelectElement>('#hero-lang');
if (heroIn && heroOut && heroLang) {
  for (const pack of PACKS) if (pack.code !== 'en') heroLang.add(new Option(pack.name, pack.code));
  let edited = false;
  const NBSP = '\u00a0';
  const marked = (text: string): Node[] =>
    text.split(new RegExp(`(${NBSP})`)).flatMap((part) => {
      if (!part) return [];
      const ins = document.createElement('ins');
      ins.textContent = part;
      if (part === NBSP) ins.dataset.nbsp = '';
      return [ins];
    });
  const run = () => {
    const lang = heroLang.value as Lang;
    const source = heroIn.value;
    const result = typographic(source, lang, { quoteStyle: lang === 'en' ? 'us' : 'language' });
    // One paragraph per block of text, as the input has them.
    const paragraphs: Node[][] = [[]];
    for (const part of diff(source, result)) {
      if (part.kind === 'del') continue;
      const pieces = part.text.split(/\n\s*\n/);
      pieces.forEach((piece, n) => {
        if (n) paragraphs.push([]);
        const nodes = part.kind === 'ins' ? marked(piece) : [document.createTextNode(piece)];
        paragraphs[paragraphs.length - 1]?.push(...nodes);
      });
    }
    heroOut.replaceChildren(
      ...paragraphs.map((nodes) => {
        const p = document.createElement('p');
        p.append(...nodes);
        return p;
      }),
    );
    markHangs(heroOut);
  };
  // The box grows with its text, so the whole input shows.
  const fit = () => {
    heroIn.style.height = 'auto';
    heroIn.style.height = `${heroIn.scrollHeight}px`;
  };
  fit();
  addEventListener('resize', fit);
  heroIn.addEventListener('input', () => {
    edited = true;
    fit();
    run();
  });
  heroLang.addEventListener('change', () => {
    if (!edited) heroIn.value = example('text', heroLang.value as Lang, 'short');
    fit();
    run();
  });
}
