# ADR-0002: Centralização do Sistema de Status de Campanhas

## Status
Aceito

## Contexto

### Situação Atual
O projeto App Faz Bem possuía lógica de status de campanhas dispersa em múltiplos arquivos (`status-utils.js`, `campaign-service.js`) com algumas inconsistências:

- Diferentes convenções de nomenclatura (COMPLETED vs EXPIRED)
- Falta de suporte para estado PAUSED 
- Ausência de testes automatizados abrangentes
- API não padronizada para computação de status
- Validação defensiva limitada para entradas inválidas

### Necessidades Identificadas
1. **Centralização**: Uma única fonte de verdade para lógica de status
2. **Robustez**: Tratamento defensivo de datas inválidas
3. **Testabilidade**: Cobertura de testes de 100% em casos críticos
4. **Extensibilidade**: Suporte para novos estados (ex: PAUSED)
5. **Observabilidade**: Logging estruturado para debugging
6. **Ergonomia**: Funções auxiliares para casos de uso comuns

## Decisão

Implementamos uma camada de utilitários centralizada e endurecida em `src/domain/campaign/status.js` com as seguintes características:

### Arquitetura
- **Enum Congelado**: `CampaignStatus` imutável previne modificações acidentais
- **API Funcional**: Funções puras que aceitam objetos de configuração
- **Validação Defensiva**: Fallback para EXPIRED em caso de dados inválidos
- **Logging Integrado**: Warnings para entradas problemáticas

### Estados Suportados
1. **UPCOMING**: Campanha ainda não iniciada
2. **ACTIVE**: Campanha em andamento
3. **PAUSED**: Campanha pausada manualmente (supersede lógica temporal)
4. **EXPIRED**: Campanha finalizada ou dados inválidos

### Lógica de Priorização
```
1. paused === true → PAUSED (mais alta prioridade)
2. endsAt < now → EXPIRED  
3. startsAt > now → UPCOMING
4. Dentro do período → ACTIVE
5. Fallback → EXPIRED (dados inválidos)
```

### Assinatura da API
```javascript
computeCampaignStatus({
  startsAt: Date | string | null,
  endsAt: Date | string | null, 
  paused: boolean,
  now: Date
}) → 'UPCOMING' | 'ACTIVE' | 'PAUSED' | 'EXPIRED'
```

## Alternativas Consideradas

### 1. Manter Status Atual + Patches
- **Prós**: Menor refatoração inicial
- **Contras**: Mantém inconsistências, dificulta manutenção

### 2. Biblioteca Externa (ex: date-fns)
- **Prós**: Funcionalidades robustas de data
- **Contras**: Dependência adicional, overhead para casos simples

### 3. Classes vs Funções 
- **Prós Classes**: Encapsulamento, state management
- **Contras Classes**: Overhead, menos tree-shakable
- **Escolha**: Funções puras para simplicidade e performance

### 4. TypeScript vs JSDoc
- **Prós TS**: Type safety nativo, melhor DX
- **Contras TS**: Overhead de build, configuração complexa
- **Escolha**: JSDoc para manter simplicidade do projeto

## Consequências

### Positivas
✅ **Testabilidade**: 100% cobertura de branches, casos extremos cobertos  
✅ **Robustez**: Tratamento defensivo previne crashes em produção  
✅ **Observabilidade**: Logging estruturado facilita debugging  
✅ **Manutenibilidade**: Lógica centralizada, API consistente  
✅ **Performance**: Tree-shakable, sem dependências externas  
✅ **Documentação**: JSDoc completa com exemplos  

### Neutras
➖ **Breaking Change**: Requer migração de código existente  
➖ **Learning Curve**: Nova API para desenvolvedores  

### Riscos Mitigados
- **Datas Inválidas**: Fallback para EXPIRED + logging
- **Mudanças de Requisitos**: Enum extensível, helpers configuráveis
- **Debugging**: Contexto completo nos logs de warning

## Próximos Passos

### Fase 2 (Esta Implementação)
- [x] Implementar `src/domain/campaign/status.js`
- [x] Criar suite de testes com Vitest  
- [x] Documentar API e casos limite
- [x] Adicionar logging estruturado

### Fase 3 (PRs Futuros)
- [ ] Migrar código existente para nova API
- [ ] Implementar cache/SWR para consultas de campanha
- [ ] Adicionar métricas de performance
- [ ] Integrar com sistema de observabilidade (Sentry)

### Refatoração Gradual
1. **Coexistência**: Manter `status-utils.js` temporariamente
2. **Migração Progressiva**: Atualizar consumers um por vez
3. **Deprecação**: Remover código legado após validação
4. **Monitoramento**: Acompanhar métricas de erro pós-migração

## Referências
- [Campaign Status API Documentation](../development/campaign-status.md)
- [Test Coverage Report](../../src/domain/campaign/status.test.js)
- [Logging Utilities](../../src/lib/logging/logger.js)
- [Metrics Baseline](../metrics.md)

---
**Autor**: App Faz Bem Team  
**Data**: 2024-12-24  
**Versão**: 1.0