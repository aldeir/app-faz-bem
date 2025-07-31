// Arquivo: firestore-paths.js
// Descrição: Centraliza todos os caminhos de coleções e documentos do Cloud Firestore.

import { firebaseConfig } from './app-config.js';

// O ID do projeto é usado para construir o caminho base, garantindo que funcione em diferentes ambientes (dev, prod).
const appId = firebaseConfig.projectId;
const basePath = `artifacts/${appId}/public/data`;

/**
 * Objeto que contém todos os caminhos e funções geradoras de caminho para o Firestore.
 * O uso deste módulo é preferível a construir os caminhos manualmente em cada arquivo.
 */
export const paths = {
  // --- CAMINHOS DE COLEÇÕES ---
  
  /** Caminho para a coleção de usuários (doadores). */
  users: 'users',

  /** Caminho para a coleção de entidades. */
  entidades: `${basePath}/entidades`,

  /** Caminho para a coleção de campanhas. */
  campaigns: `${basePath}/campaigns`,

  /** Caminho para a coleção de doações. */
  donations: `${basePath}/donations`,

  /** Caminho para a coleção de likes. */
  likes: `${basePath}/likes`,

  /** Caminho para a coleção de configurações gerais. */
  configs: `${basePath}/configs`,

  // --- FUNÇÕES GERADORAS DE CAMINHOS DE DOCUMENTOS ---

  /**
   * Retorna o caminho para um documento de usuário específico.
   * @param {string} uid - O ID do usuário.
   * @returns {string} O caminho completo do documento.
   */
  userDoc: (uid) => `${paths.users}/${uid}`,

  /**
   * Retorna o caminho para um documento de entidade específica.
   * @param {string} uid - O ID da entidade (que é o mesmo do usuário criador).
   * @returns {string} O caminho completo do documento.
   */
  entidadeDoc: (uid) => `${paths.entidades}/${uid}`,
  
  /**
   * Retorna o caminho para um documento de campanha específica.
   * @param {string} campaignId - O ID da campanha.
   * @returns {string} O caminho completo do documento.
   */
  campaignDoc: (campaignId) => `${paths.campaigns}/${campaignId}`,
  
  /**
   * Retorna o caminho para um documento de doação específica.
   * @param {string} donationId - O ID da doação.
   * @returns {string} O caminho completo do documento.
   */
  donationDoc: (donationId) => `${paths.donations}/${donationId}`,
  
  /**
   * Retorna o caminho para um documento de like específico.
   * @param {string} likeId - O ID do like (composto por campaignId_donorId_likerId).
   * @returns {string} O caminho completo do documento.
   */
  likeDoc: (likeId) => `${paths.likes}/${likeId}`,
  
  /**
   * Retorna o caminho para um documento de configuração específico.
   * @param {string} configId - O ID da configuração (ex: 'campaignTypes', 'itemSubtypes').
   * @returns {string} O caminho completo do documento.
   */
  configDoc: (configId) => `${paths.configs}/${configId}`,
};
