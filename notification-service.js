// Arquivo: notification-service.js
// Responsabilidade: Centralizar a lógica de criação de notificações.

// <-- INÍCIO DA ALTERAÇÃO: Corrigimos de onde as funções são importadas -->
import { db } from './app-config.js';
import { collection, addDoc, serverTimestamp } from './firebase-services.js';
// <-- FIM DA ALTERAÇÃO -->
import { paths } from './firestore-paths.js';

/**
 * Cria uma nova notificação para um usuário específico.
 * @param {string} userId - O ID do usuário que receberá a notificação.
 * @param {string} message - A mensagem da notificação.
 * @param {string} [link] - Um link opcional para o qual a notificação irá redirecionar.
 * @returns {Promise<void>}
 */
export async function createNotification(userId, message, link = '#') {
    try {
        await addDoc(collection(db, paths.notifications), {
            userId: userId,
            message: message,
            link: link,
            read: false,
            timestamp: serverTimestamp()
        });
    } catch (error) {
        console.error("Erro ao criar notificação:", error);
        // Em uma aplicação real, poderíamos adicionar um sistema de log de erros aqui.
    }
}
