// Arquivo: firestore-paths.js
// Versão 5.0 - Caminhos corrigidos para refletir a estrutura real do banco de dados na raiz.

export const paths = {
    // Getters para Coleções na raiz do Firestore
    get users() { return 'users'; },
    get entidades() { return 'entidades'; },
    get campaigns() { return 'campaigns'; },
    get donations() { return 'donations'; },
    get likes() { return 'likes'; },
    get configs() { return 'configs'; },
    get notifications() { return 'notifications'; },

    // Funções para Documentos
    userDoc: function(uid) { return `${this.users}/${uid}`; },
    entidadeDoc: function(uid) { return `${this.entidades}/${uid}`; },
    campaignDoc: function(campaignId) { return `${this.campaigns}/${campaignId}`; },
    donationDoc: function(donationId) { return `${this.donations}/${donationId}`; },
    likeDoc: function(likeId) { return `${this.likes}/${likeId}`; },
    configDoc: function(configId) { return `${this.configs}/${configId}`; },
    notificationDoc: function(notificationId) { return `${this.notifications}/${notificationId}`; },
};
