// Arquivo: profile-service.js
// Responsabilidade: Centralizar a busca e o cache de perfis de utilizadores (doadores e entidades).

import { db } from './app-config.js';
import { doc, getDoc } from './firebase-services.js';
import { paths } from './firestore-paths.js';

// Um cache simples em memória para evitar buscas repetidas na base de dados durante a mesma sessão.
const profilesCache = new Map();

/**
 * Busca um perfil de utilizador (doador ou entidade) pelo seu ID.
 * Primeiro, verifica o cache. Se não encontrar, busca no Firestore.
 * @param {string} userId O ID do utilizador a ser procurado.
 * @returns {Promise<Object|null>} O objeto do perfil ou um objeto padrão se não for encontrado.
 */
export async function getProfileById(userId) {
    if (!userId) {
        return { displayName: 'Sistema', photoURL: null };
    }
    
    // [NOVO] Verificação especial para campanhas gerais do App Faz Bem.
    if (userId === 'app_faz_bem') {
        return { publicName: 'App Faz Bem', displayName: 'App Faz Bem', photoURL: './images/icons/icon-192x192.png' };
    }

    // 1. Verifica se já temos o perfil em cache para máxima performance.
    if (profilesCache.has(userId)) {
        return profilesCache.get(userId);
    }

    // 2. Se não estiver no cache, procura primeiro na coleção de entidades.
    let userDocRef = doc(db, paths.entidadeDoc(userId));
    let docSnap = await getDoc(userDocRef);

    // 3. Se não for uma entidade, procura na coleção de doadores.
    if (!docSnap.exists()) {
        userDocRef = doc(db, paths.userDoc(userId));
        docSnap = await getDoc(userDocRef);
    }

    // 4. Se encontrarmos o perfil, guardamos no cache e retornamos os dados.
    if (docSnap.exists()) {
        const profileData = docSnap.data();
        // Garante que ambos os possíveis nomes de exibição estejam disponíveis.
        if (profileData.publicName) profileData.displayName = profileData.publicName;
        if (profileData.displayName) profileData.publicName = profileData.displayName;
        
        profilesCache.set(userId, profileData);
        return profileData;
    }

    // 5. Se não encontrarmos em lado nenhum, retornamos um objeto padrão para evitar erros.
    console.warn(`Perfil não encontrado para o ID: ${userId}`);
    const notFoundProfile = { displayName: 'Utilizador Desconhecido', publicName: 'Entidade Desconhecida', photoURL: null };
    profilesCache.set(userId, notFoundProfile); // Também guardamos no cache para não procurar de novo.
    return notFoundProfile;
}
