# Arquitetura de Módulos

Documentação da estrutura de módulos atual e planejada para o App Faz Bem.

## Mapa Atual

### Módulos Existentes

#### 🔧 Core Services
- **`app-config.js`** - Configuração central do Firebase, constantes globais
- **`firebase-services.js`** - Centralização das importações Firebase
- **`firestore-paths.js`** - Sistema de caminhos dinâmicos para Firestore
- **`auth-service.js`** - Serviço de autenticação centralizado
- **`profile-service.js`** - Cache e busca de perfis de usuários

#### 🎨 UI & Components
- **`app-header.js`** - Componente de cabeçalho global
- **`modal-handler.js`** - Sistema unificado de modais
- **`route-guard.js`** - Proteção de rotas baseada em autenticação
- **`notification-service.js`** - Sistema de notificações

#### 📄 Pages
- **`pages/*.html`** - Páginas da aplicação
- **`cadastro-entidade.js`** - Lógica específica do cadastro de entidades
- **`perfil-entidade.js`** - Lógica do perfil de entidades

#### 🎨 Styles
- **`assets/styles/design-tokens.css`** - Tokens de design
- **`assets/styles/ui-core.css`** - Estilos base e utilitários
- **`style.css`** - CSS compilado principal
- **`mobile-enhancements.css`** - Melhorias específicas mobile

#### ⚙️ Infrastructure
- **`service-worker.js`** - Cache e funcionalidade offline
- **`manifest.json`** - Configuração PWA

## Arquitetura Futura Planejada

### 🛠️ Utils Layer
**Localização**: `assets/js/utils/`

```
utils/
├── format.js          # Formatação de dados (datas, moeda, texto)
├── logger.js          # Sistema de logging estruturado
├── validation.js      # Validações reutilizáveis
├── storage.js         # Abstrações para localStorage/sessionStorage
└── constants.js       # Constantes da aplicação
```

**Responsabilidades**:
- Funções puras e utilitárias
- Sem dependências de Firebase ou DOM
- Facilmente testáveis

### 🧩 Components Layer
**Localização**: `assets/js/components/`

```
components/
├── toast/
│   ├── toast.js       # Componente de notificação
│   └── toast.css      # Estilos específicos
├── countdown/
│   ├── countdown.js   # Componente de contagem regressiva
│   └── countdown.css  # Estilos e animations
├── modal/
│   ├── modal.js       # Sistema de modais reutilizável
│   └── modal.css      # Estilos base
├── form/
│   ├── form-validator.js  # Validação de formulários
│   └── form-utils.js      # Utilitários de formulário
└── loading/
    ├── spinner.js     # Indicadores de loading
    └── skeleton.js    # Skeleton loaders
```

**Responsabilidades**:
- Componentes reutilizáveis
- Lógica de UI isolada
- Configuráveis via options/props

### 📊 Data Layer
**Localização**: `assets/js/data/`

```
data/
├── firestore/
│   ├── collections.js    # Abstrações para coleções
│   ├── queries.js        # Queries reutilizáveis
│   └── mutations.js      # Operações de escrita
├── cache/
│   ├── memory-cache.js   # Cache em memória
│   └── indexed-db.js     # Cache persistente
└── models/
    ├── user.js           # Model de usuário
    ├── campaign.js       # Model de campanha
    └── donation.js       # Model de doação
```

**Responsabilidades**:
- Abstração do Firestore
- Cache e sincronização
- Validação de dados
- Transformações de dados

### 🔍 Observers Layer
**Localização**: `assets/js/observers/`

```
observers/
├── performance-observer.js  # Monitoramento de performance
├── error-observer.js       # Captura e relatório de erros
├── user-observer.js        # Observer de mudanças do usuário
└── connectivity-observer.js # Monitor de conectividade
```

**Responsabilidades**:
- Monitoramento de estado
- Coleta de métricas
- Error handling global
- Analytics e logging

### 🔄 Service Worker Enhanced
**Localização**: `sw/`

```
sw/
├── sw.js              # Service worker principal
├── cache-strategies.js # Estratégias de cache
├── background-sync.js  # Sincronização offline
└── push-notifications.js # Notificações push
```

## Diretrizes de Import

### 🔝 Hierarquia de Dependências

```
┌─────────────────┐
│     Pages       │ ← Podem importar tudo
├─────────────────┤
│   Observers     │ ← Podem importar Data, Components, Utils
├─────────────────┤
│     Data        │ ← Podem importar Utils
├─────────────────┤
│   Components    │ ← Podem importar Utils
├─────────────────┤
│     Utils       │ ← Não importam nada (pure functions)
└─────────────────┘
```

### ✅ Imports Permitidos

```javascript
// ✅ Page pode importar qualquer layer
import { logger } from '../assets/js/utils/logger.js';
import { Modal } from '../assets/js/components/modal/modal.js';
import { getUserProfile } from '../assets/js/data/firestore/queries.js';

// ✅ Component pode importar Utils
import { formatDate } from '../utils/format.js';

// ✅ Data pode importar Utils
import { logger } from '../utils/logger.js';
```

### ❌ Imports Proibidos

```javascript
// ❌ Utils não podem importar outros layers
import { Modal } from '../components/modal/modal.js'; // ERRO

// ❌ Components não podem importar Data
import { getUserProfile } from '../data/queries.js'; // ERRO

// ❌ Dependências circulares
// utils/format.js importa validation.js
// validation.js importa format.js // ERRO
```

## Patterns de Implementação

### Module Pattern

```javascript
// assets/js/utils/format.js
export const formatUtils = {
  currency: (value) => new Intl.NumberFormat('pt-BR', {
    style: 'currency',
    currency: 'BRL'
  }).format(value),
  
  date: (date) => new Intl.DateTimeFormat('pt-BR').format(date)
};
```

### Component Pattern

```javascript
// assets/js/components/toast/toast.js
export class Toast {
  constructor(options = {}) {
    this.options = { ...this.defaults, ...options };
  }
  
  show(message, type = 'info') {
    // Implementation
  }
  
  static success(message) {
    return new Toast().show(message, 'success');
  }
}
```

### Data Service Pattern

```javascript
// assets/js/data/firestore/collections.js
export class CampaignService {
  static async getActive() {
    // Firestore query with caching
  }
  
  static async create(data) {
    // Validation + creation
  }
}
```

## Migração Gradual

### Fase 1: Utils
- Extrair funções utilitárias existentes
- Criar `utils/format.js`, `utils/logger.js`
- Migrar código duplicado

### Fase 2: Components
- Refatorar `modal-handler.js` para component
- Criar `countdown` component
- Padronizar interfaces

### Fase 3: Data
- Abstrair queries Firestore
- Implementar cache layer
- Separar concerns de data

### Fase 4: Observers
- Implementar performance monitoring
- Centralizar error handling
- Adicionar analytics

## Benefícios Esperados

### 🔧 Manutenibilidade
- Responsabilidades claras
- Código reutilizável
- Testes isolados

### 📈 Escalabilidade
- Adição de features sem conflitos
- Refatoração segura
- Onboarding de desenvolvedores

### 🚀 Performance
- Code splitting natural
- Lazy loading de módulos
- Cache otimizado

### 🧪 Testabilidade
- Units tests focados
- Mocks mais simples
- Coverage granular

## Ferramentas de Apoio

### Build
- **Rollup/Vite**: Bundling modular
- **ES Modules**: Import/export nativo

### Teste
- **Vitest**: Unit tests
- **Testing Library**: Component tests

### Lint
- **ESLint**: Regras de import
- **dependency-cruiser**: Verificação de arquitetura

## Links Relacionados

- [Documentação atual](arquitetura.md)
- [Strategy de Testes](../testing/strategy.md)
- [CONTRIBUTING](../../CONTRIBUTING.md)

---

**Status**: Planejamento  
**Próximos passos**: Implementação Fase 1 - Utils  
**Responsável**: Equipe de Frontend