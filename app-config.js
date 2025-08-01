// app-config.js (Versão 4.2 - Exportando Paths)
// Responsabilidade: Inicializar o Firebase e exportar todos os serviços e configurações.

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { paths } from './firestore-paths.js';

// Re-exporta todas as funções para um único ponto de acesso
export * from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
export * from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
export * from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

const firebaseConfig = {
    apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
    authDomain: "app-faz-bem-guacui.firebaseapp.com",
    projectId: "app-faz-bem-guacui",
    storageBucket: "app-faz-bem-guacui.firebasestorage.app",
    messagingSenderId: "218995880923",
    appId: "1:218995880923:web:ce8a371bc402904c0dedfe",
    measurementId: "G-R5W1F2NXH4"
};

paths.init(firebaseConfig.projectId);

const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

const ADMIN_EMAIL = 'aldeir@gmail.com';
const logout = () => signOut(auth);

export {
    app,
    auth,
    db,
    storage,
    logout,
    ADMIN_EMAIL,
    firebaseConfig,
    paths // <-- CORREÇÃO: Exporta o objeto 'paths' já inicializado
};
