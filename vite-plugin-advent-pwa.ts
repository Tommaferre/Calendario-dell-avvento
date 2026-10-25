import type { Plugin } from 'vite';
import { createHash } from 'node:crypto';
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import type { AppConfig } from './src/content/types.ts';

export function buildManifest(app: AppConfig, base: string) {
  return {
    id: base,
    name: app.appName,
    short_name: app.shortName,
    description: app.description,
    lang: 'it',
    start_url: '.',
    scope: '.',
    display: 'standalone',
    orientation: 'portrait',
    theme_color: app.themeColor,
    background_color: app.backgroundColor,
    icons: [
      { src: 'icons/icon-192.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
      { src: 'icons/icon-maskable-512.png', sizes: '512x512', type: 'image/png', purpose: 'maskable' },
    ],
  };
}

function walk(dir: string, root = dir): string[] {
  return readdirSync(dir).flatMap((name) => {
    const full = path.join(dir, name);
    return statSync(full).isDirectory() ? walk(full, root) : [path.relative(root, full).split(path.sep).join('/')];
  });
}

/** Genera manifest.webmanifest e sw.js dalla configurazione; sostituisce i segnaposto {{...}} nell'HTML. */
export function adventPwa(app: AppConfig, base: string): Plugin {
  let outDir = 'dist';
  const manifestJson = JSON.stringify(buildManifest(app, base), null, 2);
  return {
    name: 'advent-pwa',
    configResolved(config) {
      outDir = path.resolve(config.root, config.build.outDir);
    },
    transformIndexHtml(html) {
      return html
        .replaceAll('{{APP_NAME}}', app.appName)
        .replaceAll('{{DESCRIPTION}}', app.description)
        .replaceAll('{{THEME_COLOR}}', app.themeColor);
    },
    configureServer(server) {
      server.middlewares.use((req, res, next) => {
        if (req.url?.split('?')[0].endsWith('/manifest.webmanifest')) {
          res.setHeader('Content-Type', 'application/manifest+json');
          res.end(manifestJson);
        } else next();
      });
    },
    generateBundle() {
      this.emitFile({ type: 'asset', fileName: 'manifest.webmanifest', source: manifestJson });
    },
    closeBundle() {
      // Il service worker elenca tutti i file pubblicati: la versione della cache cambia a ogni modifica.
      const files = walk(outDir).filter((f) => f !== 'sw.js').sort();
      const hash = createHash('sha256');
      for (const f of files) hash.update(f).update(readFileSync(path.join(outDir, f)));
      const version = hash.digest('hex').slice(0, 12);
      const template = readFileSync(new URL('./src/sw.template.js', import.meta.url), 'utf8');
      const precache = ['./', ...files.map((f) => `./${f}`)];
      writeFileSync(
        path.join(outDir, 'sw.js'),
        template.replace('__VERSION__', version).replace('__PRECACHE__', JSON.stringify(precache)),
      );
    },
  };
}
