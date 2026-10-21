import { defineConfig } from 'vite';
import { website } from './build/plugin';

// A static site: `vite build --config apps/website/vite.config.ts` writes apps/website/dist.
export default defineConfig({
  root: import.meta.dirname,
  base: './',
  plugins: [website()],
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2022' },
});
