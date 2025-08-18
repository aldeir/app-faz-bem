// /js/app-header.js (Versão 8.4 - Compatível com a nova estrutura de dados da Entidade)

import { db, rtdb, logout } from './app-config.js';
import { collection, query, where, onSnapshot, getDocs, limit, databaseRef, onValue } from './firebase-services.js';
import { paths } from './firestore-paths.js';
import { getCurrentUser } from './auth-service.js';

let unreadListener = null;

function addFavicon() {
    if (document.querySelector("link[rel='icon']")) return;
    const faviconLink = document.createElement('link');
    faviconLink.rel = 'icon';
    faviconLink.type = 'image/png';
    faviconLink.href = 'images/icons/icon-72x72.png'; 
    document.head.appendChild(faviconLink);
}

function listenForUnreadNotifications(userId) {
    const bellContainer = document.getElementById('notification-bell-container');
    if (!bellContainer) return;
    
    const q = query(collection(db, paths.notifications), where("userId", "==", userId), where("read", "==", false));
    if (unreadListener) unreadListener();

    unreadListener = onSnapshot(q, (snapshot) => {
        if (snapshot.empty) {
            bellContainer.innerHTML = '';
        } else {
            bellContainer.innerHTML = `
                <a href="notificacoes.html" class="relative text-gray-500 hover:text-gray-700 p-2 rounded-full" title="Notificações">
                    <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
                    <span class="absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
                </a>`;
        }
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

async function donorHasDonations(donorId) {
    if (!donorId) return false;
    const donationsQuery = query(collection(db, paths.donations), where("donorId", "==", donorId), limit(1));
    const snapshot = await getDocs(donationsQuery);
    return !snapshot.empty;
}

async function createUserMenuHTML(userSession) {
    const { auth, profile } = userSession;
    const userRole = profile?.role || 'doador';

    // --- INÍCIO DA ALTERAÇÃO: Lógica para buscar nome e foto da nova estrutura ---
    let displayName = 'Utilizador';
    let photoURL = profile?.photoURL || auth.photoURL || 'https://placehold.co/40x40/e2e8f0/cbd5e0?text=Foto';
    let profileLink = 'perfil-doador.html';

    if (profile) {
        switch (userRole) {
            case 'entidade':
                // Busca os dados da nova estrutura aninhada
                displayName = profile.dadosEntidade?.nomeFantasia || 'Entidade sem nome';
                photoURL = profile.logoUrl || 'https://placehold.co/40x40/e2e8f0/cbd5e0?text=Logo';
                profileLink = 'perfil-entidade.html';
                break;
            case 'superadmin':
                displayName = profile.displayName || 'Super Admin';
                profileLink = 'perfil-admin.html'; // Assumindo que existe ou será criado
                break;
            default: // Doador
                displayName = profile.displayName || auth.displayName;
                break;
        }
    }
    // --- FIM DA ALTERAÇÃO ---
    
    let menuItems = `<a href="notificacoes.html" class="menu-item">Notificações</a>`;
    switch (userRole) {
        case 'superadmin':
            menuItems += `<a href="superadmin.html" class="menu-item">Painel Superadmin</a><a href="configuracoes.html" class="menu-item">Configurações</a>`;
            break;
        case 'entidade':
            menuItems += `<a href="admin.html" class="menu-item">Painel da Entidade</a><a href="${profileLink}" class="menu-item">Perfil da Entidade</a>`;
            break;
        default: // Doador
            menuItems += `<a href="${profileLink}" class="menu-item">Meu Perfil</a>`;
            const hasDonations = await donorHasDonations(auth.uid);
            if (hasDonations) {
                menuItems += `<a href="minhas-entregas.html" class="menu-item">Minhas Entregas</a>`;
            }
            break;
    }

    return `
        <div id="notification-bell-container" class="flex items-center"></div>
        <a href="${profileLink}" class="text-sm font-medium text-gray-700 hidden sm:block hover:text-green-600 truncate max-w-[150px]" title="Ver perfil">${displayName}</a>
        <a href="${profileLink}" title="Ver perfil">
            <img src="${photoURL}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-green-500 transition">
        </a>
        <div class="relative">
            <button id="user-menu-button" class="p-2 rounded-full hover:bg-gray-100 focus:outline-none" title="Menu de opções">
                <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div id="user-menu-dropdown" class="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-xl z-50 hidden origin-top-right">
                <div class="py-1">
                    ${menuItems}
                    <div class="border-t border-gray-200 my-1"></div>
                    <button id="header-logout-btn" class="menu-item logout w-full text-left">Sair</button>
                </div>
            </div>
        </div>
    `;
}

export async function injectHeader() {
    addFavicon();
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return true;

    const userSession = await getCurrentUser();
    
    const isPublicPage = ['/index.html', '/', '/verificar-email.html', '/login.html', '/cadastro-doador.html', '/cadastro-entidade.html', '/termos-de-servico.html', '/politica-de-privacidade.html'].some(path => window.location.pathname.endsWith(path));

    if (userSession && !userSession.isVerified && !isPublicPage) {
        window.location.href = 'verificar-email.html';
        return false;
    }
    
    const verificationBanner = (userSession && !userSession.isVerified) 
        ? `<div class="bg-yellow-300 text-yellow-800 text-center text-sm p-2">
             Por favor, verifique o seu e-mail para ter acesso a todas as funcionalidades. <a href="verificar-email.html" class="font-bold underline hover:text-yellow-900">Verificar agora</a>
           </div>`
        : '';

    headerContainer.innerHTML = `
        <style>
            .menu-item { display: block; padding: 0.75rem 1rem; font-medium; color: #374151; transition: background-color 0.2s; }
            .menu-item:hover { background-color: #f3f4f6; }
            .menu-item.logout { color: #ef4444; }
        </style>
        <header class="bg-white shadow-sm sticky top-0 z-40">
            ${verificationBanner}
            <nav class="container mx-auto max-w-5xl p-4 flex justify-between items-center h-16">
                <a href="index.html" class="flex items-center" title="Voltar à página inicial">
                    <img src="logo.png" alt="Logótipo Faz Bem" class="h-12">
                </a>
                <div class="flex items-center space-x-2 sm:space-x-4">
                    <div id="online-users-container" class="flex items-center pl-2 sm:pl-4 border-l border-gray-200"></div>
                    <div id="header-user-menu" class="flex items-center space-x-2 sm:space-x-4"></div>
                </div>
            </nav>
        </header>`;

    const userMenuContainer = document.getElementById('header-user-menu');
    listenForOnlineUsers();
    
    if (userSession?.auth) {
        if (userSession.isVerified) {
            userMenuContainer.innerHTML = await createUserMenuHTML(userSession);
            listenForUnreadNotifications(userSession.auth.uid);
            
            document.getElementById('header-logout-btn').addEventListener('click', () => logout().then(() => window.location.href = 'index.html'));
            
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
            userMenuContainer.innerHTML = `<button id="header-logout-btn" class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Sair</button>`;
            document.getElementById('header-logout-btn').addEventListener('click', () => logout().then(() => window.location.href = 'login.html'));
        }
    } else {
        userMenuContainer.innerHTML = `<a href="login.html" class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow">Entrar / Registar</a>`;
    }
    
    return true; 
}
