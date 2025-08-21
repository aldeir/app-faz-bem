/* Service Worker – App Faz Bem (Mobile UX Enhanced)
   Estratégias:
   - HTML (navegação): network-first c/ navigation preload -> offline fallback
   - CSS/JS: stale-while-revalidate
   - Imagens: cache-first com limite
   - Doações offline: fila em IndexedDB + Background Sync ('donation-sync')
*/
const VERSION = 'v0.3.0';
const CACHE_PAGES = `app-pages-${VERSION}`;
const CACHE_ASSETS = `app-assets-${VERSION}`;
const CACHE_IMAGES = `app-images-${VERSION}`;
const OFFLINE_URL = 'offline.html';
const PRECACHE = [
  'index.html',
  'offline.html',
  'manifest.json',
  'logo.png'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    self.skipWaiting();
    const cache = await caches.open(CACHE_PAGES);
    await cache.addAll(PRECACHE.map(u => new Request(u, { cache: 'reload' })));
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    const keys = await caches.keys();
    await Promise.all(
      keys.filter(k => ![CACHE_PAGES, CACHE_ASSETS, CACHE_IMAGES].includes(k))
          .map(k => caches.delete(k))
    );
    if ('navigationPreload' in self.registration) {
      try { await self.registration.navigationPreload.enable(); } catch {}
    }
    await self.clients.claim();
  })());
});

// =============== Offline Donation Queue (IndexedDB) ===============
const DB_NAME = 'donation-queue-db';
const STORE = 'queue';

function openQueueDB() {
  return new Promise((resolve, reject) => {
    const req = indexedDB.open(DB_NAME, 1);
    req.onupgradeneeded = () => {
      req.result.createObjectStore(STORE, { keyPath: 'id', autoIncrement: true });
    };
    req.onsuccess = () => resolve(req.result);
    req.onerror = () => reject(req.error);
  });
}

async function queueDonation(payload) {
  const db = await openQueueDB();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).add({ payload, ts: Date.now() });
  await tx.done;
}

async function popAllDonations() {
  const db = await openQueueDB();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  const all = [];
  const cursorReq = store.openCursor();
  await new Promise(res => {
    cursorReq.onsuccess = e => {
      const cur = e.target.result;
      if (cur) {
        all.push({ key: cur.key, value: cur.value });
        cur.continue();
      } else res();
    };
  });
  for (const item of all) store.delete(item.key);
  await tx.done;
  return all.map(i => i.value.payload);
}

// Background Sync
self.addEventListener('sync', event => {
  if (event.tag === 'donation-sync') {
    event.waitUntil(flushDonations());
  }
});

async function flushDonations() {
  const items = await popAllDonations();
  if (!items.length) return;
  for (const payload of items) {
    try {
      await fetch('/api/offline-donation', { // Ajuste para endpoint real ou Cloud Function
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      notifyClients({ type: 'toast', status: 'success', message: 'Doação sincronizada!' });
    } catch {
      // Re-fila se falhou novamente
      await queueDonation(payload);
    }
  }
}

// Comunicação com front
function notifyClients(msg) {
  self.clients.matchAll({ includeUncontrolled: true }).then(clients => {
    clients.forEach(c => c.postMessage(msg));
  });
}

// Intercept fetch para doações offline (exemplo simplificado)
// Front deve enviar fetch POST para /offline-donation-proxy
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method === 'POST' && request.url.endsWith('/offline-donation-proxy')) {
    event.respondWith((async () => {
      try {
        const cloned = request.clone();
        const body = await cloned.json();
        // Tenta rede
        const netResp = await fetch('/api/offline-donation', {
            method:'POST',
            headers:{'Content-Type':'application/json'},
            body: JSON.stringify(body)
        });
        if (!netResp.ok) throw new Error('Net error');
        notifyClients({ type:'toast', status:'success', message:'Doação registrada!' });
        return netResp;
      } catch {
        // Fila offline
        const clone2 = request.clone();
        const body2 = await clone2.json();
        await queueDonation(body2);
        if ('sync' in self.registration) {
          try { await self.registration.sync.register('donation-sync'); } catch {}
        }
        notifyClients({ type:'toast', status:'success', message:'Offline: doação na fila.' });
        return new Response(JSON.stringify({ queued: true }), {
          status: 202,
          headers: { 'Content-Type':'application/json' }
        });
      }
    })());
    return;
  }
});

// Geral fetch
self.addEventListener('fetch', event => {
  const { request } = event;
  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const dest = request.destination;
  const isNavigation = request.mode === 'navigate' ||
    (request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith(networkFirstForHTML(request));
    return;
  }

  if (dest === 'style' || dest === 'script') {
    event.respondWith(staleWhileRevalidate(request, CACHE_ASSETS));
    return;
  }

  if (dest === 'image') {
    event.respondWith(cacheFirstWithLimit(request, CACHE_IMAGES, 80));
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

async function networkFirstForHTML(request) {
  let preload;
  if ('navigationPreload' in self.registration) {
    preload = self.registration.navigationPreload.getState()
      .then(s => s.enabled ? event.preloadResponse : null)
      .catch(()=>null);
  }
  try {
    const pre = await preload;
    if (pre) {
      const cache = await caches.open(CACHE_PAGES);
      cache.put(request, pre.clone());
      return pre;
    }
    const networkResponse = await fetch(request, { cache: 'no-store' });
    const cache = await caches.open(CACHE_PAGES);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cacheMatch = await caches.match(request);
    if (cacheMatch) return cacheMatch;
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response('Offline', { status: 503 });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then(response => {
    cache.put(request, response.clone()).catch(()=>{});
    return response;
  }).catch(()=>undefined);
  return cached || networkFetch || fetch(request);
}

async function cacheFirstWithLimit(request, cacheName, maxEntries) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  if (cached) return cached;
  try {
    const response = await fetch(request);
    if (response && response.ok) {
      await cache.put(request, response.clone());
      await limitCacheEntries(cache, maxEntries);
    }
    return response;
  } catch {
    return caches.match(request);
  }
}

async function limitCacheEntries(cache, maxEntries) {
  const keys = await cache.keys();
  if (keys.length <= maxEntries) return;
  const toDelete = keys.length - maxEntries;
  for (let i = 0; i < toDelete; i++) await cache.delete(keys[i]);
}
