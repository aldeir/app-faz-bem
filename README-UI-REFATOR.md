# UI Refactor Foundation

Este documento descreve a nova camada de design system implementada no App Faz Bem para padronizar a interface e facilitar a migração para um padrão mobile-first consistente.

## Objetivos da Refatoração

### 🎯 Principais Metas

1. **Consistência Visual**: Estabelecer uma linguagem de design unificada em todas as páginas
2. **Mobile-First**: Garantir experiência otimizada em dispositivos móveis
3. **Acessibilidade**: Melhorar a usabilidade para todos os usuários
4. **Manutenibilidade**: Reduzir duplicação de código e facilitar atualizações
5. **Performance**: Otimizar carregamento e responsividade

### 🏗️ Arquitetura da Solução

A refatoração introduz três camadas fundamentais:

```
assets/
├── styles/
│   ├── design-tokens.css    # Tokens de design (cores, espaçamentos, etc.)
│   └── ui-core.css          # Estilos base e utilitários
└── js/
    └── ui-components.js     # Helpers JavaScript reutilizáveis
```

## Componentes da Foundation

### 1. Design Tokens (`assets/styles/design-tokens.css`)

Sistema de tokens que define:

- **Paleta de Cores**: Escala de cores da marca, neutros e cores semânticas
- **Espaçamentos**: Escala consistente de espaçamentos (4px, 8px, 12px, etc.)
- **Tipografia**: Tamanhos, pesos e altura de linha padronizados
- **Bordas e Sombras**: Raios de borda e sombras em múltiplos níveis
- **Transições**: Durações e curvas de animação consistentes
- **Modo Escuro**: Overrides automáticos para preferência de tema

#### Principais Tokens:

```css
/* Cores Principais */
--color-primary-500: #22c55e;
--color-primary-600: #16a34a;

/* Cores de Urgência (para countdown) */
--color-urgent-high: #dc2626;    /* vermelho */
--color-urgent-medium: #f59e0b;  /* amarelo */
--color-urgent-low: #22c55e;     /* verde */

/* Espaçamentos */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */
```

### 2. UI Core (`assets/styles/ui-core.css`)

Camada de estilos base construída sobre os tokens:

- **Resets CSS**: Normalização cross-browser
- **Tipografia**: Classes utilitárias para texto
- **Superfícies**: Estilos para painéis e cartões
- **Formulários**: Inputs e botões padronizados
- **Toast/Notificações**: Sistema de notificações baseline
- **Estados de Loading**: Spinners e skeletons
- **Acessibilidade**: Foco visível e utilitários para leitores de tela

#### Classes Principais:

```css
.panel          /* Cartão/painel padrão */
.btn            /* Botão base */
.btn-primary    /* Botão primário */
.form-input     /* Input padrão */
.toast          /* Notificação */
.loading-spinner /* Indicador de carregamento */
.sr-only        /* Apenas para leitores de tela */
```

### 3. UI Components (`assets/js/ui-components.js`)

Helpers JavaScript reutilizáveis:

- **`delegate()`**: Delegação de eventos eficiente
- **`showToast()`**: Sistema de notificações toast
- **`basicModal()`**: Modal simples para casos básicos
- **`lazyImages()`**: Carregamento lazy de imagens
- **`skeleton()`**: Placeholder de loading
- **`announce()`**: Anúncios para leitores de tela

#### Exemplo de Uso:

```javascript
import { showToast, delegate } from './assets/js/ui-components.js';

// Notificação
showToast('Operação realizada com sucesso!', { type: 'success' });

// Delegação de eventos
delegate(document, '.btn-delete', 'click', function(e) {
  // Handler para todos os botões .btn-delete
});
```

## Migration Checklist

### ✅ Checklist por Página

Para cada página HTML, seguir este checklist:

#### Fase 1: Preparação
- [ ] Analisar página com `npm run inventory` 
- [ ] Documentar componentes únicos existentes
- [ ] Identificar estilos inline para extração

#### Fase 2: Integração da Foundation
- [ ] Adicionar imports dos novos CSS (após fontes, antes de style.css)
- [ ] Importar ui-components.js se necessário JavaScript
- [ ] Testar que não há quebras visuais

#### Fase 3: Migração Gradual
- [ ] Substituir cores hardcoded por tokens CSS
- [ ] Migrar espaçamentos para escala padronizada
- [ ] Aplicar classes utilitárias onde apropriado
- [ ] Extrair estilos inline para classes reutilizáveis

#### Fase 4: Otimização
- [ ] Remover CSS duplicado/obsoleto
- [ ] Aplicar padrões de acessibilidade
- [ ] Testar responsividade em múltiplos dispositivos
- [ ] Validar com ferramentas de acessibilidade

#### Fase 5: Validação
- [ ] Teste funcional completo
- [ ] Validação de performance
- [ ] Review de código
- [ ] Documentação de componentes únicos

## Convenções de Desenvolvimento

### 🎨 CSS

1. **Usar tokens CSS sempre que possível**:
   ```css
   /* ✅ Bom */
   color: var(--color-text-primary);
   padding: var(--space-4);
   
   /* ❌ Evitar */
   color: #1e293b;
   padding: 16px;
   ```

2. **Nomear classes com prefixos consistentes**:
   ```css
   .ui-*     /* Componentes da foundation */
   .page-*   /* Específico da página */
   .comp-*   /* Componentes personalizados */
   ```

3. **Organizar CSS por especificidade**:
   ```css
   /* 1. Tokens/variáveis */
   /* 2. Base/reset */
   /* 3. Layout */
   /* 4. Componentes */
   /* 5. Utilitários */
   /* 6. Responsivo */
   ```

### 📱 Mobile-First

1. **Design para mobile primeiro**:
   ```css
   /* Base: mobile */
   .component { 
     font-size: 14px; 
   }
   
   /* Tablet+ */
   @media (min-width: 768px) {
     .component { 
       font-size: 16px; 
     }
   }
   ```

2. **Usar unidades relativas**:
   ```css
   /* ✅ Flexível */
   padding: var(--space-4); /* 1rem = 16px */
   
   /* ❌ Fixo */
   padding: 16px;
   ```

### ♿ Acessibilidade

1. **Sempre incluir texto alternativo**:
   ```html
   <img src="..." alt="Descrição clara da imagem">
   <button aria-label="Fechar modal">×</button>
   ```

2. **Usar marcos semânticos**:
   ```html
   <main>, <nav>, <aside>, <article>, <section>
   ```

3. **Garantir contraste adequado**:
   - Usar cores semânticas definidas nos tokens
   - Testar com ferramentas de contraste

## Scripts Úteis

### Análise de Páginas

```bash
# Gerar relatório de inventário das páginas
node scripts/inventory-pages.mjs

# Arquivos gerados:
# - ui-refactor-inventory.json (dados estruturados)
# - ui-refactor-inventory.md (relatório legível)
```

### Build CSS

```bash
# Rebuild Tailwind CSS
npm run build-css
```

## Cronograma de Migração

### 🗓️ Fases de Implementação

**Fase 1 (Atual)**: Foundation Setup
- [x] Implementar design tokens
- [x] Criar UI core layer  
- [x] Desenvolver UI components
- [x] Documentação inicial

**Fase 2**: Páginas Principais
- [ ] index.html (countdown com cores de urgência)
- [ ] minhas-entregas.html
- [ ] registrar-doacao.html

**Fase 3**: Páginas de Autenticação
- [ ] login.html
- [ ] cadastro-doador.html
- [ ] cadastro-entidade.html

**Fase 4**: Páginas Administrativas
- [ ] admin.html
- [ ] gerenciar-*.html
- [ ] configuracoes.html

**Fase 5**: Refinamento
- [ ] Remover CSS legacy não utilizado
- [ ] Otimizações de performance
- [ ] Testes finais

## Troubleshooting

### Problemas Comuns

**CSS não está sendo aplicado**:
- Verificar ordem dos imports (tokens → core → existente)
- Checar especificidade CSS
- Validar sintaxe dos custom properties

**Quebras visuais após migração**:
- Comparar com versão anterior
- Verificar se tokens estão sendo usados corretamente
- Testar em diferentes browsers/dispositivos

**Performance degradada**:
- Verificar se não há CSS duplicado
- Considerar lazy loading de componentes não críticos
- Usar ferramentas de profiling do browser

## Suporte

Para dúvidas sobre a foundation ou migração:

1. Consultar este README
2. Verificar exemplos nas páginas já migradas
3. Analisar o relatório de inventário
4. Criar issue com template específico

---

**Última atualização**: Dezembro 2024  
**Versão da Foundation**: 1.0.0