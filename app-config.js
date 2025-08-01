// app-config.js (Versão 5.0 - Exports Explícitos e Corrigidos)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
// Auth
import { 
    getAuth, signOut, onAuthStateChanged, createUserWithEmailAndPassword, 
    updateProfile, sendEmailVerification, signInWithEmailAndPassword, 
    GoogleAuthProvider, signInWithPopup, getAdditionalUserInfo 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// Firestore
import { 
    getFirestore, doc, setDoc, getDoc, serverTimestamp, deleteDoc,
    collection, query, where, onSnapshot, getDocs, updateDoc,
    writeBatch, FieldValue
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
// Storage
import { 
    getStorage, ref as storageRef, uploadBytes, getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
// Realtime Database
import { 
    getDatabase, ref as databaseRef, set, onDisconnect, onValue 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";

import { paths } from './firestore-paths.js';

const firebaseConfig = {
    apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
    authDomain: "app-faz-bem-guacui.firebaseapp.com",
    projectId: "app-faz-bem-guacui",
    storageBucket: "app-faz-bem-guacui.firebasestorage.app",
    messagingSenderId: "218995880923",
    appId: "1:218995880923:web:ce8a371bc402904c0dedfe",
    measurementId: "G-R5W1F2NXH4",
    databaseURL: "https://app-faz-bem-guacui-default-rtdb.firebaseio.com"
};

paths.init(firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const rtdb = getDatabase(app);

const ADMIN_EMAIL = 'aldeir@gmail.com';
const logout = () => signOut(auth);

// Exporta tudo de forma explícita para evitar conflitos
export {
    // Serviços
    app, auth, db, storage, rtdb,
    // Constantes e Funções
    logout, ADMIN_EMAIL, firebaseConfig, paths,
    // Auth
    onAuthStateChanged, createUserWithEmailAndPassword, updateProfile, 
    sendEmailVerification, signInWithEmailAndPassword, GoogleAuthProvider, 
    signInWithPopup, getAdditionalUserInfo,
    // Firestore
    doc, setDoc, getDoc, serverTimestamp, deleteDoc, collection, 
    query, where, onSnapshot, getDocs, updateDoc, writeBatch, FieldValue,
    // Storage (com alias)
    storageRef, uploadBytes, getDownloadURL,
    // Realtime DB (com alias)
    databaseRef, set, onDisconnect, onValue
};
