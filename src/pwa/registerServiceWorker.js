/**
 * Service Worker Registration Helper
 * Encapsulates service worker registration logic with update detection
 * 
 * @version 1.0.0
 * @author App Faz Bem Team
 */

/**
 * Service worker registration options
 * @typedef {Object} RegisterOptions
 * @property {string} [scope] - Service worker scope
 * @property {function} [onUpdateFound] - Callback when update is found
 * @property {function} [onUpdateReady] - Callback when update is ready
 * @property {function} [onRegistered] - Callback when initially registered
 * @property {function} [onError] - Callback on registration error
 */

/**
 * Register service worker with enhanced update detection
 * @param {string} swUrl - Service worker URL
 * @param {RegisterOptions} [options] - Registration options
 * @returns {Promise<ServiceWorkerRegistration|null>}
 */
export async function registerServiceWorker(swUrl = './service-worker.js', options = {}) {
  if (!('serviceWorker' in navigator)) {
    console.warn('Service workers not supported');
    return null;
  }

  const {
    scope,
    onUpdateFound,
    onUpdateReady,
    onRegistered,
    onError
  } = options;

  try {
    const registration = await navigator.serviceWorker.register(swUrl, { scope });
    
    console.log('ServiceWorker registration successful with scope:', registration.scope);
    
    // Handle initial registration
    if (onRegistered) {
      onRegistered(registration);
    }

    // Listen for updates
    registration.addEventListener('updatefound', () => {
      console.log('Service worker update found');
      
      if (onUpdateFound) {
        onUpdateFound(registration);
      }

      const newWorker = registration.installing;
      if (newWorker) {
        newWorker.addEventListener('statechange', () => {
          console.log('Service worker state changed:', newWorker.state);
          
          if (newWorker.state === 'installed' && navigator.serviceWorker.controller) {
            // New service worker available
            console.log('New service worker ready');
            
            if (onUpdateReady) {
              onUpdateReady(registration, newWorker);
            }
            
            // Broadcast custom event for app to handle
            const event = new CustomEvent('sw-update-available', {
              detail: { registration, newWorker }
            });
            window.dispatchEvent(event);
          }
        });
      }
    });

    // Listen for service worker messages
    navigator.serviceWorker.addEventListener('message', (event) => {
      console.log('Message from service worker:', event.data);
      
      if (event.data && event.data.type === 'sw:update-ready') {
        const updateEvent = new CustomEvent('sw-update-ready', {
          detail: event.data
        });
        window.dispatchEvent(updateEvent);
      }
    });

    return registration;
    
  } catch (error) {
    console.error('ServiceWorker registration failed:', error);
    
    if (onError) {
      onError(error);
    }
    
    return null;
  }
}

/**
 * Skip waiting and activate new service worker
 * @param {ServiceWorkerRegistration} registration - Service worker registration
 */
export function skipWaiting(registration) {
  if (registration && registration.waiting) {
    registration.waiting.postMessage({ type: 'SKIP_WAITING' });
  }
}

/**
 * Default registration with basic logging
 * Maintains compatibility with existing direct registration calls
 */
export function register() {
  return registerServiceWorker('./service-worker.js', {
    onRegistered: (registration) => {
      console.log('SW registered:', registration.scope);
    },
    onUpdateReady: (registration) => {
      console.log('SW update ready:', registration.scope);
    },
    onError: (error) => {
      console.log('SW registration error:', error);
    }
  });
}

// Auto-register if loaded directly (not as module)
if (typeof window !== 'undefined' && !window.module) {
  window.addEventListener('load', register);
}