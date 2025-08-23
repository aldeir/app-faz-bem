/* =============================================================================
   UI COMPONENTS
   Reusable JavaScript helpers for the design system
   ============================================================================= */

/**
 * Event delegation utility
 * @param {Element} container - Container element to delegate from
 * @param {string} selector - CSS selector for target elements
 * @param {string} event - Event type (e.g., 'click')
 * @param {Function} handler - Event handler function
 * @returns {Function} Cleanup function to remove the listener
 */
export function delegate(container, selector, event, handler) {
  function delegateHandler(e) {
    const target = e.target.closest(selector);
    if (target && container.contains(target)) {
      handler.call(target, e);
    }
  }
  
  container.addEventListener(event, delegateHandler);
  
  // Return cleanup function
  return () => container.removeEventListener(event, delegateHandler);
}

/**
 * Show toast notification
 * @param {string} message - Toast message
 * @param {Object} options - Toast options
 * @param {string} options.type - Toast type: 'success', 'error', 'warning', 'info'
 * @param {number} options.duration - Duration in milliseconds (default: 4000)
 * @param {boolean} options.dismissible - Whether toast can be dismissed (default: true)
 */
export function showToast(message, options = {}) {
  const {
    type = 'info',
    duration = 4000,
    dismissible = true
  } = options;
  
  // Ensure toast container exists
  let container = document.getElementById('toast-container');
  if (!container) {
    container = document.createElement('div');
    container.id = 'toast-container';
    container.className = 'toast-container';
    document.body.appendChild(container);
  }
  
  // Create toast element
  const toast = document.createElement('div');
  toast.className = `toast ${type}`;
  toast.setAttribute('role', 'alert');
  toast.setAttribute('aria-live', 'polite');
  
  // Add content
  const content = document.createElement('div');
  content.textContent = message;
  content.style.flex = '1';
  toast.appendChild(content);
  
  // Add dismiss button if dismissible
  if (dismissible) {
    const dismissBtn = document.createElement('button');
    dismissBtn.innerHTML = '×';
    dismissBtn.setAttribute('aria-label', 'Fechar notificação');
    dismissBtn.style.cssText = `
      background: none;
      border: none;
      color: inherit;
      font-size: 1.25rem;
      cursor: pointer;
      padding: 0;
      width: 1.5rem;
      height: 1.5rem;
      display: flex;
      align-items: center;
      justify-content: center;
      opacity: 0.7;
    `;
    dismissBtn.addEventListener('click', () => removeToast(toast));
    toast.appendChild(dismissBtn);
  }
  
  // Add to container
  container.appendChild(toast);
  
  // Auto-remove after duration
  const timeoutId = setTimeout(() => removeToast(toast), duration);
  
  // Store timeout ID on toast for potential cancellation
  toast._timeoutId = timeoutId;
  
  return toast;
}

/**
 * Remove toast with animation
 * @param {Element} toast - Toast element to remove
 */
function removeToast(toast) {
  if (toast._timeoutId) {
    clearTimeout(toast._timeoutId);
  }
  
  toast.style.cssText = `
    opacity: 0;
    transform: translate(-50%, -8px);
    transition: opacity 250ms ease, transform 250ms ease;
  `;
  
  setTimeout(() => {
    if (toast.parentNode) {
      toast.parentNode.removeChild(toast);
    }
  }, 250);
}

/**
 * Basic modal utility (fallback for complex modals)
 * @param {Object} options - Modal options
 * @param {string} options.title - Modal title
 * @param {string} options.content - Modal content (HTML string)
 * @param {Array} options.buttons - Array of button configs
 * @param {boolean} options.dismissible - Whether modal can be dismissed by clicking backdrop
 * @returns {Promise} Promise that resolves with button result
 */
export function basicModal(options = {}) {
  const {
    title = '',
    content = '',
    buttons = [{ text: 'OK', value: 'ok', primary: true }],
    dismissible = true
  } = options;
  
  return new Promise((resolve) => {
    // Create modal backdrop
    const backdrop = document.createElement('div');
    backdrop.style.cssText = `
      position: fixed;
      inset: 0;
      background-color: rgba(0, 0, 0, 0.5);
      z-index: var(--z-modal-backdrop, 40);
      display: flex;
      align-items: center;
      justify-content: center;
      padding: 1rem;
    `;
    
    // Create modal content
    const modal = document.createElement('div');
    modal.style.cssText = `
      background-color: var(--color-surface, white);
      border-radius: var(--radius-lg, 0.5rem);
      box-shadow: var(--shadow-xl);
      max-width: 400px;
      width: 100%;
      max-height: 90vh;
      overflow-y: auto;
      z-index: var(--z-modal, 50);
    `;
    
    // Modal header
    let headerHTML = '';
    if (title) {
      headerHTML = `
        <div style="padding: 1.5rem 1.5rem 0; border-bottom: 1px solid var(--color-border, #e5e7eb);">
          <h3 style="margin: 0; font-size: 1.125rem; font-weight: 600; color: var(--color-text-primary);">${title}</h3>
        </div>
      `;
    }
    
    // Modal body
    const bodyHTML = content ? `
      <div style="padding: 1.5rem;">
        ${content}
      </div>
    ` : '';
    
    // Modal buttons
    const buttonsHTML = buttons.length > 0 ? `
      <div style="padding: 0 1.5rem 1.5rem; display: flex; gap: 0.75rem; justify-content: flex-end;">
        ${buttons.map(btn => `
          <button data-value="${btn.value}" style="
            padding: 0.5rem 1rem;
            border: 1px solid ${btn.primary ? 'var(--color-primary-600, #059669)' : 'var(--color-border, #d1d5db)'};
            background-color: ${btn.primary ? 'var(--color-primary-600, #059669)' : 'transparent'};
            color: ${btn.primary ? 'white' : 'var(--color-text-primary, #374151)'};
            border-radius: var(--radius-md, 0.375rem);
            font-size: 0.875rem;
            font-weight: 500;
            cursor: pointer;
            transition: all 150ms ease;
          ">${btn.text}</button>
        `).join('')}
      </div>
    ` : '';
    
    modal.innerHTML = headerHTML + bodyHTML + buttonsHTML;
    
    // Handle button clicks
    modal.addEventListener('click', (e) => {
      const button = e.target.closest('[data-value]');
      if (button) {
        const value = button.getAttribute('data-value');
        cleanup();
        resolve(value);
      }
    });
    
    // Handle backdrop clicks
    if (dismissible) {
      backdrop.addEventListener('click', (e) => {
        if (e.target === backdrop) {
          cleanup();
          resolve(null);
        }
      });
    }
    
    // Cleanup function
    function cleanup() {
      document.body.removeChild(backdrop);
      document.body.style.overflow = '';
    }
    
    // Add to DOM
    backdrop.appendChild(modal);
    document.body.appendChild(backdrop);
    document.body.style.overflow = 'hidden';
    
    // Focus first button
    const firstButton = modal.querySelector('button');
    if (firstButton) {
      firstButton.focus();
    }
  });
}

/**
 * Lazy image loading utility
 * @param {string} selector - CSS selector for images to lazy load
 * @param {Object} options - Intersection observer options
 */
export function lazyImages(selector = 'img[data-src]', options = {}) {
  const defaultOptions = {
    rootMargin: '50px 0px',
    threshold: 0.1,
    ...options
  };
  
  const imageObserver = new IntersectionObserver((entries, observer) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        const img = entry.target;
        const src = img.getAttribute('data-src');
        
        if (src) {
          img.src = src;
          img.removeAttribute('data-src');
          img.classList.remove('lazy');
          img.classList.add('lazy-loaded');
        }
        
        observer.unobserve(img);
      }
    });
  }, defaultOptions);
  
  const images = document.querySelectorAll(selector);
  images.forEach(img => {
    img.classList.add('lazy');
    imageObserver.observe(img);
  });
  
  return imageObserver;
}

/**
 * Skeleton loading placeholder utility
 * @param {Element} element - Element to convert to skeleton
 * @param {Object} options - Skeleton options
 * @param {boolean} options.animate - Whether to animate skeleton (default: true)
 * @param {string} options.className - Additional CSS class for skeleton
 */
export function skeleton(element, options = {}) {
  const { animate = true, className = '' } = options;
  
  if (!element) return;
  
  // Store original content
  element._originalHTML = element.innerHTML;
  element._originalClasses = element.className;
  
  // Apply skeleton styles
  const skeletonClass = `skeleton ${className}`.trim();
  element.className = `${element.className} ${skeletonClass}`.trim();
  
  if (!animate) {
    element.style.setProperty('--skeleton-animation', 'none');
  }
  
  // Clear content
  element.innerHTML = '';
  
  // Return function to restore original content
  return () => {
    if (element._originalHTML !== undefined) {
      element.innerHTML = element._originalHTML;
      element.className = element._originalClasses;
      element.style.removeProperty('--skeleton-animation');
      delete element._originalHTML;
      delete element._originalClasses;
    }
  };
}

/**
 * ARIA live region utility for announcements
 * @param {string} message - Message to announce
 * @param {Object} options - Announcement options
 * @param {string} options.priority - 'polite' or 'assertive' (default: 'polite')
 * @param {boolean} options.clear - Clear previous announcements (default: true)
 */
export function announce(message, options = {}) {
  const { priority = 'polite', clear = true } = options;
  
  // Find or create live region
  let liveRegion = document.getElementById('ui-live-region');
  if (!liveRegion) {
    liveRegion = document.createElement('div');
    liveRegion.id = 'ui-live-region';
    liveRegion.setAttribute('aria-live', priority);
    liveRegion.className = 'sr-only';
    document.body.appendChild(liveRegion);
  }
  
  // Update live region
  if (clear) {
    liveRegion.innerHTML = '';
  }
  
  // Add message
  const messageEl = document.createElement('div');
  messageEl.textContent = message;
  liveRegion.appendChild(messageEl);
  
  // Clear message after delay to allow re-announcement of same message
  setTimeout(() => {
    if (messageEl.parentNode) {
      messageEl.parentNode.removeChild(messageEl);
    }
  }, 1000);
}

/**
 * Initialize all UI components
 * Call this function when the DOM is ready
 */
export function initUIComponents() {
  // Initialize lazy images if any exist
  if (document.querySelector('img[data-src]')) {
    lazyImages();
  }
  
  // Set up global keyboard navigation enhancements
  document.addEventListener('keydown', (e) => {
    // Escape key to close modals/dropdowns
    if (e.key === 'Escape') {
      // Close any open dropdowns
      document.querySelectorAll('[aria-expanded="true"]').forEach(el => {
        el.setAttribute('aria-expanded', 'false');
      });
      
      // Announce if something was closed
      const openElements = document.querySelectorAll('.dropdown-open, .modal-open');
      if (openElements.length > 0) {
        announce('Menu fechado');
      }
    }
  });
  
  // Enhance focus management
  document.addEventListener('focusin', (e) => {
    // Add focus class to focused element's container if needed
    const focusContainer = e.target.closest('[data-focus-container]');
    if (focusContainer) {
      focusContainer.classList.add('has-focus');
    }
  });
  
  document.addEventListener('focusout', (e) => {
    // Remove focus class from container
    const focusContainer = e.target.closest('[data-focus-container]');
    if (focusContainer) {
      focusContainer.classList.remove('has-focus');
    }
  });
  
  console.log('UI Components initialized');
}