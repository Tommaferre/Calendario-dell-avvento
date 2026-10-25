import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import { readFileSync } from 'node:fs';
import { getBasePath } from './src/lib/links.ts';
import { adventPwa } from './vite-plugin-advent-pwa.ts';
import type { AppConfig } from './src/content/types.ts';

const app: AppConfig = JSON.parse(readFileSync(new URL('./config/app.json', import.meta.url), 'utf8'));

export default defineConfig(({ command }) => {
  // Base path derivato dall'URL pubblico (https://utente.github.io/repo/ → /repo/).
  // Si può sovrascrivere con VITE_BASE (es. VITE_BASE=/ per un dominio personalizzato).
  const base = command === 'build' ? (process.env.VITE_BASE ?? getBasePath(app.publicUrl)) : '/';
  return {
    base,
    plugins: [react(), adventPwa(app, base)],
    build: { outDir: 'dist', sourcemap: false },
    test: {
      environment: 'jsdom',
      setupFiles: ['./tests/setup.ts'],
      include: ['tests/**/*.test.{ts,tsx}'],
      css: false,
    },
  };
});
