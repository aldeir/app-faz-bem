// /service-worker.js

const CACHE_VERSION = '1.8';
const CACHE_NAME = `app-faz-bem-v${CACHE_VERSION}`;
const STATIC_CACHE = `static-v${CACHE_VERSION}`;
const IMAGES_CACHE = `images-v${CACHE_VERSION}`;
const MAX_IMAGE_CACHE_ENTRIES = 50;

const urlsToCache = [
    // As páginas principais do seu app
    './',
    './index.html',
    './login.html',
    './cadastro-doador.html',
    './cadastro-entidade.html',
    './minhas-entregas.html',
    './registrar-doacao.html',
    './receber-doacao.html',
    './admin.html',
    './superadmin.html',
    './configuracoes.html',
    './politica-de-privacidade.html',
    './termos-de-servico.html',
    './detalhes.html',
    './notificacoes.html',
    './perfil-entidade.html',
    './perfil-doador.html',
    './gerenciar-entidades.html',
    './aguardando-aprovacao.html',
    './verificar-email.html',
    './offline.html', // Offline fallback page

    // Arquivos de estilo e script essenciais
    './style.css',
    './app-header.js',
    './auth-service.js',
    './app-config.js',
    './firebase-services.js',
    './firestore-paths.js',
    './modal-handler.js',
    './notification-service.js',
    './perfil-entidade.js',
    './cadastro-entidade.js',

    // Imagens e Ícones principais (apenas os que existem)
    './logo.png',
    './manifest.json'
];

self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache aberto, adicionando URLs essenciais.');
                return cache.addAll(urlsToCache);
            })
            .catch(error => {
                console.error('Service Worker: Falha ao fazer cache dos arquivos na instalação.', error);
            })
            .then(() => self.skipWaiting())
    );
});

self.addEventListener('activate', event => {
    console.log('Service Worker: Ativando...');
    event.waitUntil(
        caches.keys().then(cacheNames => {
            return Promise.all(
                cacheNames.map(cacheName => {
                    // Delete old caches that don't match current version
                    if (cacheName !== CACHE_NAME && cacheName !== STATIC_CACHE && cacheName !== IMAGES_CACHE) {
                        console.log('Service Worker: Limpando cache antigo:', cacheName);
                        return caches.delete(cacheName);
                    }
                })
            );
        }).then(() => self.clients.claim())
    );
});

// Helper functions for caching strategies
async function networkFirstWithOfflineFallback(request) {
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            const responseToCache = networkResponse.clone();
            const cache = await caches.open(CACHE_NAME);
            cache.put(request, responseToCache);
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed, trying cache:', error);
        const cachedResponse = await caches.match(request);
        if (cachedResponse) {
            return cachedResponse;
        }
        // If no cache and it's a navigation request, return offline page
        if (request.mode === 'navigate') {
            return caches.match('./offline.html');
        }
        throw error;
    }
}

async function staleWhileRevalidate(request, cacheName) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    const fetchPromise = fetch(request).then(networkResponse => {
        if (networkResponse && networkResponse.status === 200) {
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    }).catch(() => cachedResponse);
    
    return cachedResponse || fetchPromise;
}

async function cacheFirstWithLRU(request, cacheName, maxEntries) {
    const cache = await caches.open(cacheName);
    const cachedResponse = await cache.match(request);
    
    if (cachedResponse) {
        return cachedResponse;
    }
    
    try {
        const networkResponse = await fetch(request);
        if (networkResponse && networkResponse.status === 200) {
            // Implement simple LRU by checking cache size
            const keys = await cache.keys();
            if (keys.length >= maxEntries) {
                // Delete oldest entries (first ones)
                const entriesToDelete = keys.slice(0, keys.length - maxEntries + 1);
                await Promise.all(entriesToDelete.map(key => cache.delete(key)));
            }
            cache.put(request, networkResponse.clone());
        }
        return networkResponse;
    } catch (error) {
        console.log('Network failed for image:', error);
        throw error;
    }
}

function isHtmlRequest(request) {
    return request.mode === 'navigate' || 
           (request.headers.get('accept') && request.headers.get('accept').includes('text/html'));
}

function isStaticAsset(url) {
    return url.pathname.endsWith('.css') || 
           url.pathname.endsWith('.js') || 
           url.pathname.includes('/js/') ||
           url.pathname.includes('/css/');
}

function isImage(url) {
    return url.pathname.match(/\.(png|jpg|jpeg|gif|svg|webp|ico)$/i);
}

self.addEventListener('fetch', event => {
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    const requestUrl = new URL(event.request.url);
    
    // Skip external resources (different origin)
    if (requestUrl.origin !== self.location.origin) {
        event.respondWith(
            fetch(event.request).catch(() => {
                return caches.match(event.request);
            })
        );
        return;
    }
    
    // HTML pages: Network-first with offline fallback
    if (isHtmlRequest(event.request)) {
        event.respondWith(networkFirstWithOfflineFallback(event.request));
    }
    // Static assets (CSS/JS): Stale-while-revalidate
    else if (isStaticAsset(requestUrl)) {
        event.respondWith(staleWhileRevalidate(event.request, STATIC_CACHE));
    }
    // Images: Cache-first with LRU
    else if (isImage(requestUrl)) {
        event.respondWith(cacheFirstWithLRU(event.request, IMAGES_CACHE, MAX_IMAGE_CACHE_ENTRIES));
    }
    // Default: Cache-first for other same-origin resources
    else {
        event.respondWith(
            caches.match(event.request).then(cachedResponse => {
                if (cachedResponse) {
                    return cachedResponse;
                }
                return fetch(event.request).then(networkResponse => {
                    if (networkResponse && networkResponse.status === 200) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                });
            })
        );
    }
});
