// app-config.js (Versão 2.3 - Final)

// Importa as funções que você precisa dos SDKs
import { initializeApp } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-app.js";
import { 
    getAuth, 
    onAuthStateChanged,
    signOut,
    createUserWithEmailAndPassword, 
    updateProfile,
    sendEmailVerification,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";
// Adicionadas as funções necessárias para as novas funcionalidades
import { getFirestore, doc, setDoc, getDoc, serverTimestamp, deleteDoc } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";
import { getStorage } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/11.6.1/firebase-analytics.js";

// A sua configuração do Firebase com o storageBucket original e correto
const firebaseConfig = {
  apiKey: "AIzaSyCGIBYXEhvGDfcpbzyOxPiRJkAixCGpmcE",
  authDomain: "app-faz-bem-guacui.firebaseapp.com",
  projectId: "app-faz-bem-guacui",
  storageBucket: "app-faz-bem-guacui.firebasestorage.app", 
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

const ADMIN_EMAIL = 'aldeir@gmail.com'; // Email do administrador

/**
 * Função centralizada para registrar uma nova entidade.
 */
async function registerUser(authData, profileData) {
  const userCredential = await createUserWithEmailAndPassword(auth, authData.email, authData.password);
  const user = userCredential.user;
  await updateProfile(user, { displayName: authData.displayName });
  await sendEmailVerification(user);

  const appId = firebaseConfig.projectId;
  const fullProfileData = {
    ...profileData,
    email: user.email,
    uid: user.uid
  };
  await setDoc(doc(db, "artifacts", appId, "public", "data", "entidades", user.uid), fullProfileData);
  return userCredential;
}

/**
 * Função para fazer logout do usuário.
 */
const logout = () => signOut(auth);

/**
 * Obtém a sessão do usuário atual (auth e perfil do Firestore).
 */
const getCurrentUser = () => {
    return new Promise((resolve) => {
        const unsubscribe = onAuthStateChanged(auth, async (user) => {
            unsubscribe();
            if (user) {
                // MELHORIA: Lógica específica para o Superadmin
                if (user.email === ADMIN_EMAIL) {
                    // Cria um objeto de perfil "virtual" para o superadmin,
                    // já que ele não tem um documento no Firestore.
                    resolve({ 
                        auth: user, 
                        profile: { 
                            displayName: user.displayName, 
                            photoURL: user.photoURL, 
                            email: user.email, 
                            role: 'superadmin' 
                        } 
                    });
                    return;
                }

                let userDocRef = doc(db, "users", user.uid);
                let docSnap = await getDoc(userDocRef);

                if (!docSnap.exists()) {
                    const appId = firebaseConfig.projectId;
                    userDocRef = doc(db, "artifacts", appId, "public", "data", "entidades", user.uid);
                    docSnap = await getDoc(userDocRef);
                }
                
                resolve({ auth: user, profile: docSnap.exists() ? docSnap.data() : null });
            } else {
                resolve(null);
            }
        });
    });
};

// Exporta tudo para ser usado em outras páginas
export { 
    app, 
    auth, 
    db, 
    storage, 
    analytics, 
    registerUser, 
    logout, 
    onAuthStateChanged,
    getCurrentUser,
    ADMIN_EMAIL,
    firebaseConfig,
    signInWithEmailAndPassword,
    GoogleAuthProvider,
    signInWithPopup,
    setDoc,
    deleteDoc,
    serverTimestamp,
    updateProfile // Exporta a função para ser usada em outras páginas
};
