# Estratégia de Testes

Estratégia progressive de implementação de testes para o App Faz Bem.

## Visão Geral

O App Faz Bem adotará uma abordagem **progressive** de testes, começando com testes unitários simples e evoluindo para cobertura completa de E2E.

## Fases de Implementação

### 📚 Phase 1: Unit Tests (Foundational)
**Timeline**: Próximos 2-3 meses  
**Coverage Target**: 40%  

#### Escopo
- **Utils functions**: Formatação, validação, transformações
- **Pure functions**: Lógica de negócio isolada
- **Configuration modules**: Parsing e validação de configs

#### Ferramentas
- **Test Runner**: Vitest (recomendado) ou Jest
- **Assertions**: Expect API built-in
- **Coverage**: c8 (built-in Vitest)

#### Estrutura
```
tests/
├── unit/
│   ├── utils/
│   │   ├── format.test.js
│   │   ├── validation.test.js
│   │   └── logger.test.js
│   ├── services/
│   │   ├── auth-service.test.js
│   │   └── profile-service.test.js
│   └── helpers/
│       └── test-utils.js
└── setup.js
```

#### Exemplo de Teste
```javascript
// tests/unit/utils/format.test.js
import { describe, it, expect } from 'vitest';
import { formatUtils } from '../../../assets/js/utils/format.js';

describe('formatUtils', () => {
  describe('currency', () => {
    it('formata valores monetários brasileiros', () => {
      expect(formatUtils.currency(1234.56))
        .toBe('R$ 1.234,56');
    });
    
    it('trata valores zerados', () => {
      expect(formatUtils.currency(0))
        .toBe('R$ 0,00');
    });
  });
});
```

### 🔗 Phase 2: Integration Tests (DOM + Services)
**Timeline**: 3-6 meses após Phase 1  
**Coverage Target**: 70%  

#### Escopo
- **DOM interactions**: Form submissions, modal interactions
- **Service integration**: Firebase mocks, API calls
- **User workflows**: Login, registration, donation flow

#### Ferramentas
- **Environment**: jsdom para manipulação DOM
- **Firebase Mocking**: Firebase Test SDK
- **Test Utilities**: @testing-library/dom

#### Estrutura
```
tests/
├── integration/
│   ├── components/
│   │   ├── modal.test.js
│   │   ├── countdown.test.js
│   │   └── toast.test.js
│   ├── services/
│   │   ├── firestore-integration.test.js
│   │   └── auth-flow.test.js
│   └── pages/
│       ├── login.test.js
│       └── registration.test.js
└── helpers/
    ├── firebase-mock.js
    └── dom-helpers.js
```

#### Exemplo de Teste
```javascript
// tests/integration/components/modal.test.js
import { describe, it, expect, beforeEach } from 'vitest';
import { screen } from '@testing-library/dom';
import { Modal } from '../../../assets/js/components/modal/modal.js';

describe('Modal Component', () => {
  beforeEach(() => {
    document.body.innerHTML = '<div id="app"></div>';
  });

  it('abre e fecha modal corretamente', async () => {
    const modal = new Modal({
      title: 'Test Modal',
      content: 'Test content'
    });
    
    modal.show();
    expect(screen.getByText('Test Modal')).toBeInTheDocument();
    
    modal.hide();
    expect(screen.queryByText('Test Modal')).not.toBeInTheDocument();
  });
});
```

### 🌐 Phase 3: End-to-End Tests (Complete Flows)
**Timeline**: 6-12 meses após Phase 1  
**Coverage Target**: 85%  

#### Escopo
- **Critical user journeys**: Complete donation flow
- **Authentication flows**: Login, registration, password reset
- **Admin workflows**: Campaign management, approvals
- **Cross-browser testing**: Chrome, Firefox, Safari

#### Ferramentas
- **E2E Framework**: Playwright (recomendado)
- **Browser Support**: Chromium, Firefox, WebKit
- **Visual Testing**: Screenshots regression

#### Estrutura
```
tests/
├── e2e/
│   ├── flows/
│   │   ├── donation-flow.spec.js
│   │   ├── registration-flow.spec.js
│   │   └── admin-flow.spec.js
│   ├── pages/
│   │   ├── login.page.js
│   │   ├── registration.page.js
│   │   └── donation.page.js
│   └── helpers/
│       ├── auth-helpers.js
│       └── test-data.js
└── playwright.config.js
```

#### Exemplo de Teste
```javascript
// tests/e2e/flows/donation-flow.spec.js
import { test, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page.js';
import { DonationPage } from '../pages/donation.page.js';

test.describe('Donation Flow', () => {
  test('doador pode completar doação end-to-end', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const donationPage = new DonationPage(page);
    
    // Login
    await loginPage.goto();
    await loginPage.login('doador@test.com', 'password123');
    
    // Navigate to donation
    await donationPage.goto();
    await donationPage.selectCampaign('Campanha Teste');
    await donationPage.addItem('Roupas', 'Camisetas usadas');
    await donationPage.submitDonation();
    
    // Verify success
    await expect(page.locator('.success-message'))
      .toContainText('Doação registrada com sucesso');
  });
});
```

## Ferramentas Recomendadas

### 🔧 Test Runners

#### Vitest (Recomendado)
```bash
npm install -D vitest @vitest/ui c8
```

**Vantagens**:
- ES modules nativo
- Setup mínimo
- Hot reload
- Interface visual
- Compatible com Jest API

#### Jest (Alternativa)
```bash
npm install -D jest @jest/environment-jsdom
```

**Vantagens**:
- Ecosistema maduro
- Snapshot testing
- Ampla documentação

### 🌐 E2E Testing

#### Playwright (Recomendado)
```bash
npm install -D @playwright/test
```

**Vantagens**:
- Multi-browser
- Auto-wait
- Screenshots/videos
- Parallel execution
- Network interception

#### Cypress (Alternativa)
```bash
npm install -D cypress
```

**Vantagens**:
- Developer experience
- Time travel debugging
- Visual testing

### 🔧 Testing Utilities

#### @testing-library/dom
```bash
npm install -D @testing-library/dom @testing-library/jest-dom
```

**Para**: Queries DOM semânticas, user-centric testing

#### Firebase Test SDK
```bash
npm install -D @firebase/rules-unit-testing
```

**Para**: Mocking Firestore, Authentication, Functions

## Cobertura de Testes

### Metas Progressivas

| Phase | Coverage | Focus | Timeline |
|-------|----------|-------|----------|
| Phase 1 | 40% | Utils + Core services | 2-3 meses |
| Phase 2 | 70% | Components + Integration | 3-6 meses |
| Phase 3 | 85% | E2E + Critical flows | 6-12 meses |

### Priorização

#### High Priority (40% coverage)
- ✅ Utils functions (format, validation)
- ✅ Authentication service
- ✅ Firestore paths
- ✅ Configuration parsing

#### Medium Priority (70% coverage)
- 🔶 Modal handler
- 🔶 Notification service
- 🔶 Form validation
- 🔶 Profile service

#### Lower Priority (85% coverage)
- 🔻 UI components edge cases
- 🔻 Error boundaries
- 🔻 Performance optimizations
- 🔻 Analytics tracking

## Configuração Inicial

### package.json
```json
{
  "scripts": {
    "test": "vitest",
    "test:ui": "vitest --ui",
    "test:coverage": "vitest --coverage",
    "test:e2e": "playwright test",
    "test:e2e:ui": "playwright test --ui"
  },
  "devDependencies": {
    "vitest": "^1.0.0",
    "@vitest/ui": "^1.0.0",
    "c8": "^8.0.0",
    "@playwright/test": "^1.40.0",
    "@testing-library/dom": "^9.3.0"
  }
}
```

### vitest.config.js
```javascript
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    environment: 'jsdom',
    coverage: {
      provider: 'c8',
      reporter: ['text', 'html', 'lcov'],
      exclude: [
        'node_modules/',
        'tests/',
        '*.config.js'
      ]
    }
  }
});
```

### playwright.config.js
```javascript
import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: './tests/e2e',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: process.env.CI ? 2 : 0,
  workers: process.env.CI ? 1 : undefined,
  reporter: 'html',
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },
    {
      name: 'firefox',
      use: { ...devices['Desktop Firefox'] },
    },
    {
      name: 'webkit',
      use: { ...devices['Desktop Safari'] },
    },
  ],
});
```

## Boas Práticas

### 📝 Writing Tests

1. **Arrange, Act, Assert pattern**
2. **Descriptive test names** em português
3. **Test isolation** - cada teste independente
4. **Mock external dependencies** (Firebase, APIs)
5. **Test user behavior**, não implementação

### 🏗️ Test Structure

```javascript
describe('Feature/Component Name', () => {
  describe('when condition', () => {
    it('should do something specific', () => {
      // Test implementation
    });
  });
});
```

### 🎯 What to Test

#### ✅ Test
- Business logic
- User interactions
- Error scenarios
- Edge cases
- Critical paths

#### ❌ Don't Test
- Third-party libraries
- Browser APIs
- Implementation details
- Trivial getters/setters

## Integração CI/CD

### GitHub Actions
```yaml
# .github/workflows/tests.yml
name: Tests
on: [push, pull_request]

jobs:
  unit:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run test:coverage
      
  e2e:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npx playwright install
      - run: npm run test:e2e
```

## Métricas e Monitoring

### Coverage Reports
- **Local**: `npm run test:coverage`
- **CI**: Upload para CodeCov/Coveralls
- **Target**: Manter coverage acima das metas por phase

### Performance Testing
- **Bundle size** impact
- **Test execution time**
- **CI pipeline duration**

## Links Relacionados

- [Arquitetura de Módulos](../architecture/modules.md)
- [Performance Strategy](../performance/strategy.md)
- [CONTRIBUTING](../../CONTRIBUTING.md)

---

**Status**: Planejamento  
**Próximo passo**: Setup inicial Phase 1  
**Responsável**: Equipe de Desenvolvimento