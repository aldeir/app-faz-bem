# ADR 0001: Estratégia de Design Tokens

**Data**: 2024-12-20  
**Status**: Aceito  
**Autores**: Equipe de Desenvolvimento  

## Contexto

O App Faz Bem precisa de um sistema consistente de design para:

1. **Manter consistência visual** entre todas as páginas
2. **Facilitar manutenção** e atualizações de design
3. **Suportar modo escuro** e futuras variações de tema
4. **Evitar vendor-lock** em frameworks CSS pesados
5. **Reduzir duplicação** de valores mágicos no CSS

Atualmente, o projeto já possui uma base de CSS Custom Properties em `assets/styles/design-tokens.css` e utility classes existentes. Precisamos padronizar e expandir este sistema.

## Decisão

Adotamos um sistema de **Design Tokens centralizados** usando CSS Custom Properties nativas, com as seguintes características:

### 1. Estrutura de Tokens

- **Cores Semânticas vs Escala Base**: Mantemos tanto cores da marca (`--color-primary-*`) quanto cores semânticas (`--color-success`, `--color-error`)
- **Escalas Definidas**: Progressões matemáticas consistentes (4px base para spacing, escala de cores)
- **Naming Convention**: Padrão `--{categoria}-{subcategoria}-{valor}` (ex: `--color-primary-500`)

### 2. Categorias de Tokens

```css
/* Cores */
--color-primary-500: #22c55e;
--color-neutral-800: #1e293b;
--color-semantic-success: var(--color-primary-500);

/* Espaçamentos (base 4px) */
--space-4: 1rem;      /* 16px */
--space-6: 1.5rem;    /* 24px */
--space-8: 2rem;      /* 32px */

/* Tipografia */
--font-size-base: 1rem;
--font-size-lg: 1.125rem;

/* Bordas & Sombras */
--radius-md: 0.375rem;
--shadow-sm: 0 1px 3px 0 rgb(0 0 0 / 0.1);
```

### 3. Fallback Strategy

Todos os tokens incluem fallbacks para navegadores que não suportam custom properties:

```css
.exemplo {
  color: #22c55e; /* fallback */
  color: var(--color-primary-500, #22c55e);
}
```

### 4. Modo Escuro

Implementação via `@media (prefers-color-scheme: dark)` que sobrescreve valores de tokens automaticamente:

```css
@media (prefers-color-scheme: dark) {
  :root {
    --color-neutral-800: #f8fafc;
    --color-neutral-100: #1e293b;
  }
}
```

## Alternativas Consideradas

### A. Framework CSS (Tailwind/Bootstrap)
**Rejeitada**: Vendor-lock e overhead para projeto de tamanho médio

### B. CSS-in-JS
**Rejeitada**: Adiciona complexidade de build e runtime

### C. SASS Variables
**Rejeitada**: Menos flexível que custom properties para theming dinâmico

## Consequências

### Positivas

1. **Facilidade de Theming**: Modo escuro e variações futuras são simples
2. **Consistency**: Valores centralizados reduzem inconsistências
3. **Manutenibilidade**: Mudanças globais em um local
4. **Performance**: 
   - Reduz repintura durante mudanças de tema
   - CSS nativo sem overhead de build
5. **Acessibilidade**: Respeita preferências do sistema operacional
6. **Flexibilidade**: Tokens podem ser alterados via JavaScript se necessário

### Negativas

1. **Curva de Aprendizado**: Equipe precisa se familiarizar com convenções
2. **Verbosidade**: `var(--color-primary-500)` vs `#22c55e`
3. **Suporte Legacy**: IE11 não suporta custom properties (aceitável para PWA)

### Neutras

1. **Migração Gradual**: Tokens podem ser adoptados incrementalmente
2. **Compatibilidade**: Mantém CSS existente funcionando

## Implementação

### Fase 1: Fundação ✅
- [x] Definir tokens base em `assets/styles/design-tokens.css`
- [x] Documentar convenções
- [x] Estabelecer escalas

### Fase 2: Migração (Planejada)
- [ ] Migrar páginas principais para usar tokens
- [ ] Refatorar CSS legacy
- [ ] Implementar modo escuro completo

### Fase 3: Expansão (Futuro)
- [ ] Tokens de motion/animação
- [ ] Tokens responsivos
- [ ] Sistema de grid

## Monitoramento

- **Adoption Rate**: % de propriedades CSS usando tokens vs valores hardcoded
- **Bundle Size**: Tamanho do CSS compilado
- **Performance**: Core Web Vitals após implementação
- **Developer Experience**: Feedback da equipe sobre uso

## Links Relacionados

- [Documentação de Tokens](../design-system/tokens.md)
- [Implementação atual](../../assets/styles/design-tokens.css)
- [UI Refactor Foundation](../../README-UI-REFATOR.md)

---

**Próxima Revisão**: Março 2025  
**Responsável**: Equipe de Frontend