// /service-worker.js

const CACHE_NAME = 'app-faz-bem-v1.4'; // Versão incrementada
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
    // Adicionar novas páginas essenciais
    './perfil-entidade.html',
    './perfil-doador.html',
    './gerenciar-entidades.html',
    './aguardando-aprovacao.html',
    './verificar-email.html',

    // Arquivos de estilo e script essenciais
    './style.css',
    // --- CORREÇÃO: Caminho dos scripts JS (removido /js/) ---
    './app-header.js',
    './auth-service.js',
    './app-config.js',
    './firebase-services.js',
    './firestore-paths.js',
    './modal-handler.js',
    './notification-service.js',
    './perfil-entidade.js', 
    './cadastro-entidade.js',

    // Imagens e Ícones principais
    './logo.png',
    './images/icons/icon-72x72.png',
    './images/icons/icon-96x96.png',
    './images/icons/icon-128x128.png',
    './images/icons/icon-144x144.png',
    './images/icons/icon-152x152.png',
    './images/icons/icon-192x192.png',
    './images/icons/icon-384x384.png',
    './images/icons/icon-512x512.png',
];

self.addEventListener('install', event => {
    console.log('Service Worker: Instalando...');
    event.waitUntil(
        caches.open(CACHE_NAME)
            .then(cache => {
                console.log('Service Worker: Cache aberto, adicionando URLs essenciais.');
                // Usamos `fetch` para cada recurso para ignorar falhas individuais
                const promises = urlsToCache.map(url => {
                    return fetch(url, { cache: 'no-store' }).then(response => {
                        if (response.ok) {
                            return cache.put(url, response);
                        }
                        console.warn(`Service Worker: Falha ao fazer cache de ${url}, status: ${response.status}`);
                        return Promise.resolve(); // Continua mesmo se um falhar
                    }).catch(err => {
                        console.error(`Service Worker: Erro de rede ao buscar ${url}`, err);
                    });
                });
                return Promise.all(promises);
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
    if (event.request.method !== 'GET' || event.request.url.startsWith('chrome-extension://')) {
        return;
    }
    
    // Estratégia: Stale-While-Revalidate para recursos do mesmo domínio
    if (new URL(event.request.url).origin === self.location.origin) {
        event.respondWith(
            caches.open(CACHE_NAME).then(cache => {
                return cache.match(event.request).then(cachedResponse => {
                    const fetchPromise = fetch(event.request).then(networkResponse => {
                        cache.put(event.request, networkResponse.clone());
                        return networkResponse;
                    });
                    return cachedResponse || fetchPromise;
                });
            })
        );
    }
    // Para recursos externos (como fontes), usa a estratégia de network first
    else {
        event.respondWith(
            fetch(event.request).catch(() => {
                // Se a rede falhar, tenta encontrar no cache (se já tiver sido cacheado dinamicamente)
                return caches.match(event.request);
            })
        );
    }
});
