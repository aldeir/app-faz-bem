# App Faz Bem

Plataforma Progressive Web App (PWA) que conecta doadores e entidades beneficentes para criação e gestão de campanhas, coordenação de doações e agendamentos de entregas — com suporte offline, instalação e funcionalidades aprimoradas para uso em dispositivos móveis e futura publicação na Google Play (via Trusted Web Activity).

> Este README é uma referência técnica abrangente. Ele inclui descrição sucinta de TODOS os arquivos listados atualmente no repositório para facilitar busca, onboarding e manutenção.  
> Quando novos arquivos forem adicionados, atualizar a seção “Referência de Arquivos”.

---

## ✨ Visão Geral

O App Faz Bem permite:
- Criar e gerenciar campanhas de doação
- Registrar, acompanhar e receber doações
- Gerenciar usuários (doadores, entidades, admin, superadmin)
- Operar parcialmente offline (fila de ações e fallback)
- Instalar como aplicativo (PWA) em Android e Desktop
- Compartilhar conteúdo (Web Share Target)
- Aproveitar atalhos (manifest shortcuts) para fluxos frequentes

Status: MVP em desenvolvimento (Rumo à publicação Play Store)

---

## 🧩 Principais Funcionalidades

| Domínio | Recursos |
|---------|----------|
| Autenticação | Cadastro, login, verificação e recuperação de senha |
| Usuários / Perfis | Perfis de doador, entidade e administradores |
| Campanhas | Criação, aprovação, gerenciamento e listagem |
| Doações | Registro, agendamento, recebimento e histórico |
| Notificações | Serviço de notificação / estrutura para push |
| Offline / PWA | Cache de páginas/recursos, fallback offline, background sync |
| Governança | Inventários (rotas & UI), CHANGELOG, CONTRIBUTING |
| UI / Design System | Tailwind + tokens + refatoração estrutural progressiva |

---

## 🏗 Arquitetura (Alto Nível)

| Camada | Descrição |
|--------|-----------|
| Interface (HTML + CSS + JS) | Páginas multi-documento (cada HTML é uma rota), JS modular progressivo |
| Serviços (Firebase) | Auth, Firestore, Realtime Database, Storage (arquivos *-service(s).js) |
| Segurança Cliente | Route Guard para bloquear acesso não autorizado |
| PWA Layer | Service Worker (caching strategizado + background sync) + Manifest + offline.html |
| Governança & Docs | Inventários JSON/MD, CHANGELOG, CONTRIBUTING, políticas e termos |
| Build Frontend | Tailwind CSS (input.css → style.css) + design tokens em expansão |
| Persistência Offline | IndexedDB (fila de doações) + Cache Storage |

---

## 🔐 Fluxos Centrais

### Autenticação
1. Usuário acessa página (ex.: `login.html`)
2. `auth-service.js` chama Firebase Auth
3. `route-guard.js` verifica estado antes de permitir acesso a páginas protegidas
4. Páginas de verificação e recuperação (`verificar-email.html`, `recuperar-senha.html`)

### Campanhas & Doações
- Criação de campanha (`criar-campanha.html`)
- Aprovação / moderação (painéis `admin.html`, `superadmin.html`, *gerenciar-*.html)
- Registro de doação (`registrar-doacao.html`)
- Recebimento / confirmação (`receber-doacao.html`)
- Agendamentos e listagem (`gerenciar-agendamentos*.html`, `minhas-entregas.html`)

### Perfis
- Páginas específicas: `perfil-doador.html`, `perfil-entidade.html`, `perfil-admin.html`
- Serviços de perfil: `profile-service.js` e `perfil-entidade.js` para lógicas diferenciais

### Notificações
- `notification-service.js` estrutura para exibir ou encaminhar (potencial integração Firebase Messaging futura)
- `notificacoes.html` apresenta o feed / status

### Offline & Sincronização
- `service-worker.js`: 
  - Network-first para navegação (com fallback `offline.html`)
  - Estratégias distintas para assets / imagens
  - Fila de doações offline + Background Sync (`donation-sync`)
- `offline.html` provê experiência mínima degradada

---

## 📱 PWA

| Item | Estado |
|------|--------|
| Manifest | Presente (atalhos, share target, ícone multi-size) |
| Service Worker | Cache + sync + versionamento |
| Offline Fallback | `offline.html` |
| Share Target | Configurado (`share_target` → `share.html` se implementado) |
| Shortcuts | Atalhos rápidos (Criar Campanha, Minhas Entregas) |
| Background Sync | Fila IndexedDB para doações |
| Próximos Ajustes | Ícones separados multi-arquivo, `start_url` & `scope` absolutos, auditoria Lighthouse |

---

## 🎨 Design System & Refatoração UI

- Baseado em Tailwind + CSS custom properties (tokens)
- Objetivo: padronizar cores, espaçamentos, tipografia, componentes
- Arquivos de inventário: `ui-refactor-inventory.md` / `.json`
- CSS:
  - `input.css` (fonte Tailwind + tokens)
  - `style.css` (resultado compilado)
  - `mobile-enhancements.css` (ajustes responsivos / mobile UX)
- Em evolução para centralizar componentes (ex.: header em `app-header.js`)

---

## 📁 Estrutura de Pastas

| Pasta | Descrição |
|-------|-----------|
| `.github` | Workflows, templates de issues/PR, governança |
| `assets` | Recursos estáticos (imagens, estilos, JS organizável) – expansão planejada |
| `docs` | Documentação técnica (inventários de rotas e UI, ADRs futuros) |
| `node_modules` | Dependências gerenciadas por npm (não versionar manualmente) |
| `scripts` | Scripts utilitários (build, inventários, automações futuras) |

> Páginas HTML e módulos JS atualmente estão na raiz. Migração planejada para estrutura /pages /services /components /styles /icons (ver Roadmap).

---

## 📂 Referência de Arquivos

> Descrições sucintas. Se um arquivo ganhar responsabilidade adicional, atualizar aqui.  
> (Arquivos binários/imagens — descrição funcional.)

### Arquivos de Configuração & Governança

| Arquivo | Descrição |
|---------|-----------|
| `.gitignore` | Lista arquivos/diretórios ignorados (builds, node_modules, etc.) |
| `CHANGELOG.md` | Histórico de mudanças segundo convenção (mantém transparência de evolução) |
| `CONTRIBUTING.md` | Diretrizes de contribuição: branching, commits, fluxo de PR |
| `README.md` | (Este documento) Referência principal do projeto |
| `README-UI-REFATOR.md` | Documento focal da refatoração de UI, escopo de componentes e tokens |
| `package.json` | Metadados do projeto, dependências, scripts npm |
| `package-lock.json` | Snapshot de dependências para reprodução determinística |
| `tailwind.config.js` | Configuração Tailwind (paths de purge, extensões de tema, tokens) |

### Regras de Segurança Firebase

| Arquivo | Descrição |
|---------|-----------|
| `REGRAS_cloud-firestore.json` | Regras Firestore (acesso, validação, segurança de coleções) |
| `REGRAS_firebase-storage.json` | Regras Firebase Storage (upload/download restrições) |
| `REGRAS_realtime-database.json` | Regras Realtime Database (leitura/escrita segmentadas) |

### Páginas HTML (Rotas de Interface)

| Arquivo | Descrição |
|---------|-----------|
| `index.html` | Landing / ponto de entrada principal do app PWA |
| `login.html` | Autenticação de usuários (entrada inicial) |
| `verificar-email.html` | Informa status de verificação e reenvio de email |
| `recuperar-senha.html` | Fluxo de redefinição de senha |
| `cadastro-doador.html` | Cadastro de perfil doador |
| `cadastro-entidade.html` | Cadastro de entidade beneficente |
| `admin.html` | Painel administrativo (gestão macro) |
| `superadmin.html` | Painel superadmin (controles elevadas / auditoria) |
| `aguardando-aprovacao.html` | Estado intermediário para entidade/ação pendente |
| `configuracoes.html` | Preferências do usuário / ajustes gerais |
| `perfil-doador.html` | Dashboard / perfil do doador |
| `perfil-entidade.html` | Painel perfil entidade |
| `perfil-admin.html` | Painel específico admin moderador |
| `criar-campanha.html` | Formulário de criação de campanha |
| `gerenciar-campanhas.html` | Lista / moderação de campanhas existentes |
| `gerenciar-agendamentos.html` | Gerencia agendamentos próprios |
| `gerenciar-agendamentos-global.html` | Visão consolidada (admin/global) de agendamentos |
| `gerenciar-doadores.html` | Administração de perfis de doadores |
| `gerenciar-entidades.html` | Administração / aprovação de entidades |
| `minhas-entregas.html` | Histórico / listagem de entregas do usuário |
| `registrar-doacao.html` | Fluxo de criação/registro de uma nova doação |
| `receber-doacao.html` | Interface para confirmar/registrar recebimento |
| `detalhes.html` | Detalhes de uma campanha, doação ou item específico (contextual) |
| `notificacoes.html` | Exibição de alertas / notificações do sistema |
| `politica-de-privacidade.html` | Política de privacidade (requisito legal & Play Store) |
| `termos-de-servico.html` | Termos de uso / consentimento legal |
| `offline.html` | Página fallback para navegação offline (explica indisponibilidade e opções) |

### Módulos JavaScript (Serviços & Utilidades)

| Arquivo | Descrição |
|---------|-----------|
| `app-config.js` | Configurações centrais (endpoints, chaves, flags de ambiente) |
| `app-header.js` | Componente / script para construir ou injetar cabeçalho e navegação padrão |
| `auth-service.js` | Funções de autenticação (login, logout, registro, verificação, recuperação) via Firebase Auth |
| `firebase-services.js` | Inicialização / bootstrap do Firebase SDK, wrappers de instâncias (auth, db, storage) |
| `firestore-paths.js` | Centralização de nomes de coleções, caminhos e utilidades de composição de paths |
| `cadastro-entidade.js` | Lógica específica do processo de registro/atualização de entidade |
| `perfil-entidade.js` | Funções de exibição, edição e estado do perfil de entidade |
| `profile-service.js` | Interface unificada para operações de perfil (doadores, entidades, admins) |
| `route-guard.js` | Verificação de autenticação / autorização para proteger páginas sensíveis |
| `notification-service.js` | Gestão de notificações (consulta, formatação; potencial integração futura push) |
| `modal-handler.js` | Controle centralizado de abertura/fechamento de modais reutilizáveis |
| `service-worker.js` | Service Worker PWA: cache versionado, estratégias offline, fila offline (IndexedDB + Background Sync), limpeza de caches |
| `perfil-admin.html` (HTML) + scripts internos | (Ver HTML) – pode consumir `route-guard.js` e serviços de notificação/perfil |
| (Outros HTML) + scripts inline | Muitos HTMLs podem conter scripts inline de UI e interações — recomendação futura: extrair para módulos dedicados |

### Inventários & Documentação Técnica

| Arquivo | Descrição |
|---------|-----------|
| `routes-inventory.json` | Inventário de rotas planejadas (metadados: path, prioridade, auth, status etc.) |
| `ui-refactor-inventory.md` | Documento explicativo do escopo de refatoração da UI |
| `ui-refactor-inventory.json` | Estrutura de dados com o estado/migração de componentes UI |

### Arquitetura & Decisões Técnicas

| Documentação | Descrição |
|--------------|-----------|
| [docs/adr/ADR-0002-campaign-status-centralizacao.md](docs/adr/ADR-0002-campaign-status-centralizacao.md) | Decisão arquitetural sobre centralização do sistema de status de campanhas |
| [docs/development/campaign-status.md](docs/development/campaign-status.md) | API e documentação completa do sistema de status de campanhas |
| [docs/metrics.md](docs/metrics.md) | Métricas de performance e baseline de observabilidade |

### Estilos & Design

| Arquivo | Descrição |
|---------|-----------|
| `input.css` | Fonte Tailwind + tokens (usado no build) |
| `style.css` | CSS final compilado/distribuído |
| `mobile-enhancements.css` | Ajustes específicos para mobile UX (responsivo, toques, espaçamentos) |

### Imagens & Ícones

| Arquivo | Descrição |
|---------|-----------|
| `logo.png` | Ícone (multiuso, PWA manifest, favicon potencial) |
| `bg-faz-bem.png` | Imagem de fundo / temática (branding) |

### PWA / Manifest

| Arquivo | Descrição |
|---------|-----------|
| `manifest.json` | Metadados de PWA (nome, ícones, atalhos, share_target, cores) |

### Outros

| Arquivo | Descrição |
|---------|-----------|
| `bg-faz-bem.png` | Asset de interface (branding / background) |

---

## ⚙️ Scripts (npm)

| Script | Propósito | Observação |
|--------|-----------|-----------|
| `build-css` | Compila Tailwind (modo watch ou geração) | Definido em `package.json` |
| `inventory` | (Planejado) Gera inventário de páginas/rotas | Implementar automação futura |
| (Futuros) `pwa-audit` | Rodar Lighthouse / validar PWA | A criar |
| (Futuros) `prepare-twa` | Pré-validações para TWA | A definir |

---

## 🔒 Segurança & Privacy

- Regras Firebase (Firestore, Storage, Realtime DB) versionadas (auditoria e reprodutibilidade)
- Route Guard no cliente (defesa adicional; não substitui regras backend)
- Verificação de email exigida nos fluxos
- Políticas e termos presentes (páginas dedicadas)
- Próximo: Documentar limites e políticas de dados em seção dedicada (`docs/security.md` futura)

---

## 🔄 Offline & Background Sync

| Componente | Função |
|------------|-------|
| Cache Pages | HTML / offline fallback |
| Cache Assets | CSS / JS críticos |
| Cache Images | Imagens (cache-first controlado) |
| IndexedDB fila | Armazena doações realizadas offline |
| Sync tag | `donation-sync` dispara flush quando conectividade retorna |
| Estratégias | Network-first (HTML), stale-while-revalidate (assets), cache-first (imagens) |

---

## 📊 Qualidade

| Área | Ação Atual | Próximos Passos |
|------|------------|-----------------|
| Performance | Estratégias de cache | Medir Lighthouse & registrar baseline |
| Acessibilidade | Estrutura semântica em evolução | Checklist WCAG 2.1 AA + testes de contraste |
| Testes | (Inicial / manual) | Planejar testes unitários (services) + E2E (fluxo de campanha/doação) |
| Observabilidade | (Planejado) | Definir estratégia de logging + métricas |

---

## 🚀 Build & Deploy

| Etapa | Comando / Ação |
|-------|----------------|
| Instalação | `npm install` |
| Dev (CSS watch) | `npm run build-css` (ou watcher configurado) |
| Servir | Qualquer servidor estático (Firebase Hosting recomendado) |
| Deploy | `firebase deploy` |
| Atualização de SW | Incrementar `VERSION` em `service-worker.js` e monitorar clients |

---

## 🧭 Roadmap (Resumo)

| Fase | Objetivo | Estado |
|------|----------|--------|
| F1 | PWA básico (manifest + SW + offline) | Concluído (ajustes menores) |
| F2 | UI Refactor Foundation | Em andamento |
| F3 | Inventários (rotas + UI) & script de geração | Parcial |
| F4 | Performance & A11y baseline | Pendente |
| F5 | Empacotar TWA (Play Store) | Pendente |
| F6 | Observability & Métricas Reais | Pendente |
| F7 | Reorganizar diretórios (pages/services/components) | Planejado |

---

## 🤝 Contribuição

1. Fork & clone
2. Crie branch: `git checkout -b feature/minha-feature`
3. Commits com Conventional Commits (`feat:`, `fix:`, `chore:`, `docs:` etc.)
4. Abra PR com descrição clara, referencie issues (`Closes #N`)
5. Siga `CONTRIBUTING.md` para padrões adicionais

Branching:
- `main` (produção)
- `develop` (integração)
- `feature/*`, `fix/*`, `refactor/*`

---

## 🗂 Manutenção da Referência de Arquivos

Passos para manter esta seção atualizada:
1. Ao adicionar arquivo, incluir linha na tabela de “Referência de Arquivos”
2. Manter descrições concisas (≤ 15 palavras)
3. Indicar se substituir (ex.: “DEPRECATED”)
4. (Futuro) Automatizar geração via script analisando glob patterns

---

## 📄 Licença

MIT — ver arquivo LICENSE (se ainda não existir, criar).

---

## 🕑 Histórico de Mudanças

Consulte `CHANGELOG.md` para versões e marcos.

---

## 🧪 Próximos Itens Técnicos Recomendados

| Item | Justificativa |
|------|---------------|
| Normalizar start_url/scope manifest | Consistência TWA e múltiplas entradas |
| Ícones separados multi-arquivo | Compatibilidade Play & maskable safe zone |
| Script inventário páginas → JSON/MD | Automação & governança |
| SW update notification UX | Melhor experiência em releases |
| Estrutura modular (/pages /services) | Escalabilidade e clareza |
| Perfil de Performance documentado | Baseline para otimizações futuras |

---

## 📬 Contato / Suporte

- Issues: GitHub Issues
- Documentação: diretório `docs/`
- (Adicionar email / canal se aplicável)

---

### Nota Final

Algumas descrições foram inferidas por convenção de nomenclatura e padrão de arquitetura. Se a responsabilidade real divergir, priorizar atualização deste README após alteração do código para evitar desinformação.

Boa colaboração e bom desenvolvimento! 💚
