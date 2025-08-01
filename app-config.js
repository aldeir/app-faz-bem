// app-config.js (Versão 6.1 - Com DatabaseURL)

import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { getDatabase } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
import { paths } from './firestore-paths.js';

const firebaseConfig = {
    apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
    authDomain: "app-faz-bem-guacui.firebaseapp.com",
    projectId: "app-faz-bem-guacui",
    storageBucket: "app-faz-bem-guacui.firebasestorage.app",
    messagingSenderId: "218995880923",
    appId: "1:218995880923:web:ce8a371bc402904c0dedfe",
    measurementId: "G-R5W1F2NXH4",
    // CORREÇÃO: Adicionada a URL do Realtime Database
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

export {
    app,
    auth,
    db,
    storage,
    rtdb,
    logout,
    ADMIN_EMAIL,
    firebaseConfig,
    paths
};
