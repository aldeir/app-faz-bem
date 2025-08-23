## 📋 Descrição

### Resumo
[Breve descrição das mudanças implementadas]

### Contexto
[Por que essas mudanças foram necessárias?]

### Solução
[Como o problema foi resolvido?]

## 🔄 Tipo de Mudança

- [ ] 🐛 Bug fix (mudança que corrige um issue)
- [ ] ✨ New feature (mudança que adiciona funcionalidade)
- [ ] 💥 Breaking change (mudança que quebra compatibilidade)
- [ ] 🔧 Refactor (mudança que não altera funcionalidade)
- [ ] 📝 Documentation (mudanças apenas na documentação)
- [ ] 🎨 Style (formatação, espaços, ponto e vírgula)
- [ ] ⚡ Performance (mudanças que melhoram performance)
- [ ] ✅ Test (adição ou correção de testes)
- [ ] 🔨 Chore (mudanças de build, CI, dependências)

## ✅ Checklist

### Code Quality
- [ ] **Lint**: Código passa no linting sem erros
- [ ] **Build**: Aplicação compila sem erros (quando aplicável)
- [ ] **Self-review**: Revisei meu próprio código
- [ ] **Comments**: Adicionei comentários em áreas complexas

### Documentation
- [ ] **Code docs**: Código está adequadamente documentado
- [ ] **README**: Atualizei README se necessário
- [ ] **CHANGELOG**: Atualizei CHANGELOG se necessário
- [ ] **ADRs**: Criei/atualizei ADRs se necessário

### Performance
- [ ] **Lighthouse Performance**: ≥ 85 (para páginas afetadas)
- [ ] **Bundle size**: Verificado impacto no bundle
- [ ] **Loading performance**: Sem degradação perceptível
- [ ] **Memory leaks**: Verificado por vazamentos de memória

### Acessibilidade
- [ ] **Lighthouse A11y**: ≥ 90 (para páginas afetadas)
- [ ] **Keyboard navigation**: Navegação por teclado funciona
- [ ] **Focus management**: Foco visível e lógico
- [ ] **ARIA attributes**: Labels e roles apropriados
- [ ] **Screen reader**: Testado com leitor de tela (quando aplicável)
- [ ] **Color contrast**: Contraste adequado (min 4.5:1)

### Testing
- [ ] **Existing tests**: Testes existentes passam
- [ ] **New tests**: Adicionei testes para nova funcionalidade
- [ ] **Edge cases**: Testei cenários de erro/edge cases
- [ ] **Cross-browser**: Testado em navegadores principais
- [ ] **Mobile**: Testado em dispositivos móveis
- [ ] **Regression**: Sem regressões identificadas

### Security
- [ ] **No credentials**: Sem credenciais hardcoded
- [ ] **Input validation**: Validação adequada de inputs
- [ ] **XSS prevention**: Prevenção contra XSS
- [ ] **CSRF protection**: Proteção CSRF onde necessário

## 📱 Screenshots / Videos

### Antes
[Screenshots do estado anterior, se aplicável]

### Depois
[Screenshots das mudanças implementadas]

### Mobile
[Screenshots da versão mobile, se aplicável]

### Acessibilidade
[Screenshots de ferramentas de A11y, se relevante]

## 🧪 Como Testar

### Pré-requisitos
- [ ] Node.js [versão]
- [ ] Dependencies: `npm install`
- [ ] Environment: [variáveis ou configurações especiais]

### Passos
1. Checkout da branch: `git checkout [branch-name]`
2. Instalar dependências: `npm install`
3. Executar build: `npm run build` (se necessário)
4. Navegar para: `[URL específica]`
5. Executar ação: `[passos específicos]`
6. Verificar resultado: `[resultado esperado]`

### Test Cases
- [ ] **Happy path**: Fluxo principal funciona
- [ ] **Edge cases**: Casos extremos tratados
- [ ] **Error states**: Estados de erro apropriados
- [ ] **Loading states**: Estados de carregamento adequados
- [ ] **Empty states**: Estados vazios tratados

## 📊 Lighthouse Scores

### Performance
| Página | Antes | Depois | Status |
|--------|-------|--------|--------|
| [página] | [score] | [score] | ✅/❌ |

### Acessibilidade
| Página | Antes | Depois | Status |
|--------|-------|--------|--------|
| [página] | [score] | [score] | ✅/❌ |

## 🔗 Issues Relacionadas

**Closes**: #[numero]  
**Related to**: #[numero]  
**Depends on**: #[numero]  
**Blocks**: #[numero]  

## ⚠️ Breaking Changes

[Descreva qualquer breaking change e como migrar]

## 📝 Notas Adicionais

### Decisions Made
[Decisões técnicas importantes tomadas]

### Future Improvements
[Melhorias que podem ser feitas no futuro]

### Migration Notes
[Notas sobre migração, se aplicável]

---

## 👥 Review Checklist (para reviewers)

- [ ] **Code quality**: Código está limpo e bem estruturado
- [ ] **Architecture**: Segue padrões arquiteturais do projeto
- [ ] **Performance**: Sem impacto negativo na performance
- [ ] **Security**: Sem vulnerabilidades introduzidas
- [ ] **Accessibility**: Requirements de A11y atendidos
- [ ] **Testing**: Coverage adequada
- [ ] **Documentation**: Documentação adequada
- [ ] **Mobile**: Funciona adequadamente em mobile