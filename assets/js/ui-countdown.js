/* =============================================================================
   UI COUNTDOWN
   Unified countdown badge system with semantic states and accessibility
   ============================================================================= */

(function() {
  'use strict';

  // Active countdown intervals tracking
  const countdownIntervals = new Map();

  // Countdown state thresholds (in milliseconds)
  const THRESHOLDS = {
    NORMAL: 72 * 60 * 60 * 1000,     // >= 72h
    APPROACHING: 24 * 60 * 60 * 1000, // 24-72h
    WARN: 6 * 60 * 60 * 1000,        // 6-24h
    DANGER: 1 * 60 * 60 * 1000,      // 1-6h
    CRITICAL: 0                       // < 1h
  };

  // State configuration
  const STATE_CONFIG = {
    normal: {
      label: 'Normal',
      updateInterval: 60000, // 1 minute
      copy: {
        prefix: 'Encerra em: ',
        suffix: ''
      }
    },
    approaching: {
      label: 'Approaching',
      updateInterval: 60000, // 1 minute
      copy: {
        prefix: 'Encerra em: ',
        suffix: ''
      }
    },
    warn: {
      label: 'Warning',
      updateInterval: 60000, // 1 minute
      copy: {
        prefix: 'Encerra em: ',
        suffix: ''
      }
    },
    danger: {
      label: 'Danger',
      updateInterval: 30000, // 30 seconds
      copy: {
        prefix: 'Encerra em: ',
        suffix: ''
      }
    },
    critical: {
      label: 'Critical',
      updateInterval: 10000, // 10 seconds
      copy: {
        prefix: 'URGENTE: ',
        suffix: ''
      }
    },
    ended: {
      label: 'Ended',
      updateInterval: null,
      copy: {
        prefix: '',
        suffix: ''
      }
    }
  };

  /**
   * Parse deadline from various formats
   * @param {string|Date|number} deadline - ISO string, Date object, or timestamp
   * @returns {Date|null} Parsed date or null if invalid
   */
  function parseDeadline(deadline) {
    if (!deadline) return null;
    
    try {
      if (deadline instanceof Date) {
        return isNaN(deadline.getTime()) ? null : deadline;
      }
      
      if (typeof deadline === 'number') {
        return new Date(deadline);
      }
      
      if (typeof deadline === 'string') {
        // Try ISO format first, then generic parsing
        const parsed = new Date(deadline);
        return isNaN(parsed.getTime()) ? null : parsed;
      }
      
      return null;
    } catch (error) {
      console.warn('[Countdown] Failed to parse deadline:', deadline, error);
      return null;
    }
  }

  /**
   * Classify countdown state based on remaining time
   * @param {number} remainingMs - Remaining time in milliseconds
   * @returns {string} State name
   */
  function classifyState(remainingMs) {
    if (remainingMs <= 0) return 'ended';
    if (remainingMs < THRESHOLDS.DANGER) return 'critical';
    if (remainingMs < THRESHOLDS.WARN) return 'danger';
    if (remainingMs < THRESHOLDS.APPROACHING) return 'warn';
    if (remainingMs < THRESHOLDS.NORMAL) return 'approaching';
    return 'normal';
  }

  /**
   * Format time remaining for display
   * @param {number} remainingMs - Remaining time in milliseconds
   * @param {boolean} useSeconds - Whether to include seconds precision
   * @returns {string} Formatted time string
   */
  function formatTime(remainingMs, useSeconds = false) {
    if (remainingMs <= 0) return 'Encerrada';

    const totalSeconds = Math.floor(remainingMs / 1000);
    const days = Math.floor(totalSeconds / (24 * 60 * 60));
    const hours = Math.floor((totalSeconds % (24 * 60 * 60)) / (60 * 60));
    const minutes = Math.floor((totalSeconds % (60 * 60)) / 60);
    const seconds = totalSeconds % 60;

    // Format with seconds precision (for detalhes.html)
    if (useSeconds) {
      return `${String(days).padStart(2, '0')}d ${String(hours).padStart(2, '0')}h ${String(minutes).padStart(2, '0')}m ${String(seconds).padStart(2, '0')}s`;
    }

    // Format with minute precision (default)
    if (days > 0) {
      return `${days}d ${hours}h`;
    }
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  }

  /**
   * Update countdown badge state and content
   * @param {HTMLElement} element - Countdown badge element
   * @param {Date} deadline - Campaign deadline
   * @param {Object} options - Configuration options
   */
  function updateCountdownBadge(element, deadline, options = {}) {
    const now = new Date();
    const remainingMs = deadline.getTime() - now.getTime();
    const state = classifyState(remainingMs);
    const config = STATE_CONFIG[state];
    const useSeconds = options.precision === 'seconds';

    // Update data state attribute
    element.setAttribute('data-state', state);

    // Format time and copy
    const timeText = formatTime(remainingMs, useSeconds);
    const displayText = state === 'ended' ? 'Encerrada' : `${config.copy.prefix}${timeText}${config.copy.suffix}`;

    // Update text content
    element.textContent = displayText;

    // Update accessibility
    const ariaLabel = state === 'ended' 
      ? 'Campanha encerrada'
      : `Campanha ${config.label.toLowerCase()}, ${timeText.replace(/(\d+)([dhm])/g, '$1 $2')} restantes`;
    element.setAttribute('aria-label', ariaLabel);

    // Handle ended state
    if (state === 'ended') {
      const countdownId = element.getAttribute('data-countdown-id');
      if (countdownId && countdownIntervals.has(countdownId)) {
        clearInterval(countdownIntervals.get(countdownId));
        countdownIntervals.delete(countdownId);
      }

      // Trigger ended event for external handling (e.g., disable buttons)
      element.dispatchEvent(new CustomEvent('countdown:ended', {
        bubbles: true,
        detail: { element, deadline }
      }));
    }

    return state;
  }

  /**
   * Start countdown for a single element
   * @param {HTMLElement} element - Countdown badge element
   * @param {Object} options - Configuration options
   */
  function startCountdown(element, options = {}) {
    const deadlineAttr = element.getAttribute('data-deadline');
    const deadline = parseDeadline(deadlineAttr);

    if (!deadline) {
      console.warn('[Countdown] Invalid deadline for element:', element, deadlineAttr);
      return;
    }

    // Generate unique ID if not present
    let countdownId = element.getAttribute('data-countdown-id');
    if (!countdownId) {
      countdownId = `countdown-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
      element.setAttribute('data-countdown-id', countdownId);
    }

    // Clear existing interval
    if (countdownIntervals.has(countdownId)) {
      clearInterval(countdownIntervals.get(countdownId));
    }

    // Parse options from data attributes
    const precision = element.getAttribute('data-precision') || options.precision || 'minutes';
    const updateOptions = { precision };

    // Initial update
    const initialState = updateCountdownBadge(element, deadline, updateOptions);

    // Don't set interval for ended campaigns
    if (initialState === 'ended') return;

    // Determine update interval based on state
    const config = STATE_CONFIG[initialState];
    const interval = config.updateInterval;

    if (interval) {
      const intervalId = setInterval(() => {
        const currentState = updateCountdownBadge(element, deadline, updateOptions);
        
        // If state changed, restart with new interval
        if (currentState !== initialState) {
          clearInterval(intervalId);
          countdownIntervals.delete(countdownId);
          startCountdown(element, options);
        }
      }, interval);

      countdownIntervals.set(countdownId, intervalId);
    }
  }

  /**
   * Initialize countdown badges on page
   * @param {string} selector - CSS selector for countdown elements
   * @param {Object} options - Global configuration options
   */
  function initCountdownBadges(selector = '.countdown-badge[data-deadline]', options = {}) {
    const elements = document.querySelectorAll(selector);
    
    elements.forEach(element => {
      startCountdown(element, options);
    });

    // Listen for countdown ended events to handle global actions
    document.addEventListener('countdown:ended', function(event) {
      const { element } = event.detail;
      
      // Find and disable related buttons
      const campaignId = element.getAttribute('data-campaign-id');
      if (campaignId) {
        const relatedButtons = document.querySelectorAll(`[data-campaign-id="${campaignId}"] button, button[data-campaign-id="${campaignId}"]`);
        relatedButtons.forEach(button => {
          button.disabled = true;
          if (button.textContent && !button.textContent.includes('Encerrada')) {
            button.textContent = 'Campanha Encerrada';
          }
        });
      }
    });

    return {
      elements: elements.length,
      message: `Initialized ${elements.length} countdown badge(s)`
    };
  }

  /**
   * Clean up countdown intervals
   * @param {string} countdownId - Specific countdown ID to clean up, or null for all
   */
  function cleanup(countdownId = null) {
    if (countdownId && countdownIntervals.has(countdownId)) {
      clearInterval(countdownIntervals.get(countdownId));
      countdownIntervals.delete(countdownId);
    } else if (!countdownId) {
      // Clean up all intervals
      countdownIntervals.forEach((intervalId) => {
        clearInterval(intervalId);
      });
      countdownIntervals.clear();
    }
  }

  // Expose API to global scope
  window.initCountdownBadges = initCountdownBadges;
  window.countdownUtils = {
    parseDeadline,
    classifyState,
    formatTime,
    cleanup,
    startCountdown
  };

  // Auto-initialize on DOM content loaded
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
      initCountdownBadges();
    });
  } else {
    // DOM already loaded
    initCountdownBadges();
  }

})();