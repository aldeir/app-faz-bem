# PWA Documentation

## Overview

App Faz Bem implements a Progressive Web App (PWA) architecture with advanced offline capabilities, intelligent caching strategies, and seamless update management.

## Manifest Configuration

The `manifest.json` file defines the PWA characteristics:

- **Name**: "App Faz Bem"
- **Short Name**: "Faz Bem"
- **Start URL**: `/index.html?src=pwa`
- **Display**: `standalone` (app-like experience)
- **Theme Color**: `#22c55e` (green)
- **Background Color**: `#ffffff` (white)
- **Scope**: `/` (entire app)
- **Orientation**: `portrait-primary`
- **Categories**: `["charity", "productivity", "social", "utilities"]`

### Icons

- **192x192px**: Standard Android icon (`icon-192.png`)
- **512x512px**: High-resolution icon (`icon-512.png`)
- **512x512px Maskable**: Adaptive icon for Android (`icon-maskable-512.png`)

### Shortcuts

- **Criar Campanha**: Direct access to campaign creation
- **Minhas Entregas**: Quick access to delivery management

## Service Worker

The service worker (`service-worker.js`) implements multiple caching strategies:

### Cache Names

- `app-pages-{VERSION}`: HTML pages and navigation
- `app-assets-{VERSION}`: CSS, JavaScript, and static assets
- `app-images-{VERSION}`: Image files with size limits

### Caching Strategies

#### 1. HTML Navigation (Network-First)
- **Strategy**: Network-first with offline fallback
- **Fallback**: `offline.html` → cached `index.html`
- **Features**: Navigation preload support
- **Use Case**: Ensures fresh content when online, graceful offline experience

#### 2. Static Assets (Stale-While-Revalidate)
- **Files**: CSS, JavaScript
- **Strategy**: Serve from cache immediately, update in background
- **Use Case**: Fast loading with automatic updates

#### 3. Images (Cache-First with Limits)
- **Strategy**: Cache-first with background revalidation
- **Limit**: Maximum 50 images in cache
- **Cleanup**: LRU (Least Recently Used) eviction
- **Use Case**: Fast image loading with storage management

#### 4. API Calls (Network-First with Timeout)
- **Endpoints**: `/api/*`, `firestore.googleapis.com`
- **Timeout**: 6 seconds
- **Fallback**: Cached response if available
- **Use Case**: Real-time data with offline resilience

### Offline Features

#### Donation Queue
- **Storage**: IndexedDB
- **Sync**: Background Sync with `donation-sync` tag
- **Retry Logic**: Exponential backoff (max 3 attempts)
- **Reliability**: Items removed only after successful POST

#### Offline Fallback
- **Page**: `offline.html`
- **Features**: Accessible design, retry button, status indicators
- **UX**: Clear messaging about offline state

## Update Management

### Service Worker Updates

#### Manual Update Check
```javascript
// Force service worker update
if ('serviceWorker' in navigator) {
  const registration = await navigator.serviceWorker.getRegistration();
  if (registration) {
    await registration.update();
  }
}
```

#### Skip Waiting (Immediate Activation)
```javascript
// Post message to service worker
navigator.serviceWorker.controller.postMessage({
  type: 'SKIP_WAITING'
});
```

#### Update Detection
The app listens for update events:
```javascript
window.addEventListener('sw-update-available', (event) => {
  // Show update notification to user
  console.log('New version available', event.detail);
});
```

### Cache Version Management

To force cache updates:

1. **Update VERSION constant** in `service-worker.js`:
   ```javascript
   const VERSION = 'v0.5.0'; // Increment version
   ```

2. **Update BUILD_TS** for diagnostics:
   ```javascript
   const BUILD_TS = Date.now(); // Automatic timestamp
   ```

3. **Deploy changes** - new version will be detected automatically

### Update Flow

1. **Detection**: Service worker detects new version
2. **Download**: New service worker downloads in background
3. **Notification**: User receives update notification
4. **Activation**: User can choose to update immediately or on next visit
5. **Cleanup**: Old caches are automatically removed

## Testing & Verification

### Lighthouse PWA Audit

Required criteria:
- ✅ Manifest linked and valid
- ✅ Service worker controlling start_url
- ✅ Offline response available
- ✅ Icons properly configured

### Manual Testing

#### Offline Mode Testing
1. Open Developer Tools → Network tab
2. Check "Offline" checkbox
3. Reload page → should show `offline.html`
4. Navigate → should work with cached content

#### Update Flow Testing
1. Change `VERSION` in service worker
2. Reload page
3. Check console for "Service worker update found"
4. Verify update notification appears

#### Cache Verification
```javascript
// Check cache contents
caches.keys().then(console.log);
caches.open('app-pages-v0.4.0').then(cache => 
  cache.keys().then(console.log)
);
```

## Adding New Assets

### Static Assets (CSS/JS)
1. Add file path to `PRECACHE` array in service worker
2. Increment `VERSION` constant
3. Deploy changes

### New Pages
- Automatically cached via navigation strategy
- No configuration required

### API Endpoints
- Automatically handled by API strategy
- Add specific patterns to fetch handler if needed

### Images
- Automatically cached on first request
- Subject to 50-item limit with LRU eviction

## Browser Compatibility

### Service Worker Support
- **Chrome**: 45+ ✅
- **Firefox**: 44+ ✅
- **Safari**: 11.1+ ✅
- **Edge**: 17+ ✅

### Fallback Strategy
- Feature detection prevents errors in unsupported browsers
- Graceful degradation maintains core functionality

## Performance Considerations

### Cache Storage Limits
- **Quota**: ~10% of available disk space
- **Monitoring**: Automatic cleanup on quota exceeded
- **Strategy**: Prioritize essential assets

### Network Timeouts
- **API calls**: 6-second timeout
- **Images**: No timeout (cache-first)
- **Navigation**: 30-second default

### Memory Management
- **Image cache**: 50-item limit
- **Regular cleanup**: Expired cache removal
- **Background updates**: Non-blocking revalidation

## Troubleshooting

### Common Issues

#### Service Worker Not Updating
- Check browser cache settings
- Verify VERSION constant was incremented
- Test in incognito mode

#### Offline Page Not Showing
- Verify `offline.html` in PRECACHE array
- Check network strategy implementation
- Test offline detection

#### Assets Not Caching
- Check file paths in PRECACHE
- Verify cache names match VERSION
- Monitor storage quota

### Debug Tools

#### Console Commands
```javascript
// Service worker status
navigator.serviceWorker.getRegistrations()

// Cache inspection
caches.keys()

// Force update
navigator.serviceWorker.controller.postMessage({type: 'SKIP_WAITING'})
```

#### Chrome DevTools
- **Application** → Service Workers
- **Application** → Storage → Cache Storage
- **Network** → Offline checkbox

## Security Considerations

- Service worker scope limited to `/`
- HTTPS required for service worker registration
- Cache isolation between different origins
- No sensitive data in client-side caches