# Arquitetura do App Faz Bem

## Visão Geral

O App Faz Bem é uma aplicação web Progressive Web App (PWA) que conecta doadores e entidades beneficentes para facilitar doações de itens e campanhas de arrecadação.

## Arquitetura Atual

### Tipo de Aplicação
- **MPA (Multi-Page Application)**: Aplicação com múltiplas páginas HTML independentes
- **PWA**: Capacidades de aplicativo nativo através de Service Worker e Manifest

### Serviços Firebase via CDN ESM
A aplicação utiliza Firebase através de imports ESM diretamente do CDN:
- **Firebase App**: Inicialização e configuração
- **Firebase Auth**: Autenticação de usuários
- **Firestore**: Banco de dados NoSQL
- **Firebase Storage**: Armazenamento de arquivos (logos, imagens)
- **Realtime Database**: Presença online de usuários

### Módulos Principais

#### app-config.js
- Configuração central do Firebase
- Inicialização de serviços
- Constantes globais (ADMIN_EMAIL)
- Exportação de instâncias dos serviços

#### firebase-services.js
- Centraliza as importações das funções do Firebase
- Abstração para facilitar manutenção
- Reexportação de métodos necessários

#### firestore-paths.js
- Sistema de caminhos dinâmicos para Firestore
- Estrutura hierárquica organizacional
- Separação por ambiente através do projectId

#### auth-service.js
- Serviço de autenticação centralizado
- Função `getCurrentUser()` que retorna `{ auth, profile, isVerified }`
- Lógica de verificação de email
- Gerenciamento de presença

#### profile-service.js
- Cache de perfis de usuários
- Busca unificada entre doadores e entidades
- Otimização de performance

#### notification-service.js
- Sistema de notificações
- Integração com Firestore para persistência

### Tipos de Usuários e Roles

#### Doador (`role: 'doador'`)
- Usuários que fazem doações
- Acesso a perfil pessoal e histórico de doações

#### Entidade (`role: 'entidade'`)
- Organizações beneficentes
- Status: `'ativo'` ou `'pendente_aprovacao'`
- Acesso ao painel administrativo quando ativas

#### SuperAdmin (`role: 'superadmin'`)
- Administradores do sistema
- Identificados por email especial ou role
- Acesso completo ao sistema

### Estrutura de Dados

#### Coleções Firestore
```
users/ - Doadores
artifacts/{projectId}/public/data/
  ├── entidades/ - Entidades beneficentes
  │   └── {entidadeId}/representantes/ - Representantes das entidades
  ├── campaigns/ - Campanhas de arrecadação
  ├── donations/ - Registros de doações
  ├── likes/ - Curtidas em campanhas
  ├── configs/ - Configurações do sistema
  └── notifications/ - Notificações
```

#### Realtime Database
```
status/{userId} - Presença online dos usuários
```

### Recursos PWA

#### service-worker.js
- Cache de recursos estáticos
- Estratégias de cache diferenciadas
- Funcionalidade offline

#### manifest.json
- Configuração do PWA
- Ícones e tema
- Metadados da aplicação

### Segurança

#### Regras de Segurança
- `REGRAS_cloud-firestore.json`: Regras do Firestore
- `REGRAS_firebase-storage.json`: Regras do Storage
- `REGRAS_realtime-database.json`: Regras do Realtime Database

#### Verificação de Email
- Obrigatória para usuários com provedor de senha
- Redirecionamento automático para `verificar-email.html`
- Integração no app-header.js

## Melhorias Propostas

### Unificação de Route Guards
- Implementar `route-guard.js` para centralizar verificações de autenticação
- Suporte a verificação de roles e email
- Redirecionamento consistente

### Consistência de UI
- Padronização de modais através de `modal-handler.js`
- Sistema de renderização unificado
- Componentes reutilizáveis

### Otimizações do Service Worker
- Estratégia network-first para HTML
- Cache mais inteligente
- Melhor experiência offline

### Validações de Segurança
- Testes no Firebase Emulator
- Validação de regras de segurança
- Auditoria de permissões

### Higiene do Repositório
- `.gitignore` adequado
- Remoção de arquivos desnecessários
- Estrutura de pastas organizada