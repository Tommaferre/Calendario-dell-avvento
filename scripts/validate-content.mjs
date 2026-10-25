#!/usr/bin/env node
// Valida config/app.json e src/content/advent-content.json (struttura + esistenza dei file citati).
import { readFileSync, existsSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { validateContent, collectAssetPaths } from '../src/content/types.ts';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const app = JSON.parse(readFileSync(path.join(root, 'config/app.json'), 'utf8'));
const content = JSON.parse(readFileSync(path.join(root, 'src/content/advent-content.json'), 'utf8'));

const errors = validateContent(content, app);
for (const rel of collectAssetPaths(content)) {
  if (!existsSync(path.join(root, 'public', rel))) errors.push(`File mancante: public/${rel}`);
}
if (errors.length) {
  console.error(`✖ ${errors.length} problemi trovati:\n` + errors.map((e) => ` - ${e}`).join('\n'));
  process.exit(1);
}
console.log(`✔ Contenuti validi: ${content.days.length} giorni, anno ${app.year}.`);
