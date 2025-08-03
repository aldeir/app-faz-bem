// service-worker.js

const CACHE_NAME = 'app-faz-bem-cache-v2'; // Versão do cache, mude se alterar os assets
const assetsToCache = [
  // Adicione aqui APENAS os arquivos que você tem CERTEZA que existem no repositório.
  // O caminho deve ser completo a partir da raiz do site do GitHub Pages.
  '/app-faz-bem/',
  '/app-faz-bem/index.html',
  '/app-faz-bem/login.html',
  '/app-faz-bem/receber-doacao.html',
  '/app-faz-bem/manifest.json',
  '/app-faz-bem/app-config.js',
  '/app-faz-bem/auth-service.js',
  '/app-faz-bem/firebase-services.js',
  '/app-faz-bem/app-header.js',
  // URLs externas também podem ser cacheadas
  'https://cdn.tailwindcss.com',
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css',
  'https://unpkg.com/html5-qrcode'
];

// Evento de Instalação
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Adicionando assets ao cache...');
        // Usamos requisições individuais para que um erro não pare todo o processo
        const promises = assetsToCache.map(url => {
          return fetch(url).then(response => {
            if (!response.ok) {
              // Se um arquivo não for encontrado (404), ele não será adicionado ao cache, mas não quebrará a instalação.
              console.error(`Service Worker: Falha ao buscar o asset: ${url}. Status: ${response.status}`);
              return Promise.resolve(); // Continua para o próximo arquivo
            }
            return cache.put(url, response);
          });
        });
        return Promise.all(promises);
      })
      .then(() => {
        console.log('Service Worker: Instalação concluída.');
        return self.skipWaiting();
      })
      .catch(error => {
        console.error('Service Worker: Erro geral durante a instalação.', error);
      })
  );
});

// Evento de Ativação
self.addEventListener('activate', event => {
  console.log('Service Worker: Ativando...');
  event.waitUntil(
    caches.keys().then(cacheNames => {
      return Promise.all(
        cacheNames.filter(cache => cache !== CACHE_NAME).map(cache => {
          console.log('Service Worker: Limpando cache antigo:', cache);
          return caches.delete(cache);
        })
      );
    }).then(() => self.clients.claim())
  );
});

// Evento Fetch
self.addEventListener('fetch', event => {
  // Estratégia: Cache, caindo para a rede (Cache falling back to network)
  event.respondWith(
    caches.match(event.request)
      .then(cachedResponse => {
        // Retorna do cache se encontrar
        if (cachedResponse) {
          return cachedResponse;
        }
        // Se não, busca na rede
        return fetch(event.request);
      })
  );
});
