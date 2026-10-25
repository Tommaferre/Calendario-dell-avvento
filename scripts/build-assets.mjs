// Genera tutte le illustrazioni SVG locali del progetto: nessuna immagine
// remota, nessun placeholder "da completare". Esegui con:
//   node scripts/build-assets.mjs

import { writeFileSync, mkdirSync } from "node:fs";
import { fileURLToPath } from "node:url";
import path from "node:path";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const ADVENT_DIR = path.join(__dirname, "..", "public", "assets", "advent");
const ICONS_DIR = path.join(__dirname, "..", "public", "icons");
mkdirSync(ADVENT_DIR, { recursive: true });
mkdirSync(ICONS_DIR, { recursive: true });

const PALETTE = {
  fir: "#1f4d3a",
  firDark: "#163a2b",
  bordeaux: "#7a2335",
  cream: "#fbf4e6",
  gold: "#c9a24b",
  goldLight: "#e3c57a",
};

const write = (dir, name, content) => writeFileSync(path.join(dir, name), content, "utf-8");

// Semplice PRNG seminato, così ogni giorno ha una variazione coerente
// ma deterministica (niente dipendenze esterne per la grafica).
function mulberry32(seed) {
  return function () {
    seed |= 0;
    seed = (seed + 0x6d2b79f5) | 0;
    let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function ornament(rand, cx, cy, r, fill) {
  return `<circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}" opacity="${(0.55 + rand() * 0.35).toFixed(2)}"/>`;
}

function star(cx, cy, r, fill) {
  const points = [];
  for (let i = 0; i < 10; i++) {
    const angle = (Math.PI / 5) * i - Math.PI / 2;
    const rad = i % 2 === 0 ? r : r * 0.45;
    points.push(`${(cx + Math.cos(angle) * rad).toFixed(1)},${(cy + Math.sin(angle) * rad).toFixed(1)}`);
  }
  return `<polygon points="${points.join(" ")}" fill="${fill}"/>`;
}

function dayIllustration(day) {
  const rand = mulberry32(day * 97 + 13);
  const w = 400, h = 300;
  let ornaments = "";
  const count = 5 + Math.floor(rand() * 4);
  for (let i = 0; i < count; i++) {
    const cx = 40 + rand() * (w - 80);
    const cy = 60 + rand() * (h - 160);
    const r = 6 + rand() * 10;
    const colors = [PALETTE.gold, PALETTE.goldLight, PALETTE.bordeaux, "#ffffff"];
    ornaments += ornament(rand, cx, cy, r, colors[Math.floor(rand() * colors.length)]);
  }
  // Albero stilizzato, sempre presente ma con leggere variazioni di forma
  const treeShift = (rand() - 0.5) * 10;
  const tiers = [
    { y: 230, w: 170 },
    { y: 185, w: 130 },
    { y: 140, w: 90 },
  ];
  const treeX = w / 2 + treeShift;
  let tree = "";
  for (const t of tiers) {
    tree += `<polygon points="${treeX},${t.y - 70} ${treeX - t.w / 2},${t.y} ${treeX + t.w / 2},${t.y}" fill="${PALETTE.fir}"/>`;
  }
  tree += `<rect x="${treeX - 10}" y="230" width="20" height="26" rx="3" fill="${PALETTE.bordeaux}"/>`;
  tree += star(treeX, 90, 18, PALETTE.gold);

  const dayLabel = String(day).padStart(2, "0");

  return `<svg viewBox="0 0 ${w} ${h}" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrazione giorno ${day}">
  <defs>
    <linearGradient id="bg${day}" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="${PALETTE.cream}"/>
      <stop offset="100%" stop-color="#f4e6cc"/>
    </linearGradient>
  </defs>
  <rect width="${w}" height="${h}" fill="url(#bg${day})"/>
  <g>${ornaments}</g>
  ${tree}
  <circle cx="60" cy="50" r="22" fill="${PALETTE.gold}" opacity="0.18"/>
  <circle cx="340" cy="260" r="30" fill="${PALETTE.bordeaux}" opacity="0.12"/>
  <text x="${w - 20}" y="${h - 16}" text-anchor="end" font-family="Georgia, 'Times New Roman', serif" font-size="22" fill="${PALETTE.firDark}" opacity="0.55">${dayLabel}</text>
</svg>`;
}

for (let day = 1; day <= 25; day++) {
  write(ADVENT_DIR, `day-${String(day).padStart(2, "0")}.svg`, dayIllustration(day));
}

// Illustrazione principale del calendario (hero)
const hero = `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrazione principale del calendario dell'avvento">
  <defs>
    <linearGradient id="heroBg" x1="0" y1="0" x2="0" y2="1">
      <stop offset="0%" stop-color="#163a2b"/>
      <stop offset="100%" stop-color="${PALETTE.fir}"/>
    </linearGradient>
  </defs>
  <rect width="800" height="450" fill="url(#heroBg)"/>
  ${Array.from({ length: 60 }, (_, i) => {
    const rand = mulberry32(i * 13 + 4);
    const cx = rand() * 800, cy = rand() * 450, r = 0.8 + rand() * 1.6;
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="${r.toFixed(1)}" fill="#ffffff" opacity="${(0.15 + rand() * 0.4).toFixed(2)}"/>`;
  }).join("")}
  <polygon points="400,120 330,280 470,280" fill="#2a5c44"/>
  <polygon points="400,170 350,300 450,300" fill="${PALETTE.fir}"/>
  <polygon points="400,220 365,330 435,330" fill="#2a5c44"/>
  <rect x="385" y="330" width="30" height="40" rx="4" fill="${PALETTE.bordeaux}"/>
  ${star(400, 95, 26, PALETTE.gold)}
  ${[...Array(14)].map((_, i) => {
    const rand = mulberry32(i * 31 + 7);
    const cx = 340 + rand() * 120;
    const cy = 150 + rand() * 170;
    const colors = [PALETTE.gold, PALETTE.goldLight, "#f4f1ea", PALETTE.bordeaux];
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="5" fill="${colors[i % colors.length]}"/>`;
  }).join("")}
  <rect x="60" y="370" width="680" height="3" fill="${PALETTE.gold}" opacity="0.3"/>
  <text x="400" y="415" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" fill="${PALETTE.cream}">Il nostro dicembre</text>
</svg>`;
write(path.join(__dirname, "..", "public", "assets", "advent"), "hero.svg", hero);

// Grafica speciale per il 25 dicembre
const finalArt = `<svg viewBox="0 0 800 450" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Illustrazione speciale del 25 dicembre">
  <defs>
    <radialGradient id="glow" cx="50%" cy="35%" r="70%">
      <stop offset="0%" stop-color="#3a7357"/>
      <stop offset="100%" stop-color="${PALETTE.firDark}"/>
    </radialGradient>
  </defs>
  <rect width="800" height="450" fill="url(#glow)"/>
  ${star(400, 90, 40, PALETTE.gold)}
  ${[...Array(10)].map((_, i) => {
    const angle = (i / 10) * Math.PI * 2;
    const r = 70;
    const cx = 400 + Math.cos(angle) * r;
    const cy = 90 + Math.sin(angle) * r;
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="2.5" fill="${PALETTE.goldLight}"/>`;
  }).join("")}
  <polygon points="400,150 300,330 500,330" fill="${PALETTE.fir}"/>
  <polygon points="400,190 330,350 470,350" fill="#2a5c44"/>
  <rect x="378" y="350" width="44" height="48" rx="5" fill="${PALETTE.bordeaux}"/>
  ${[...Array(20)].map((_, i) => {
    const rand = mulberry32(i * 19 + 2);
    const cx = 320 + rand() * 160;
    const cy = 170 + rand() * 170;
    const colors = [PALETTE.gold, PALETTE.goldLight, "#ffffff", PALETTE.bordeaux];
    return `<circle cx="${cx.toFixed(1)}" cy="${cy.toFixed(1)}" r="4.5" fill="${colors[i % colors.length]}"/>`;
  }).join("")}
  <text x="400" y="430" text-anchor="middle" font-family="Georgia, 'Times New Roman', serif" font-size="30" fill="${PALETTE.cream}">Buon Natale</text>
</svg>`;
write(ADVENT_DIR, "day-25-special.svg", finalArt);

// Schermate per i minigiochi
write(ADVENT_DIR, "game-quiz.svg", `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Quiz romantico">
  <rect width="400" height="260" fill="${PALETTE.cream}"/>
  <circle cx="200" cy="100" r="60" fill="${PALETTE.fir}" opacity="0.12"/>
  <text x="200" y="112" text-anchor="middle" font-family="Georgia, serif" font-size="54" fill="${PALETTE.bordeaux}">?</text>
  <text x="200" y="200" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="${PALETTE.firDark}">Quiz romantico</text>
</svg>`);

write(ADVENT_DIR, "game-memory.svg", `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Memory natalizio">
  <rect width="400" height="260" fill="${PALETTE.cream}"/>
  ${[0, 1, 2, 3].map((i) => {
    const x = 100 + (i % 2) * 110;
    const y = 60 + Math.floor(i / 2) * 90;
    return `<rect x="${x}" y="${y}" width="90" height="70" rx="10" fill="${PALETTE.fir}" opacity="0.85"/>`;
  }).join("")}
  <text x="200" y="230" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="${PALETTE.firDark}">Memory natalizio</text>
</svg>`);

write(ADVENT_DIR, "game-riddle.svg", `<svg viewBox="0 0 400 260" xmlns="http://www.w3.org/2000/svg" role="img" aria-label="Indovinello">
  <rect width="400" height="260" fill="${PALETTE.cream}"/>
  <circle cx="200" cy="110" r="55" fill="${PALETTE.bordeaux}" opacity="0.12"/>
  <text x="200" y="122" text-anchor="middle" font-family="Georgia, serif" font-size="46" fill="${PALETTE.fir}">?!</text>
  <text x="200" y="210" text-anchor="middle" font-family="Georgia, serif" font-size="20" fill="${PALETTE.firDark}">Indovinello</text>
</svg>`);

// Decorazioni riutilizzabili piccole
write(path.join(__dirname, "..", "public", "assets", "advent"), "deco-holly.svg", `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">
  <ellipse cx="22" cy="30" rx="14" ry="8" fill="${PALETTE.fir}" transform="rotate(-20 22 30)"/>
  <ellipse cx="38" cy="30" rx="14" ry="8" fill="${PALETTE.fir}" transform="rotate(20 38 30)"/>
  <circle cx="30" cy="34" r="4" fill="${PALETTE.bordeaux}"/>
  <circle cx="24" cy="40" r="4" fill="${PALETTE.bordeaux}"/>
  <circle cx="36" cy="40" r="4" fill="${PALETTE.bordeaux}"/>
</svg>`);

write(path.join(__dirname, "..", "public", "assets", "advent"), "deco-star.svg", `<svg viewBox="0 0 60 60" xmlns="http://www.w3.org/2000/svg" aria-hidden="true">${star(30, 30, 24, PALETTE.gold)}</svg>`);

// Icone PWA (192 e 512), in SVG: verranno referenziate anche come "maschera"
function iconSvg(size) {
  const r = size * 0.22;
  return `<svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}" xmlns="http://www.w3.org/2000/svg">
  <rect width="${size}" height="${size}" rx="${r}" fill="${PALETTE.fir}"/>
  <g transform="translate(${size / 2}, ${size * 0.58})">
    <polygon points="0,${-size * 0.32} ${-size * 0.24},${size * 0.08} ${size * 0.24},${size * 0.08}" fill="${PALETTE.cream}"/>
    <polygon points="0,${-size * 0.2} ${-size * 0.17},${size * 0.16} ${size * 0.17},${size * 0.16}" fill="${PALETTE.goldLight}"/>
    <rect x="${-size * 0.045}" y="${size * 0.16}" width="${size * 0.09}" height="${size * 0.1}" fill="${PALETTE.bordeaux}"/>
  </g>
  ${star(size / 2, size * 0.22, size * 0.07, PALETTE.gold)}
</svg>`;
}
write(ICONS_DIR, "icon.svg", iconSvg(512));
write(ICONS_DIR, "icon-192.svg", iconSvg(192));
write(ICONS_DIR, "icon-512.svg", iconSvg(512));
write(ICONS_DIR, "maskable-icon-512.svg", iconSvg(512));

console.log("Asset SVG generati in public/assets/advent e public/icons.");
