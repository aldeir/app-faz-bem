import { getCurrentUser, logout } from './app-config.js';

const headerHTML = `
    <header class="bg-white shadow-sm sticky top-0 z-10">
        <nav class="container mx-auto max-w-5xl p-4 flex justify-between items-center">
            <a href="index.html" class="text-2xl font-bold text-green-600">Faz Bem</a>
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
        
        userMenu.innerHTML = `
            <a href="perfil-doador.html" class="flex items-center space-x-2">
                <span class="text-sm font-medium text-gray-700 hidden sm:block">${profile?.displayName || auth.displayName}</span>
                <img src="${photoURL}" class="w-10 h-10 rounded-full object-cover border-2 border-gray-200">
            </a>
            <button id="header-logout-btn" class="text-sm text-gray-500 hover:text-red-600">Sair</button>
        `;
        document.getElementById('header-logout-btn').addEventListener('click', () => {
            logout().then(() => window.location.href = 'index.html');
        });

    } else {
        userMenu.innerHTML = `<a href="login.html" class="bg-green-600 text-white px-4 py-2 rounded-md text-sm font-medium hover:bg-green-700 shadow">Entrar / Registar</a>`;
    }
}
