/* Service Worker – App Faz Bem
   Estratégias:
   - HTML (navegação): network-first -> cache -> offline.html
   - CSS/JS: stale-while-revalidate
   - Imagens: cache-first com limite (LRU simples)
*/

const VERSION = 'v0.2.0';
const CACHE_PAGES = `app-pages-${VERSION}`;
const CACHE_ASSETS = `app-assets-${VERSION}`;
const CACHE_IMAGES = `app-images-${VERSION}`;
const OFFLINE_URL = 'offline.html';

// Ajuste esses padrões conforme seus caminhos
const ASSET_EXTENSIONS = ['.css', '.js'];
const IMAGE_EXTENSIONS = ['.png', '.jpg', '.jpeg', '.gif', '.webp', '.svg', '.ico'];
const MAX_IMAGE_ENTRIES = 60;

self.addEventListener('install', event => {
  event.waitUntil((async () => {
    self.skipWaiting();
    const cache = await caches.open(CACHE_PAGES);
    await cache.addAll([
      new Request(OFFLINE_URL, { cache: 'reload' })
    ]);
  })());
});

self.addEventListener('activate', event => {
  event.waitUntil((async () => {
    // Remove caches antigos
    const keys = await caches.keys();
    await Promise.all(
      keys
        .filter(k => ![CACHE_PAGES, CACHE_ASSETS, CACHE_IMAGES].includes(k))
        .map(k => caches.delete(k))
    );
    await self.clients.claim();
  })());
});

self.addEventListener('fetch', event => {
  const { request } = event;

  if (request.method !== 'GET') return;

  const url = new URL(request.url);
  const dest = request.destination;

  // HTML (navegação)
  const isNavigation = request.mode === 'navigate' ||
                       (request.headers.get('accept') || '').includes('text/html');

  if (isNavigation) {
    event.respondWith(networkFirstForHTML(request));
    return;
  }

  // CSS/JS (stale-while-revalidate)
  if (dest === 'style' || dest === 'script' || hasAnyExtension(url.pathname, ASSET_EXTENSIONS)) {
    event.respondWith(staleWhileRevalidate(request, CACHE_ASSETS));
    return;
  }

  // Imagens (cache-first + limite)
  if (dest === 'image' || hasAnyExtension(url.pathname, IMAGE_EXTENSIONS)) {
    event.respondWith(cacheFirstWithLimit(request, CACHE_IMAGES, MAX_IMAGE_ENTRIES));
    return;
  }

  // Demais: tenta rede, sem cache especial
  event.respondWith(fetch(request).catch(() => caches.match(request)));
});

function hasAnyExtension(pathname, exts) {
  const lower = pathname.toLowerCase();
  return exts.some(ext => lower.endsWith(ext));
}

async function networkFirstForHTML(request) {
  try {
    const networkResponse = await fetch(request, { cache: 'no-store' });
    const cache = await caches.open(CACHE_PAGES);
    cache.put(request, networkResponse.clone());
    return networkResponse;
  } catch {
    const cacheMatch = await caches.match(request);
    if (cacheMatch) return cacheMatch;
    const offline = await caches.match(OFFLINE_URL);
    return offline || new Response('Você está offline.', {
      status: 503,
      headers: { 'Content-Type': 'text/plain; charset=utf-8' }
    });
  }
}

async function staleWhileRevalidate(request, cacheName) {
  const cache = await caches.open(cacheName);
  const cached = await cache.match(request);
  const networkFetch = fetch(request).then(response => {
    cache.put(request, response.clone()).catch(() => {});
    return response;
  }).catch(() => undefined);

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
  for (let i = 0; i < toDelete; i++) {
    await cache.delete(keys[i]);
  }
}
