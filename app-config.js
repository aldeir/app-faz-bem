// app-config.js (v2.6 - Robusto e Corrigido)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, 
    updateProfile, sendEmailVerification, signInWithEmailAndPassword, 
    GoogleAuthProvider, signInWithPopup 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { 
    getFirestore, doc, setDoc, getDoc, collection, query, where, 
    onSnapshot, updateDoc, Timestamp, deleteField, runTransaction, serverTimestamp 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage, ref, uploadBytes, getDownloadURL } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
  authDomain: "app-faz-bem-guacui.firebaseapp.com",
  projectId: "app-faz-bem-guacui",
  storageBucket: "app-faz-bem-guacui.appspot.com",
  messagingSenderId: "218995880923",
  appId: "1:218995880923:web:ce8a371bc402904c0dedfe",
  measurementId: "G-R5W1F2NXH4"
};

// Inicialização dos serviços
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const ADMIN_EMAIL = 'aldeir@gmail.com';

const logout = () => signOut(auth);

// --- CORREÇÃO PRINCIPAL ---
// A função agora tem um bloco try...catch para lidar com erros de permissão.
const getCurrentUser = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (user) {
                try {
                    // Tenta ler o perfil de Doador
                    let userDocRef = doc(db, "users", user.uid);
                    let docSnap = await getDoc(userDocRef);

                    // Se não for doador, tenta ler o perfil de Entidade
                    if (!docSnap.exists()) {
                        userDocRef = doc(db, `artifacts/${firebaseConfig.projectId}/public/data/entidades`, user.uid);
                        docSnap = await getDoc(userDocRef);
                    }
                    
                    // Retorna o usuário autenticado e o perfil encontrado (ou null)
                    resolve({ auth: user, profile: docSnap.exists() ? docSnap.data() : null });

                } catch (error) {
                    // Se houver um erro de permissão durante a leitura:
                    console.error("ERRO DE PERMISSÃO em getCurrentUser:", error.message);
                    // Resolve a Promise retornando o usuário autenticado, mas sem perfil.
                    // Isso permite que a app continue funcionando, mesmo sem os dados do perfil.
                    resolve({ auth: user, profile: null });
                }
            } else {
                // Se não há usuário, resolve como nulo.
                resolve(null);
            }
        });
    });
};

// Exporta tudo que a aplicação precisa
export { 
    app, auth, db, storage, logout, onAuthStateChanged, getCurrentUser, ADMIN_EMAIL, firebaseConfig,
    createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup,
    doc, setDoc, getDoc, collection, query, where, onSnapshot, updateDoc, Timestamp, deleteField, runTransaction, serverTimestamp,
    ref, uploadBytes, getDownloadURL
};
