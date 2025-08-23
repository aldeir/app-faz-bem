# Estratégia de Performance

Estratégia abrangente de performance para o App Faz Bem, focando em Core Web Vitals e experiência do usuário.

## Metas de Performance

### 🎯 Core Web Vitals

| Métrica | Desktop | Mobile | Conexão |
|---------|---------|--------|---------|
| **LCP** (Largest Contentful Paint) | < 2.5s | < 2.5s | 4G simulado |
| **FID** (First Input Delay) | < 100ms | < 100ms | Todas |
| **CLS** (Cumulative Layout Shift) | < 0.1 | < 0.1 | Todas |
| **TTFB** (Time to First Byte) | < 800ms | < 1.2s | 4G simulado |

### 📊 Métricas Adicionais

| Métrica | Target | Contexto |
|---------|--------|----------|
| **FCP** (First Contentful Paint) | < 1.8s | Primeira impressão |
| **Speed Index** | < 3.0s | Progresso visual |
| **Total Blocking Time** | < 300ms | Main thread responsiveness |
| **FPS durante scroll** | ≥ 60 FPS | Smoothness |

## Estratégias de Otimização

### 🖼️ Images & Assets

#### Lazy Loading (Já Iniciado)
```javascript
// Implementação atual em desenvolvimento
const images = document.querySelectorAll('img[data-src]');
const imageObserver = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      const img = entry.target;
      img.src = img.dataset.src;
      img.removeAttribute('data-src');
      imageObserver.unobserve(img);
    }
  });
});
```

#### Formato Otimizado
- **WebP** para browsers compatíveis
- **AVIF** para browsers mais recentes
- **Fallback JPEG** para compatibilidade

```html
<picture>
  <source srcset="image.avif" type="image/avif">
  <source srcset="image.webp" type="image/webp">
  <img src="image.jpg" alt="Description" loading="lazy">
</picture>
```

#### Responsive Images
```html
<img 
  srcset="image-320w.webp 320w,
          image-640w.webp 640w,
          image-1024w.webp 1024w"
  sizes="(max-width: 320px) 280px,
         (max-width: 640px) 600px,
         1024px"
  src="image-640w.webp"
  alt="Description"
>
```

### 🔗 Prefetching & Preloading

#### Hover Prefetch
```javascript
// Prefetch on hover for instant navigation
document.addEventListener('mouseover', (e) => {
  if (e.target.matches('a[href]')) {
    const link = e.target.href;
    if (!prefetchedLinks.has(link)) {
      prefetchPage(link);
      prefetchedLinks.add(link);
    }
  }
});
```

#### Critical Resource Preload
```html
<!-- Preload critical fonts -->
<link rel="preload" href="/assets/fonts/inter-variable.woff2" as="font" type="font/woff2" crossorigin>

<!-- Preload hero image -->
<link rel="preload" href="/assets/images/hero.webp" as="image">

<!-- Preload critical CSS -->
<link rel="preload" href="/assets/styles/critical.css" as="style">
```

### ⚡ JavaScript Optimization

#### Bundle Splitting
```javascript
// Code splitting por rota
const loadPageModule = async (pageName) => {
  const module = await import(`./pages/${pageName}.js`);
  return module.default;
};

// Lazy loading de componentes não-críticos
const loadComponent = async (componentName) => {
  const { default: Component } = await import(`./components/${componentName}.js`);
  return Component;
};
```

#### Main Thread Management
```javascript
// Usar requestIdleCallback para tarefas não-críticas
const scheduleWork = (task) => {
  if ('requestIdleCallback' in window) {
    requestIdleCallback(task, { timeout: 5000 });
  } else {
    setTimeout(task, 0);
  }
};
```

### 🎨 CSS Optimization

#### Critical CSS Inline
- Extrair CSS crítico para inline no `<head>`
- Carregar CSS não-crítico de forma assíncrona

```html
<style>
  /* Critical CSS inline */
  .critical-styles { /* ... */ }
</style>

<link rel="preload" href="/style.css" as="style" onload="this.onload=null;this.rel='stylesheet'">
<noscript><link rel="stylesheet" href="/style.css"></noscript>
```

#### CSS Containment
```css
.component {
  contain: layout style paint;
}

.independent-section {
  contain: layout;
}
```

### 🔄 Differential Rendering (Planejado)

#### Virtual Scrolling
Para listas longas (ex: histórico de doações):

```javascript
class VirtualList {
  constructor(container, items, renderItem) {
    this.container = container;
    this.items = items;
    this.renderItem = renderItem;
    this.itemHeight = 60; // Fixed height for performance
    this.visibleCount = Math.ceil(container.clientHeight / this.itemHeight);
  }
  
  render(startIndex) {
    const endIndex = Math.min(startIndex + this.visibleCount, this.items.length);
    const visibleItems = this.items.slice(startIndex, endIndex);
    
    // Render only visible items
    this.container.innerHTML = visibleItems
      .map(this.renderItem)
      .join('');
  }
}
```

#### Smart Updates
```javascript
// Update apenas elementos que mudaram
const updateElement = (element, newData, oldData) => {
  if (newData.status !== oldData.status) {
    element.querySelector('.status').textContent = newData.status;
  }
  if (newData.amount !== oldData.amount) {
    element.querySelector('.amount').textContent = newData.amount;
  }
  // Update apenas o que mudou
};
```

### 🗄️ Caching Strategy

#### Service Worker Cache
```javascript
// network-first for HTML
const networkFirst = async (request) => {
  try {
    const response = await fetch(request);
    cache.put(request, response.clone());
    return response;
  } catch {
    return cache.match(request);
  }
};

// cache-first for assets
const cacheFirst = async (request) => {
  const cached = await cache.match(request);
  return cached || fetch(request);
};
```

#### Memory Cache
```javascript
class MemoryCache {
  constructor(maxSize = 100) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }
  
  set(key, value) {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      this.cache.delete(firstKey);
    }
    this.cache.set(key, value);
  }
  
  get(key) {
    const value = this.cache.get(key);
    if (value) {
      // Move to end (LRU)
      this.cache.delete(key);
      this.cache.set(key, value);
    }
    return value;
  }
}
```

## Minimização de Reflows

### Layout Optimization

#### Batch DOM Updates
```javascript
// ❌ Evitar múltiplos reflows
element1.style.width = '100px';  // reflow
element2.style.height = '200px'; // reflow
element3.style.margin = '10px';  // reflow

// ✅ Batch updates
const updates = [
  { element: element1, style: 'width', value: '100px' },
  { element: element2, style: 'height', value: '200px' },
  { element: element3, style: 'margin', value: '10px' }
];

requestAnimationFrame(() => {
  updates.forEach(update => {
    update.element.style[update.style] = update.value;
  });
});
```

#### Transform over Layout Properties
```css
/* ❌ Trigger layout */
.animate-move {
  transition: left 0.3s ease;
}

/* ✅ Use transform */
.animate-move {
  transition: transform 0.3s ease;
}
```

#### CSS Containment
```css
.card-component {
  contain: layout style;
}

.independent-widget {
  contain: layout style paint;
}
```

### Event Listener Optimization

#### Debounced Scroll
```javascript
let scrollTimeout;
const handleScroll = () => {
  clearTimeout(scrollTimeout);
  scrollTimeout = setTimeout(() => {
    // Actual scroll logic
    updateVisibleElements();
  }, 16); // ~60fps
};

window.addEventListener('scroll', handleScroll, { passive: true });
```

#### Remove Duplicate Listeners
```javascript
class EventManager {
  constructor() {
    this.listeners = new Map();
  }
  
  add(element, event, handler, options) {
    const key = `${element.id}-${event}`;
    if (this.listeners.has(key)) {
      this.remove(element, event);
    }
    element.addEventListener(event, handler, options);
    this.listeners.set(key, { element, event, handler, options });
  }
  
  remove(element, event) {
    const key = `${element.id}-${event}`;
    const listener = this.listeners.get(key);
    if (listener) {
      listener.element.removeEventListener(listener.event, listener.handler);
      this.listeners.delete(key);
    }
  }
}
```

## Métricas a Coletar

### 📊 Core Metrics

#### Web Vitals
```javascript
import { getCLS, getFID, getFCP, getLCP, getTTFB } from 'web-vitals';

const vitalsReporter = (metric) => {
  // Send to analytics
  analytics.track('web-vital', {
    name: metric.name,
    value: metric.value,
    id: metric.id,
    page: window.location.pathname
  });
};

getCLS(vitalsReporter);
getFID(vitalsReporter);
getFCP(vitalsReporter);
getLCP(vitalsReporter);
getTTFB(vitalsReporter);
```

#### Custom Metrics
```javascript
// Time to Interactive
const measureTTI = () => {
  return new Promise((resolve) => {
    const observer = new PerformanceObserver((list) => {
      const entries = list.getEntries();
      // Calculate TTI based on main thread idle
      resolve(calculateTTI(entries));
    });
    observer.observe({ entryTypes: ['longtask'] });
  });
};

// FPS Monitoring
let fps = 0;
let lastTime = performance.now();

const trackFPS = () => {
  requestAnimationFrame((currentTime) => {
    fps = 1000 / (currentTime - lastTime);
    lastTime = currentTime;
    
    if (fps < 50) {
      analytics.track('performance-warning', {
        metric: 'low-fps',
        value: fps,
        page: window.location.pathname
      });
    }
    
    trackFPS();
  });
};
```

### 🔍 Resource Monitoring
```javascript
// Bundle size tracking
const trackBundleSize = () => {
  const resources = performance.getEntriesByType('resource');
  const jsSize = resources
    .filter(r => r.name.includes('.js'))
    .reduce((total, r) => total + r.transferSize, 0);
    
  analytics.track('bundle-size', {
    jsSize: jsSize,
    page: window.location.pathname
  });
};

// Memory usage
const trackMemory = () => {
  if ('memory' in performance) {
    analytics.track('memory-usage', {
      used: performance.memory.usedJSHeapSize,
      total: performance.memory.totalJSHeapSize,
      limit: performance.memory.jsHeapSizeLimit
    });
  }
};
```

## Ferramentas de Monitoramento

### 🔧 Development
- **Lighthouse CI**: Automated audits
- **WebPageTest**: Real-world testing
- **Chrome DevTools**: Performance profiling
- **webpack-bundle-analyzer**: Bundle analysis

### 📈 Production
- **Google PageSpeed Insights**: Field data
- **Core Web Vitals report**: Search Console
- **Real User Monitoring (RUM)**: Custom implementation
- **Error tracking**: Sentry integration

## Lighthouse CI Integration

### GitHub Actions
```yaml
# .github/workflows/lighthouse.yml
name: Lighthouse CI
on: [push, pull_request]

jobs:
  lighthouse:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4
      - uses: actions/setup-node@v4
        with:
          node-version: '18'
      - run: npm ci
      - run: npm run build
      - name: Run Lighthouse CI
        run: |
          npm install -g @lhci/cli@0.12.x
          lhci autorun
        env:
          LHCI_GITHUB_APP_TOKEN: ${{ secrets.LHCI_GITHUB_APP_TOKEN }}
```

### Configuration
```json
{
  "ci": {
    "collect": {
      "url": [
        "http://localhost:3000/",
        "http://localhost:3000/login.html",
        "http://localhost:3000/registrar-doacao.html"
      ],
      "startServerCommand": "npm run serve"
    },
    "assert": {
      "assertions": {
        "categories:performance": ["warn", {"minScore": 0.85}],
        "categories:accessibility": ["error", {"minScore": 0.90}],
        "categories:best-practices": ["warn", {"minScore": 0.85}],
        "categories:seo": ["warn", {"minScore": 0.85}]
      }
    }
  }
}
```

## Performance Budget

### Resource Limits
| Resource | Target | Max |
|----------|--------|-----|
| **JavaScript** | 200KB | 300KB |
| **CSS** | 50KB | 100KB |
| **Images** | 500KB/page | 1MB/page |
| **Fonts** | 100KB | 200KB |
| **Total** | 1MB | 1.5MB |

### Timing Budget
| Metric | Target | Budget |
|--------|--------|--------|
| **First Paint** | 1.5s | 2s |
| **LCP** | 2.5s | 3s |
| **TTI** | 3.5s | 5s |
| **FID** | 100ms | 300ms |

## Roadmap de Implementação

### 🚀 Phase 1: Quick Wins (1-2 semanas)
- [ ] Implement image lazy loading
- [ ] Add critical CSS inline
- [ ] Configure Service Worker caching
- [ ] Set up Lighthouse CI

### 📈 Phase 2: Advanced Optimizations (1-2 meses)
- [ ] Implement differential rendering
- [ ] Add hover prefetching
- [ ] Optimize JavaScript bundles
- [ ] Add performance monitoring

### 🔮 Phase 3: Future Optimizations (3-6 meses)
- [ ] Virtual scrolling for long lists
- [ ] Advanced caching strategies
- [ ] Web Workers for heavy tasks
- [ ] Predictive prefetching

## Links Relacionados

- [Testing Strategy](../testing/strategy.md)
- [Design Tokens](../design-system/tokens.md)
- [Architecture](../architecture/modules.md)
- [CONTRIBUTING](../../CONTRIBUTING.md)

---

**Status**: Planejamento  
**Próximo passo**: Implementar Phase 1  
**Responsável**: Equipe de Frontend