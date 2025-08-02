// Arquivo: firebase-services.js
// Responsabilidade: Único ponto de importação para todas as funções do SDK do Firebase.
// Resolve conflitos de nome e centraliza as dependências.

// Auth
export { 
    onAuthStateChanged, 
    createUserWithEmailAndPassword, 
    updateProfile, 
    sendEmailVerification, 
    signInWithEmailAndPassword, 
    GoogleAuthProvider, 
    signInWithPopup, 
    getAdditionalUserInfo 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-auth.js";

// Firestore
export { 
    doc, 
    setDoc, 
    getDoc, 
    serverTimestamp, 
    deleteDoc, 
    collection, 
    query, 
    where, 
    onSnapshot, 
    getDocs, 
    updateDoc, 
    writeBatch, 
    FieldValue,
    orderBy,
    Timestamp,
    addDoc // <-- CORREÇÃO: Função 'addDoc' adicionada à lista de exportação.
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-firestore.js";

// Storage (com alias para 'ref')
export { 
    ref as storageRef, 
    uploadBytes, 
    getDownloadURL 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-storage.js";

// Realtime Database (com alias para 'ref')
export { 
    ref as databaseRef, 
    set, 
    onDisconnect, 
    onValue 
} from "https://www.gstatic.com/firebasejs/11.6.1/firebase-database.js";
