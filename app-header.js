// /js/app-header.js (Versão 5.0 - Menu Sanduíche Integrado)

import { db, rtdb, logout } from './app-config.js';
import { collection, query, where, onSnapshot, databaseRef, onValue, sendEmailVerification } from './firebase-services.js';
import { paths } from './firestore-paths.js';
import { getCurrentUser } from './auth-service.js';
import { showAlertModal } from './modal-handler.js';

let unreadListener = null;

/**
 * Adiciona dinamicamente a tag do favicon ao <head> da página.
 */
function addFavicon() {
    if (document.querySelector("link[rel='icon']")) return;
    const faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.type = 'image/png';
    faviconLink.href = 'images/icons/icon-72x72.png'; 
    document.head.appendChild(faviconLink);
}

/**
 * Ouve por notificações não lidas e exibe/oculta o indicador no sino.
 */
function listenForUnreadNotifications(userId) {
    const bellIndicator = document.getElementById('notification-indicator');
    if (!bellIndicator) return;
    const q = query(collection(db, paths.notifications), where("userId", "==", userId), where("read", "==", false));
    if (unreadListener) unreadListener();
    unreadListener = onSnapshot(q, (snapshot) => {
        bellIndicator.classList.toggle('hidden', snapshot.empty);
    });
}

/**
 * Ouve o status de presença (online/offline) dos usuários no Realtime Database.
 */
function listenForOnlineUsers() {
    const onlineContainer = document.getElementById('online-users-container');
    if (!onlineContainer) return;
    const statusRef = databaseRef(rtdb, 'status');
    onValue(statusRef, (snapshot) => {
        const users = snapshot.val();
        if (users) {
            const userList = Object.values(users);
            onlineContainer.innerHTML = `
                <div class="flex items-center -space-x-2 mr-2">
                    ${userList.slice(0, 3).map(user => `<img class="inline-block h-6 w-6 rounded-full ring-2 ring-white" src="${user.photoURL || 'https://placehold.co/24x24/e2e8f0/cbd5e0?text=?'}" title="${user.name}">`).join('')}
                </div>
                <span class="text-sm font-medium text-green-600">${userList.length} online</span>`;
        } else {
            onlineContainer.innerHTML = `<span class="text-sm text-gray-500">0 online</span>`;
        }
    });
}

/**
 * Bloqueia o conteúdo da página e mostra o painel de verificação de e-mail.
 */
function showVerificationBlock(user) {
    const pageContent = document.querySelector('main');
    if (!pageContent) return;
    
    pageContent.innerHTML = `
        <div class="min-h-[calc(100vh-200px)] flex items-center justify-center text-center p-4">
            <div class="max-w-md w-full bg-white p-10 rounded-xl shadow-lg">
                <h1 class="text-2xl font-bold text-yellow-600">Verificação de E-mail Pendente</h1>
                <p class="mt-4 text-gray-700">Enviámos um link de verificação para o seu e-mail. Por favor, clique no link para ativar a sua conta e ter acesso completo à plataforma.</p>
                <p class="mt-2 text-gray-600">Se não recebeu o e-mail, verifique a sua pasta de spam.</p>
                <button id="resend-verification-btn" class="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">Reenviar E-mail de Verificação</button>
            </div>
        </div>
    `;
    
    document.getElementById('resend-verification-btn').addEventListener('click', async (e) => {
        const button = e.target;
        button.disabled = true;
        button.textContent = 'Aguarde...';
        try {
            await sendEmailVerification(user);
            showAlertModal('E-mail Enviado', 'Um novo e-mail de verificação foi enviado para o seu endereço.');
        } catch (error) {
            showAlertModal('Erro', 'Não foi possível reenviar o e-mail. Tente novamente mais tarde.');
        } finally {
            setTimeout(() => {
                button.disabled = false;
                button.textContent = 'Reenviar E-mail de Verificação';
            }, 30000);
        }
    });
}

/**
 * Cria o HTML para o novo menu de usuário sanduíche.
 */
function createUserMenuHTML(userSession) {
    const { auth, profile } = userSession;
    const userRole = profile?.role || 'doador';
    const photoURL = profile?.photoURL || auth.photoURL || 'https://placehold.co/40x40/e2e8f0/cbd5e0?text=Foto';

    let menuItems = '';
    switch (userRole) {
        case 'superadmin':
            menuItems = `
                <a href="superadmin.html" class="menu-item">Painel Superadmin</a>
                <a href="gerenciar-doadores.html" class="menu-item">Doadores</a>
                <a href="gerenciar-entidades.html" class="menu-item">Entidades</a>
                <a href="configuracoes.html" class="menu-item">Configurações</a>
            `;
            break;
        case 'entidade':
            menuItems = `
                <a href="admin.html" class="menu-item">Painel da Entidade</a>
                <a href="criar-campanha.html" class="menu-item">Criar Campanha</a>
                <a href="gerenciar-campanhas.html" class="menu-item">Minhas Campanhas</a>
                <a href="receber-doacao.html" class="menu-item">Receber Doação</a>
                <a href="gerenciar-agendamentos.html" class="menu-item">Agendamentos</a>
            `;
            break;
        case 'doador':
        default:
            menuItems = `
                <a href="minhas-entregas.html" class="menu-item">Minhas Entregas</a>
                <a href="perfil-doador.html" class="menu-item">Meu Perfil</a>
            `;
            break;
    }

    return `
        <a href="notificacoes.html" id="notification-bell-icon" class="relative text-gray-500 hover:text-gray-700" title="Notificações">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span id="notification-indicator" class="hidden absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </a>
        <div class="relative">
            <button id="user-menu-button" class="block bg-gray-200 p-2 rounded-full hover:bg-gray-300 focus:outline-none mr-2" title="Menu do usuário">
                <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div id="user-menu-dropdown" class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-50 hidden">
                <div class="py-1">
                    ${menuItems}
                    <div class="border-t border-gray-200 my-1"></div>
                    <button id="header-logout-btn" class="menu-item w-full text-left text-red-600">Sair</button>
                </div>
            </div>
            <img src="${photoURL}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200">
        </div>
    `;
}

/**
 * Função principal que injeta o cabeçalho e gerencia o acesso.
 */
export async function injectHeader() {
    addFavicon();

    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return true;

    headerContainer.innerHTML = `
        <header class="bg-white shadow-sm sticky top-0 z-40">
            <nav class="container mx-auto max-w-5xl p-4 flex justify-between items-center">
                <div class="flex items-center space-x-2 sm:space-x-4">
                    <a href="index.html" class="text-2xl font-bold text-green-600" title="Voltar para a página inicial">Faz Bem</a>
                    <div id="online-users-container" class="flex items-center pl-2 sm:pl-4 border-l border-gray-200"></div>
                </div>
                <div id="header-user-menu" class="flex items-center space-x-2 sm:space-x-4"></div>
            </nav>
        </header>
    `;

    const userMenuContainer = document.getElementById('header-user-menu');
    listenForOnlineUsers();

    const userSession = await getCurrentUser();

    if (userSession?.auth) {
        const { auth, isVerified } = userSession;

        if (!isVerified) {
            const isPublicPage = window.location.pathname.endsWith('index.html') || window.location.pathname.endsWith('/') || window.location.pathname.endsWith('verificar-email.html');
            if (!isPublicPage) {
                showVerificationBlock(auth);
                // Mesmo na tela de verificação, mostra um menu simples para sair
                userMenuContainer.innerHTML = `<button id="header-logout-btn" class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Sair</button>`;
                document.getElementById('header-logout-btn').addEventListener('click', () => logout().then(() => window.location.href = 'login.html'));
                return false;
            }
        }

        userMenuContainer.innerHTML = createUserMenuHTML(userSession);
        document.getElementById('header-logout-btn').addEventListener('click', () => logout().then(() => window.location.href = 'index.html'));
        listenForUnreadNotifications(auth.uid);
        
        // Adiciona listeners para o menu dropdown
        const menuButton = document.getElementById('user-menu-button');
        const dropdown = document.getElementById('user-menu-dropdown');
        if (menuButton && dropdown) {
            menuButton.addEventListener('click', (event) => {
                event.stopPropagation();
                dropdown.classList.toggle('hidden');
            });
            window.addEventListener('click', (e) => {
                if (!e.target.closest('#user-menu-button')) {
                    dropdown.classList.add('hidden');
                }
            });
        }

    } else {
        userMenuContainer.innerHTML = `<a href="login.html" class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow">Entrar / Registar</a>`;
    }
    return true;
}
