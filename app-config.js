// Importa as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// --- CONFIGURAÇÃO CENTRAL DO FIREBASE ---
const firebaseConfig = {
    apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
    authDomain: "app-faz-bem-guacui.firebaseapp.com",
    projectId: "app-faz-bem-guacui",
    storageBucket: "app-faz-bem-guacui.appspot.com",
    messagingSenderId: "218995880923",
    appId: "1:218995880923:web:ce8a371bc402904c0dedfe",
    measurementId: "G-R5W1F2NXH4"
};

// --- INICIALIZAÇÃO DOS SERVIÇOS ---
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const ADMIN_EMAIL = "aldeir@gmail.com";

/**
 * Obtém o estado atual do utilizador e os seus dados da base de dados.
 * @returns {Promise<object|null>} Um objeto com os dados de autenticação e perfil, ou nulo se não estiver logado.
 */
const getCurrentUser = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe(); // Executa apenas uma vez para obter o estado atual
            if (user) {
                const userDocRef = doc(db, "users", user.uid);
                const docSnap = await getDoc(userDocRef);
                const profile = docSnap.exists() ? docSnap.data() : null;
                resolve({ auth: user, profile: profile });
            } else {
                resolve(null);
            }
        });
    });
};

/**
 * Função de logout.
 */
const logout = () => {
    return signOut(auth);
};

// --- EXPORTAÇÕES ---
// Exporta as variáveis e funções que outras páginas irão precisar
export { auth, db, ADMIN_EMAIL, getCurrentUser, logout, onAuthStateChanged };
