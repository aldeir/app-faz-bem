# App Faz Bem

Plataforma PWA para conectar doadores e entidades beneficentes, facilitando doações e gestão de campanhas solidárias.

## 🚀 Sobre o Projeto

O App Faz Bem é uma Progressive Web App (PWA) que conecta pessoas dispostas a doar com entidades beneficentes que precisam de ajuda. A plataforma facilita a criação de campanhas, gestão de doações e coordenação de entregas.

### ✨ Funcionalidades Principais

- **🔐 Sistema de Autenticação**: Login seguro para doadores e entidades
- **📱 PWA**: Instalável e funciona offline
- **🎯 Campanhas**: Criação e gestão de campanhas de doação
- **📦 Doações**: Registro e tracking de itens doados
- **📅 Agendamentos**: Sistema de coordenação de entregas
- **👥 Perfis**: Gestão de perfis de doadores e entidades
- **🔔 Notificações**: Sistema de notificações em tempo real
- **👑 Admin**: Painel administrativo completo

## 🛠️ Tecnologias

- **Frontend**: HTML5, CSS3, JavaScript (ES6+)
- **Styling**: Tailwind CSS + Design Tokens customizados
- **Backend**: Firebase (Firestore, Authentication, Storage)
- **PWA**: Service Worker, Manifest
- **Build**: Node.js, Tailwind CLI

## 🏁 Quick Start

### Pré-requisitos

- Node.js 18+
- npm ou yarn
- Firebase CLI (para desenvolvimento)

### Instalação

```bash
# Clone o repositório
git clone https://github.com/aldeir/app-faz-bem.git
cd app-faz-bem

# Instale dependências
npm install

# Build CSS (modo watch)
npm run build-css

# Sirva os arquivos (usando qualquer servidor local)
# Exemplo: Live Server, http-server, etc.
```

### Scripts Disponíveis

```bash
# Build Tailwind CSS (watch mode)
npm run build-css

# Gerar inventário de páginas
npm run inventory
```

## 📁 Estrutura do Projeto

```
├── assets/
│   ├── styles/          # Design tokens e estilos
│   └── js/              # JavaScript modules
├── docs/                # Documentação técnica
├── pages/               # Páginas HTML
├── scripts/             # Scripts utilitários
├── .github/             # Templates e workflows
└── service-worker.js    # PWA service worker
```

## 🎨 Design System

O projeto utiliza um sistema de Design Tokens baseado em CSS Custom Properties para garantir consistência visual e facilitar manutenção.

```css
/* Exemplo de uso de tokens */
.button {
  background-color: var(--color-primary-500);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-base);
  transition: var(--transition-colors);
}
```

### Características

- **🎨 Paleta de Cores**: Escala semântica e cores da marca
- **📏 Espaçamentos**: Sistema baseado em 4px
- **🔤 Tipografia**: Escalas e pesos consistentes
- **🌙 Dark Mode**: Suporte nativo via CSS
- **📱 Responsive**: Mobile-first approach

## 🧪 Desenvolvimento

### Branch Strategy

```
main           # Produção
develop        # Desenvolvimento
feature/*      # Novas funcionalidades
fix/*          # Correções
refactor/*     # Refatorações
```

### Commits

Seguimos [Conventional Commits](https://conventionalcommits.org/):

```
feat(auth): adicionar verificação de email
fix(modal): corrigir fechamento inesperado
docs(readme): atualizar instruções de setup
```

## 🔒 Segurança

- Regras de segurança Firestore configuradas
- Verificação de email obrigatória
- Route guards para proteção de páginas
- Validação de dados no frontend e backend

## 📈 Performance

- **PWA optimizations**: Cache strategies, offline support
- **Image optimization**: Lazy loading, responsive images
- **Core Web Vitals**: Performance targets defined
- **Bundle optimization**: Code splitting, tree shaking

## ♿ Acessibilidade

- **WCAG 2.1 AA**: Compliance target
- **Keyboard navigation**: Full support
- **Screen readers**: ARIA labels and semantic HTML
- **Color contrast**: 4.5:1 minimum ratio

## 🚀 Deploy

O projeto está configurado para deploy automático via Firebase Hosting:

```bash
# Build para produção
npm run build

# Deploy
firebase deploy
```

## 📊 Monitoramento

- **Performance**: Lighthouse CI integration
- **Errors**: Error tracking setup
- **Analytics**: User behavior tracking
- **Core Web Vitals**: Real user monitoring

## Fundação & Documentação

### 📋 Governança
- [**CONTRIBUTING.md**](CONTRIBUTING.md) - Diretrizes de contribuição
- [**CHANGELOG.md**](CHANGELOG.md) - Histórico de mudanças
- [Templates de Issues](.github/ISSUE_TEMPLATE/) - Templates padronizados
- [Template de PR](.github/PULL_REQUEST_TEMPLATE.md) - Checklist de pull request

### 🎨 Design System
- [**Design Tokens**](docs/design-system/tokens.md) - Sistema completo de tokens
- [**ADR 0001**](docs/adr/0001-design-tokens.md) - Decisões arquiteturais sobre tokens
- [UI Refactor Foundation](README-UI-REFATOR.md) - Base da refatoração UI

### 🏗️ Arquitetura
- [**Módulos**](docs/architecture/modules.md) - Estrutura atual e planejada
- [Arquitetura atual](docs/arquitetura.md) - Documentação existente
- [Roadmap MVP](docs/roadmap-mvp.md) - Plano de desenvolvimento

### 🧪 Qualidade
- [**Estratégia de Testes**](docs/testing/strategy.md) - Testes progressivos (Unit → E2E)
- [**Performance**](docs/performance/strategy.md) - Core Web Vitals e otimizações
- [**Observability**](docs/observability/README.md) - Monitoramento planejado

## 🤝 Contribuindo

1. **Fork** o projeto
2. **Crie** uma branch: `git checkout -b feature/nova-funcionalidade`
3. **Commit** suas mudanças: `git commit -m 'feat: adicionar nova funcionalidade'`
4. **Push** para a branch: `git push origin feature/nova-funcionalidade`
5. **Abra** um Pull Request

Consulte [CONTRIBUTING.md](CONTRIBUTING.md) para diretrizes detalhadas.

## 📄 Licença

Este projeto está sob a licença [MIT](LICENSE).

## 👥 Equipe

- **Aldeir Gomes** - Desenvolvimento Principal
- [Lista de Contribuidores](https://github.com/aldeir/app-faz-bem/contributors)

## 🆘 Suporte

- **Issues**: [GitHub Issues](https://github.com/aldeir/app-faz-bem/issues)
- **Documentação**: [docs/](docs/)
- **Email**: [contato]

---

**Status**: MVP em desenvolvimento  
**Versão**: 1.0.0 (em breve)  
**Última atualização**: Dezembro 2024