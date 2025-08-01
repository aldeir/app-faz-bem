// Arquivo: auth-service.js
// Responsabilidade: Centralizar a lógica de obtenção de dados do usuário autenticado.

// CORREÇÃO: 'paths' agora é importado do app-config.js
import { auth, db, ADMIN_EMAIL, onAuthStateChanged, getDoc, doc, paths } from './app-config.js';

/**
 * Obtém o usuário autenticado atual juntamente com seu perfil do Firestore.
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

            let userDocRef = doc(db, paths.entidadeDoc(user.uid));
            let docSnap = await getDoc(userDocRef);

            if (!docSnap.exists()) {
                userDocRef = doc(db, paths.userDoc(user.uid));
                docSnap = await getDoc(userDocRef);
            }
            
            resolve({ auth: user, profile: docSnap.exists() ? docSnap.data() : null });
        });
    });
};
