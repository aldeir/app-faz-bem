/**
 * Campaign Service for App Faz Bem
 * Pure domain logic for campaign lifecycle management
 * 
 * @version 1.0.0
 * @author App Faz Bem Team
 */

import { 
  computeCampaignStatus, 
  isCampaignCompleted, 
  getCampaignProgress,
  normalizeTimestamp,
  CAMPAIGN_STATUS 
} from './status-utils.js';

// Version banner
console.log('[Campaign Service] v1.0.0 loaded');

/**
 * Derives campaign lifecycle information
 * Pure function that analyzes campaign state without mutations
 * 
 * @param {Object} campaign - Campaign object
 * @param {Date} [now=new Date()] - Current date for comparison
 * @returns {Object} Lifecycle information
 * 
 * @example
 * deriveLifecycle({
 *   startsAt: new Date('2023-12-01'),
 *   expiresAt: new Date('2023-12-31'),
 *   status: 'active'
 * })
 * // returns { status: 'active', isCompleted: false, daysRemaining: 25, ... }
 */
export function deriveLifecycle(campaign, now = new Date()) {
  if (!campaign) {
    return {
      status: CAMPAIGN_STATUS.COMPLETED,
      isCompleted: true,
      daysRemaining: 0,
      hasStarted: false,
      hasEnded: true
    };
  }

  const status = computeCampaignStatus(campaign, now);
  const isCompleted = status === CAMPAIGN_STATUS.COMPLETED;
  
  const startDate = normalizeTimestamp(campaign.startsAt);
  const endDate = normalizeTimestamp(campaign.expiresAt);
  
  const hasStarted = !startDate || startDate <= now;
  const hasEnded = endDate && endDate < now;
  
  let daysRemaining = 0;
  if (endDate && !hasEnded) {
    const diffTime = endDate.getTime() - now.getTime();
    daysRemaining = Math.max(0, Math.ceil(diffTime / (1000 * 60 * 60 * 24)));
  }

  return {
    status,
    isCompleted,
    daysRemaining,
    hasStarted,
    hasEnded,
    startDate,
    endDate
  };
}

/**
 * Determines if a campaign should be auto-completed
 * Based on business rules and current state
 * 
 * @param {Object} campaign - Campaign object
 * @param {Date} [now=new Date()] - Current date for comparison
 * @returns {boolean} True if campaign should be auto-completed
 * 
 * @example
 * shouldAutoComplete({
 *   expiresAt: new Date('2023-11-30'),
 *   status: 'active'
 * }) // returns true if past Nov 30
 */
export function shouldAutoComplete(campaign, now = new Date()) {
  if (!campaign) return false;
  
  const lifecycle = deriveLifecycle(campaign, now);
  
  // Auto-complete if past expiration date and not already completed
  return lifecycle.hasEnded && !lifecycle.isCompleted;
}

/**
 * Merges computed status with campaign data
 * Returns new object without mutating original
 * 
 * @param {Object} campaign - Original campaign object
 * @param {Date} [now=new Date()] - Current date for comparison
 * @returns {Object} Campaign with computed status merged
 * 
 * @example
 * const enriched = mergeComputedStatus({
 *   id: '123',
 *   title: 'Help Campaign',
 *   expiresAt: new Date('2023-12-31')
 * })
 * // returns original campaign + { computedStatus: 'active', lifecycle: {...} }
 */
export function mergeComputedStatus(campaign, now = new Date()) {
  if (!campaign) return null;
  
  const lifecycle = deriveLifecycle(campaign, now);
  const computedStatus = lifecycle.status;
  
  // Calculate progress if goal is available
  let progress = null;
  if (campaign.goal && campaign.goal > 0) {
    progress = getCampaignProgress({
      goal: campaign.goal,
      currentAmount: campaign.currentAmount,
      completedItems: campaign.completedItems
    });
  }
  
  return {
    ...campaign,
    computedStatus,
    lifecycle,
    progress
  };
}

/**
 * Sorts campaigns array by priority rules
 * 1. By createdAt descending (newest first)
 * 2. By title ascending (alphabetical) as tiebreaker
 * 
 * @param {Array} campaigns - Array of campaign objects
 * @returns {Array} Sorted campaigns (new array)
 * 
 * @example
 * sortCampaigns([
 *   { createdAt: timestamp1, title: 'B Campaign' },
 *   { createdAt: timestamp2, title: 'A Campaign' }
 * ])
 * // returns sorted by createdAt desc, then title asc
 */
export function sortCampaigns(campaigns) {
  if (!Array.isArray(campaigns)) return [];
  
  return [...campaigns].sort((a, b) => {
    // Primary sort: createdAt descending (newest first)
    const aCreated = normalizeTimestamp(a.createdAt);
    const bCreated = normalizeTimestamp(b.createdAt);
    
    if (aCreated && bCreated) {
      const timeDiff = bCreated.getTime() - aCreated.getTime();
      if (timeDiff !== 0) return timeDiff;
    } else if (aCreated && !bCreated) {
      return -1; // a is newer
    } else if (!aCreated && bCreated) {
      return 1; // b is newer
    }
    
    // Secondary sort: title ascending (alphabetical)
    const aTitle = (a.title || '').toLowerCase();
    const bTitle = (b.title || '').toLowerCase();
    return aTitle.localeCompare(bTitle);
  });
}

/**
 * Filters campaigns by status
 * 
 * @param {Array} campaigns - Array of campaigns
 * @param {string} statusFilter - Status to filter by ('all', 'active', 'upcoming', 'completed')
 * @param {Date} [now=new Date()] - Current date for comparison
 * @returns {Array} Filtered campaigns
 */
export function filterCampaignsByStatus(campaigns, statusFilter, now = new Date()) {
  if (!Array.isArray(campaigns)) return [];
  if (!statusFilter || statusFilter === 'all') return campaigns;
  
  return campaigns.filter(campaign => {
    const status = computeCampaignStatus(campaign, now);
    return status === statusFilter;
  });
}

// TODO: Future data access layer functions to be added in subsequent PRs
// - fetchCampaigns(filters, pagination)
// - updateCampaignStatus(campaignId, status)
// - createCampaign(campaignData)
// - deleteCampaign(campaignId)
// These will be Firestore adapters that use the pure functions above