// app-config.js (Versão 4.0 - Arquitetura Limpa e Correta)
// Responsabilidade: Apenas inicializar o Firebase e exportar os serviços.

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { paths } from './firestore-paths.js';

// Importa e re-exporta todas as funções necessárias para que outras páginas
// possam importar tudo a partir de um único lugar.
export * from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
export * from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

const firebaseConfig = {
    apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
    authDomain: "app-faz-bem-guacui.firebaseapp.com",
    projectId: "app-faz-bem-guacui",
    storageBucket: "app-faz-bem-guacui.firebasestorage.app",
    messagingSenderId: "218995880923",
    appId: "1:218995880923:web:ce8a371bc402904c0dedfe",
    measurementId: "G-R5W1F2NXH4"
};

// Inicializa o módulo de caminhos com o ID do projeto.
paths.init(firebaseConfig.projectId);

// Inicializa e exporta os serviços principais do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);

// Exporta constantes e funções utilitárias globais
const ADMIN_EMAIL = 'aldeir@gmail.com';
const logout = () => signOut(auth);

export {
    app,
    auth,
    db,
    storage,
    logout,
    ADMIN_EMAIL,
    firebaseConfig
};
