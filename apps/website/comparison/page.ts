import { FIXES, LANGS, PROFILE, REGEX, ROWS, SAMPLES, SCORE, SIZES, TOOLS, WHY } from './data.ts';

/**
 * The comparison page: its tables, bars and cards are drawn from `data.ts` on load, so a number is
 * changed in one place. The markup it fills is `index.html`, by id.
 */

const SHORT: Partial<Record<string, string>> = { 'retext-smartypants': 'retext-smarty' };
const nm = (t: string): string => SHORT[t] ?? t;

const $ = (id: string): HTMLElement => {
  const el = document.getElementById(id);
  if (!el) throw new Error(`comparison: no element #${id}`);
  return el;
};
const esc = (s: string): string =>
  String(s).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;');
const fmt = (n: number): string =>
  n >= 1e6
    ? `${(n / 1e6).toFixed(1)}M`
    : n >= 100
      ? Math.round(n).toLocaleString('en-US')
      : n >= 10
        ? n.toFixed(0)
        : n.toFixed(n < 1 ? 1 : 0);
/** A no-break space typed as `~` in the data, drawn as a mark. */
const nb = (s: string): string => esc(s).replace(/~/g, '<mark title="no-break space">·</mark>');
const me = (yes: boolean): string => (yes ? ' data-me' : '');

type BarOptions = { me?: boolean; est?: boolean; title?: string; track?: string };
const bar = (name: string, width: number, value: string, opts: BarOptions = {}): string =>
  `<li${me(opts.me ?? false)}><span title="${opts.title ?? name}">${name}</span><div${opts.track ? ` title="${opts.track}"` : ''}><div${opts.est ? ' data-est' : ''} style="width:${width}%"></div></div><data>${value}</data></li>`;
const card = (title: string, tag: string, text: string): string =>
  `<article><h3>${title}<small>${tag}</small></h3><p>${text}</p></article>`;

/* ---------- score bars ---------- */
$('scoreBars').innerHTML = SCORE.map(([name, pass, of, mine]) => {
  const pct = Math.round((pass / of) * 100);
  return bar(name, (pass / of) * 100, `${pass} / ${of} <small>${pct}%</small>`, { me: mine });
}).join('');

/* ---------- matrix ---------- */
const SYM = { Y: ['y', '✓', 'yes'], P: ['p', '◐', 'partly'], N: ['n', '✕', 'no'] } as const;
const totals: number[] = TOOLS.map(() => 0);
let rows = 0;
let matrix = `<thead><tr><th>Feature</th>${TOOLS.map((t, i) => `<th${me(i === 0)}>${nm(t)}</th>`).join('')}</tr></thead><tbody>`;
for (const row of ROWS) {
  if (row.length === 2) {
    matrix += `<tr><th scope="rowgroup" colspan="${TOOLS.length + 1}">${row[1]}</th></tr>`;
    continue;
  }
  rows++;
  matrix += `<tr><td>${row[0]}${row[1] ? `<small>${row[1]}</small>` : ''}</td>`;
  [...row[2]].forEach((c, i) => {
    const key = c as keyof typeof SYM;
    totals[i] = (totals[i] ?? 0) + (key === 'Y' ? 1 : key === 'P' ? 0.5 : 0);
    const [mark, glyph, word] = SYM[key];
    matrix += `<td${me(i === 0)}><span data-mark="${mark}" aria-hidden="true">${glyph}</span><span class="sr-only">${word}</span></td>`;
  });
  matrix += '</tr>';
}
matrix += `</tbody><tfoot><tr><td>Features (✓ = 1, ◐ = ½) of ${rows}</td>${totals.map((t, i) => `<td${me(i === 0)}>${t % 1 ? t.toFixed(1) : t}</td>`).join('')}</tr></tfoot>`;
$('matrix').innerHTML = matrix;

/* ---------- samples ---------- */
$('sampleList').innerHTML = SAMPLES.map((s) => {
  const list = TOOLS.map((t) => {
    const v = s.out[t];
    return `<dt${me(t === '@mokhniuk/typography')}>${nm(t)}</dt>${v == null ? '<dd data-na>not applicable</dd>' : `<dd>${nb(v)}</dd>`}`;
  }).join('');
  return `<details><summary><b>${esc(s.name)}</b><code>${esc(s.in)}</code></summary><dl>${list}</dl></details>`;
}).join('');

/* ---------- speed ---------- */
let size = Object.keys(SIZES)[0] as string;
function drawSpeed(): void {
  const cfg = SIZES[size];
  if (!cfg) return;
  const items = TOOLS.map((t) => {
    const raw = cfg.data[t];
    return typeof raw === 'number'
      ? { t, v: raw, est: false, label: null }
      : { t, v: raw[0], est: true, label: raw[1] };
  });
  const values = items.map((i) => i.v);
  const lo = 10 ** (Math.floor(Math.log10(Math.min(...values))) - 0.3);
  const hi = 10 ** Math.ceil(Math.log10(Math.max(...values)));
  const pos = (v: number) =>
    ((Math.log10(v) - Math.log10(lo)) / (Math.log10(hi) - Math.log10(lo))) * 100;
  const base = cfg.data.typograf as number | readonly [number, string];
  const baseValue = typeof base === 'number' ? base : base[0];
  $('speedBars').innerHTML = [...items]
    .sort((a, b) => a.v - b.v)
    .map((i) => {
      const ratio = i.v / baseValue;
      const mult =
        i.t === 'typograf' ? '' : ` <small>${ratio.toFixed(ratio < 10 ? 1 : 0)}×</small>`;
      const txt = i.label ?? `${fmt(i.v)} ${cfg.unit}`;
      return bar(nm(i.t), Math.max(1, pos(i.v)), `${txt}${mult}`, {
        me: i.t === '@mokhniuk/typography',
        est: i.est,
        track: `${nm(i.t)}: ${txt}`,
      });
    })
    .join('');
  const steps: string[] = [];
  for (let e = Math.ceil(Math.log10(lo)); e <= Math.floor(Math.log10(hi)); e++)
    steps.push(`${fmt(10 ** e)} ${cfg.unit}`);
  $('speedLegend').innerHTML =
    `<span>${cfg.note}; axis from ${steps[0]} to ${steps[steps.length - 1]}, logarithmic</span><span>small figure: multiple of typograf</span>`;
  for (const b of $('sizeSeg').querySelectorAll('button'))
    b.setAttribute('aria-pressed', String(b.dataset.k === size));
}
$('sizeSeg').insertAdjacentHTML(
  'beforeend',
  Object.keys(SIZES)
    .map((k) => `<button type="button" data-k="${k}" aria-pressed="false">${k}</button>`)
    .join(''),
);
$('sizeSeg').addEventListener('click', (e) => {
  const b = (e.target as Element).closest('button');
  if (b?.dataset.k) {
    size = b.dataset.k;
    drawSpeed();
  }
});
drawSpeed();

/* ---------- why ---------- */
$('regexTable').innerHTML =
  `<thead><tr><th>Tool</th><th>Unicode <code>\\p{…}</code> classes</th><th>Lookbehinds</th><th>Time, English</th></tr></thead><tbody>${REGEX.map(([t, p, l, ms]) => `<tr><td>${t}</td><td>${p == null ? 'not counted' : p}</td><td>${l}</td><td>${ms}</td></tr>`).join('')}</tbody>`;
$('whyCards').innerHTML = WHY.map(([t, tag, txt]) => card(t, tag, txt)).join('');

/* ---------- profile ---------- */
$('profileBars').innerHTML = PROFILE.map(([n, p, ms]) =>
  bar(`<code>${n}</code>`, (p / 30) * 100, `${ms} ms <small>${p}%</small>`, { me: true, title: n }),
).join('');
$('fixCards').innerHTML = FIXES.map(([n, t, txt]) => card(t, n, txt)).join('');

/* ---------- languages ---------- */
const WHO = [...TOOLS.slice(0, 6), 'retext'] as const;
const has = (who: string, w: string): boolean => who.split(' ').includes(w);
const counts = WHO.map((w) => LANGS.rows.filter((r) => has(r[3], w)).length);
$('langTable').innerHTML =
  `<thead><tr><th>Language</th>${WHO.map((w, i) => `<th${me(i === 0)}>${w === 'retext' ? 'retext-smarty' : w}</th>`).join('')}</tr></thead><tbody>${LANGS.rows
    .map(
      ([c, n, , who]) =>
        `<tr><td>${n} <small data-inline>${c}</small></td>${WHO.map((w, i) => {
          const y = has(who, w);
          return `<td${me(i === 0)}><span data-mark="${y ? 'y' : 'n'}" aria-hidden="true">${y ? '✓' : '·'}</span><span class="sr-only">${y ? 'yes' : 'no'}</span></td>`;
        }).join('')}</tr>`,
    )
    .join(
      '',
    )}</tbody><tfoot><tr><td>Of these 26 rows</td>${counts.map((c, i) => `<td${me(i === 0)}>${c}</td>`).join('')}</tr></tfoot>`;
$('langTiers').innerHTML =
  `Counting English and US English separately, so a tool that has English only gets one of the two. typograf ships 29 locales in all, tipograph 16, typopo 6 (en-US, de-DE, de-CH, sk, cs, rue), richtypo 3 (en, fr, ru); smartypants and retext-smartypants one each. @mokhniuk/typography is the only tool with a pack for Croatian, Lithuanian and Maltese. Counts for the other tools are from the 0.1.1 comparison and were not re-checked; <code>apps/bench/RESULTS.md</code> counts 21 of 26 for typograf by a slightly different rule.`;
