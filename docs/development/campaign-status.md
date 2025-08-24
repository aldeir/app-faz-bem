# Sistema de Status de Campanhas - Documentação da API

## Visão Geral

O sistema de status de campanhas do App Faz Bem fornece uma API centralizada e robusta para determinar o estado atual de uma campanha baseado em suas datas de início, fim e configurações de pausa.

## Contrato da API

### CampaignStatus (Enum)

Enumeração congelada que define todos os estados possíveis de uma campanha:

```javascript
import { CampaignStatus } from './src/domain/campaign/status.js';

console.log(CampaignStatus.UPCOMING); // 'UPCOMING'
console.log(CampaignStatus.ACTIVE);   // 'ACTIVE' 
console.log(CampaignStatus.PAUSED);   // 'PAUSED'
console.log(CampaignStatus.EXPIRED);  // 'EXPIRED'

// Objeto congelado - não pode ser modificado
Object.isFrozen(CampaignStatus); // true
```

### computeCampaignStatus(bounds)

Função principal que calcula o status de uma campanha baseado em seus limites temporais.

```javascript
import { computeCampaignStatus } from './src/domain/campaign/status.js';

const status = computeCampaignStatus({
  startsAt: '2023-12-01T00:00:00Z',    // Data de início
  endsAt: '2023-12-31T23:59:59Z',      // Data de fim  
  paused: false,                        // Se está pausada
  now: new Date()                       // Data atual (opcional)
});
```

**Parâmetros:**
- `bounds.startsAt` (Date|string|null): Data de início da campanha
- `bounds.endsAt` (Date|string|null): Data de fim da campanha  
- `bounds.paused` (boolean): Se a campanha está pausada manualmente
- `bounds.now` (Date): Data atual para comparação (padrão: `new Date()`)

**Retorna:** `'UPCOMING' | 'ACTIVE' | 'PAUSED' | 'EXPIRED'`

### Funções Auxiliares

```javascript
import { 
  isActive, 
  isUpcoming, 
  isPaused, 
  isExpired,
  getAllStatuses,
  isValidStatus 
} from './src/domain/campaign/status.js';

// Verificadores de estado
isActive(status)     // boolean
isUpcoming(status)   // boolean  
isPaused(status)     // boolean
isExpired(status)    // boolean

// Utilitários
getAllStatuses()     // ['UPCOMING', 'ACTIVE', 'PAUSED', 'EXPIRED']
isValidStatus('ACTIVE') // true
```

## Tabela de Estados

| Estado | Descrição | Prioridade | Condições |
|--------|-----------|------------|-----------|
| **PAUSED** | Campanha pausada manualmente | 1 (Mais alta) | `paused === true` |
| **EXPIRED** | Campanha finalizada ou dados inválidos | 2 | `endsAt < now` OU dados inválidos |
| **UPCOMING** | Campanha ainda não iniciada | 3 | `startsAt > now` |
| **ACTIVE** | Campanha em andamento | 4 | Dentro do período válido |

### Lógica de Priorização

A computação segue uma ordem específica de prioridade:

1. **Paused Override**: Se `paused === true`, retorna `PAUSED` (ignora datas)
2. **Expiration Check**: Se `endsAt < now`, retorna `EXPIRED`  
3. **Start Check**: Se `startsAt > now`, retorna `UPCOMING`
4. **Active Period**: Se dentro do período, retorna `ACTIVE`
5. **Fallback**: Para dados inválidos, retorna `EXPIRED`

## Casos Limite

### Validação de Datas

```javascript
// Datas válidas - múltiplos formatos aceitos
computeCampaignStatus({ 
  startsAt: new Date('2023-12-01'),           // Objeto Date
  endsAt: '2023-12-31T23:59:59Z',            // String ISO
  now: 1672531200000                          // Timestamp Unix
});

// Datas inválidas - fallback seguro
computeCampaignStatus({
  startsAt: 'data-inválida',                 // ⚠️ Warning + EXPIRED
  endsAt: 'também-inválida'                  // ⚠️ Warning + EXPIRED  
});
```

### Condições de Fronteira

```javascript
const startTime = '2023-12-15T12:00:00Z';
const endTime = '2023-12-31T23:59:59Z';

// Exatamente no início
computeCampaignStatus({ 
  startsAt: startTime, 
  now: new Date(startTime) 
}); // → 'ACTIVE'

// Exatamente no fim  
computeCampaignStatus({ 
  endsAt: endTime, 
  now: new Date(endTime) 
}); // → 'ACTIVE'

// 1 segundo antes do início
computeCampaignStatus({
  startsAt: startTime,
  now: new Date(new Date(startTime).getTime() - 1000)
}); // → 'UPCOMING'

// 1 segundo após o fim
computeCampaignStatus({
  endsAt: endTime,  
  now: new Date(new Date(endTime).getTime() + 1000)
}); // → 'EXPIRED'
```

### Estados Especiais

```javascript
// Campanha sem data de início (ativa desde sempre)
computeCampaignStatus({ 
  endsAt: '2023-12-31T23:59:59Z' 
}); // → 'ACTIVE' (se antes do fim)

// Campanha sem data de fim (ativa para sempre)
computeCampaignStatus({ 
  startsAt: '2023-12-01T00:00:00Z' 
}); // → 'ACTIVE' (se após o início)

// Campanha pausada independente das datas
computeCampaignStatus({
  startsAt: '2023-12-01T00:00:00Z',
  endsAt: '2023-11-30T23:59:59Z',    // Já deveria estar EXPIRED
  paused: true                        // Mas está pausada
}); // → 'PAUSED'
```

## Exemplos de Uso

### Caso 1: Campanha de Natal

```javascript
const campanhaDeNatal = {
  startsAt: '2023-12-01T00:00:00Z',
  endsAt: '2023-12-31T23:59:59Z',
  paused: false
};

// 15 de novembro - antes do início
computeCampaignStatus({ 
  ...campanhaDeNatal, 
  now: new Date('2023-11-15T10:00:00Z') 
}); // → 'UPCOMING'

// 15 de dezembro - durante a campanha  
computeCampaignStatus({ 
  ...campanhaDeNatal, 
  now: new Date('2023-12-15T10:00:00Z') 
}); // → 'ACTIVE'

// 15 de janeiro - após o fim
computeCampaignStatus({ 
  ...campanhaDeNatal, 
  now: new Date('2024-01-15T10:00:00Z') 
}); // → 'EXPIRED'
```

### Caso 2: Campanha Pausada Temporariamente

```javascript
const campanhaManutencao = {
  startsAt: '2023-12-01T00:00:00Z',
  endsAt: '2023-12-31T23:59:59Z', 
  paused: true  // Pausada para manutenção
};

computeCampaignStatus({ 
  ...campanhaManutencao, 
  now: new Date('2023-12-15T10:00:00Z') 
}); // → 'PAUSED' (não importa que deveria estar ativa)
```

### Caso 3: Integração com Interface

```javascript
import { computeCampaignStatus, isActive, isPaused } from './src/domain/campaign/status.js';

function renderCampaignBadge(campaign) {
  const status = computeCampaignStatus({
    startsAt: campaign.startDate,
    endsAt: campaign.endDate,
    paused: campaign.isPaused
  });
  
  if (isActive(status)) {
    return '<span class="badge-green">Ativa</span>';
  } else if (isPaused(status)) {
    return '<span class="badge-yellow">Pausada</span>';
  } else {
    return '<span class="badge-gray">Finalizada</span>';  
  }
}
```

## Notas sobre Fuso Horário

### Recomendações
- **Sempre use UTC**: Armazene datas em UTC no banco de dados
- **Parse Explícito**: Use ISO strings com 'Z' suffix para UTC
- **Conversão Local**: Faça conversões para fuso local apenas na UI

### Exemplos
```javascript
// ✅ Recomendado - UTC explícito
computeCampaignStatus({
  startsAt: '2023-12-01T00:00:00Z',  // UTC
  endsAt: '2023-12-31T23:59:59Z'     // UTC
});

// ⚠️ Cuidado - pode variar por fuso horário
computeCampaignStatus({
  startsAt: '2023-12-01T00:00:00',   // Fuso local
  endsAt: '2023-12-31T23:59:59'      // Fuso local  
});
```

## Tratamento de Erros

### Logging Automático
O sistema registra automaticamente warnings para situações problemáticas:

```javascript
// Logs warning e retorna 'EXPIRED'
computeCampaignStatus({
  startsAt: 'data-inválida',
  endsAt: '2023-12-31T23:59:59Z'
});

// Console output:
// [2023-12-24T10:00:00.000Z] WARN: Invalid campaign dates provided, falling back to EXPIRED
```

### Tratamento Defensivo
```javascript
// Mesmo com dados ruins, nunca falha
try {
  const status = computeCampaignStatus({ 
    startsAt: null,
    endsAt: undefined, 
    paused: 'not-a-boolean'  // Será falsy → false
  });
  console.log(status); // 'ACTIVE' (sem datas = sempre ativa)
} catch (error) {
  // Nunca acontece - função é defensiva
}
```

## Próximos Passos

### Melhorias Planejadas
1. **Cache de Status**: Implementar cache inteligente para consultas frequentes
2. **Eventos de Mudança**: Sistema de notificação quando status muda
3. **Regras Customizáveis**: Permitir lógica de negócio específica por tipo de campanha
4. **Métricas**: Acompanhar distribuição de status e performance
5. **Timezone Awareness**: Suporte nativo para diferentes fusos horários

### Considerações de Performance
- **Função Pura**: Sem side effects, pode ser memorizada
- **Tree Shaking**: Imports nomeados permitem bundling otimizado  
- **Zero Dependencies**: Sem overhead de bibliotecas externas
- **Validação Mínima**: Apenas o necessário para robustez

---

## Links Relacionados
- [ADR-0002: Centralização do Status](../adr/ADR-0002-campaign-status-centralizacao.md)
- [Métricas de Performance](../metrics.md)
- [Testes de Cobertura](../../src/domain/campaign/status.test.js)
- [Logger Utilities](../../src/lib/logging/logger.js)