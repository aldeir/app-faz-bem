// service-worker.js (v2.1 - com Estratégia Stale-While-Revalidate e versão incrementada)

// A versão do cache é crucial. Mude-a sempre que fizer deploy de novos ficheiros.
const CACHE_NAME = 'faz-bem-cache-v6'; 
const urlsToCache = [
  '/app-faz-bem/',
  '/app-faz-bem/index.html',
  'https://cdn.tailwindcss.com'
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
          if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
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
