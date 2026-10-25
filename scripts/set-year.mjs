#!/usr/bin/env node
// Cambia l'anno del calendario: node scripts/set-year.mjs 2027
import { readFileSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const year = Number(process.argv[2]);
if (!Number.isInteger(year) || year < 2024 || year > 2100) {
  console.error('Uso: npm run set-year -- 2027');
  process.exit(1);
}
const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const appPath = path.join(root, 'config/app.json');
const contentPath = path.join(root, 'src/content/advent-content.json');
const app = JSON.parse(readFileSync(appPath, 'utf8'));
const content = JSON.parse(readFileSync(contentPath, 'utf8'));
app.year = year;
content.days.forEach((d) => { d.date = `${year}-12-${String(d.day).padStart(2, '0')}`; });
writeFileSync(appPath, JSON.stringify(app, null, 2) + '\n');
writeFileSync(contentPath, JSON.stringify(content, null, 2) + '\n');
console.log(`✔ Anno impostato a ${year} (config/app.json e date dei 25 giorni).`);
console.log('  Ricorda: i testi che citano giorni della settimana o il solstizio vanno controllati a mano.');
