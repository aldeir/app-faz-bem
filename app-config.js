// app-config.js

// Importa as funções que você precisa dos SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { getAuth, createUserWithEmailAndPassword, updateProfile } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
import { getFirestore, doc, setDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

// A sua configuração do Firebase (fornecida por você)
const firebaseConfig = {
  apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
  authDomain: "app-faz-bem-guacui.firebaseapp.com",
  projectId: "app-faz-bem-guacui",
  storageBucket: "app-faz-bem-guacui.appspot.com",
  messagingSenderId: "218995880923",
  appId: "1:218995880923:web:ce8a371bc402904c0dedfe",
  measurementId: "G-R5W1F2NXH4"
};

// Inicializa os serviços do Firebase
const app = initializeApp(firebaseConfig);
const auth = getAuth(app);
const db = getFirestore(app);
const storage = getStorage(app);
const analytics = getAnalytics(app);

/**
 * Função centralizada para registrar uma nova entidade.
 * Cria o usuário na autenticação e salva o perfil completo no Firestore.
 * @param {object} authData - Contém email, password e displayName.
 * @param {object} profileData - Contém todos os outros dados do perfil da entidade.
 * @returns {Promise<UserCredential>} A credencial do usuário criado.
 */
async function registerUser(authData, profileData) {
  // 1. Cria o usuário no Firebase Authentication
  const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
  const user = userCredential.user;

  // 2. Atualiza o perfil do usuário na Autenticação (ex: nome de exibição)
  await updateProfile(user, { displayName: authData.displayName });

  // 3. Salva o perfil completo da entidade no Firestore, usando o UID do usuário como ID do documento
  const fullProfileData = {
    ...profileData,
    email: user.email, // Garante que o email também seja salvo no perfil
    uid: user.uid      // É uma boa prática salvar o UID no documento
  };
  await setDoc(doc(db, "entidades", user.uid), fullProfileData);

  return userCredential;
}

// Exporta os serviços inicializados e a função de registro para serem usados em outras páginas
export { app, auth, db, storage, analytics, registerUser };
