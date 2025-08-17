// /js/app-header.js (Versão 7.2 - Restaura o menu sanduíche e mantém as melhorias de UX)

import { db, rtdb, logout } from './app-config.js';
import { collection, query, where, onSnapshot, getDocs, limit, databaseRef, onValue, sendEmailVerification } from './firebase-services.js';
import { paths } from './firestore-paths.js';
import { getCurrentUser } from './auth-service.js';
import { showAlertModal } from './modal-handler.js';

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
    const pageContent = document.getElementById('page-content');
    if (!pageContent) return;
    
    pageContent.innerHTML = `
        <div class="min-h-[calc(100vh-200px)] flex items-center justify-center text-center p-4">
            <div class="max-w-md w-full bg-white p-10 rounded-xl shadow-lg">
                <h1 class="text-2xl font-bold text-yellow-600">Verificação de E-mail Pendente</h1>
                <p class="mt-4 text-gray-700">Enviámos um link de verificação para o seu e-mail. Por favor, clique no link para ativar a sua conta.</p>
                <p class="mt-2 text-gray-600">Se não recebeu o e-mail, verifique a sua pasta de spam.</p>
                <button id="resend-verification-btn" class="mt-6 bg-green-600 hover:bg-green-700 text-white px-4 py-2 rounded-md text-sm font-medium">Reenviar E-mail</button>
            </div>
        </div>
    `;
    
    document.getElementById('resend-verification-btn').addEventListener('click', async (e) => {
        const button = e.target;
        button.disabled = true;
        button.textContent = 'Aguarde...';
        try {
            await sendEmailVerification(user);
            showAlertModal('E-mail Enviado', 'Um novo e-mail de verificação foi enviado.');
        } catch (error) {
            showAlertModal('Erro', 'Não foi possível reenviar o e-mail.');
        } finally {
            setTimeout(() => {
                button.disabled = false;
                button.textContent = 'Reenviar E-mail';
            }, 30000);
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
    const photoURL = profile?.photoURL || auth.photoURL || 'https://placehold.co/40x40/e2e8f0/cbd5e0?text=Foto';
    
    let displayName = auth.displayName;
    let profileLink = 'perfil-doador.html';
    if (profile?.role === 'entidade') { displayName = profile.publicName; profileLink = 'perfil-entidade.html'; }
    else if (profile?.role === 'superadmin') { displayName = profile.displayName; profileLink = 'perfil-admin.html'; }
    
    let menuItems = '';
    switch (userRole) {
        case 'superadmin':
             menuItems = `<a href="superadmin.html" class="menu-item"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.096 2.572-1.065z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"></path></svg>Painel SuperAdmin</a>`;
            break;
        case 'entidade':
            menuItems = `<a href="admin.html" class="menu-item"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 19v-6a2 2 0 012-2h2a2 2 0 012 2v6m-8 0h-2.586a1 1 0 01-.707-.293l-2.414-2.414a1 1 0 010-1.414l2.414-2.414a1 1 0 01.707-.293H9m4 0h2.586a1 1 0 01.707.293l2.414 2.414a1 1 0 010 1.414l-2.414 2.414a1 1 0 01-.707-.293H15m-4 0v-6a2 2 0 012-2h2a2 2 0 012 2v6m0 0v-6a2 2 0 00-2-2h-2a2 2 0 00-2 2v6"></path></svg>Painel da Entidade</a>
                         <a href="${profileLink}" class="menu-item"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>Perfil da Entidade</a>`;
            break;
        default: // Doador
            menuItems = `<a href="${profileLink}" class="menu-item"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg>Meu Perfil</a>`;
            const hasDonations = await donorHasDonations(auth.uid);
            if (hasDonations) {
                menuItems += `<a href="minhas-entregas.html" class="menu-item"><svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 17l4 4 4-4m-4-5v9"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M20.62 14.38A9 9 0 1012 21a9.003 9.003 0 008.62-6.62z"></path></svg>Minhas Entregas</a>`;
            }
            break;
    }

    return `
        <a href="notificacoes.html" id="notification-bell-icon" class="relative text-gray-500 hover:text-gray-700 p-2 rounded-full" title="Notificações">
            <svg class="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 17h5l-1.405-1.405A2.032 2.032 0 0118 14.158V11a6.002 6.002 0 00-4-5.659V5a2 2 0 10-4 0v.341C7.67 6.165 6 8.388 6 11v3.159c0 .538-.214 1.055-.595 1.436L4 17h5m6 0v1a3 3 0 11-6 0v-1m6 0H9"></path></svg>
            <span id="notification-indicator" class="hidden absolute top-1 right-1 block h-2 w-2 rounded-full bg-red-500 ring-2 ring-white"></span>
        </a>
        <a href="${profileLink}" class="text-sm font-medium text-gray-700 hidden sm:block hover:text-green-600" title="Ver perfil">${displayName}</a>
        <a href="${profileLink}" title="Ver perfil">
            <img src="${photoURL}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-green-500 transition">
        </a>
        <div class="relative">
            <button id="user-menu-button" class="p-2 rounded-full hover:bg-gray-100 focus:outline-none" title="Menu de opções">
                <svg class="h-6 w-6 text-gray-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M4 6h16M4 12h16M4 18h16" />
                </svg>
            </button>
            <div id="user-menu-dropdown" class="origin-top-right absolute right-0 mt-2 w-56 rounded-md shadow-lg bg-white ring-1 ring-black ring-opacity-5 hidden z-50">
                <div class="py-1" role="menu" aria-orientation="vertical">
                    ${menuItems}
                    <div class="border-t border-gray-100 my-1"></div>
                    <button id="header-logout-btn" class="menu-item w-full text-left">
                        <svg class="w-5 h-5 mr-3" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"></path></svg>
                        Sair
                    </button>
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

    const verificationBanner = (userSession && userSession.auth.providerData.some(p => p.providerId === 'password') && !userSession.isVerified) 
        ? `<div class="bg-yellow-300 text-yellow-800 text-center text-sm p-2">
               Por favor, verifique o seu e-mail para ter acesso a todas as funcionalidades. <a href="verificar-email.html" class="font-bold underline hover:text-yellow-900">Verificar agora</a>
           </div>`
        : '';

    headerContainer.innerHTML = `
        <style>
            .menu-item { display: flex; align-items: center; text-align: left; padding: 0.75rem 1rem; font-medium; color: #374151; transition: background-color 0.2s, color 0.2s; border-radius: 0.25rem; margin: 0.25rem; }
            .menu-item:hover { background-color: #f3f4f6; color: #1f2937; }
        </style>
        <header class="bg-white shadow-sm sticky top-0 z-40">
            ${verificationBanner}
            <nav class="container mx-auto max-w-5xl p-4 flex justify-between items-center h-16">
                <a href="index.html" class="flex items-center gap-2 text-2xl font-bold text-green-600" title="Voltar à página inicial">
                    <svg class="w-7 h-7" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 12l2-2m0 0l7-7 7 7M5 10v10a1 1 0 001 1h3m10-11l2 2m-2-2v10a1 1 0 01-1 1h-3m-6 0a1 1 0 001-1v-4a1 1 0 011-1h2a1 1 0 011 1v4a1 1 0 001 1m-6 0h6"></path></svg>
                    Faz Bem
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
        const { auth, isVerified } = userSession;
        
        const isPublicPage = ['/index.html', '/', '/verificar-email.html', '/termos-de-servico.html', '/politica-de-privacidade.html'].some(path => window.location.pathname.endsWith(path));
        
        if (!isVerified && !isPublicPage) {
            showVerificationBlock(auth);
            userMenuContainer.innerHTML = `<button id="header-logout-btn" class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Sair</button>`;
            document.getElementById('header-logout-btn').addEventListener('click', () => logout().then(() => window.location.href = 'login.html'));
            return false;
        }
        
        userMenuContainer.innerHTML = await createUserMenuHTML(userSession);
        listenForUnreadNotifications(auth.uid);
        
        document.getElementById('header-logout-btn').addEventListener('click', () => logout().then(() => window.location.href = 'index.html'));
        
        const menuButton = document.getElementById('user-menu-button');
        const dropdown = document.getElementById('user-menu-dropdown');
        if (menuButton && dropdown) {
            menuButton.addEventListener('click', (event) => {
                event.stopPropagation();
                dropdown.classList.toggle('hidden');
            });
            window.addEventListener('click', (e) => {
                if (!menuButton.contains(e.target) && !e.target.closest('#user-menu-dropdown')) {
                    dropdown.classList.add('hidden');
                }
            });
        }

    } else {
        userMenuContainer.innerHTML = `<a href="login.html" class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow">Entrar / Registar</a>`;
    }
    
    return true;
}
