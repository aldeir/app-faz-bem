// service-worker.js

// Altere a versão do cache sempre que fizer alterações nos arquivos cacheados.
const CACHE_NAME = 'faz-bem-cache-v4'; 
const urlsToCache = [
  // Adicione aqui os caminhos completos e corretos dos seus arquivos essenciais.
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
  'https://cdnjs.cloudflare.com/ajax/libs/font-awesome/6.0.0-beta3/css/all.min.css'
];

// Evento de Instalação: Salva os assets essenciais no cache.
self.addEventListener('install', event => {
  console.log('Service Worker: Instalando...');
  event.waitUntil(
    caches.open(CACHE_NAME)
      .then(cache => {
        console.log('Service Worker: Adicionando assets ao cache...');
        // CORREÇÃO: Trata requisições externas com 'no-cors' para evitar erros de CORS.
        const cachePromises = urlsToCache.map(url => {
          const request = new Request(url, { mode: 'no-cors' });
          return fetch(request).then(response => cache.put(url, response));
        });
        return Promise.all(cachePromises);
      })
      .then(() => {
        return self.skipWaiting(); 
      })
      .catch(error => {
        console.error('Service Worker: Falha na instalação -', error);
      })
  );
});

// Evento de Ativação: Limpa caches antigos para evitar conflitos.
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
    }).then(() => {
      return self.clients.claim();
    })
  );
});

// Evento Fetch: Implementa a estratégia "Network First" para páginas HTML
// e "Cache First" para outros assets (CSS, JS, imagens).
self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET (como POST para o Firestore)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // Estratégia "Network First" para páginas HTML (navigation requests)
  if (event.request.mode === 'navigate') {
    event.respondWith(
      fetch(event.request)
        .then(networkResponse => {
          // Se a rede funcionar, clona a resposta para o cache e a retorna
          const responseClone = networkResponse.clone();
          caches.open(CACHE_NAME).then(cache => {
            cache.put(event.request, responseClone);
          });
          return networkResponse;
        })
        .catch(() => {
          // Se a rede falhar, tenta servir do cache
          return caches.match(event.request);
        })
    );
    return;
  }

  // Estratégia "Cache First" para todos os outros assets (CSS, JS, imagens, etc.)
  event.respondWith(
    caches.match(event.request)
      .then(response => {
        // Retorna do cache se encontrar, senão busca na rede
        return response || fetch(event.request);
      })
  );
});
