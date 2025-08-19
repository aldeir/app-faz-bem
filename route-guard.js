// route-guard.js - Sistema unificado de proteção de rotas
// Versão 1.0 - Implementação inicial para o MVP

import { getCurrentUser } from './auth-service.js';

// Base path: supports GitHub Pages (/app-faz-bem) and local dev ("")
const REPO_BASE = "/app-faz-bem";
const BASE_PATH = location.pathname.startsWith(REPO_BASE) ? REPO_BASE : "";

function redirectTo403() {
  const from = encodeURIComponent(location.pathname + location.search + location.hash);
  console.warn("Route Guard: Acesso negado — redirecionando para 403");
  window.location.replace(`${BASE_PATH}/403.html?from=${from}`);
}

/**
 * Sistema unificado de proteção de rotas com verificação de autenticação, roles e email
 * 
 * @param {Object} options - Opções de configuração do guard
 * @param {boolean} options.requireAuth - Se true, exige usuário autenticado
 * @param {string[]} options.requiredRoles - Array de roles permitidos (ex: ['entidade', 'doador', 'superadmin'])
 * @param {boolean} options.requireVerified - Se true, exige email verificado
 * @param {boolean} options.requireApprovedEntity - Se true, exige que entidades tenham status 'ativo'
 * @param {string} options.redirectTo - URL para redirecionamento personalizado (padrão: 'login.html')
 * @param {string} options.pendingRedirectTo - URL para entidades pendentes (padrão: 'aguardando-aprovacao.html')
 * 
 * @returns {Promise<Object|null>} Retorna userSession se autorizado, null se não autorizado
 * 
 * @example
 * // Página que requer autenticação
 * const userSession = await guard({ requireAuth: true });
 * 
 * @example
 * // Página apenas para entidades ativas com email verificado
 * const userSession = await guard({ 
 *   requireAuth: true, 
 *   requiredRoles: ['entidade'], 
 *   requireVerified: true,
 *   requireApprovedEntity: true
 * });
 * 
 * @example
 * // Página de superadmin
 * const userSession = await guard({ 
 *   requireAuth: true, 
 *   requiredRoles: ['superadmin'] 
 * });
 */
export async function guard(options = {}) {
    const {
        requireAuth = false,
        requiredRoles = [],
        requireVerified = false,
        requireApprovedEntity = false,
        redirectTo = 'login.html',
        pendingRedirectTo = 'aguardando-aprovacao.html'
    } = options;

    try {
        // Obter sessão do usuário atual
        const userSession = await getCurrentUser();

        // Verificação 1: Autenticação obrigatória
        if (requireAuth && !userSession) {
            console.log('Route Guard: Usuário não autenticado, redirecionando para login');
            const currentPage = encodeURIComponent(window.location.pathname + window.location.search);
            window.location.href = `${redirectTo}?next=${currentPage}`;
            return null;
        }

        // Se não há usuário e não requer autenticação, permite acesso
        if (!userSession && !requireAuth) {
            return null;
        }

        // Verificação 2: Email verificado (se obrigatório)
        if (requireVerified && !userSession.isVerified) {
            console.log('Route Guard: Email não verificado, redirecionando para verificação');
            window.location.href = 'verificar-email.html';
            return null;
        }

        // Verificação 3: Roles permitidos
        if (requiredRoles.length > 0) {
            const userRole = userSession.profile?.role;
            
            // Verificação especial para superadmin (role ou email admin)
            const isSuperAdmin = userRole === 'superadmin' || 
                               (userSession.auth?.email === 'aldeir@gmail.com');

            if (!userRole) {
                console.log('Route Guard: Usuário sem role definido');
                redirectTo403();
                return null;
            }

            // Se role superadmin está nas roles requeridas e usuário é superadmin
            if (requiredRoles.includes('superadmin') && isSuperAdmin) {
                console.log('Route Guard: Acesso liberado para superadmin');
                return userSession;
            }

            // Verificação normal de roles
            if (!requiredRoles.includes(userRole) && !isSuperAdmin) {
                console.log(`Route Guard: Role '${userRole}' não autorizado. Roles permitidos:`, requiredRoles);
                redirectTo403();
                return null;
            }

            // Verificação 4: Status da entidade (se for entidade e requerido)
            if (userRole === 'entidade' && userSession.profile && requireApprovedEntity) {
                const entityStatus = userSession.profile.status;
                
                if (entityStatus === 'pendente') {
                    console.log('Route Guard: Entidade pendente de aprovação, redirecionando');
                    window.location.href = pendingRedirectTo;
                    return null;
                }

                if (entityStatus !== 'ativo') {
                    console.log(`Route Guard: Status da entidade '${entityStatus}' não permite acesso`);
                    redirectTo403();
                    return null;
                }
            }
        }

        // Se chegou até aqui, o acesso é permitido
        console.log('Route Guard: Acesso autorizado');
        return userSession;

    } catch (error) {
        console.error('Route Guard: Erro durante verificação de acesso:', error);
        // Em caso de erro, redireciona para login por segurança
        window.location.href = redirectTo;
        return null;
    }
}

/**
 * Função auxiliar para verificar apenas se o usuário está autenticado
 * Não faz redirecionamento, apenas retorna boolean
 * 
 * @returns {Promise<boolean>} true se autenticado, false caso contrário
 */
export async function isAuthenticated() {
    try {
        const userSession = await getCurrentUser();
        return !!userSession;
    } catch (error) {
        console.error('Route Guard: Erro ao verificar autenticação:', error);
        return false;
    }
}

/**
 * Função auxiliar para verificar se o usuário possui uma role específica
 * Não faz redirecionamento, apenas retorna boolean
 * 
 * @param {string} role - Role a ser verificada
 * @returns {Promise<boolean>} true se possui a role, false caso contrário
 */
export async function hasRole(role) {
    try {
        const userSession = await getCurrentUser();
        if (!userSession || !userSession.profile) return false;
        
        const userRole = userSession.profile.role;
        
        // Verificação especial para superadmin
        if (role === 'superadmin') {
            return userRole === 'superadmin' || userSession.auth?.email === 'aldeir@gmail.com';
        }
        
        return userRole === role;
    } catch (error) {
        console.error('Route Guard: Erro ao verificar role:', error);
        return false;
    }
}

/**
 * Função auxiliar para obter as páginas públicas que não precisam de autenticação
 * Útil para verificações condicionais
 * 
 * @returns {string[]} Array com os caminhos das páginas públicas
 */
export function getPublicPages() {
    return [
        '/index.html',
        '/',
        '/verificar-email.html',
        '/login.html',
        '/cadastro-doador.html',
        '/cadastro-entidade.html',
        '/termos-de-servico.html',
        '/politica-de-privacidade.html',
        '/recuperar-senha.html',
        '/403.html'
    ];
}

/**
 * Função auxiliar para verificar se a página atual é pública
 * 
 * @returns {boolean} true se for página pública, false caso contrário
 */
export function isPublicPage() {
    const publicPages = getPublicPages();
    return publicPages.some(path => window.location.pathname.endsWith(path));
}