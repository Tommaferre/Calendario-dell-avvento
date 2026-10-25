/* Service worker generato da vite-plugin-advent-pwa.ts (i segnaposto sono sostituiti in fase di build). */
const VERSION = '__VERSION__';
const CACHE = 'advent-' + VERSION;
const PRECACHE = __PRECACHE__;
const scopeUrl = (p) => new URL(p, self.registration.scope).href;

self.addEventListener('install', (event) => {
  // Nessun skipWaiting automatico: la nuova versione attende che l'utente tocchi "Aggiorna".
  event.waitUntil(caches.open(CACHE).then((cache) => cache.addAll(PRECACHE.map(scopeUrl))));
});

self.addEventListener('message', (event) => {
  if (event.data && event.data.type === 'SKIP_WAITING') self.skipWaiting();
});

self.addEventListener('activate', (event) => {
  event.waitUntil(
    caches.keys()
      .then((keys) => Promise.all(keys.filter((k) => k.startsWith('advent-') && k !== CACHE).map((k) => caches.delete(k))))
      .then(() => self.clients.claim()),
  );
});

self.addEventListener('fetch', (event) => {
  const req = event.request;
  if (req.method !== 'GET') return;
  const url = new URL(req.url);
  if (url.origin !== self.location.origin) return;

  if (req.mode === 'navigate') {
    // Le pagine (anche con ?day=7) usano l'index precaricato; se manca, rete; se offline, messaggio.
    event.respondWith(
      caches.match(scopeUrl('./index.html'), { ignoreSearch: true })
        .then((hit) => hit || fetch(req))
        .catch(() => new Response('<meta charset="utf-8"><title>Offline</title><p style="font:18px Georgia,serif;padding:2rem">Sei offline e l’app non è ancora stata salvata sul dispositivo. Riapri il calendario quando sei online.</p>', { headers: { 'Content-Type': 'text/html; charset=utf-8' } })),
    );
    return;
  }
  event.respondWith(
    caches.match(req).then((hit) => hit || fetch(req).then((res) => {
      if (res.ok) { const copy = res.clone(); caches.open(CACHE).then((c) => c.put(req, copy)); }
      return res;
    })),
  );
});
