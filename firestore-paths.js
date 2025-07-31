// Arquivo: firestore-paths.js
// Versão 3.1 - Código limpo sem caracteres especiais.

const paths = {
    _projectId: null,
    _basePath: '',

    /**
     * Inicializa os caminhos com o ID do projeto. Deve ser chamado uma única vez.
     * @param {string} projectId - O ID do projeto do Firebase.
     */
    init: function(projectId) {
        if (!projectId) {
            throw new Error("Firestore Paths Error: O ID do Projeto é obrigatório para a inicialização.");
        }
        if (this._projectId) return; // Evita re-inicialização

        this._projectId = projectId;
        this._basePath = `artifacts/${this._projectId}/public/data`;
    },

    /**
     * Verifica se o módulo foi inicializado antes de usar os caminhos.
     * @private
     */
    _checkInit: function() {
        if (!this._projectId) {
            throw new Error("Firestore Paths Error: O serviço de caminhos não foi inicializado. Chame paths.init(projectId) primeiro.");
        }
    },

    // --- Getters para Coleções ---
    get users() { this._checkInit(); return 'users'; },
    get entidades() { this._checkInit(); return `${this._basePath}/entidades`; },
    get campaigns() { this._checkInit(); return `${this._basePath}/campaigns`; },
    get donations() { this._checkInit(); return `${this._basePath}/donations`; },
    get likes() { this._checkInit(); return `${this._basePath}/likes`; },
    get configs() { this._checkInit(); return `${this._basePath}/configs`; },

    // --- Funções para Documentos ---
    userDoc: function(uid) { this._checkInit(); return `${this.users}/${uid}`; },
    entidadeDoc: function(uid) { this._checkInit(); return `${this.entidades}/${uid}`; },
    campaignDoc: function(campaignId) { this._checkInit(); return `${this.campaigns}/${campaignId}`; },
    donationDoc: function(donationId) { this._checkInit(); return `${this.donations}/${donationId}`; },
    likeDoc: function(likeId) { this._checkInit(); return `${this.likes}/${likeId}`; },
    configDoc: function(configId) { this._checkInit(); return `${this.configs}/${configId}`; },
};

export { paths };
