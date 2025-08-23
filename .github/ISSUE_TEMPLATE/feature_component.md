---
name: Novo Componente
about: Template para criação de novos componentes UI
labels: ["feature", "component", "enhancement"]
assignees: ""
---

## 🧩 Informações do Componente

**Nome do componente**: `[NomeDoComponente]`  
**Localização planejada**: `assets/js/components/[pasta]/[arquivo].js`  

## 🎯 Propósito e Contexto

**Descrição**: [Descreva o que o componente faz e por que é necessário]

**Casos de uso**:
- [Onde será usado - páginas específicas]
- [Cenários de interação]
- [Frequência de uso esperada]

## 🎨 Estados e Variações

**Estados visuais**:
- [ ] Default
- [ ] Hover
- [ ] Active/Pressed
- [ ] Disabled
- [ ] Loading
- [ ] Error
- [ ] Success

**Variações**:
- [ ] Tamanhos (sm, md, lg)
- [ ] Variantes de cores (primary, secondary, danger)
- [ ] Responsive behavior

## ⚙️ Props/Data Attributes

**Configurações esperadas**:
```javascript
{
  // Exemplo de interface
  title: string,
  type: 'primary' | 'secondary' | 'danger',
  size: 'sm' | 'md' | 'lg',
  disabled: boolean,
  loading: boolean,
  onClick: function,
  // ... outras props
}
```

**Data attributes**:
- `data-component="[component-name]"`
- `data-variant="[variant]"`
- `data-size="[size]"`

## ♿ Acessibilidade

**Requisitos A11y**:
- [ ] **Keyboard navigation**: Tab, Enter, Escape, Arrow keys
- [ ] **Screen reader**: Proper ARIA labels and roles
- [ ] **Focus management**: Visible focus indicator
- [ ] **Semantic HTML**: Appropriate element choice
- [ ] **Contrast**: Meet WCAG AA standards (4.5:1 minimum)

**ARIA attributes necessários**:
- [ ] `role="[appropriate-role]"`
- [ ] `aria-label="[descriptive-label]"`
- [ ] `aria-expanded="[true/false]"` (se aplicável)
- [ ] `aria-controls="[target-id]"` (se aplicável)
- [ ] `aria-describedby="[help-text-id]"` (se aplicável)

## 🎨 Design Tokens Utilizados

**Cores**:
- [ ] `--color-primary-*` para estados principais
- [ ] `--color-neutral-*` para backgrounds e borders
- [ ] `--color-semantic-*` para feedback states

**Espaçamentos**:
- [ ] `--space-*` para padding e margins
- [ ] `--radius-*` para bordas arredondadas
- [ ] `--shadow-*` para elevação

**Tipografia**:
- [ ] `--font-size-*` para texto
- [ ] `--font-weight-*` para hierarquia
- [ ] `--line-height-*` para legibilidade

**Animações**:
- [ ] `--transition-*` para micro-interações
- [ ] Respeitar `prefers-reduced-motion`

## 🔧 API do Componente

**Inicialização**:
```javascript
// Exemplo de uso
const component = new ComponentName({
  container: '#container',
  options: { /* ... */ }
});
```

**Métodos públicos**:
- [ ] `show()` / `hide()`
- [ ] `enable()` / `disable()`
- [ ] `update(newOptions)`
- [ ] `destroy()`

**Eventos**:
- [ ] `component:show`
- [ ] `component:hide`
- [ ] `component:change`
- [ ] `component:error`

## 📱 Responsive Behavior

**Breakpoints**:
- [ ] **Mobile** (< 768px): [comportamento]
- [ ] **Tablet** (768px - 1024px): [comportamento]
- [ ] **Desktop** (> 1024px): [comportamento]

**Adaptações**:
- [ ] Stack layout em mobile
- [ ] Touch-friendly sizing (min 44px)
- [ ] Appropriate spacing for different screens

## 🧪 Testes Planejados

**Unit tests**:
- [ ] Initialization with different options
- [ ] Public API methods behavior
- [ ] Event handling
- [ ] Edge cases and error states

**Integration tests**:
- [ ] DOM manipulation
- [ ] User interactions (click, keyboard)
- [ ] Accessibility compliance
- [ ] Responsive behavior

## 📋 Definition of Done

- [ ] Componente implementado conforme especificação
- [ ] Design tokens utilizados consistentemente
- [ ] Acessibilidade validada (A11y testing)
- [ ] Responsive em todos os breakpoints
- [ ] Testes unitários implementados
- [ ] Documentação de uso criada
- [ ] Code review aprovado
- [ ] Lighthouse accessibility score ≥ 90

## 🔗 Referencias

**Design**:
- [ ] **Figma/Design file**: [link]
- [ ] **Style guide**: [Design tokens documentation]

**Implementação**:
- [ ] **Similar components**: [referências de outros componentes]
- [ ] **External libraries**: [se houver inspiração externa]

## 📝 Notas de Implementação

**Considerations**:
- [Qualquer consideração técnica específica]
- [Dependências ou limitações]
- [Performance considerations]

**Future enhancements**:
- [Funcionalidades que podem ser adicionadas no futuro]