// Importa as funções necessárias do SDK do Firebase
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, onAuthStateChanged, signOut, createUserWithEmailAndPassword, updateProfile, sendEmailVerification } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, getDoc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

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
 * **NOVA FUNÇÃO CENTRALIZADA**
 * Regista um novo utilizador (Doador ou Entidade) no sistema.
 * @param {object} userData - Os dados do utilizador a serem registados.
 * @param {string} userData.email - O e-mail do utilizador.
 * @param {string} userData.password - A senha do utilizador.
 * @param {string} userData.displayName - O nome a ser exibido.
 * @param {object} profileData - Os dados adicionais a serem guardados no perfil do Firestore.
 * @returns {Promise<void>}
 */
const registerUser = async (userData, profileData) => {
    const { email, password, displayName } = userData;
    
    // 1. Cria o utilizador no Firebase Authentication
    const userCredential = await createUserWithEmailAndPassword(auth, email, password);
    const user = userCredential.user;

    // 2. Atualiza o perfil de autenticação com o nome
    await updateProfile(user, { displayName });

    // 3. Guarda os dados detalhados no Firestore
    const userDocRef = doc(db, "users", user.uid);
    await setDoc(userDocRef, {
        uid: user.uid,
        email: user.email,
        displayName: displayName,
        ...profileData // Adiciona todos os outros dados (role, status, cnpj, etc.)
    });

    // 4. Envia o e-mail de verificação
    await sendEmailVerification(user);
};


/**
 * Função de logout.
 */
const logout = () => {
    return signOut(auth);
};

// --- EXPORTAÇÕES ---
// Exporta as variáveis e funções que outras páginas irão precisar
export { auth, db, ADMIN_EMAIL, getCurrentUser, logout, onAuthStateChanged, firebaseConfig, registerUser };
