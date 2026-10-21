import { diff, type Lang, PACKS, typographic } from '../../src/core';
import { hangPunctuation } from '../../src/dom';

const STORAGE = 'typography-theme';

/** Storage can be blocked (private windows, some embeds); the page works without it. */
const save = (key: string, value: string) => {
  try {
    localStorage.setItem(key, value);
  } catch {}
};

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

// The live example on the landing page.
const input = document.querySelector<HTMLTextAreaElement>('#demo-in');
const output = document.querySelector<HTMLElement>('#demo-out');
const language = document.querySelector<HTMLSelectElement>('#demo-lang');
const american = document.querySelector<HTMLInputElement>('#demo-us');
if (input && output && language && american) {
  for (const pack of PACKS)
    language.add(new Option(pack.name, pack.code, pack.code === 'en', pack.code === 'en'));
  american.checked = true;
  const run = () => {
    const text = typographic(input.value, language.value as Lang, {
      quoteStyle: american.checked ? 'us' : 'language',
    });
    output.replaceChildren();
    for (const part of diff(input.value, text)) {
      if (part.kind === 'del') continue;
      const node =
        part.kind === 'ins' ? document.createElement('ins') : document.createTextNode(part.text);
      if (node instanceof HTMLElement) {
        node.textContent = part.text;
        if (part.text === ' ') node.dataset.nbsp = '';
      }
      output.append(node);
    }
  };
  for (const control of [input, language, american]) control.addEventListener('input', run);
  run();
}
