// app-header.js (v2.0 - Lógica de renderização aprimorada)

import { logout, ADMIN_EMAIL } from './app-config.js';

const headerHTML = `
    <header class="bg-white shadow-sm sticky top-0 z-10">
        <nav class="container mx-auto max-w-5xl p-4 flex justify-between items-center">
            <a href="index.html" class="text-2xl font-bold text-green-600" title="Voltar para a página inicial">Faz Bem</a>
            <div id="header-user-menu" class="flex items-center space-x-4">
                </div>
        </nav>
    </header>
`;

// A função agora recebe a sessão do usuário como um argumento
export function injectHeader(userSession) {
    const headerContainer = document.getElementById('app-header');
    if (!headerContainer) return;

    headerContainer.innerHTML = headerHTML;
    const userMenu = document.getElementById('header-user-menu');
    
    // Se uma sessão de usuário válida foi passada
    if (userSession?.auth) {
        const { auth, profile } = userSession;
        const photoURL = profile?.photoURL || auth.photoURL || 'https://placehold.co/40x40/e2e8f0/cbd5e0?text=Foto';
        const displayName = profile?.displayName || auth.displayName || 'Usuário';

        let userSpecificContent = '';

        if (auth.email === ADMIN_EMAIL) {
            // Menu do Superadmin
            userSpecificContent = `
                <a href="superadmin.html" class="text-sm font-medium text-red-600 hover:text-red-800">Painel Super Admin</a>
            `;
        } else if (profile?.role === 'entidade') {
            // Menu da Entidade
            userSpecificContent = `
                <a href="admin.html" class="text-sm font-medium text-blue-600 hover:text-blue-800">Painel da Entidade</a>
            `;
        } else {
            // Menu do Doador (padrão)
            userSpecificContent = `
                <a href="minhas-entregas.html" class="text-sm font-medium text-gray-600 hover:text-green-600 hidden sm:block">Minhas Entregas</a>
                <a href="perfil-doador.html" class="flex items-center space-x-2" title="Acessar meu perfil">
                    <span class="text-sm font-medium text-gray-700 hidden sm:block">${displayName}</span>
                    <img src="${photoURL}" class="w-10 h-10 rounded-full object-cover border-2 hover:border-green-500">
                </a>
            `;
        }

        userMenu.innerHTML = `
            ${userSpecificContent}
            <button id="header-logout-btn" class="text-sm text-gray-500 hover:text-red-600 pl-2 border-l">Sair</button>
        `;

        document.getElementById('header-logout-btn').addEventListener('click', () => {
            logout().then(() => {
                window.location.href = 'index.html';
            });
        });

    } else {
        // Se não houver sessão de usuário, mostra o botão de login
        userMenu.innerHTML = `<a href="login.html" class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow">Entrar / Registar</a>`;
    }
}
