# Contribuindo para o App Faz Bem

Este documento estabelece as diretrizes para contribuir com o projeto App Faz Bem. Seguir essas convenções garante consistência e facilita a manutenção do código.

## Convenções de Branch

Use os seguintes prefixos para nomear suas branches:

- `feature/` - Novas funcionalidades
- `fix/` - Correção de bugs
- `refactor/` - Refatoração de código
- `chore/` - Tarefas de manutenção
- `docs/` - Atualizações de documentação
- `perf/` - Melhorias de performance
- `test/` - Adição ou correção de testes

**Exemplo**: `feature/sistema-notificacoes`

## Conventional Commits

Usamos a convenção Conventional Commits para mensagens de commit consistentes:

```
<tipo>(<escopo>): <descrição>

<corpo opcional>

<rodapé opcional>
```

### Tipos de Commit

| Tipo | Descrição | Exemplo |
|------|-----------|---------|
| `feat` | Nova funcionalidade | `feat(auth): adicionar verificação email` |
| `fix` | Correção de bug | `fix(modal): corrigir fechamento modal` |
| `docs` | Documentação | `docs(readme): atualizar instruções` |
| `style` | Formatação, espaços | `style(css): formatar código` |
| `refactor` | Refatoração | `refactor(auth): simplificar lógica` |
| `perf` | Performance | `perf(images): lazy loading` |
| `test` | Testes | `test(utils): adicionar testes unitários` |
| `chore` | Manutenção | `chore(deps): atualizar dependências` |
| `ci` | CI/CD | `ci(github): adicionar workflow` |

## Fluxo de Pull Request

1. **Abrir como Draft**: Inicie sempre com `Draft Pull Request`
2. **Checklist**: Complete todos os itens do checklist antes de marcar como "Ready for Review"
3. **Review**: Requer pelo menos 1 aprovação antes do merge
4. **Tamanho**: Mantenha PRs com menos de ~400 linhas de código quando possível

### Checklist do Pull Request

- [ ] **Lint**: Código passa no linting
- [ ] **Build**: Aplicação builda sem erros (quando aplicável)
- [ ] **Lighthouse**: Performance >= 85, Acessibilidade >= 90 (para páginas afetadas)
- [ ] **Acessibilidade**: 
  - [ ] Foco visível em elementos interativos
  - [ ] Atributos ARIA adequados
  - [ ] Texto alternativo em imagens
  - [ ] Contraste adequado
- [ ] **Testes**: Testes passam (quando aplicável)
- [ ] **Documentação**: Atualizada se necessário

## Política de Tamanho de PR

**Preferência**: PRs com menos de 400 linhas de código

**Para PRs maiores**:
- Dividir em múltiplos PRs menores quando possível
- Documentar claramente o contexto e impacto
- Incluir screenshots/demos para mudanças de UI

## Diretrizes de Comentários

### Comentários no Código

```javascript
// ✅ Bom: Explica o "porquê"
// Evita reflow durante animação de scroll
element.style.transform = 'translateZ(0)';

// ❌ Evitar: Explica o "o quê" (óbvio)
// Define a cor para vermelho
element.style.color = 'red';
```

### TODOs

Use o formato padrão para TODOs:

```javascript
// TODO(seu-usuario): Migrar para nova API - 2024-12-20
// TODO(joao): Implementar cache aqui - 2024-12-25
```

**Estrutura**:
- `TODO(autor)`: Identificação do responsável
- Descrição clara
- Data limite estimada

## Acessibilidade (A11y)

### Requisitos Mínimos

1. **Contraste**: Ratio mínimo 4.5:1 para texto normal
2. **Foco**: Indicador visível para navegação por teclado
3. **Semântica**: Uso correto de elementos HTML semânticos
4. **ARIA**: Labels e roles quando necessário
5. **Alt Text**: Texto alternativo para imagens informativas

### Ferramentas de Teste

- **Lighthouse**: Auditoria automática
- **axe DevTools**: Extensão do Chrome
- **Navegação por teclado**: Teste manual com Tab/Shift+Tab
- **Leitor de tela**: Teste com NVDA/VoiceOver

## Performance

### Métricas Alvo

- **LCP** (Largest Contentful Paint): < 2.5s
- **FID** (First Input Delay): < 100ms
- **CLS** (Cumulative Layout Shift): < 0.1

### Boas Práticas

- Otimizar imagens (WebP, lazy loading)
- Minimizar reflows/repaints
- Usar `will-change` com parcimônia
- Prefetch recursos críticos

## Design Tokens

Sempre usar tokens CSS definidos em `assets/styles/design-tokens.css`:

```css
/* ✅ Correto */
color: var(--color-primary-500);
padding: var(--space-4);

/* ❌ Evitar */
color: #22c55e;
padding: 16px;
```

## Estrutura de Testes

```
tests/
├── unit/          # Testes unitários
├── integration/   # Testes de integração
└── e2e/          # Testes end-to-end
```

## Links Úteis

- [Design System](docs/design-system/tokens.md)
- [Arquitetura](docs/architecture/modules.md)
- [Strategy de Testes](docs/testing/strategy.md)
- [Performance](docs/performance/strategy.md)
- [ADR 0001 - Design Tokens](docs/adr/0001-design-tokens.md)

---

**Dúvidas?** Abra uma issue ou consulte a documentação existente.