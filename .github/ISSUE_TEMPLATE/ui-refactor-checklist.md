---
name: UI Refactor Page Migration
about: Checklist para migração de página individual para a nova foundation
title: "UI Refactor: [Nome da Página]"
labels: ["ui-refactor", "enhancement"]
assignees: []
---

## 📄 Página: `[nome-da-pagina.html]`

### 📊 Análise Inicial

**Priority Level**: [ ] High / [ ] Medium / [ ] Low  
**Complexity Score**: `[usar output do script inventory]`  
**Current Size**: `[linhas/KB]`  
**Inline Styles**: `[quantidade de blocos <style>]`  

### ✅ Fase 1: Preparação

- [ ] Executar `node scripts/inventory-pages.mjs` para análise detalhada
- [ ] Documentar componentes únicos/específicos da página
- [ ] Identificar estilos inline que precisam ser extraídos
- [ ] Fazer backup da versão atual (screenshot + código)
- [ ] Verificar dependências JavaScript específicas

**Componentes únicos identificados**:
- [ ] `[Listar componentes específicos desta página]`

**Estilos inline para extrair**:
- [ ] `[Listar blocos <style> principais]`

### ✅ Fase 2: Integração da Foundation

- [ ] Adicionar import do design-tokens.css (após fonts, antes de style.css)
  ```html
  <link href="assets/styles/design-tokens.css" rel="stylesheet">
  ```
- [ ] Adicionar import do ui-core.css (após design-tokens.css)
  ```html
  <link href="assets/styles/ui-core.css" rel="stylesheet">
  ```
- [ ] Importar ui-components.js se houver necessidade de JavaScript
  ```html
  <script type="module">
    import { showToast, delegate } from './assets/js/ui-components.js';
    // ... usar conforme necessário
  </script>
  ```
- [ ] Testar que não há quebras visuais após imports
- [ ] Validar que funcionalidades existentes continuam funcionando

### ✅ Fase 3: Migração de Tokens

**Cores**:
- [ ] Substituir cores hardcoded por tokens de cor
  - [ ] `#22c55e` → `var(--color-primary-500)`
  - [ ] `#1e293b` → `var(--color-text-primary)`
  - [ ] `#f8fafc` → `var(--color-bg-primary)`
  - [ ] Cores de urgência (se countdown): usar `var(--color-urgent-*)`

**Espaçamentos**:
- [ ] Migrar padding/margin fixos para tokens
  - [ ] `16px` → `var(--space-4)`
  - [ ] `24px` → `var(--space-6)`
  - [ ] `32px` → `var(--space-8)`

**Tipografia**:
- [ ] Aplicar escala tipográfica padronizada
  - [ ] Tamanhos: usar `.text-*` ou `var(--font-size-*)`
  - [ ] Pesos: usar `.font-*` ou `var(--font-weight-*)`

**Bordas e Sombras**:
- [ ] Usar tokens de border-radius: `var(--radius-*)`
- [ ] Usar tokens de shadow: `var(--shadow-*)`

### ✅ Fase 4: Componentes e Utilidades

**Botões**:
- [ ] Migrar para classes `.btn`, `.btn-primary`, `.btn-secondary`
- [ ] Aplicar estados de focus consistentes

**Formulários**:
- [ ] Usar classe `.form-input` para inputs
- [ ] Aplicar validação visual consistente

**Painéis/Cards**:
- [ ] Usar classes `.panel`, `.surface` onde apropriado
- [ ] Aplicar hover states consistentes

**Loading States**:
- [ ] Implementar skeleton loading com classe `.skeleton`
- [ ] Usar `.loading-spinner` para indicadores

**Notificações**:
- [ ] Migrar para sistema de toast da foundation
- [ ] Implementar com `showToast()` se necessário

### ✅ Fase 5: Acessibilidade e Mobile

**Acessibilidade**:
- [ ] Adicionar/verificar `aria-label` em botões de ação
- [ ] Garantir markup semântico (`<main>`, `<nav>`, etc.)
- [ ] Verificar contraste de cores com tokens
- [ ] Testar navegação por teclado
- [ ] Adicionar landmarks ARIA se necessário

**Mobile Optimization**:
- [ ] Verificar/adicionar viewport meta tag
- [ ] Testar responsividade em múltiplos tamanhos
- [ ] Ajustar touch targets (mínimo 44px)
- [ ] Verificar safe-area para devices com notch

**Progressive Enhancement**:
- [ ] Verificar graceful degradation de JavaScript
- [ ] Testar com CSS desabilitado
- [ ] Validar acessibilidade com leitor de tela

### ✅ Fase 6: Limpeza e Otimização

**Remoção de Código Legacy**:
- [ ] Remover estilos inline desnecessários
- [ ] Eliminar CSS duplicado
- [ ] Remover classes não utilizadas
- [ ] Consolidar JavaScript repetitivo

**Performance**:
- [ ] Verificar se não há CSS/JS duplicado carregando
- [ ] Otimizar ordem de carregamento de recursos
- [ ] Implementar lazy loading se apropriado

### ✅ Fase 7: Validação e Testes

**Testes Funcionais**:
- [ ] Todas as funcionalidades principais funcionam
- [ ] Formulários submetem corretamente
- [ ] Navegação está funcional
- [ ] Estados de loading/erro funcionam

**Testes de UI**:
- [ ] Layout está consistente em desktop
- [ ] Layout está consistente em mobile/tablet
- [ ] Dark mode funciona corretamente (se aplicável)
- [ ] Animações/transições são suaves

**Testes de Acessibilidade**:
- [ ] WAVE ou axe DevTools sem erros críticos
- [ ] Navegação por teclado completa
- [ ] Contraste adequado (WCAG AA)
- [ ] Leitores de tela conseguem navegar

**Performance**:
- [ ] Lighthouse score mantido ou melhorado
- [ ] Tempo de carregamento aceitável
- [ ] Core Web Vitals dentro dos limites

### 📸 Screenshots

**Antes (Desktop)**:
`[Adicionar screenshot da versão original]`

**Depois (Desktop)**:
`[Adicionar screenshot da versão migrada]`

**Antes (Mobile)**:
`[Adicionar screenshot mobile original]`

**Depois (Mobile)**:
`[Adicionar screenshot mobile migrado]`

### 📝 Notas de Implementação

**Decisões de Design**:
- `[Documentar escolhas específicas feitas durante a migração]`

**Desafios Encontrados**:
- `[Listar problemas encontrados e como foram resolvidos]`

**Componentes Criados/Modificados**:
- `[Documentar novos componentes que precisaram ser criados]`

### 🔗 Links Relacionados

- [ ] Link para commit da migração
- [ ] Link para design/protótipo se aplicável
- [ ] Issues relacionadas

### ✅ Review Final

- [ ] Code review aprovado
- [ ] Testes manuais completos
- [ ] Documentação atualizada
- [ ] Deploy em staging testado
- [ ] Aprovação final para produção

---

**Estimativa de Esforço**: `[XX horas]`  
**Data Início**: `[DD/MM/YYYY]`  
**Data Conclusão**: `[DD/MM/YYYY]`