// Arquivo: auth-service.js
// Responsabilidade: Centralizar a lógica de obtenção de dados do usuário autenticado.

import { auth, db, ADMIN_EMAIL, onAuthStateChanged, getDoc, doc } from './app-config.js';
import { paths } from './firestore-paths.js';

/**
 * Obtém o usuário autenticado atual juntamente com seu perfil do Firestore.
 * Esta função verifica se o usuário é superadmin, entidade ou doador.
 * @returns {Promise<{auth: import("firebase/auth").User, profile: object}|null>}
 */
export const getCurrentUser = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (!user) {
                resolve(null);
                return;
            }

            // Caso especial para o Super Admin
            if (user.email === ADMIN_EMAIL) {
                const superAdminProfile = {
                    displayName: user.displayName || 'Super Admin',
                    photoURL: user.photoURL,
                    email: user.email,
                    role: 'superadmin'
                };
                resolve({ auth: user, profile: superAdminProfile });
                return;
            }

            // Tenta buscar o perfil de Entidade primeiro
            let userDocRef = doc(db, paths.entidadeDoc(user.uid));
            let docSnap = await getDoc(userDocRef);

            // Se não for uma entidade, busca o perfil de Doador
            if (!docSnap.exists()) {
                userDocRef = doc(db, paths.userDoc(user.uid));
                docSnap = await getDoc(userDocRef);
            }
            
            resolve({ auth: user, profile: docSnap.exists() ? docSnap.data() : null });
        });
    });
};
