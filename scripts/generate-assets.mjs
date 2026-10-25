#!/usr/bin/env node
/**
 * Genera tutte le illustrazioni originali (SVG) e le icone PWA (PNG, via "sharp" se disponibile).
 * Uso:  node scripts/generate-assets.mjs
 * Gli SVG sono già inclusi nel repository: rigenerali solo se modifichi questo file.
 */
import { mkdirSync, writeFileSync } from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const out = (rel, data) => {
  const f = path.join(root, 'public', rel);
  mkdirSync(path.dirname(f), { recursive: true });
  writeFileSync(f, data);
};

const C = {
  abete: '#123a2f', abeteScuro: '#0b241d', abeteChiaro: '#2d6a54',
  bordeaux: '#7b2233', bordeauxScuro: '#561522', bordeauxChiaro: '#a8394d',
  crema: '#f5ead3', cremaScura: '#e6d3ab', oro: '#c8a24b', oroChiaro: '#ecd081', neve: '#fffaf0', notte: '#1d2b3a',
};
const svg = (w, h, body, title) =>
  `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 ${w} ${h}" role="img" aria-label="${title}"><title>${title}</title>${body}</svg>\n`;

/* ------------------------------------------------------------ motivi (centro 200,200) */
const star5 = (cx, cy, R, r, fill, extra = '') => {
  const pts = Array.from({ length: 10 }, (_, i) => {
    const a = (Math.PI / 5) * i - Math.PI / 2; const rad = i % 2 ? r : R;
    return `${(cx + rad * Math.cos(a)).toFixed(1)},${(cy + rad * Math.sin(a)).toFixed(1)}`;
  }).join(' ');
  return `<polygon points="${pts}" fill="${fill}" stroke-linejoin="round" ${extra}/>`;
};
const heart = (cx, cy, s, fill) =>
  `<path transform="translate(${cx} ${cy}) scale(${s})" d="M0 28 C-40 -2 -26 -34 -2 -22 C0 -20 0 -18 0 -16 C0 -18 0 -20 2 -22 C26 -34 40 -2 0 28Z" fill="${fill}"/>`;
const bauble = (cx, cy, r, fill, hi = C.neve) =>
  `<rect x="${cx - 7}" y="${cy - r - 12}" width="14" height="12" rx="3" fill="${C.oro}"/><circle cx="${cx}" cy="${cy}" r="${r}" fill="${fill}"/><ellipse cx="${cx - r * 0.35}" cy="${cy - r * 0.35}" rx="${r * 0.22}" ry="${r * 0.14}" fill="${hi}" opacity=".55" transform="rotate(-35 ${cx - r * 0.35} ${cy - r * 0.35})"/>`;
const snowflake = (cx, cy, r, color) => {
  let s = `<g stroke="${color}" stroke-width="${Math.max(3, r / 12)}" stroke-linecap="round" fill="none">`;
  for (let i = 0; i < 6; i++) {
    s += `<g transform="rotate(${i * 60} ${cx} ${cy})"><line x1="${cx}" y1="${cy}" x2="${cx}" y2="${cy - r}"/><polyline points="${cx - r * .22},${cy - r * .62} ${cx},${cy - r * .8} ${cx + r * .22},${cy - r * .62}"/><polyline points="${cx - r * .16},${cy - r * .34} ${cx},${cy - r * .5} ${cx + r * .16},${cy - r * .34}"/></g>`;
  }
  return s + '</g>';
};
const giftBox = (cx, cy, w, h, body, ribbon) =>
  `<rect x="${cx - w / 2}" y="${cy - h / 2}" width="${w}" height="${h}" rx="6" fill="${body}"/><rect x="${cx - w / 12}" y="${cy - h / 2}" width="${w / 6}" height="${h}" fill="${ribbon}"/><rect x="${cx - w / 2 - 4}" y="${cy - h / 2 - 12}" width="${w + 8}" height="22" rx="5" fill="${body}" stroke="${ribbon}" stroke-width="0"/><rect x="${cx - w / 12}" y="${cy - h / 2 - 12}" width="${w / 6}" height="22" fill="${ribbon}"/><path d="M${cx} ${cy - h / 2 - 12} C${cx - 36} ${cy - h / 2 - 50} ${cx - 50} ${cy - h / 2 - 8} ${cx} ${cy - h / 2 - 12} C${cx + 36} ${cy - h / 2 - 50} ${cx + 50} ${cy - h / 2 - 8} ${cx} ${cy - h / 2 - 12}Z" fill="${ribbon}"/>`;

const motifs = {
  tree: () => `<rect x="188" y="300" width="24" height="34" rx="3" fill="${C.bordeauxScuro}"/><polygon points="200,92 270,190 130,190" fill="${C.abeteChiaro}"/><polygon points="200,140 285,248 115,248" fill="#27614c"/><polygon points="200,190 300,310 100,310" fill="#1e5441"/>${star5(200, 90, 20, 9, C.oroChiaro)}${[[170, 200, C.bordeauxChiaro], [225, 230, C.oroChiaro], [150, 285, C.oroChiaro], [240, 290, C.bordeauxChiaro], [200, 262, C.neve]].map(([x, y, c]) => `<circle cx="${x}" cy="${y}" r="8" fill="${c}"/>`).join('')}`,
  star: () => `<circle cx="200" cy="200" r="110" fill="${C.oroChiaro}" opacity=".18"/><circle cx="200" cy="200" r="72" fill="${C.oroChiaro}" opacity=".22"/>${star5(200, 205, 92, 40, C.oro)}${star5(200, 205, 60, 26, C.oroChiaro)}`,
  envelope: () => `<rect x="90" y="140" width="220" height="150" rx="10" fill="${C.crema}"/><polyline points="90,148 200,236 310,148" fill="none" stroke="${C.cremaScura}" stroke-width="6" stroke-linejoin="round"/>${heart(200, 232, 1.1, C.bordeaux)}`,
  cocoa: () => `<g fill="none" stroke="${C.neve}" stroke-width="7" stroke-linecap="round" opacity=".7"><path d="M170 150c-14-18 14-30 0-50"/><path d="M205 150c-14-18 14-30 0-50"/><path d="M240 150c-14-18 14-30 0-50"/></g><path d="M120 175h160v70c0 40-30 68-80 68s-80-28-80-68z" fill="${C.crema}"/><path d="M120 175h160v22H120z" fill="${C.bordeaux}"/><path d="M280 195c42-6 44 56 0 62" fill="none" stroke="${C.crema}" stroke-width="14" stroke-linecap="round"/><ellipse cx="160" cy="172" rx="22" ry="10" fill="${C.neve}"/><ellipse cx="205" cy="168" rx="24" ry="11" fill="${C.neve}"/><ellipse cx="248" cy="173" rx="20" ry="9" fill="${C.neve}"/>`,
  candycane: () => `<path d="M250 330V160a60 60 0 0 0-120 0" fill="none" stroke="${C.neve}" stroke-width="42" stroke-linecap="round"/><path d="M250 330V160a60 60 0 0 0-120 0" fill="none" stroke="${C.bordeauxChiaro}" stroke-width="42" stroke-linecap="round" stroke-dasharray="22 30"/>`,
  bell: () => `<path d="M200 96c-70 0-84 70-84 110 0 30-28 40-28 62h224c0-22-28-32-28-62 0-40-14-110-84-110z" fill="${C.oro}"/><path d="M200 96c-40 0-60 40-62 90" fill="none" stroke="${C.oroChiaro}" stroke-width="10" stroke-linecap="round" opacity=".8"/><circle cx="200" cy="300" r="22" fill="${C.oroChiaro}"/><circle cx="200" cy="88" r="12" fill="${C.oroChiaro}"/><path d="M96 118c20-20 50-6 40 20M304 118c-20-20-50-6-40 20" fill="none" stroke="${C.bordeauxChiaro}" stroke-width="12" stroke-linecap="round"/>`,
  snow: () => snowflake(200, 200, 118, C.neve),
  film: () => `<rect x="86" y="170" width="228" height="140" rx="10" fill="${C.crema}"/><rect x="86" y="110" width="228" height="48" rx="8" fill="${C.notte}" stroke="${C.oro}" stroke-width="4"/>${[0, 1, 2, 3, 4].map((i) => `<polygon points="${100 + i * 46},158 ${130 + i * 46},158 ${146 + i * 46},110 ${116 + i * 46},110" fill="${i % 2 ? C.oro : C.neve}"/>`).join('')}${heart(200, 250, 1.4, C.bordeaux)}`,
  mitten: () => `<path d="M140 320V210c-24-18-20-60 10-62 10 0 20 8 22 22l-4-60c0-26 36-26 40 0l6 40 6-34c4-24 38-18 36 6l-4 38 18-16c20-12 40 6 28 28l-38 68v80z" fill="${C.bordeaux}"/><rect x="132" y="296" width="156" height="42" rx="8" fill="${C.crema}"/><path d="M150 316h120" stroke="${C.cremaScura}" stroke-width="5" stroke-dasharray="8 10"/>${star5(210, 240, 22, 10, C.oroChiaro)}`,
  baubles: () => bauble(140, 230, 44, C.bordeauxChiaro) + bauble(215, 190, 56, C.oro, C.neve) + bauble(280, 250, 38, C.abeteChiaro) + `<path d="M104 120c60 20 120 20 190 0" fill="none" stroke="${C.oro}" stroke-width="3"/>`,
  lights: () => `<path d="M40 130c80 50 240 50 320 0" fill="none" stroke="${C.abeteScuro}" stroke-width="4"/>${[0, 1, 2, 3, 4, 5, 6].map((i) => { const x = 62 + i * 46; const y = 136 + Math.sin((i / 6) * Math.PI) * 40; const col = [C.oroChiaro, C.bordeauxChiaro, C.neve][i % 3]; return `<circle cx="${x}" cy="${y + 26}" r="26" fill="${col}" opacity=".22"/><ellipse cx="${x}" cy="${y + 20}" rx="10" ry="15" fill="${col}"/>`; }).join('')}<rect x="150" y="240" width="100" height="70" rx="6" fill="${C.bordeaux}"/><rect x="195" y="240" width="10" height="70" fill="${C.oro}"/>`,
  gift: () => giftBox(200, 240, 170, 110, C.bordeaux, C.oro),
  lamp: () => `<rect x="190" y="150" width="20" height="170" rx="6" fill="${C.notte}" stroke="${C.oro}" stroke-width="3"/><rect x="160" y="310" width="80" height="18" rx="6" fill="${C.notte}" stroke="${C.oro}" stroke-width="3"/><path d="M165 150h70l-12-44h-46z" fill="${C.oroChiaro}"/><circle cx="200" cy="130" r="80" fill="${C.oroChiaro}" opacity=".2"/><polygon points="160,100 240,100 200,70" fill="${C.notte}" stroke="${C.oro}" stroke-width="3"/>`,
  letter: () => `<rect x="86" y="130" width="228" height="160" rx="10" fill="${C.crema}"/><polyline points="86,138 200,228 314,138" fill="none" stroke="${C.cremaScura}" stroke-width="6" stroke-linejoin="round"/><circle cx="200" cy="222" r="30" fill="${C.bordeaux}"/><circle cx="200" cy="222" r="21" fill="none" stroke="${C.bordeauxChiaro}" stroke-width="3"/>${heart(200, 220, .42, C.oroChiaro)}`,
  owl: () => `<ellipse cx="200" cy="230" rx="86" ry="100" fill="#6d4c35"/><ellipse cx="200" cy="250" rx="52" ry="68" fill="${C.cremaScura}"/><circle cx="165" cy="190" r="32" fill="${C.neve}"/><circle cx="235" cy="190" r="32" fill="${C.neve}"/><circle cx="165" cy="192" r="14" fill="${C.notte}"/><circle cx="235" cy="192" r="14" fill="${C.notte}"/><polygon points="188,212 212,212 200,236" fill="${C.oro}"/><polygon points="130,140 156,162 124,172" fill="#6d4c35"/><polygon points="270,140 244,162 276,172" fill="#6d4c35"/><path d="M96 330h208" stroke="${C.bordeauxScuro}" stroke-width="12" stroke-linecap="round"/>`,
  stocking: () => `<path d="M150 110h90v130c0 20 10 28 40 40 24 10 24 48-4 52-34 6-90-6-110-34-14-20-16-40-16-60z" fill="${C.bordeauxChiaro}"/><rect x="140" y="96" width="110" height="38" rx="10" fill="${C.crema}"/><path d="M150 300c30 18 76 22 102 8" fill="none" stroke="${C.crema}" stroke-width="12" stroke-linecap="round" opacity=".7"/>${star5(200, 190, 20, 9, C.oroChiaro)}`,
  dinner: () => `<circle cx="200" cy="205" r="104" fill="${C.crema}"/><circle cx="200" cy="205" r="76" fill="none" stroke="${C.oro}" stroke-width="5"/>${heart(200, 205, 1.3, C.bordeaux)}<g fill="${C.cremaScura}"><rect x="84" y="130" width="10" height="150" rx="5"/><rect x="70" y="130" width="38" height="52" rx="12"/></g><g fill="${C.cremaScura}"><rect x="306" y="130" width="10" height="150" rx="5"/><path d="M306 130h50v60h-50z" opacity="0"/><path d="M306 130c-24 10-24 60 0 70z"/></g>`,
  wreath: () => `<circle cx="200" cy="210" r="96" fill="none" stroke="#1e5441" stroke-width="44"/><circle cx="200" cy="210" r="96" fill="none" stroke="${C.abeteChiaro}" stroke-width="22" stroke-dasharray="12 10"/>${[[200, 114], [296, 210], [104, 210], [250, 292], [150, 292]].map(([x, y], i) => `<circle cx="${x}" cy="${y}" r="10" fill="${i % 2 ? C.oroChiaro : C.bordeauxChiaro}"/>`).join('')}<path d="M200 296c-30-16-60 0-50 26 22-6 40-12 50-26zM200 296c30-16 60 0 50 26-22-6-40-12-50-26z" fill="${C.bordeaux}"/><circle cx="200" cy="302" r="12" fill="${C.bordeauxChiaro}"/>`,
  polaroid: () => `<g transform="rotate(-6 200 210)"><rect x="100" y="100" width="200" height="236" rx="6" fill="${C.neve}"/><rect x="116" y="116" width="168" height="168" fill="${C.abete}"/><circle cx="240" cy="160" r="22" fill="${C.oroChiaro}"/><path d="M116 284v-48l50-40 40 30 30-26 48 40v44z" fill="${C.abeteChiaro}"/>${heart(200, 312, .5, C.bordeaux)}</g>`,
  globe: () => `<circle cx="200" cy="205" r="108" fill="${C.abeteChiaro}"/><g fill="none" stroke="${C.crema}" stroke-width="4" opacity=".85"><ellipse cx="200" cy="205" rx="50" ry="108"/><line x1="92" y1="205" x2="308" y2="205"/><path d="M104 150h192M104 260h192"/></g><circle cx="200" cy="205" r="108" fill="none" stroke="${C.oro}" stroke-width="8"/>${star5(200, 82, 18, 8, C.oroChiaro)}`,
  moon: () => `<path d="M240 100a110 110 0 1 0 60 190 94 94 0 0 1-60-190z" fill="${C.oroChiaro}"/>${star5(130, 130, 18, 8, C.neve)}${star5(300, 150, 12, 5, C.neve)}${star5(110, 300, 12, 5, C.neve)}`,
  ticket: () => `<g transform="rotate(-8 200 210)"><path d="M80 150h240v44a22 22 0 0 0 0 44v44H80v-44a22 22 0 0 0 0-44z" fill="${C.oro}"/><path d="M80 150h240v44a22 22 0 0 0 0 44v44H80v-44a22 22 0 0 0 0-44z" fill="none" stroke="${C.oroChiaro}" stroke-width="5" stroke-dasharray="3 10"/>${star5(200, 216, 44, 20, C.bordeaux)}</g>`,
  reindeer: () => `<g stroke="#6d4c35" stroke-width="12" stroke-linecap="round" fill="none"><path d="M160 140l-30-50M130 90l-26 8M130 90l8-34M160 140l-24-10M240 140l30-50M270 90l26 8M270 90l-8-34M240 140l24-10"/></g><path d="M150 140h100c10 40 0 100-50 150-50-50-60-110-50-150z" fill="#8a6244"/><ellipse cx="200" cy="280" rx="34" ry="26" fill="${C.cremaScura}"/><circle cx="200" cy="288" r="14" fill="${C.bordeauxChiaro}"/><circle cx="172" cy="200" r="9" fill="${C.notte}"/><circle cx="228" cy="200" r="9" fill="${C.notte}"/>`,
  house: () => `<rect x="110" y="210" width="180" height="116" fill="${C.crema}"/><polygon points="90,215 200,120 310,215" fill="${C.bordeaux}"/><polygon points="90,215 200,120 310,215 300,222 200,142 100,222" fill="${C.neve}"/><rect x="170" y="250" width="60" height="76" rx="4" fill="${C.oroChiaro}"/><line x1="200" y1="250" x2="200" y2="326" stroke="${C.oro}" stroke-width="4"/><line x1="170" y1="288" x2="230" y2="288" stroke="${C.oro}" stroke-width="4"/><rect x="238" y="140" width="26" height="46" fill="${C.bordeauxScuro}"/><circle cx="200" cy="288" r="90" fill="${C.oroChiaro}" opacity=".12"/>`,
  grand: () => `<circle cx="200" cy="190" r="130" fill="${C.oroChiaro}" opacity=".16"/>${star5(200, 100, 46, 20, C.oro)}${heart(200, 230, 2.1, C.bordeaux)}${heart(200, 220, 1.3, C.bordeauxChiaro)}<g fill="${C.oroChiaro}">${[[90, 150], [310, 170], [120, 300], [290, 300], [60, 240], [340, 250]].map(([x, y]) => star5(x, y, 14, 6, C.oroChiaro)).join('')}</g>`,
};

/** Un motivo per ogni giorno (indice = giorno-1) con palette di sfondo. */
const dayMotifs = [
  ['tree', 'g'], ['star', 'n'], ['envelope', 'b'], ['cocoa', 'g'], ['candycane', 'b'],
  ['bell', 'n'], ['snow', 'g'], ['film', 'b'], ['mitten', 'n'], ['baubles', 'g'],
  ['lights', 'b'], ['gift', 'n'], ['lamp', 'g'], ['letter', 'b'], ['owl', 'n'],
  ['stocking', 'g'], ['dinner', 'b'], ['wreath', 'n'], ['polaroid', 'g'], ['globe', 'b'],
  ['moon', 'n'], ['ticket', 'g'], ['reindeer', 'b'], ['house', 'n'], ['grand', 'b'],
];
const bgs = {
  g: [C.abete, C.abeteScuro], b: [C.bordeauxScuro, '#3a0e18'], n: ['#17302b', '#0a1a23'],
};

function sky(id, [top, bottom], extra = '') {
  const stars = Array.from({ length: 26 }, (_, i) => {
    const x = (i * 97 + 23) % 400, y = (i * 61 + 11) % 250, r = 1 + (i % 3) * 0.8;
    return `<circle cx="${x}" cy="${y}" r="${r}" fill="${C.neve}" opacity="${0.35 + (i % 4) * 0.12}"/>`;
  }).join('');
  return `<defs><linearGradient id="g${id}" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${top}"/><stop offset="1" stop-color="${bottom}"/></linearGradient></defs><rect width="400" height="400" fill="url(#g${id})"/>${stars}${extra}`;
}
const ground = `<path d="M0 340c60-18 120-18 200-4s140 8 200-6v70H0z" fill="${C.neve}"/><path d="M0 362c70-12 150-10 220 0s130 2 180-6v44H0z" fill="${C.crema}" opacity=".9"/>`;
const frame = `<rect x="6" y="6" width="388" height="388" rx="22" fill="none" stroke="${C.oro}" stroke-width="3" opacity=".85"/>`;

for (let d = 1; d <= 25; d++) {
  const [m, bg] = dayMotifs[d - 1];
  const n = String(d).padStart(2, '0');
  const label = `Illustrazione del giorno ${d}`;
  const body = sky(n, bgs[bg]) + ground + `<g>${motifs[m]()}</g>` +
    `<g><circle cx="46" cy="46" r="26" fill="${C.oro}"/><text x="46" y="55" text-anchor="middle" font-family="Georgia,serif" font-size="26" font-weight="700" fill="${C.abeteScuro}">${d}</text></g>` + frame;
  out(`assets/advent/day-${n}.svg`, svg(400, 400, body, label));
}

/* ------------------------------------------------------------ decorazioni (memory & co.) */
const decor = {
  star: motifs.star, bell: motifs.bell, 'candy-cane': motifs.candycane, tree: motifs.tree, gift: motifs.gift,
  heart: () => heart(200, 190, 4.2, C.bordeauxChiaro),
  wreath: motifs.wreath, mitten: motifs.mitten, candle: () => `<rect x="165" y="170" width="70" height="150" rx="8" fill="${C.crema}"/><rect x="165" y="170" width="70" height="20" rx="8" fill="${C.cremaScura}"/><path d="M200 70c-30 36-24 74 0 84 24-10 30-48 0-84z" fill="${C.oro}"/><path d="M200 100c-12 18-9 38 0 44 10-6 12-26 0-44z" fill="${C.oroChiaro}"/><rect x="198" y="148" width="4" height="26" fill="${C.notte}"/><path d="M150 320h100" stroke="${C.oro}" stroke-width="10" stroke-linecap="round"/>`,
  snowflake: motifs.snow, ornament: () => bauble(200, 215, 90, C.bordeauxChiaro) + `<path d="M130 200q70 40 140 0" fill="none" stroke="${C.oroChiaro}" stroke-width="8" opacity=".8"/>`,
  stocking: motifs.stocking,
};
for (const [name, fn] of Object.entries(decor)) {
  const dark = ['snowflake', 'mitten', 'candle'].includes(name);
  const body = `<rect width="400" height="400" rx="40" fill="${dark ? C.abete : C.crema}"/><rect x="5" y="5" width="390" height="390" rx="36" fill="none" stroke="${C.oro}" stroke-width="6"/><g transform="translate(200 200) scale(.78) translate(-200 -200)">${fn()}</g>`;
  out(`assets/decor/${name}.svg`, svg(400, 400, body, name));
}
/* dorso delle carte memory */
out('assets/decor/card-back.svg', svg(400, 400,
  `<rect width="400" height="400" rx="40" fill="${C.bordeaux}"/><rect x="14" y="14" width="372" height="372" rx="30" fill="none" stroke="${C.oro}" stroke-width="5"/>${[[100, 100], [300, 100], [100, 300], [300, 300], [200, 200]].map(([x, y]) => star5(x, y, 30, 13, C.oroChiaro)).join('')}`, 'Dorso della carta'));

/* ------------------------------------------------------------ hero del calendario */
{
  const gifts = [[70, 330, 76, 70, C.bordeaux, C.oro], [150, 340, 64, 56, C.abeteChiaro, C.crema], [250, 332, 78, 66, C.crema, C.bordeaux], [336, 338, 70, 60, C.bordeauxChiaro, C.oroChiaro]];
  const body = sky('h', [C.abete, C.abeteScuro]) +
    `<g transform="translate(0 -20)">${motifs.tree()}</g>` +
    `<path d="M0 372c70-14 140-14 210-2s130 6 190-8v38H0z" fill="${C.neve}"/>` +
    gifts.map(([x, y, w, h, b, r]) => giftBox(x, y, w, h, b, r)).join('') +
    `<path d="M20 36C110 82 290 82 380 36" fill="none" stroke="${C.abeteScuro}" stroke-width="3"/>` +
    [40, 100, 160, 220, 280, 340].map((x, i) => `<circle cx="${x}" cy="${i % 2 ? 76 : 66}" r="9" fill="${[C.oroChiaro, C.bordeauxChiaro, C.neve][i % 3]}"/>`).join('');
  out('assets/advent/calendar-hero.svg', svg(400, 400, body, 'Un albero di Natale illuminato circondato da pacchetti regalo'));
}

/* ------------------------------------------------------------ schermate dei minigiochi */
const gameScreen = (name, title, inner) =>
  out(`assets/games/${name}.svg`, svg(400, 240, `<defs><linearGradient id="gs" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.abete}"/><stop offset="1" stop-color="${C.abeteScuro}"/></linearGradient></defs><rect width="400" height="240" rx="20" fill="url(#gs)"/><rect x="5" y="5" width="390" height="230" rx="16" fill="none" stroke="${C.oro}" stroke-width="3"/>${inner}`, title));
gameScreen('memory', 'Memory natalizio',
  [[70, 70, C.bordeaux], [160, 70, C.crema], [250, 70, C.crema], [340, 70, C.bordeaux], [70, 170, C.crema], [160, 170, C.bordeaux], [250, 170, C.bordeaux], [340, 170, C.crema]]
    .map(([x, y, f], i) => `<rect x="${x - 34}" y="${y - 44}" width="68" height="88" rx="10" fill="${f}" stroke="${C.oro}" stroke-width="3"/>${f === C.bordeaux ? star5(x, y, 18, 8, C.oroChiaro) : heart(x, y - 4, .8, [C.bordeaux, C.abeteChiaro][i % 2])}`).join(''));
gameScreen('riddle', 'Indovinello', `<text x="200" y="150" text-anchor="middle" font-family="Georgia,serif" font-size="130" fill="${C.oroChiaro}" font-style="italic">?</text>${star5(80, 70, 18, 8, C.oro)}${star5(330, 60, 12, 5, C.oro)}${star5(320, 190, 16, 7, C.oro)}`);
gameScreen('quiz', 'Quiz', `<g transform="translate(200 120)">${[[-90, -50], [-90, 10], [10, -50], [10, 10]].map(([x, y], i) => `<rect x="${x}" y="${y}" width="80" height="44" rx="10" fill="${i === 2 ? C.oro : C.crema}"/>`).join('')}</g>${heart(200, 205, .5, C.bordeauxChiaro)}`);
gameScreen('finale', 'Il regalo finale', `${star5(200, 100, 54, 24, C.oro)}${heart(200, 175, 1.5, C.bordeauxChiaro)}`);

/* ------------------------------------------------------------ fotografie di esempio (illustrate) */
const photoScene = (id, inner, title) => out(`assets/photos/${id}.svg`, svg(600, 450, inner, title));
photoScene('cartolina-inverno',
  `<defs><linearGradient id="p1" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="${C.notte}"/><stop offset="1" stop-color="${C.abete}"/></linearGradient></defs><rect width="600" height="450" fill="url(#p1)"/>${Array.from({ length: 40 }, (_, i) => `<circle cx="${(i * 71) % 600}" cy="${(i * 43) % 260}" r="${1 + (i % 3)}" fill="${C.neve}" opacity=".6"/>`).join('')}<circle cx="470" cy="90" r="40" fill="${C.oroChiaro}"/><circle cx="486" cy="80" r="36" fill="#1d2b3a" opacity=".0"/><path d="M0 330c120-60 260-60 360-10s170 20 240-20v150H0z" fill="${C.neve}"/><rect x="190" y="250" width="160" height="110" fill="${C.crema}"/><polygon points="170,255 270,175 370,255" fill="${C.bordeaux}"/><rect x="236" y="290" width="48" height="70" rx="4" fill="${C.oroChiaro}"/><rect x="305" y="280" width="30" height="30" rx="3" fill="${C.oroChiaro}"/><rect x="205" y="280" width="26" height="26" rx="3" fill="${C.oroChiaro}"/>${[[90, 330], [120, 350], [500, 340]].map(([x, y]) => `<polygon points="${x},${y - 80} ${x + 28},${y} ${x - 28},${y}" fill="#1e5441"/>`).join('')}`,
  'Una casetta con la luce accesa sotto la neve');
photoScene('luci-della-citta',
  `<defs><linearGradient id="p2" x1="0" y1="0" x2="0" y2="1"><stop offset="0" stop-color="#0a1a23"/><stop offset="1" stop-color="${C.bordeauxScuro}"/></linearGradient></defs><rect width="600" height="450" fill="url(#p2)"/>${[[20, 170, 90], [120, 120, 100], [230, 190, 80], [320, 100, 110], [440, 160, 90], [540, 140, 60]].map(([x, y, w]) => `<rect x="${x}" y="${y}" width="${w}" height="${450 - y}" fill="#0b1c25"/>${Array.from({ length: 12 }, (_, i) => `<rect x="${x + 10 + (i % 3) * (w / 3.3)}" y="${y + 16 + Math.floor(i / 3) * 40}" width="14" height="20" fill="${(i * 7 + x) % 5 === 0 ? '#2d4251' : C.oroChiaro}" opacity=".9"/>`).join('')}`).join('')}<path d="M0 60C150 120 450 120 600 60" fill="none" stroke="${C.oro}" stroke-width="3"/>${[40, 130, 220, 310, 400, 490, 570].map((x, i) => `<circle cx="${x}" cy="${86 + Math.sin(i * 0.5) * 22 + 20}" r="10" fill="${[C.oroChiaro, C.bordeauxChiaro, C.neve][i % 3]}"/>`).join('')}<rect y="410" width="600" height="40" fill="${C.neve}"/>`,
  'Una città di sera con finestre illuminate e luminarie');
photoScene('pomeriggio-invernale',
  `<rect width="600" height="450" fill="${C.abeteScuro}"/><rect x="120" y="90" width="360" height="260" rx="10" fill="#561522"/><rect x="170" y="150" width="260" height="200" rx="6" fill="#1a0a0d"/><path d="M300 330c-60-6-70-70-30-100 4 24 22 30 30 20 10 20 40 24 30 80-6 10-20 0-30 0z" fill="${C.oro}"/><path d="M300 330c-26-4-30-34-12-52 8 14 18 14 24 34-2 10-6 18-12 18z" fill="${C.oroChiaro}"/><rect x="100" y="350" width="400" height="22" fill="${C.cremaScura}"/><rect x="40" y="250" width="110" height="130" rx="30" fill="${C.bordeauxChiaro}"/><rect x="450" y="250" width="110" height="130" rx="30" fill="${C.bordeauxChiaro}"/><g fill="${C.crema}"><rect x="160" y="316" width="22" height="26" rx="4"/><rect x="418" y="316" width="22" height="26" rx="4"/></g><rect y="380" width="600" height="70" fill="#2a1a12"/>${star5(300, 60, 22, 9, C.oroChiaro)}`,
  'Un camino acceso con due poltrone e due tazze');

/* ------------------------------------------------------------ icona PWA */
const iconSvg = (pad) => svg(512, 512,
  `<rect width="512" height="512" fill="${C.abete}"/><g transform="translate(256 256) scale(${pad}) translate(-256 -256)"><circle cx="256" cy="256" r="196" fill="${C.bordeaux}"/><circle cx="256" cy="256" r="196" fill="none" stroke="${C.oro}" stroke-width="10"/>${star5(256, 130, 46, 20, C.oroChiaro)}<g transform="translate(256 292) scale(2.9)">${[[-0, 0]].map(() => `<path d="M0 28 C-40 -2 -26 -34 -2 -22 C0 -20 0 -18 0 -16 C0 -18 0 -20 2 -22 C26 -34 40 -2 0 28Z" fill="${C.crema}"/>`).join('')}</g></g>`, 'Icona del calendario');
out('icons/icon.svg', iconSvg(1));
out('icons/icon-maskable.svg', iconSvg(0.78));
out('favicon.svg', iconSvg(1));

try {
  const sharp = (await import('sharp')).default;
  const jobs = [['icons/icon.svg', 'icons/icon-192.png', 192], ['icons/icon.svg', 'icons/icon-512.png', 512], ['icons/icon-maskable.svg', 'icons/icon-maskable-512.png', 512], ['icons/icon.svg', 'icons/apple-touch-icon.png', 180]];
  for (const [src, dst, size] of jobs) await sharp(path.join(root, 'public', src)).resize(size, size).png().toFile(path.join(root, 'public', dst));
  console.log('✔ Icone PNG generate.');
} catch {
  console.warn('⚠ "sharp" non disponibile: le icone PNG già presenti nel repository restano invariate.');
}
console.log('✔ Illustrazioni SVG generate in public/assets/.');
