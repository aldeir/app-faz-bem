# Services Architecture Documentation

## Overview

This document describes the services architecture philosophy for App Faz Bem, the separation between domain logic and infrastructure concerns, and the roadmap for incremental refactoring.

## Architecture Philosophy

### Domain-Driven Design Principles

The App Faz Bem services layer follows Domain-Driven Design principles with clear separation of concerns:

```
┌─────────────────────────────────────┐
│             Presentation            │  ← HTML pages, UI components
├─────────────────────────────────────┤
│          Application Layer          │  ← Page-specific logic, orchestration
├─────────────────────────────────────┤
│            Domain Layer             │  ← Pure business logic (status-utils, campaign-service)
├─────────────────────────────────────┤
│         Infrastructure Layer        │  ← Firebase, external APIs, storage
└─────────────────────────────────────┘
```

### Pure vs Impure Functions

#### Pure Domain Functions (Current Implementation)
- **Location**: `status-utils.js`, `campaign-service.js`
- **Characteristics**:
  - No side effects
  - Deterministic output for same input
  - No external dependencies (Firebase, DOM, etc.)
  - Easily testable
  - Framework agnostic

```javascript
// Pure function example
export function computeCampaignStatus(campaign, now = new Date()) {
  // Only uses input parameters
  // Returns consistent results
  // No external API calls or mutations
}
```

#### Infrastructure Functions (Future Implementation)
- **Location**: Future `adapters/` directory
- **Characteristics**:
  - Handle external system integration
  - Manage side effects (database calls, API requests)
  - Use pure domain functions for business logic
  - Provide abstraction over Firebase specifics

```javascript
// Future infrastructure function example
export async function fetchCampaignsWithStatus(filters) {
  const campaigns = await firestoreQuery(filters);
  return campaigns.map(campaign => mergeComputedStatus(campaign));
}
```

## Current Service Structure

### Status Utilities (`status-utils.js`)

**Purpose**: Centralized status computation and data normalization

**Key Functions**:
- `computeCampaignStatus()` - Deterministic campaign status logic
- `computeDonationStatus()` - Donation lifecycle management
- `getCampaignProgress()` - Progress calculation
- `normalizeTimestamp()` - Cross-format date handling

**Design Principles**:
- Pure functions only
- No Firebase dependencies
- Comprehensive JSDoc documentation
- Defensive programming (null checks, error handling)

### Campaign Service (`campaign-service.js`)

**Purpose**: Campaign domain logic and lifecycle management

**Key Functions**:
- `deriveLifecycle()` - Campaign state analysis
- `mergeComputedStatus()` - Status enrichment
- `sortCampaigns()` - Business rule sorting
- `shouldAutoComplete()` - Completion logic

**Design Principles**:
- Builds on status-utils foundation
- No mutations of input objects
- Composable function design
- Clear separation from data access

## Phased Refactoring Roadmap

### Phase 1: Foundation (Current PR)
**Goal**: Establish utility foundation and patterns

**Deliverables**:
- ✅ `status-utils.js` with core utilities
- ✅ `campaign-service.js` with domain logic
- ✅ Schema documentation
- ✅ Refactor `gerenciar-campanhas.html` as proof of concept
- ✅ TODO markers in other pages

**Benefits**:
- Eliminate duplicate status logic
- Establish consistent patterns
- Create reusable utilities
- Improve maintainability

### Phase 2: Service Expansion (Next PR)
**Goal**: Extend services to more domains

**Planned Deliverables**:
- `donation-service.js` - Donation lifecycle management
- `entity-service.js` - Entity management logic
- Refactor `admin.html`, `detalhes.html`
- Add unit tests for services

### Phase 3: Data Access Layer (Future PR)
**Goal**: Abstract Firebase operations

**Planned Deliverables**:
- `adapters/firestore-adapter.js` - Database abstraction
- `adapters/storage-adapter.js` - File storage abstraction
- `repositories/campaign-repository.js` - Campaign data operations
- Caching layer implementation

### Phase 4: Infrastructure Services (Future PR)
**Goal**: External integrations and cross-cutting concerns

**Planned Deliverables**:
- `services/notification-service.js` - Enhanced notifications
- `services/analytics-service.js` - Usage tracking
- `services/validation-service.js` - Input validation
- Error handling and logging services

## Code Organization

### Current Structure
```
/
├── status-utils.js           # Pure domain utilities
├── campaign-service.js       # Campaign domain logic
├── docs/
│   ├── schema/
│   │   ├── campaign.md      # Campaign data structure
│   │   └── donation.md      # Donation data structure
│   └── architecture/
│       └── services.md      # This document
└── [existing files...]
```

### Future Structure (Phase 3+)
```
/
├── src/                     # Source code organization
│   ├── domain/             # Pure business logic
│   │   ├── status-utils.js
│   │   ├── campaign-service.js
│   │   └── donation-service.js
│   ├── adapters/           # External system integration
│   │   ├── firestore-adapter.js
│   │   └── storage-adapter.js
│   ├── repositories/       # Data access patterns
│   │   ├── campaign-repository.js
│   │   └── donation-repository.js
│   └── services/           # Application services
│       ├── notification-service.js
│       └── analytics-service.js
├── docs/
└── [pages and existing files...]
```

## Integration Patterns

### Current Page Integration

Pages currently import and use services directly:

```javascript
// In gerenciar-campanhas.html
import { computeCampaignStatus, getCampaignProgress } from './status-utils.js';
import { sortCampaigns, mergeComputedStatus } from './campaign-service.js';

// Use in rendering logic
const enrichedCampaign = mergeComputedStatus(campaign);
const sortedCampaigns = sortCampaigns(campaignList);
```

### Future Repository Pattern

```javascript
// Future pattern with repository
import { CampaignRepository } from './src/repositories/campaign-repository.js';

const campaignRepo = new CampaignRepository();
const campaigns = await campaignRepo.findByStatus('active');
```

## Testing Strategy

### Current (Manual Testing)
- Verify status computation via browser console
- Test with different campaign states
- Validate no regression in existing functionality

### Future (Automated Testing)
- Unit tests for pure domain functions
- Integration tests for repositories
- End-to-end tests for critical user flows

## Migration Guidelines

### For New Features
1. Use existing services when applicable
2. Add new pure functions to appropriate service files
3. Follow established patterns and conventions
4. Document with JSDoc comments

### For Existing Code Refactoring
1. Identify duplicate logic patterns
2. Extract to appropriate service layer
3. Maintain backward compatibility during transition
4. Add TODO comments for future migration

### Breaking Change Policy
- No breaking changes in Phase 1
- Deprecation warnings for Phase 2+ changes
- Clear migration guides for major refactors

## Performance Considerations

### Current Optimizations
- Pure functions enable memoization opportunities
- No unnecessary Firebase calls in status computation
- Efficient sorting algorithms

### Future Optimizations
- Result caching in repository layer
- Batch operations for multiple campaigns
- Lazy loading and pagination support

## Benefits of This Architecture

### Maintainability
- Clear separation of concerns
- Predictable function behavior
- Easier debugging and testing

### Reusability
- Pure functions work across different contexts
- No coupling to specific UI frameworks
- Composable function design

### Scalability
- Services can be independently optimized
- Easy to add new domains (users, entities, etc.)
- Infrastructure changes don't affect business logic

### Team Development
- Clear contracts between layers
- Parallel development of different concerns
- Reduced merge conflicts

## Related Documentation

- [Campaign Schema](../schema/campaign.md)
- [Donation Schema](../schema/donation.md)
- [Module Architecture](./modules.md)
- [Status Utilities API](../../status-utils.js)
- [Campaign Service API](../../campaign-service.js)