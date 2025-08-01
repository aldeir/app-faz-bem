// Arquivo: auth-service.js (Versão 2.2 - Arquitetura Limpa)

import { auth, db, rtdb, ADMIN_EMAIL } from './app-config.js';
import { onAuthStateChanged, getDoc, doc, databaseRef, set, onDisconnect, serverTimestamp } from './firebase-services.js';
import { paths } from './firestore-paths.js';

/**
 * Gerencia o status de presença do usuário no Realtime Database.
 */
function managePresence(user, profile) {
    const userStatusRef = databaseRef(rtdb, `status/${user.uid}`);
    
    const presenceData = {
        name: profile.displayName || user.displayName,
        photoURL: profile.photoURL || user.photoURL,
        onlineAt: serverTimestamp()
    };

    set(userStatusRef, presenceData);
    onDisconnect(userStatusRef).remove();
}

export const getCurrentUser = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (!user) {
                resolve(null);
                return;
            }

            let profile = null;

            if (user.email === ADMIN_EMAIL) {
                profile = {
                    displayName: user.displayName || 'Super Admin',
                    photoURL: user.photoURL,
                    email: user.email,
                    role: 'superadmin'
                };
            } else {
                let userDocRef = doc(db, paths.entidadeDoc(user.uid));
                let docSnap = await getDoc(userDocRef);

                if (!docSnap.exists()) {
                    userDocRef = doc(db, paths.userDoc(user.uid));
                    docSnap = await getDoc(userDocRef);
                }
                if (docSnap.exists()) {
                    profile = docSnap.data();
                }
            }

            if (profile) {
                managePresence(user, profile);
                resolve({ auth: user, profile: profile });
            } else {
                resolve({ auth: user, profile: null });
            }
        });
    });
};
