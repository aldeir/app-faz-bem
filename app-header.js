// app-header.js (Versão 3.2 - Com Sistema de Notificações)

import { db, collection, query, where, onSnapshot } from './app-config.js';
import { paths } from './firestore-paths.js';
import { logout } from './app-config.js';
import { getCurrentUser } from './auth-service.js';

let unreadListener = null; // Variável para manter a referência do listener

/**
 * Escuta em tempo real por notificações não lidas para o usuário atual.
 * @param {string} userId - O ID do usuário logado.
 */
function listenForUnreadNotifications(userId) {
    const bellIcon = document.getElementById('notification-bell-icon');
    const bellIndicator = document.getElementById('notification-indicator');
    if (!bellIcon || !bellIndicator) return;

    const q = query(
        collection(db, paths.notifications),
        where("userId", "==", userId),
        where("read", "==", false)
    );

    // Cancela o listener anterior para evitar múltiplas execuções
    if (unreadListener) unreadListener();

    unreadListener = onSnapshot(q, (snapshot) => {
        if (snapshot.size > 0) {
            bellIndicator.classList.remove('hidden');
        } else {
            bellIndicator.classList.add('hidden');
        }
    });
}

const headerHTML = `
    <header class="bg-white shadow-sm sticky top-0 z-10">
        <nav class="container mx-auto max-w-5xl p-4 flex justify-between items-center">
            <a href="index.html" class="text-2xl font-bold text-green-600" title="Voltar para a página inicial">Faz Bem</a>
            <div id="header-user-menu" class="flex items-center space-x-4">
                <!-- O menu do usuário será inserido aqui -->
            </div>
        </nav>
    </header>
`;

export async function injectHeader() {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = headerHTML;
    const userMenu = document.getElementById('header-user-menu');
    
    const userSession = await getCurrentUser();

    if (userSession?.auth) {
        const { auth, profile } = userSession;
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
            ${userSpecificContent}
            
            <a href="notificacoes.html" id="notification-bell-icon" class="relative text-gray-500 hover:text-gray-700" title="Notificações">
                <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                <span id="notification-indicator" class="hidden absolute top-0 right-0 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
            </a>

            <a href="${profileLink}" class="flex items-center space-x-2 pl-2 border-l" title="Acessar meu perfil">
                <span class="text-sm font-medium text-gray-700 hidden sm:block">${displayName}</span>
                <img src="${photoURL}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200">
            </a>
            
            <button id="header-logout-btn" class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Sair</button>
        `;

        document.getElementById('header-logout-btn').addEventListener('click', () => {
            logout().then(() => window.location.href = 'index.html');
        });

        // Inicia o listener para notificações não lidas
        listenForUnreadNotifications(auth.uid);

    } else {
        userMenu.innerHTML = `<a href="login.html" class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow">Entrar / Registar</a>`;
    }
}
