# Design Tokens

Sistema de tokens de design para o App Faz Bem, oferecendo uma base consistente para todo o sistema visual.

**Status**: Draft  
**Versão**: 1.0.0  
**Arquivo de implementação**: [`assets/styles/design-tokens.css`](../../assets/styles/design-tokens.css)

## Visão Geral

Os design tokens são valores nomeados que representam decisões de design visual. Eles garantem consistência e facilitam a manutenção do sistema de design.

## Categorias de Tokens

### 🎨 Colors (Cores)

#### Brand Colors
Cores principais da marca e suas variações:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-primary-50` | `#f0fdf4` | Background muito claro |
| `--color-primary-100` | `#dcfce7` | Background claro |
| `--color-primary-200` | `#bbf7d0` | Hover states |
| `--color-primary-300` | `#86efac` | Borders, icons |
| `--color-primary-400` | `#4ade80` | Secondary buttons |
| `--color-primary-500` | `#22c55e` | **Principal** - botões, links |
| `--color-primary-600` | `#16a34a` | Hover de botões |
| `--color-primary-700` | `#15803d` | Active states |
| `--color-primary-800` | `#166534` | Text strong |
| `--color-primary-900` | `#14532d` | Text stronger |

#### Neutral Colors
Escala de cinzas para textos, backgrounds e bordas:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-neutral-0` | `#ffffff` | Background principal |
| `--color-neutral-50` | `#f8fafc` | Background suave |
| `--color-neutral-100` | `#f1f5f9` | Cards, panels |
| `--color-neutral-200` | `#e2e8f0` | Borders |
| `--color-neutral-300` | `#cbd5e1` | Borders ativas |
| `--color-neutral-400` | `#94a3b8` | Placeholders |
| `--color-neutral-500` | `#64748b` | Text secundário |
| `--color-neutral-600` | `#475569` | Text principal |
| `--color-neutral-700` | `#334155` | Headings |
| `--color-neutral-800` | `#1e293b` | Text strong |
| `--color-neutral-900` | `#0f172a` | Text strongest |

#### Semantic Colors
Cores para feedback e estados:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-success-500` | `#22c55e` | Sucesso, confirmações |
| `--color-warning-500` | `#f59e0b` | Avisos, atenção |
| `--color-error-500` | `#ef4444` | Erros, ações destrutivas |
| `--color-info-500` | `#3b82f6` | Informações, dicas |

#### Urgency Colors (Countdown)
Cores específicas para indicadores de urgência:

| Token | Valor | Uso |
|-------|-------|-----|
| `--color-urgent-low` | `#22c55e` | Muito tempo restante |
| `--color-urgent-medium` | `#f59e0b` | Tempo moderado |
| `--color-urgent-high` | `#dc2626` | Pouco tempo restante |

### 📏 Spacing (Espaçamentos)

Escala baseada em múltiplos de 4px para consistência:

| Token | Valor | Pixels | Uso |
|-------|-------|--------|-----|
| `--space-1` | `0.25rem` | 4px | Bordas finas |
| `--space-2` | `0.5rem` | 8px | Espaçamento mínimo |
| `--space-3` | `0.75rem` | 12px | Padding pequeno |
| `--space-4` | `1rem` | 16px | **Base** - padding padrão |
| `--space-5` | `1.25rem` | 20px | Padding médio |
| `--space-6` | `1.5rem` | 24px | Padding grande |
| `--space-8` | `2rem` | 32px | Seções |
| `--space-10` | `2.5rem` | 40px | Margins grandes |
| `--space-12` | `3rem` | 48px | Separação de blocos |
| `--space-16` | `4rem` | 64px | Separação principal |

### 🔤 Typography (Tipografia)

#### Font Sizes

| Token | Valor | Pixels | Uso |
|-------|-------|--------|-----|
| `--font-size-xs` | `0.75rem` | 12px | Captions, labels |
| `--font-size-sm` | `0.875rem` | 14px | Text secundário |
| `--font-size-base` | `1rem` | 16px | **Base** - body text |
| `--font-size-lg` | `1.125rem` | 18px | Text destacado |
| `--font-size-xl` | `1.25rem` | 20px | Small headings |
| `--font-size-2xl` | `1.5rem` | 24px | Headings |
| `--font-size-3xl` | `1.875rem` | 30px | Large headings |
| `--font-size-4xl` | `2.25rem` | 36px | Display text |

#### Font Weights

| Token | Valor | Uso |
|-------|-------|-----|
| `--font-weight-normal` | `400` | Body text |
| `--font-weight-medium` | `500` | Emphasis |
| `--font-weight-semibold` | `600` | Headings |
| `--font-weight-bold` | `700` | Strong emphasis |

#### Line Heights

| Token | Valor | Uso |
|-------|-------|-----|
| `--line-height-tight` | `1.25` | Headings |
| `--line-height-normal` | `1.5` | **Base** - body text |
| `--line-height-relaxed` | `1.75` | Reading text |

### 🔲 Radius (Bordas Arredondadas)

| Token | Valor | Uso |
|-------|-------|-----|
| `--radius-none` | `0` | Sem arredondamento |
| `--radius-sm` | `0.125rem` | 2px - inputs |
| `--radius-base` | `0.25rem` | 4px - botões |
| `--radius-md` | `0.375rem` | 6px - cards |
| `--radius-lg` | `0.5rem` | 8px - panels |
| `--radius-xl` | `0.75rem` | 12px - modals |
| `--radius-full` | `9999px` | Circular |

### 🌫️ Shadows (Sombras)

| Token | Uso |
|-------|-----|
| `--shadow-xs` | Borders sutis |
| `--shadow-sm` | Cards, inputs |
| `--shadow-base` | **Base** - elements elevated |
| `--shadow-md` | Dropdowns |
| `--shadow-lg` | Modals |
| `--shadow-xl` | Tooltips, popovers |

### ⚡ Motion (Movimento)

#### Durations

| Token | Valor | Uso |
|-------|-------|-----|
| `--transition-fast` | `150ms` | Micro-interactions |
| `--transition-base` | `250ms` | **Base** - hover, focus |
| `--transition-slow` | `350ms` | Modals, drawers |

#### Easings

| Token | Valor | Uso |
|-------|-------|-----|
| `--ease-linear` | `linear` | Loading bars |
| `--ease-out` | `ease-out` | **Base** - most transitions |
| `--ease-in-out` | `ease-in-out` | Modals |

#### Combined Transitions

| Token | Uso |
|-------|-----|
| `--transition-transform` | Transforms |
| `--transition-colors` | Color changes |

### 📚 Z-Index (Camadas)

| Token | Valor | Uso |
|-------|-------|-----|
| `--z-dropdown` | `1000` | Dropdowns |
| `--z-fixed` | `1020` | Fixed elements |
| `--z-modal-backdrop` | `1040` | Modal backgrounds |
| `--z-modal` | `1050` | Modals |
| `--z-popover` | `1060` | Popovers, tooltips |
| `--z-toast` | `1070` | Notifications |

## Modo Escuro

O sistema suporta modo escuro através de media queries que sobrescrevem valores de tokens automaticamente:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-neutral-0: #1e293b;
    --color-neutral-900: #f8fafc;
    /* ... outros overrides */
  }
}
```

## Uso Recomendado

### ✅ Correto

```css
.button {
  background-color: var(--color-primary-500);
  padding: var(--space-4) var(--space-6);
  border-radius: var(--radius-base);
  transition: var(--transition-colors);
}
```

### ❌ Evitar

```css
.button {
  background-color: #22c55e;
  padding: 16px 24px;
  border-radius: 4px;
  transition: background-color 250ms;
}
```

## Migração

Para migrar CSS existente:

1. **Identifique valores hardcoded** que têm tokens equivalentes
2. **Substitua progressivamente** usando busca e substituição
3. **Teste a consistência visual** após cada mudança
4. **Valide modo escuro** se aplicável

## Links Relacionados

- [ADR 0001 - Design Tokens](../adr/0001-design-tokens.md)
- [Arquivo de implementação](../../assets/styles/design-tokens.css)
- [UI Refactor Foundation](../../README-UI-REFATOR.md)
- [Guia de contribuição](../../CONTRIBUTING.md)

---

**Última atualização**: Dezembro 2024  
**Responsável**: Equipe de Frontend