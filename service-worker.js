/* Service Worker – App Faz Bem (Mobile UX Enhanced)
   Estratégias:
   - HTML (navegação): network-first c/ navigation preload -> offline fallback
   - CSS/JS: stale-while-revalidate
   - Imagens: cache-first com limite
   - Doações offline: fila em IndexedDB + Background Sync ('donation-sync')
*/
const VERSION = 'v0.4.0';
const BUILD_TS = Date.now(); // Timestamp de build para diagnóstico
const CACHE_PAGES = `app-pages-${VERSION}`;
const CACHE_ASSETS = `app-assets-${VERSION}`;
const CACHE_IMAGES = `app-images-${VERSION}`;
const OFFLINE_URL = 'offline.html';
const MAX_RETRIES = 3;
const MAX_IMAGES = 50; // Limite de imagens no cache
const PRECACHE = [
  'index.html',
  'offline.html',
  'manifest.json',
  'logo.png',
  'icon-192.png',
  'icon-512.png',
  'icon-maskable-512.png',
  'style.css',
  'mobile-enhancements.css'
];

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    // Skip waiting removed - let client decide when to activate
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
    
    // Notifica clientes sobre nova versão disponível
    notifyClients({ 
      type: 'sw:update-ready', 
      version: VERSION, 
      build: BUILD_TS 
    });
  })());
});

// =============== Message Handler ===============
self.addEventListener('message', event => {
  if (event.data && event.data.type === 'SKIP_WAITING') {
    self.skipWaiting();
  }
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
  tx.objectStore(STORE).add({ 
    payload, 
    ts: Date.now(), 
    retryCount: 0 
  });
  await tx.done;
}

async function popAllDonations() {
  const db = await openQueueDB();
  const tx = db.transaction(STORE, 'readonly');
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
  await tx.done;
  return all;
}

async function removeDonationFromQueue(key) {
  const db = await openQueueDB();
  const tx = db.transaction(STORE, 'readwrite');
  tx.objectStore(STORE).delete(key);
  await tx.done;
}

async function updateDonationRetryCount(key, retryCount) {
  const db = await openQueueDB();
  const tx = db.transaction(STORE, 'readwrite');
  const store = tx.objectStore(STORE);
  const item = await store.get(key);
  if (item) {
    item.retryCount = retryCount;
    store.put(item);
  }
  await tx.done;
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
  
  let shouldReRegisterSync = false;
  
  for (const item of items) {
    const { key, value } = item;
    const { payload, retryCount = 0 } = value;
    
    try {
      await fetch('/api/offline-donation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(payload)
      });
      
      // Sucesso: remove da fila
      await removeDonationFromQueue(key);
      notifyClients({ 
        type: 'toast', 
        status: 'success', 
        message: 'Doação sincronizada!' 
      });
      
    } catch (error) {
      // Falha: implementa retry com backoff exponencial
      if (retryCount < MAX_RETRIES) {
        const newRetryCount = retryCount + 1;
        await updateDonationRetryCount(key, newRetryCount);
        shouldReRegisterSync = true;
        
        // Backoff exponencial: aguarda 2^retry segundos
        const backoffMs = Math.pow(2, newRetryCount) * 1000;
        setTimeout(() => {
          if ('sync' in self.registration) {
            self.registration.sync.register('donation-sync').catch(() => {});
          }
        }, backoffMs);
        
      } else {
        // Máximo de tentativas atingido: remove da fila e notifica erro
        await removeDonationFromQueue(key);
        notifyClients({
          type: 'toast',
          status: 'error', 
          message: 'Erro ao sincronizar doação após múltiplas tentativas'
        });
      }
    }
  }
  
  // Re-registra Background Sync apenas se houver itens pendentes
  if (shouldReRegisterSync && 'sync' in self.registration) {
    try {
      await self.registration.sync.register('donation-sync');
    } catch {}
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
    event.respondWith(cacheFirstWithLimit(request, CACHE_IMAGES, MAX_IMAGES));
    return;
  }

  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

async function networkFirstForHTML(request) {
  let preload;
  if ('navigationPreload' in self.registration) {
    preload = self.registration.navigationPreload.getState()
      .then(s => s.enabled ? self.registration.navigationPreload.response : null)
      .catch(()=>null);
  }
  try {
    const pre = await preload;
    if (pre) {
      const cache = await caches.open(CACHE_PAGES);
      cache.put(request, pre.clone()).catch(() => {}); // Store navigation preload in pages cache
      return pre;
    }
    const networkResponse = await fetch(request, { cache: 'no-store' });
    const cache = await caches.open(CACHE_PAGES);
    cache.put(request, networkResponse.clone()).catch(() => {});
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
