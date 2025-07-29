// app-config.js (v2.5 - Final e Centralizado)

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

// A sua configuração do Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
  authDomain: "app-faz-bem-guacui.firebaseapp.com",
  projectId: "app-faz-bem-guacui",
  storageBucket: "app-faz-bem-guacui.appspot.com", // Usando a versão .appspot.com que é o padrão para o SDK
  messagingSenderId: "218995880923",
  appId: "1:218995880923:web:ce8a371bc402904c0dedfe",
  measurementId: "G-R5W1F2NXH4"
};

// Inicializa os serviços do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const ADMIN_EMAIL = 'aldeir@gmail.com';

const logout = () => signOut(auth);

const getCurrentUser = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (user) {
                let userDocRef = doc(db, "users", user.uid);
                let docSnap = await getDoc(userDocRef);

                if (!docSnap.exists()) {
                    userDocRef = doc(db, `artifacts/${firebaseConfig.projectId}/public/data/entidades`, user.uid);
                    docSnap = await getDoc(userDocRef);
                }
                
                resolve({ auth: user, profile: docSnap.exists() ? docSnap.data() : null });
            } else {
                resolve(null);
            }
        });
    });
};

// Exporta tudo que a aplicação precisa, de forma centralizada
export { 
    app, auth, db, storage, logout, onAuthStateChanged, getCurrentUser, ADMIN_EMAIL, firebaseConfig,
    // Auth
    createUserWithEmailAndPassword, updateProfile, sendEmailVerification, signInWithEmailAndPassword, GoogleAuthProvider, signInWithPopup,
    // Firestore
    doc, setDoc, getDoc, collection, query, where, onSnapshot, updateDoc, Timestamp, deleteField, runTransaction, serverTimestamp,
    // Storage
    ref, uploadBytes, getDownloadURL
};
