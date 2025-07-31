// app-header.js (Versão 3.0 - Refatorado com auth-service)

import { logout } from './app-config.js';
import { getCurrentUser } from './auth-service.js'; // <-- MUDANÇA AQUI

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
        if (profile?.role === 'entidade') {
            displayName = profile.publicName;
        } else if (profile?.role === 'doador' || profile?.role === 'superadmin') {
            displayName = profile.displayName;
        }

        let userSpecificContent = '';

        if (profile?.role === 'superadmin') {
            userSpecificContent = `
                <a href="superadmin.html" class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Painel Super Admin</a>
                <a href="superadmin.html#perfil" class="flex items-center space-x-2 pl-2 border-l" title="Acessar meu perfil">
                    <span class="text-sm font-medium text-gray-700 hidden sm:block">${displayName}</span>
                    <img src="${photoURL}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200">
                </a>
            `;
        } else if (profile?.role === 'entidade') {
            userSpecificContent = `
                <a href="admin.html" class="text-sm font-medium text-blue-600 hover:text-blue-800 transition-colors">Painel da Entidade</a>
                <a href="perfil-entidade.html" class="flex items-center space-x-2 pl-2 border-l" title="Acessar meu perfil">
                    <span class="text-sm font-medium text-gray-700 hidden sm:block">${displayName}</span>
                    <img src="${photoURL}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200">
                </a>
            `;
        } else {
            userSpecificContent = `
                <a href="minhas-entregas.html" class="text-sm font-medium text-gray-600 hover:text-green-600 transition-colors hidden sm:block">Minhas Entregas</a>
                <a href="perfil-doador.html" class="flex items-center space-x-2 pl-2 border-l" title="Acessar meu perfil">
                    <span class="text-sm font-medium text-gray-700 hidden sm:block">${displayName}</span>
                    <img src="${photoURL}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200 hover:border-green-500 transition-colors">
                </a>
            `;
        }

        userMenu.innerHTML = `
            ${userSpecificContent}
            <button id="header-logout-btn" class="text-sm font-medium text-red-600 hover:text-red-800 transition-colors">Sair</button>
        `;

        document.getElementById('header-logout-btn').addEventListener('click', () => {
            logout().then(() => window.location.href = 'index.html');
        });

    } else {
        userMenu.innerHTML = `<a href="login.html" class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow">Entrar / Registar</a>`;
    }
}
