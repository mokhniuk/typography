import { afterAll, beforeAll, describe, expect, test } from 'bun:test';

/**
 * A smoke test for the font checker's script: it runs on load, and nothing can tell us whether it
 * throws there except running it. The browser here is a few dozen lines of stub — enough of an
 * element to let the page build its tables — so what this proves is that the script loads, finds
 * every element it asks for by id, and renders the tables, the verdict and the config for the state
 * it starts in (no font yet). The measuring itself is tested in `src/dom/glyphs.test.ts`.
 */

type Listener = () => void;

class El {
  tagName: string;
  children: El[] = [];
  dataset: Record<string, string> = {};
  attributes: Record<string, string> = {};
  style: Record<string, string> = {};
  listeners: Record<string, Listener[]> = {};
  textContent = '';
  innerHTML = '';
  value = '';
  checked = false;
  hidden = false;
  scope = '';
  lang = '';
  type = '';
  files: unknown[] | null = null;
  constructor(tag: string) {
    this.tagName = tag;
  }
  append(...nodes: El[]) {
    this.children.push(...nodes);
  }
  replaceChildren(...nodes: El[]) {
    this.children = [...nodes];
  }
  addEventListener(name: string, fn: Listener) {
    const list = this.listeners[name] ?? [];
    list.push(fn);
    this.listeners[name] = list;
  }
  setAttribute(name: string, value: string) {
    this.attributes[name] = value;
  }
  removeAttribute(name: string) {
    delete this.attributes[name];
  }
  insertAdjacentHTML() {}
  /** Only the selectors the page uses: a tag name, or an attribute in brackets. */
  querySelectorAll(selector: string): El[] {
    const all: El[] = [];
    const walk = (el: El) => {
      for (const child of el.children) {
        all.push(child);
        walk(child);
      }
    };
    walk(this);
    const attribute = /^\[([a-z-]+)\]$/.exec(selector)?.[1];
    return attribute
      ? all.filter((el) => camel(attribute) in el.dataset)
      : all.filter((el) => el.tagName === selector);
  }
}

const camel = (name: string) =>
  name.replace(/^data-/, '').replace(/-(.)/g, (_, c) => c.toUpperCase());

const ids = [
  'file',
  'installed',
  'fontState',
  'languages',
  'register',
  'quoteStyle',
  'optIn',
  'verdict',
  'coverage',
  'examples',
  'preset',
  'configText',
  'configCopy',
  'langsAll',
  'langsNone',
];
const made = new Map<string, El>();
const saved = {
  document: globalThis.document,
  localStorage: (globalThis as { localStorage?: unknown }).localStorage,
};

beforeAll(() => {
  for (const id of ids) made.set(id, new El('div'));
  (globalThis as { document?: unknown }).document = {
    getElementById: (id: string) => made.get(id) ?? null,
    createElement: (tag: string) => (tag === 'canvas' ? { getContext: () => null } : new El(tag)),
  };
  (globalThis as { localStorage?: unknown }).localStorage = {
    getItem: () => null,
    setItem: () => {},
  };
});
afterAll(() => {
  (globalThis as { document?: unknown }).document = saved.document;
  (globalThis as { localStorage?: unknown }).localStorage = saved.localStorage;
});

describe('the font checker page', () => {
  test('its script runs on load and renders the first state', async () => {
    await import('./main');
    const languages = made.get('languages') as El;
    // One checkbox per language, English checked to start with.
    expect(languages.children.length).toBeGreaterThan(20);
    const boxes = languages.querySelectorAll('input');
    expect(boxes.length).toBe(languages.children.length);
    expect(boxes.filter((box) => box.checked).length).toBe(1);

    // Without a font: the verdict asks for one, and the coverage table still lists the characters.
    expect((made.get('verdict') as El).children.length).toBe(1);
    const coverage = made.get('coverage') as El;
    expect(coverage.children.length).toBe(1);
    expect(coverage.children[0]?.tagName).toBe('table');
    const rows = coverage.children[0]?.querySelectorAll('tr') ?? [];
    expect(rows.length).toBeGreaterThan(10);

    // Nothing is avoided until a font is measured, so the config holds the language only.
    expect(JSON.parse((made.get('configText') as El).value)).toEqual({ lang: 'en' });
    expect((made.get('examples') as El).children[0]?.textContent).toContain('Load a font');
    expect((made.get('preset') as El).children[0]?.textContent).toContain('Load a font');
  });
});
