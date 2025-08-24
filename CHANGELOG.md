# Changelog

Todas as mudanças notáveis do projeto App Faz Bem serão documentadas neste arquivo.

> **Nota**: Este é um placeholder para o sistema de versionamento formal. Versões oficiais e changelog automatizado serão implementados futuramente com **semantic-release** ou **changesets**.

## [Unreleased] - 2.2.0 (PWA Phase 3)

### Added
- **PWA Tooling**: ESLint, Prettier, EditorConfig para qualidade de código
- **CI/CD Pipeline**: GitHub Actions workflow com Node.js 18.x e 20.x
- **Service Worker Verification**: Script `scripts/verify-sw.js` para validação automática
- **Service Worker Registration Helper**: `src/pwa/registerServiceWorker.js` com detecção de atualizações
- **Logger CommonJS**: Convertido `src/lib/logging/logger.js` para CommonJS (alinhamento com utilities)
- **TypeScript Declarations**: `src/lib/logging/logger.d.ts` para suporte TypeScript
- **Campaign Status UMD**: `src/domain/campaign/status.browser.js` para uso direto no browser
- **NPM Scripts**: `lint`, `format`, `build:pwa`, `pwa:sw:check` para desenvolvimento
- **PWA Documentation**: `docs/pwa.md` completo com estratégias e troubleshooting
- **Offline Detection UX**: Service worker message integration para status offline

### Changed
- **index.html**: Service worker registration usa helper module com fallback
- **README.md**: Seção PWA expandida com instruções de teste e verificação
- **package.json**: Dependências de desenvolvimento (eslint, prettier) e scripts adicionais

### Enhanced
- **Update Flow**: Detecção automática de atualizações com eventos customizados
- **Error Handling**: Fallback gracioso para browsers sem suporte a módulos
- **Code Quality**: Linting configurado para ES modules, CommonJS, e service workers
- **Developer Experience**: Verificação automática e documentação abrangente

## [v0.4.0] - 2024-12-19 (Primeiro Lote - PWA Enhancements)

### Added
- **Service Worker v0.4.0**: Versão aprimorada com retry inteligente e controle de atualização
- **Retry Logic**: Implementado backoff exponencial para doações offline (máximo 3 tentativas)
- **Constantes BUILD_TS**: Timestamp de build para diagnóstico de versões
- **Canal de atualização**: postMessage 'sw:update-ready' para notificar clientes
- **Suporte SKIP_WAITING**: Ativação imediata via mensagem do cliente
- **Ícones dedicados**: icon-192.png, icon-512.png, icon-maskable-512.png (placeholders)
- **Precache expandido**: Inclui novos ícones e arquivos CSS essenciais
- **Limite MAX_IMAGES**: Controle de cache de imagens (50 itens)

### Changed
- **manifest.json**: start_url absoluto com parâmetro PWA (/index.html?src=pwa)
- **manifest.json**: scope ajustado para raiz (/)
- **manifest.json**: Removido display_override "fullscreen" 
- **manifest.json**: Ícones separados com propósitos específicos (any/maskable)
- **manifest.json**: Shortcuts com caminhos absolutos e ícone 192px
- **manifest.json**: share_target action absoluto (/share.html)
- **Service Worker**: Removido skipWaiting automático do install (controle do cliente)
- **Offline Queue**: Remoção de itens apenas após POST bem-sucedido
- **Navigation Preload**: Correção do armazenamento no cache de páginas

### Fixed
- **Perda de doações**: Fila offline não remove itens antes do envio bem-sucedido
- **Instalações múltiplas**: URLs absolutos previnem múltiplas entradas PWA
- **Transparência de atualização**: UX clara para atualizações do Service Worker
- **Ícones Android**: Separação de ícones maskable para melhor compatibilidade TWA

### Observações
- Ícones são placeholders do logo.png atual (necessário redimensionamento futuro)
- Endpoint /api/offline-donation mantido como placeholder
- Página share.html referenciada (verificar implementação antes do deploy)

## [Não Versionado] - Em Desenvolvimento

### 🎉 Foundation & Documentação

#### Added
- **Governança**: CONTRIBUTING.md com diretrizes de contribuição
- **ADR 0001**: Documentação da estratégia de Design Tokens
- **Design System**: Documentação completa dos tokens de design
- **Arquitetura**: Planejamento da estrutura de módulos
- **Testing**: Estratégia progressive de testes (Unit → Integration → E2E)
- **Performance**: Estratégia de otimização e Core Web Vitals
- **Templates**: Issue templates para refactor, components, bugs e chores
- **Templates**: Pull Request template com checklist completo
- **Observability**: Placeholder para estratégia de monitoramento futuro

#### Documentation
- Convenções de branch naming e Conventional Commits
- Checklist de PR com targets de Lighthouse e A11y
- Roadmap de implementação por fases
- Guidelines de Design Tokens e CSS organization

## Próximas Versões

### Planejado para v1.0.0
- Setup de semantic-release ou changesets
- Versionamento automático
- Release notes automatizadas
- Tags semânticas
- CHANGELOG gerado automaticamente

### Roadmap de Releases

```
v0.9.x  - Foundation & Documentation ← Atual
v1.0.0  - MVP Production Ready
v1.1.x  - Phase 1 Testing Implementation
v1.2.x  - Performance Optimizations
v2.0.x  - Advanced Features & Scale
```

## Sistema de Versionamento Futuro

O projeto adotará [Semantic Versioning](https://semver.org/):

- **MAJOR** (X.y.z): Breaking changes
- **MINOR** (x.Y.z): Novas features (backward compatible)
- **PATCH** (x.y.Z): Bug fixes (backward compatible)

### Ferramentas Candidatas

#### semantic-release
- Automatização completa baseada em conventional commits
- Integração com GitHub Releases
- Changelog automático

#### changesets
- Controle manual sobre releases
- Melhor para monorepos
- Flexibilidade na documentação de mudanças

---

**Status**: Foundation Phase  
**Próximo milestone**: v1.0.0 MVP  
**Sistema de versionamento**: A ser implementado