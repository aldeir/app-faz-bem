---
name: Refactor de Página
about: Template para refatoração de páginas existentes
labels: ["refactor", "ui", "enhancement"]
assignees: ""
---

## 📄 Página a Refatorar

**Arquivo**: `[nome-da-pagina].html`  
**URL**: `/caminho/da/pagina`  

## 🎯 Objetivo da Refatoração

**Descrição**: [Descreva o objetivo principal da refatoração]

**Problemas atuais**:
- [ ] Performance (identificar gargalos específicos)
- [ ] Acessibilidade (WCAG issues)
- [ ] Responsividade (problemas mobile)
- [ ] Manutenibilidade (código duplicado, inline styles)
- [ ] UX (usabilidade, fluxo confuso)
- [ ] SEO (meta tags, estrutura)

## ✅ Checklist de Refatoração

### Design Tokens
- [ ] Migrar cores hardcoded para tokens (`var(--color-*)`)
- [ ] Aplicar espaçamentos consistentes (`var(--space-*)`)
- [ ] Usar escalas de tipografia (`var(--font-size-*)`)
- [ ] Implementar border radius padrão (`var(--radius-*)`)
- [ ] Aplicar sombras consistentes (`var(--shadow-*)`)

### CSS Organization
- [ ] Remover inline styles
- [ ] Consolidar CSS duplicado
- [ ] Aplicar naming conventions (BEM, utility-first)
- [ ] Organizar imports (tokens → core → page-specific)

### Acessibilidade (A11y)
- [ ] Contraste adequado (min 4.5:1 para texto normal)
- [ ] Foco visível em elementos interativos
- [ ] Atributos ARIA apropriados
- [ ] Texto alternativo em imagens
- [ ] Estrutura semântica (headings, landmarks)
- [ ] Navegação por teclado funcional

### Performance
- [ ] Lazy loading de imagens
- [ ] Otimização de imagens (WebP, tamanhos adequados)
- [ ] Minimizar reflows (evitar layout thrashing)
- [ ] Prefetch de recursos críticos

### Lighthouse Targets
- [ ] **Performance**: ≥ 85
- [ ] **Acessibilidade**: ≥ 90
- [ ] **Best Practices**: ≥ 85
- [ ] **SEO**: ≥ 85

### Testes
- [ ] Funcionalidade mantida (regression testing)
- [ ] Responsividade testada (mobile, tablet, desktop)
- [ ] Cross-browser testing (Chrome, Firefox, Safari)
- [ ] Validação com screen readers (quando aplicável)

## 🚨 Riscos Identificados

**Riscos potenciais**:
- [ ] Quebra de funcionalidade existente
- [ ] Mudanças visuais não intencionais
- [ ] Impacto em outras páginas
- [ ] Degradação de performance

**Plano de mitigação**:
- [Descreva como minimizar ou tratar cada risco]

## 📋 Definition of Done

- [ ] Todos os itens do checklist completados
- [ ] Lighthouse scores atingidos
- [ ] Testes de regressão passando
- [ ] Code review aprovado
- [ ] QA testing completado

## 🔗 Links Relacionados

- [ ] **Design**: [Link para design/mockup se aplicável]
- [ ] **Issues relacionadas**: #[numero]
- [ ] **PR de implementação**: [será preenchido após criação]

## 📝 Notas Adicionais

[Adicione qualquer contexto adicional, decisões de design, ou considerações especiais]