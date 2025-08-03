// service-worker.js

// Altere a versão do cache sempre que fizer alterações nos arquivos cacheados.
const CACHE_NAME = 'faz-bem-cache-v2'; 
const urlsToCache = [
  // Adicione aqui os caminhos completos e corretos dos seus arquivos essenciais.
  // O Service Worker tentará cachear todos. Se um falhar, a instalação pode ser interrompida.
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
        return cache.addAll(urlsToCache);
      })
      .then(() => {
        // Força o novo service worker a se tornar ativo imediatamente.
        return self.skipWaiting(); 
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
      // Garante que o service worker ativado controle a página imediatamente.
      return self.clients.claim();
    })
  );
});

// Evento Fetch: Implementa a estratégia "Stale-While-Revalidate".
self.addEventListener('fetch', event => {
  // Ignora requisições que não são GET (como POST para o Firestore)
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      return cache.match(event.request).then(cachedResponse => {
        // 1. Busca na rede em paralelo
        const fetchedResponsePromise = fetch(event.request).then(networkResponse => {
          // Se a busca na rede for bem-sucedida, atualiza o cache
          cache.put(event.request, networkResponse.clone());
          return networkResponse;
        });

        // 2. Retorna a resposta do cache imediatamente (se existir), ou espera a da rede
        return cachedResponse || fetchedResponsePromise;
      });
    })
  );
});
