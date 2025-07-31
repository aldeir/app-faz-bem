// app-config.js (Versão 3.0 - Refatorado com firestore-paths)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword, 
    updateProfile,
    sendEmailVerification,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";
import { paths } from './firestore-paths.js'; // <-- 1. IMPORTAÇÃO DO MÓDULO

const firebaseConfig = {
  apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
  authDomain: "app-faz-bem-guacui.firebaseapp.com",
  projectId: "app-faz-bem-guacui",
  storageBucket: "app-faz-bem-guacui.firebasestorage.app", 
  messagingSenderId: "218995880923",
  appId: "1:218995880923:web:ce8a371bc402904c0dedfe",
  measurementId: "G-R5W1F2NXH4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

const ADMIN_EMAIL = 'aldeir@gmail.com';

async function registerUser(authData, profileData) {
  const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
  const user = userCredential.user;
  await updateProfile(user, { displayName: authData.displayName });
  await sendEmailVerification(user);

  const fullProfileData = { ...profileData, email: user.email, uid: user.uid };
  // 2. USO DO PATHS PARA SALVAR O DOCUMENTO DA ENTIDADE
  const entidadeRef = doc(db, paths.entidadeDoc(user.uid));
  await setDoc(entidadeRef, fullProfileData);
  return userCredential;
}

const logout = () => signOut(auth);

const getCurrentUser = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (user) {
                if (user.email === ADMIN_EMAIL) {
                    resolve({ auth: user, profile: { displayName: user.displayName, photoURL: user.photoURL, email: user.email, role: 'superadmin' } });
                    return;
                }

                // 3. USO DO PATHS PARA BUSCAR O PERFIL DE ENTIDADE
                let entidadeRef = doc(db, paths.entidadeDoc(user.uid));
                let docSnap = await getDoc(entidadeRef);

                // Se não encontrar um perfil de Entidade, procura por um perfil de Doador
                if (!docSnap.exists()) {
                    // 4. USO DO PATHS PARA BUSCAR O PERFIL DE DOADOR
                    let doadorRef = doc(db, paths.userDoc(user.uid));
                    docSnap = await getDoc(doadorRef);
                }
                
                resolve({ auth: user, profile: docSnap.exists() ? docSnap.data() : null });
            } else {
                resolve(null);
            }
        });
    });
};

export { 
    app, auth, db, storage, analytics, registerUser, logout, onAuthStateChanged,
    getCurrentUser, ADMIN_EMAIL, firebaseConfig, signInWithEmailAndPassword,
    GoogleAuthProvider, signInWithPopup, setDoc, deleteDoc, serverTimestamp, updateProfile
};
