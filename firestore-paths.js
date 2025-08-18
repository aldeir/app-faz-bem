// Arquivo: firestore-paths.js
// Versão 3.4 - Adicionado caminho para a COLEÇÃO de representantes

const paths = {
    _projectId: null,
    _basePath: '',

    init: function(projectId) {
        if (!projectId) {
            throw new Error("Firestore Paths Error: O ID do Projeto é obrigatório para a inicialização.");
        }
        if (this._projectId) return;

        this._projectId = projectId;
        this._basePath = `artifacts/${this._projectId}/public/data`;
    },

    _checkInit: function() {
        if (!this._projectId) {
            throw new Error("Firestore Paths Error: O serviço de caminhos não foi inicializado. Chame paths.init(projectId) primeiro.");
        }
    },

    // --- Getters para Coleções ---
    get users() { this._checkInit(); return 'users'; },
    get entidades() { this._checkInit(); return `${this._basePath}/entidades`; },
    
    // --- INÍCIO DA ADIÇÃO: Getter para a subcoleção de representantes ---
    representantesCollection: function(entidadeId) { this._checkInit(); return `${this.entidades}/${entidadeId}/representantes`; },
    // --- FIM DA ADIÇÃO ---

    get campaigns() { this._checkInit(); return `${this._basePath}/campaigns`; },
    get donations() { this._checkInit(); return `${this._basePath}/donations`; },
    get likes() { this._checkInit(); return `${this._basePath}/likes`; },
    get configs() { this._checkInit(); return `${this._basePath}/configs`; },
    get notifications() { this._checkInit(); return `${this._basePath}/notifications`; },

    // --- Funções para Documentos ---
    userDoc: function(uid) { this._checkInit(); return `${this.users}/${uid}`; },
    entidadeDoc: function(uid) { this._checkInit(); return `${this.entidades}/${uid}`; },
    representanteDoc: function(entidadeId, representanteId) { this._checkInit(); return `${this.representantesCollection(entidadeId)}/${representanteId}`; },
    campaignDoc: function(campaignId) { this._checkInit(); return `${this.campaigns}/${campaignId}`; },
    donationDoc: function(donationId) { this._checkInit(); return `${this.donations}/${donationId}`; },
    likeDoc: function(likeId) { this._checkInit(); return `${this.likes}/${likeId}`; },
    configDoc: function(configId) { this._checkInit(); return `${this.configs}/${configId}`; },
    notificationDoc: function(notificationId) { this._checkInit(); return `${this.notifications}/${notificationId}`; },
};

export { paths };
