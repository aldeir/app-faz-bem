// service-worker.js (v2.2 - Remoção do cache de CDN externo para corrigir erro de CORS)

// A versão do cache é crucial. Mude-a sempre que fizer deploy de novos ficheiros.
const CACHE_NAME = 'faz-bem-cache-v7'; 
const urlsToCache = [
  '/app-faz-bem/',
  '/app-faz-bem/index.html'
  // A URL 'https://cdn.tailwindcss.com' foi removida para evitar o erro de CORS.
];

// Evento de Instalação: O Service Worker é instalado.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto, adicionando URLs essenciais.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting()) // Força o novo service worker a ativar-se mais rápido
  );
});

// Evento de Ativação: Limpa caches antigos.
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.map(cache => {
          if (cache !== CACHE_NAME) {
            console.log('Service Worker: Limpando cache antigo:', cache);
            return caches.delete(cache);
          }
        })
      );
    }).then(() => self.clients.claim()) // Torna-se o service worker ativo para todas as abas
  );
});

// Evento Fetch: Interceta todos os pedidos de rede.
self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // --- ESTRATÉGIA: STALE-WHILE-REVALIDATE ---
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Apenas guarda em cache recursos do mesmo domínio (self) para evitar erros de CORS.
          if (networkResponse && networkResponse.status === 200 && new URL(event.request.url).origin === self.location.origin) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            console.log('Service Worker: Fetch falhou; a app está provavelmente offline.', err);
        });

        return cachedResponse || fetchPromise;
      });
    })
  );
});
