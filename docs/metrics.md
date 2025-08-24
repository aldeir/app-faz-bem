# Métricas de Performance - App Faz Bem

## Baseline de Métricas (Fase 2)

Esta documentação estabelece placeholders para métricas que serão coletadas manualmente após a implementação da centralização do sistema de status de campanhas.

---

## 📊 Métricas de Status de Campanhas

### Computação de Status
- **TODO**: Tempo médio de computação de status por campanha
- **TODO**: Número de chamadas para `computeCampaignStatus` por minuto
- **TODO**: Distribuição de status retornados (UPCOMING/ACTIVE/PAUSED/EXPIRED)
- **TODO**: Taxa de fallback para EXPIRED por datas inválidas

### Cache de Status (Futuro)
- **TODO**: Taxa de hit/miss do cache de status
- **TODO**: Tempo de vida médio dos itens no cache
- **TODO**: Invalidações de cache por minuto

---

## 🔍 Métricas de Observabilidade

### Logging
- **TODO**: Número de warnings de datas inválidas por hora
- **TODO**: Volume de logs por nível (debug/info/warn/error)
- **TODO**: Contextos mais comuns em logs de warning

### Erros
- **TODO**: Taxa de erro na computação de status (deve ser 0%)
- **TODO**: Tipos de entrada inválida mais comuns
- **TODO**: Campanhas com dados inconsistentes por dia

---

## ⚡ Métricas de Performance

### Funções Core
```javascript
// TODO: Implementar métricas com performance.mark()
// computeCampaignStatus()
// - Tempo de execução: __ms (p50/p95/p99)
// - Memória utilizada: __KB
// - CPU utilization: __%

// parseDate()  
// - Tempo de parsing por formato: __ms
// - Taxa de sucesso por tipo de entrada: __%
// - Formatos mais utilizados: [__, __, __]
```

### Bundle Size
- **TODO**: Tamanho do módulo status.js comprimido
- **TODO**: Tree-shaking effectiveness (bytes removidos)
- **TODO**: Dependências importadas vs utilizadas

---

## 📈 Métricas de Negócio

### Uso de Campanhas
- **TODO**: Número de campanhas por status em tempo real
- **TODO**: Tempo médio de vida de uma campanha
- **TODO**: Taxa de campanhas pausadas vs ativas
- **TODO**: Campanhas que expiram naturalmente vs pausadas

### Firestore
- **TODO**: Leituras de documentos de campanha por minuto
- **TODO**: Tamanho médio dos documentos de campanha
- **TODO**: Consultas que resultam em cache hit vs miss
- **TODO**: Latência média das consultas de campanha

---

## 🎯 Metas de Performance (Objetivos)

### Targets Iniciais
- Computação de status: < 1ms (p95)
- Zero falhas na computação (robustez total)
- Warnings de data inválida: < 1% das execuções
- Bundle size: < 5KB gzipped

### Monitoramento Crítico
- **Alerta**: Se tempo de computação > 5ms
- **Alerta**: Se taxa de warnings > 5%
- **Alerta**: Se bundle size > 10KB

---

## 📝 Como Coletar Métricas

### Desenvolvimento
```javascript
// Exemplo de instrumentação manual
import { performance } from 'perf_hooks';

function measureCampaignStatus(bounds) {
  const start = performance.now();
  const result = computeCampaignStatus(bounds);
  const end = performance.now();
  
  // TODO: Enviar para sistema de métricas
  console.log(`computeCampaignStatus took ${end - start}ms`);
  
  return result;
}
```

### Produção
```javascript
// TODO: Integrar com Analytics/APM
// - Google Analytics Events
// - Firebase Performance Monitoring  
// - Custom metrics dashboard
// - Sentry performance monitoring
```

---

## 🔄 Próximas Iterações

### Fase 3: Métricas Automáticas
- [ ] Implementar instrumentação automática
- [ ] Dashboard de métricas em tempo real
- [ ] Alertas para degradação de performance
- [ ] Comparação antes/depois da otimização

### Fase 4: Otimização Baseada em Dados
- [ ] Identificar gargalos através de métricas
- [ ] A/B testing de otimizações
- [ ] Benchmarking comparativo
- [ ] Análise de padrões de uso

---

## 📋 Checklist de Coleta Manual

Após deploy da Fase 2, coletar manualmente:

**Semana 1:**
- [ ] Baseline de performance inicial
- [ ] Volume de warnings de data inválida
- [ ] Distribuição de status retornados
- [ ] Identificar campanhas com dados problemáticos

**Semana 2:**
- [ ] Comparar performance antes/depois
- [ ] Validar estabilidade do sistema
- [ ] Documentar casos extremos encontrados
- [ ] Ajustar thresholds de alerta

**Semana 4:**
- [ ] Análise de tendências
- [ ] Relatório de impacto
- [ ] Recomendações para Fase 3
- [ ] Atualizar esta documentação com dados reais

---

**Status**: 📝 Placeholders ativos - aguardando implementação  
**Próxima Revisão**: Após merge da Fase 2  
**Responsável**: App Faz Bem Team