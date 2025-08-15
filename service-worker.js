// /service-worker.js

const CACHE_NAME = 'app-faz-bem-v1.3'; // Mude a versão sempre que alterar os arquivos cacheados
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

    // Arquivos de estilo e script essenciais
    './style.css',
    './js/app-header.js',
    './js/auth-service.js',
    './js/app-config.js',
    './js/firebase-services.js',
    './js/firestore-paths.js',
    './js/modal-handler.js',
    './js/notification-service.js',

    // Imagens e Ícones principais
    './images/logo.png',
    './images/icons/icon-72x72.png',
    './images/icons/icon-96x96.png',
    './images/icons/icon-128x128.png',
    './images/icons/icon-144x144.png',
    './images/icons/icon-152x152.png',
    './images/icons/icon-192x192.png',
    './images/icons/icon-384x384.png',
    './images/icons/icon-512x512.png',

    // Fontes (opcional, mas bom para performance offline)
    'https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap'
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
    // Apenas para requisições GET
    if (event.request.method !== 'GET') {
        return;
    }

    event.respondWith(
        caches.match(event.request)
            .then(cachedResponse => {
                // Estratégia: Cache First (Primeiro no Cache)
                // Se o recurso estiver no cache, retorna ele.
                if (cachedResponse) {
                    return cachedResponse;
                }

                // Se não estiver no cache, busca na rede.
                return fetch(event.request).then(networkResponse => {
                    // Opcional: Adiciona a nova requisição ao cache dinamicamente.
                    // Isso é bom para imagens de campanhas, etc.
                    // Apenas para requisições bem-sucedidas e do mesmo domínio.
                    if (networkResponse && networkResponse.status === 200 && new URL(event.request.url).origin === self.location.origin) {
                        const responseToCache = networkResponse.clone();
                        caches.open(CACHE_NAME).then(cache => {
                            cache.put(event.request, responseToCache);
                        });
                    }
                    return networkResponse;
                }).catch(() => {
                    // Se a rede falhar, você pode retornar uma página offline padrão (opcional)
                    // return caches.match('offline.html');
                });
            })
    );
});
