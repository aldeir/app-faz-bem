// Arquivo: firestore-paths.js
// Descrição: Centraliza todos os caminhos de coleções e documentos do Cloud Firestore.
// Versão 2.0 - Corrigido para remover dependência circular.

// O objeto 'paths' é exportado vazio inicialmente.
// Ele será preenchido pela função 'initializePaths' assim que o app for carregado.
const paths = {};

/**
 * Inicializa o objeto 'paths' com o ID do projeto do Firebase.
 * Esta função deve ser chamada uma única vez pelo app-config.js.
 * @param {string} projectId - O ID do projeto do Firebase.
 */
function initializePaths(projectId) {
    if (!projectId) {
        throw new Error("O ID do Projeto é necessário para inicializar os caminhos do Firestore.");
    }
    
    const basePath = `artifacts/${projectId}/public/data`;

    // --- CAMINHOS DE COLEÇÕES ---
    paths.users = 'users';
    paths.entidades = `${basePath}/entidades`;
    paths.campaigns = `${basePath}/campaigns`;
    paths.donations = `${basePath}/donations`;
    paths.likes = `${basePath}/likes`;
    paths.configs = `${basePath}/configs`;

    // --- FUNÇÕES GERADORAS DE CAMINHOS DE DOCUMENTOS ---
    paths.userDoc = (uid) => `${paths.users}/${uid}`;
    paths.entidadeDoc = (uid) => `${paths.entidades}/${uid}`;
    paths.campaignDoc = (campaignId) => `${paths.campaigns}/${campaignId}`;
    paths.donationDoc = (donationId) => `${paths.donations}/${donationId}`;
    paths.likeDoc = (likeId) => `${paths.likes}/${likeId}`;
    paths.configDoc = (configId) => `${paths.configs}/${configId}`;
}

// Exporta o objeto (que será preenchido) e a função de inicialização.
export { paths, initializePaths };
