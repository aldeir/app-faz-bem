// service-worker.js (v2.3 - Caminhos de cache relativos)

const CACHE_NAME = 'faz-bem-cache-v8'; // Mudei a versão para forçar a atualização
const urlsToCache = [
  './',
  'index.html'
  // Adicione outras páginas importantes aqui, como 'login.html', 'perfil-doador.html', etc.
  // Ex: 'login.html', 'cadastro-doador.html'
];

self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Cache aberto, adicionando URLs essenciais.');
        return cache.addAll(urlsToCache);
      })
      .then(() => self.skipWaiting())
  );
});

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
    }).then(() => self.clients.claim())
  );
});

self.addEventListener('fetch', event => {
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        const fetchPromise = fetch(event.request).then(networkResponse => {
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
