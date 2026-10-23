/**
 * Makes the images the site's head tags point at, in `apps/website/public/`:
 * `og.png` (1200 × 630, shown when a link to any page is shared), `apple-touch-icon.png` (180 × 180)
 * and `icon-192.png`. They are drawn in headless Chrome with the site's own font and are tracked in
 * git; run `bun run site:images` only when the design changes. Needs Google Chrome (set `CHROME`
 * to its path when it is not at the macOS default).
 */
import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { pathToFileURL } from 'node:url';

const SITE = join(import.meta.dirname, '..', 'apps', 'website');
const OUT = join(SITE, 'public');
const CHROME = process.env.CHROME ?? '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome';
const font = (weight: string): string =>
  pathToFileURL(join(SITE, 'fonts', 'KyivType', `KyivTypeSans-${weight}.woff2`)).href;

const faces = `
@font-face { font-family: "KyivType Sans"; font-weight: 400; src: url("${font('Regular')}"); }
@font-face { font-family: "KyivType Sans"; font-weight: 500; src: url("${font('Medium')}"); }
@font-face { font-family: "KyivType Sans"; font-weight: 700; src: url("${font('Bold')}"); }`;

// A boxed space stands for a no-break space, as it does on the site's rules page.
const card = `<!doctype html><meta charset="utf-8"><style>${faces}
* { box-sizing: border-box; margin: 0; }
body { width: 1200px; height: 630px; background: #0a0a0a; color: #f4f4f4; font-family: "KyivType Sans", sans-serif;
  padding: 48px 80px; position: relative; overflow: hidden; }
.mark { position: absolute; right: 48px; top: 130px; font-size: 520px; font-weight: 700; line-height: 1; color: #f2dc7d; }
h1 { position: relative; font-size: 76px; line-height: 88px; font-weight: 700; max-width: 760px; letter-spacing: -0.01em; }
h1 .q { color: #f2dc7d; }
h1 .hang { position: absolute; right: 100%; }
h1 { white-space: nowrap; }
h1 .nb { display: inline-block; width: 0.34em; height: 0.62em; margin: 0 0.04em; vertical-align: -0.02em;
  border: 4px solid #f2dc7d; border-radius: 4px; }
p { position: absolute; left: 80px; bottom: 56px; max-width: 720px; font-size: 34px; line-height: 44px; color: #9a9a9a; }
</style>
<div class="mark">«</div>
<h1><span class="q hang">«</span>Typography,<br>set the way<br>a<i class="nb"></i>typesetter would.<span class="q">»</span></h1>
<p>Typography Engine: quotes, dashes and no-break spaces in 27 languages.</p>`;

const icon = `<!doctype html><meta charset="utf-8"><style>
* { margin: 0; } body { width: 180px; height: 180px; background: #1c1a17; }
svg { width: 180px; height: 180px; display: block; }</style>
<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 32 32"><path d="M7 23v-6.6C7 11.6 9.6 8.6 13.6 7.9l.6 2.2c-2.2.6-3.3 2-3.4 4.2H14V23zm11 0v-6.6c0-4.8 2.6-7.8 6.6-8.5l.6 2.2c-2.2.6-3.3 2-3.4 4.2H25V23z" fill="#f7f4ee" transform="translate(-1 0)"/></svg>`;

const dir = mkdtempSync(join(tmpdir(), 'site-images-'));
mkdirSync(OUT, { recursive: true });

function shoot(html: string, name: string, width: number, height: number, scale = 1): void {
  const source = join(dir, `${name}.html`);
  writeFileSync(source, html);
  const result = Bun.spawnSync([
    CHROME,
    '--headless=new',
    '--hide-scrollbars',
    '--force-device-scale-factor=' + scale,
    `--window-size=${width},${height}`,
    '--virtual-time-budget=3000',
    `--screenshot=${join(OUT, name)}`,
    pathToFileURL(source).href,
  ]);
  if (result.exitCode !== 0) throw new Error(`Chrome failed on ${name}: ${result.stderr}`);
  console.log(`wrote apps/website/public/${name}`);
}

shoot(card, 'og.png', 1200, 630);
shoot(icon, 'apple-touch-icon.png', 180, 180);
// 192 px from the same 180 px drawing, scaled by the device factor.
shoot(icon, 'icon-192.png', 180, 180, 192 / 180);
