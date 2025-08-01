// app-header.js (Versão 4.2 - Implementação do Portão de Segurança)

import { db, rtdb, logout } from './app-config.js';
import { collection, query, where, onSnapshot, databaseRef, onValue, sendEmailVerification } from './firebase-services.js';
import { paths } from './firestore-paths.js';
import { getCurrentUser } from './auth-service.js';
import { showAlertModal } from './modal-handler.js';

let unreadListener = null;

function listenForUnreadNotifications(userId) {
    const bellIndicator = document.getElementById('notification-indicator');
    if (!bellIndicator) return;
    const q = query(collection(db, paths.notifications), where("userId", "==", userId), where("read", "==", false));
    if (unreadListener) unreadListener();
    unreadListener = onSnapshot(q, (snapshot) => {
        bellIndicator.classList.toggle('hidden', snapshot.empty);
    });
}

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

const headerHTML = `
    <header class="bg-white shadow-sm sticky top-0 z-10">
        <nav class="container mx-auto max-w-5xl p-4 flex justify-between items-center">
            <div class="flex items-center space-x-2 sm:space-x-4">
                <a href="index.html" class="text-2xl font-bold text-green-600" title="Voltar para a página inicial">Faz Bem</a>
                <div id="online-users-container" class="flex items-center pl-2 sm:pl-4 border-l border-gray-200"></div>
            </div>
            <div id="header-user-menu" class="flex items-center space-x-2 sm:space-x-4"></div>
        </nav>
    </header>
`;

/**
 * Injeta o cabeçalho e atua como um portão de segurança para a página.
 * @returns {Promise<boolean>} Retorna 'true' se o utilizador estiver verificado e a página puder carregar, 'false' caso contrário.
 */
export async function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return true;

    headerContainer.innerHTML = headerHTML;
    const userMenu = document.getElementById('header-user-menu');
    
    listenForOnlineUsers();

    const userSession = await getCurrentUser();

    if (userSession?.auth) {
        const { auth, profile, isVerified } = userSession;
        
        // PONTO CENTRAL DA CORREÇÃO DE SEGURANÇA
        if (!isVerified) {
            const isPublicPage = window.location.pathname.endsWith('index.html') || window.location.pathname === '/';
            if (!isPublicPage) {
                showVerificationBlock(auth);
                userMenu.innerHTML = `<button id="header-logout-btn" class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Sair</button>`;
                document.getElementById('header-logout-btn').addEventListener('click', () => logout().then(() => window.location.href = 'login.html'));
                return false; // **Impede o carregamento de páginas restritas**
            }
        }
        
        const photoURL = profile?.photoURL || auth.photoURL || 'https://placehold.co/40x40/e2e8f0/cbd5e0?text=Foto';
        let displayName = auth.displayName;
        if (profile?.role === 'entidade') displayName = profile.publicName;
        else if (profile?.role === 'doador' || profile?.role === 'superadmin') displayName = profile.displayName;

        let userSpecificContent = '';
        let profileLink = 'perfil-doador.html';
        if (profile?.role === 'superadmin') {
            profileLink = 'perfil-admin.html';
            userSpecificContent = `<a href="superadmin.html" class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Painel Super Admin</a>`;
        } else if (profile?.role === 'entidade') {
            profileLink = 'perfil-entidade.html';
            userSpecificContent = `<a href="admin.html" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">Painel da Entidade</a>`;
        } else {
            userSpecificContent = `<a href="minhas-entregas.html" class="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors hidden sm:block">Minhas Entregas</a>`;
        }

        userMenu.innerHTML = `
            ${isVerified ? userSpecificContent : ''}
            <a href="notificacoes.html" id="notification-bell-icon" class="relative text-gray-500 hover:text-gray-700" title="Notificações">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span id="notification-indicator" class="hidden absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </a>
            <a href="${isVerified ? profileLink : 'verificar-email.html'}" class="flex items-center space-x-2 pl-2 border-l" title="Aceder ao meu perfil">
                <span class="text-sm font-medium text-gray-700 hidden sm:block">${displayName}</span>
                <img src="${photoURL}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200">
            </a>
            <button id="header-logout-btn" class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Sair</button>
        `;

        document.getElementById('header-logout-btn').addEventListener('click', () => {
            logout().then(() => window.location.href = 'login.html');
        });

        listenForUnreadNotifications(auth.uid);

    } else {
        userMenu.innerHTML = `<a href="login.html" class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow">Entrar / Registar</a>`;
    }
    return true; // **Permite o carregamento da página por defeito**
}
