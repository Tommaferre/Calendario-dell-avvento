// Service worker — "Il nostro dicembre".
//
// Strategia:
// - App shell (index.html, manifest, icone, css/js generati da Vite,
//   illustrazioni) in cache-first con aggiornamento in background
//   (stale-while-revalidate), così il calendario funziona offline dopo
//   il primo caricamento.
// - Navigazioni (richieste di pagina) con fallback a offline.html se la
//   rete non è disponibile e la pagina non è in cache.
// - Cache versionata: cambiando CACHE_VERSION (fatto automaticamente ad
//   ogni build da scripts/build-sw.mjs, che include un hash dei
//   contenuti) le vecchie cache vengono ripulite all'attivazione.
//
// Questo file viene generato da scripts/build-sw.mjs a partire da
// scripts/sw-template.js: non modificare public/sw.js a mano, modifica
// il template.

const BASE = "/christmas-advent/";
const CACHE_VERSION = "2026-10-25T09-39-10-408Z";
const CACHE_NAME = `advent-cache-${CACHE_VERSION}`;

const APP_SHELL = [
  `${BASE}`,
  `${BASE}index.html`,
  `${BASE}manifest.webmanifest`,
  `${BASE}offline.html`,
];

self.addEventListener("install", (event) => {
  event.waitUntil(
    caches.open(CACHE_NAME).then((cache) =>
      cache.addAll(APP_SHELL).catch(() => {
        // Se anche solo una risorsa manca (es. ambiente di sviluppo),
        // non blocchiamo l'installazione del service worker.
      })
    )
  );
  self.skipWaiting();
});

self.addEventListener("activate", (event) => {
  event.waitUntil(
    caches.keys().then((keys) =>
      Promise.all(
        keys
          .filter((key) => key.startsWith("advent-cache-") && key !== CACHE_NAME)
          .map((key) => caches.delete(key))
      )
    )
  );
  self.clients.claim();
});

function isSameOrigin(url) {
  return url.origin === self.location.origin;
}

self.addEventListener("fetch", (event) => {
  const { request } = event;
  if (request.method !== "GET") return;

  const url = new URL(request.url);
  if (!isSameOrigin(url)) return;

  // Navigazioni: network-first con fallback a cache, poi a offline.html.
  if (request.mode === "navigate") {
    event.respondWith(
      fetch(request)
        .then((response) => {
          const copy = response.clone();
          caches.open(CACHE_NAME).then((cache) => cache.put(request, copy));
          return response;
        })
        .catch(async () => {
          const cached = await caches.match(request);
          return cached || caches.match(`${BASE}offline.html`);
        })
    );
    return;
  }

  // Risorse statiche: stale-while-revalidate.
  event.respondWith(
    caches.open(CACHE_NAME).then(async (cache) => {
      const cached = await cache.match(request);
      const networkFetch = fetch(request)
        .then((response) => {
          if (response && response.status === 200) {
            cache.put(request, response.clone());
          }
          return response;
        })
        .catch(() => cached);
      return cached || networkFetch;
    })
  );
});
