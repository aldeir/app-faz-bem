// service-worker.js (v2.0 - com Estratégia Stale-While-Revalidate)

// A versão do cache é crucial. Mude-a sempre que fizer deploy de novos ficheiros.
const CACHE_NAME = 'faz-bem-cache-v5'; 
const urlsToCache = [
  '/app-faz-bem/',
  '/app-faz-bem/index.html',
  'https://cdn.tailwindcss.com'
  // Outros assets essenciais podem ser adicionados aqui para o primeiro load.
  // A nova estratégia de fetch irá cachear as páginas à medida que são visitadas.
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
  // Ignora pedidos que não são GET (como POSTs para o Firestore) ou de extensões do Chrome.
  if (event.request.method !== 'GET' || !event.request.url.startsWith('http')) {
    return;
  }

  // --- ESTRATÉGIA: STALE-WHILE-REVALIDATE ---
  event.respondWith(
    caches.open(CACHE_NAME).then(cache => {
      // 1. Tenta ir ao cache primeiro para uma resposta rápida.
      return cache.match(event.request).then(cachedResponse => {
        // 2. Em paralelo, vai à rede para buscar a versão mais recente.
        const fetchPromise = fetch(event.request).then(networkResponse => {
          // Se a resposta da rede for bem-sucedida, atualiza o cache.
          // Apenas para respostas 'basic' (do mesmo domínio) ou 'cors' para evitar cache de respostas opacas.
          if (networkResponse && networkResponse.status === 200 && (networkResponse.type === 'basic' || networkResponse.type === 'cors')) {
            cache.put(event.request, networkResponse.clone());
          }
          return networkResponse;
        }).catch(err => {
            // O fetch pode falhar se o utilizador estiver offline.
            // Neste caso, se tivermos uma resposta do cache, está tudo bem.
            // Se não, o erro de rede será propagado.
            console.log('Service Worker: Fetch falhou; a app está provavelmente offline.', err);
        });

        // 3. Retorna a resposta do cache imediatamente (se existir), 
        // ou espera pela resposta da rede se não houver nada no cache.
        return cachedResponse || fetchPromise;
      });
    })
  );
});
