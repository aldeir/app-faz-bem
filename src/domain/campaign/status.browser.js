/**
 * UMD Browser Build for Campaign Status Utilities
 * Exposes CampaignStatusUtils as a global variable for direct browser usage
 * 
 * Usage:
 *   <script src="src/domain/campaign/status.browser.js"></script>
 *   <script>
 *     const status = CampaignStatusUtils.computeCampaignStatus(campaign);
 *     console.log(status === CampaignStatusUtils.CampaignStatus.ACTIVE);
 *   </script>
 */

(function (root, factory) {
  if (typeof exports === 'object' && typeof module !== 'undefined') {
    // CommonJS
    module.exports = factory(require('./status'));
  } else if (typeof define === 'function' && define.amd) {
    // AMD
    define(['./status'], factory);
  } else {
    // Browser globals
    root.CampaignStatusUtils = factory(root.CampaignStatus || (function() {
      // Fallback: try to require status module if available
      try {
        return require('./status');
      } catch (e) {
        throw new Error('Campaign status module not found. Please ensure status.js is loaded first or included in your build.');
      }
    })());
  }
}(typeof self !== 'undefined' ? self : this, function (statusModule) {
  'use strict';

  // Extract the main exports from the status module
  const {
    CampaignStatus,
    computeCampaignStatus,
    isValidStatus,
    getAllStatuses,
    isUpcoming,
    isActive,
    isPaused,
    isExpired,
    getStatusTimeline
  } = statusModule;

  // Return the public API
  return {
    CampaignStatus,
    computeCampaignStatus,
    isValidStatus,
    getAllStatuses,
    isUpcoming,
    isActive,
    isPaused,
    isExpired,
    getStatusTimeline
  };
}));