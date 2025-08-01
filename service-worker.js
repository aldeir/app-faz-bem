// service-worker.js

const CACHE_NAME = 'faz-bem-cache-v1';
const urlsToCache = [
  '/',
  '/index.html',
  // Adicione aqui outros arquivos estáticos importantes que você queira que funcionem offline
  // Ex: '/style.css', '/app.js', '/images/logo.png'
];

self.addEventListener('install', event => {
  // Realiza a instalação do service worker
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Opened cache');
        return cache.addAll(urlsToCache);
      })
  );
});

self.addEventListener('fetch', event => {
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Cache hit - return response
        if (response) {
          return response;
        }
        return fetch(event.request);
      }
    )
  );
});
