import { defineConfig } from 'vite';

// A static page: `vite build --config playground/vite.config.ts` writes playground/dist.
export default defineConfig({
  root: import.meta.dirname,
  base: './',
  build: { outDir: 'dist', emptyOutDir: true, target: 'es2022' },
});
