# Inventário de Rotas - App Faz Bem

## Visão Geral

Este documento mantém o inventário inicial das rotas planejadas para o App Faz Bem. Como o projeto ainda não adotou um framework web específico (SvelteKit, Next.js, etc.), este inventário serve como baseline para o planejamento da arquitetura de rotas que será implementada futuramente.

## Contexto

- **Status Atual**: O projeto utiliza páginas HTML estáticas sem framework de roteamento
- **Objetivo**: Estabelecer estrutura de rotas planejada antes da migração para framework
- **Futuro**: Este inventário poderá ser auto-gerado quando as rotas reais forem implementadas

## Inventário de Rotas Planejadas

| Path | Auth | Owner | Pri | Status | Observações |
|------|------|-------|-----|--------|-------------|
| / | Não | - | Alta | planned | Página inicial do aplicativo |
| /login | Não | - | Alta | planned | Página de autenticação de usuários |
| /items | Sim | - | Média | planned | Listagem de itens/campanhas disponíveis |
| /items/:id | Sim | - | Média | planned | Detalhes de um item/campanha específico |
| /perfil | Sim | - | Alta | planned | Página de perfil do usuário autenticado |
| /sobre | Não | - | Baixa | planned | Página informativa sobre o aplicativo |

## Legenda

### Auth (Autenticação)
- **Sim**: Rota requer usuário autenticado
- **Não**: Rota é pública

### Pri (Prioridade)
- **Alta**: Essencial para MVP
- **Média**: Importante para experiência completa
- **Baixa**: Complementar

### Status
- **planned**: Rota planejada, ainda não implementada
- **implementing**: Em desenvolvimento
- **completed**: Implementada e funcional

## Próximos Passos

1. **Escolha do Framework**: Definir se será usado SvelteKit, Next.js ou outro
2. **Implementação**: Criar estrutura de rotas real conforme framework escolhido
3. **Automação**: Adaptar `scripts/inventory-pages.mjs` para escanear rotas reais
4. **Enriquecimento**: Adicionar campos Owner e atualizar Status conforme desenvolvimento

## Links Relacionados

- [Roadmap MVP](./roadmap-mvp.md)
- [Arquitetura de Módulos](./architecture/modules.md)
- Script de inventário: `scripts/inventory-pages.mjs`