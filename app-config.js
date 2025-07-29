// app-config.js (v4.0 - Versão Estável e Definitiva)

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

const firebaseConfig = {
  apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
  authDomain: "app-faz-bem-guacui.firebaseapp.com",
  projectId: "app-faz-bem-guacui",
  storageBucket: "app-faz-bem-guacui.appspot.com",
  messagingSenderId: "218995880923",
  appId: "1:218995880923:web:ce8a371bc402904c0dedfe",
  measurementId: "G-R5W1F2NXH4"
};

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const ADMIN_EMAIL = 'aldeir@gmail.com';

const logout = () => signOut(auth);

// Função robusta que busca o perfil do usuário sem quebrar a aplicação.
const getCurrentUser = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (user) {
                try {
                    let userProfile = null;
                    // Tenta ler o perfil de Doador
                    let docRef = doc(db, "users", user.uid);
                    let docSnap = await getDoc(docRef);

                    if (docSnap.exists()) {
                        userProfile = docSnap.data();
                    } else {
                        // Se não for doador, tenta ler o perfil de Entidade
                        docRef = doc(db, `artifacts/${firebaseConfig.projectId}/public/data/entidades`, user.uid);
                        docSnap = await getDoc(docRef);
                        if (docSnap.exists()) {
                            userProfile = docSnap.data();
                        }
                    }
                    resolve({ auth: user, profile: userProfile });
                } catch (error) {
                    console.error("Falha ao buscar perfil do usuário em getCurrentUser:", error);
                    resolve({ auth: user, profile: null });
                }
            } else {
                resolve(null);
            }
        });
    });
};

export { 
    app, auth, db, storage, logout, onAuthStateChanged, getCurrentUser, ADMIN_EMAIL, firebaseConfig,
    createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup,
    doc, setDoc, getDoc, collection, query, where, onSnapshot, updateDoc, Timestamp, deleteField, runTransaction, serverTimestamp,
    ref, uploadBytes, getDownloadURL
};
