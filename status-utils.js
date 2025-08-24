/**
 * Status Utilities for App Faz Bem (Legacy Compatibility Layer)
 * 
 * ⚠️ MIGRATION NOTICE: Campaign status logic has been moved to src/domain/campaign/status.js
 * This file provides backward compatibility while transitioning to the new centralized system.
 * 
 * @version 1.1.0 (Transitional)
 * @author App Faz Bem Team
 * @deprecated Campaign status functions - use src/domain/campaign/status.js instead
 */

import { 
  CampaignStatus as NewCampaignStatus,
  computeCampaignStatus as computeNewCampaignStatus,
  parseDate as parseNewDate 
} from './src/domain/campaign/status.js';
import { warn } from './src/lib/logging/logger.js';

// Version banner
console.log('[Status Utils] v1.1.0 (Legacy Compatibility) loaded');

/**
 * Legacy campaign status enumeration
 * @deprecated Use CampaignStatus from src/domain/campaign/status.js instead
 * @readonly
 * @enum {string}
 */
export const CAMPAIGN_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active', 
  COMPLETED: 'completed'  // Legacy name for EXPIRED
};

/**
 * Donation status enumeration (unchanged)
 * @readonly
 * @enum {string}
 */
export const DONATION_STATUS = {
  SCHEDULED: 'scheduled',
  PENDING: 'pending',
  COMPLETED: 'completed',
  CANCELLED: 'cancelled',
  RESCHEDULED: 'reagendado'
};

/**
 * Normalizes timestamp from various formats to Date object
 * @deprecated Use parseDate from src/domain/campaign/status.js instead
 * @param {*} timestamp - Timestamp in various formats
 * @returns {Date|null} Normalized Date object or null if invalid
 */
export function normalizeTimestamp(timestamp) {
  return parseNewDate(timestamp);
}

/**
 * Computes campaign status based on dates and persisted status (Legacy API)
 * @deprecated Use computeCampaignStatus from src/domain/campaign/status.js instead
 * 
 * @param {Object} campaign - Campaign object (legacy format)
 * @param {*} campaign.startsAt - Campaign start date
 * @param {*} campaign.expiresAt - Campaign end date  
 * @param {string} campaign.status - Persisted status field
 * @param {Date} [now=new Date()] - Current date for comparison
 * @returns {string} Campaign status (UPCOMING, ACTIVE, or COMPLETED)
 */
export function computeCampaignStatus(campaign, now = new Date()) {
  if (!campaign) {
    warn('computeCampaignStatus called with null/undefined campaign, falling back to COMPLETED');
    return CAMPAIGN_STATUS.COMPLETED;
  }
  
  // Map legacy API to new API
  const newStatus = computeNewCampaignStatus({
    startsAt: campaign.startsAt,
    endsAt: campaign.expiresAt,  // Legacy used 'expiresAt' instead of 'endsAt'
    paused: campaign.paused || false,
    now
  });
  
  // Map new status values back to legacy values
  switch (newStatus) {
    case NewCampaignStatus.UPCOMING:
      return CAMPAIGN_STATUS.UPCOMING;
    case NewCampaignStatus.ACTIVE:
      return CAMPAIGN_STATUS.ACTIVE;
    case NewCampaignStatus.PAUSED:
      // Legacy API doesn't have PAUSED, map to ACTIVE since it's temporarily inactive
      return CAMPAIGN_STATUS.ACTIVE;
    case NewCampaignStatus.EXPIRED:
      return CAMPAIGN_STATUS.COMPLETED;
    default:
      warn('Unknown status returned from new campaign status system', { newStatus });
      return CAMPAIGN_STATUS.COMPLETED;
  }
}

/**
 * Checks if a campaign is completed (Legacy API)
 * @deprecated Use isExpired from src/domain/campaign/status.js instead
 * @param {Object} campaign - Campaign object
 * @param {Date} [now=new Date()] - Current date for comparison
 * @returns {boolean} True if campaign is completed
 */
export function isCampaignCompleted(campaign, now = new Date()) {
  return computeCampaignStatus(campaign, now) === CAMPAIGN_STATUS.COMPLETED;
}

/**
 * Computes donation status based on scheduling and item completion
 * Considers scheduledAt, items status, and persisted status
 * (Unchanged - donation logic remains in this module)
 * 
 * @param {Object} donation - Donation object
 * @param {*} donation.scheduledAt - Scheduled delivery date
 * @param {Array} donation.items - Array of donation items with status
 * @param {string} donation.status - Persisted donation status
 * @param {Date} [now=new Date()] - Current date for comparison
 * @returns {string} Donation status
 * 
 * @example
 * computeDonationStatus({
 *   scheduledAt: new Date('2023-12-01'),
 *   items: [{ status: 'pending' }, { status: 'completed' }],
 *   status: 'scheduled'
 * }) // returns computed status based on items and schedule
 */
export function computeDonationStatus(donation, now = new Date()) {
  if (!donation) return DONATION_STATUS.CANCELLED;
  
  // Check persisted status first for explicit states
  if (donation.status === DONATION_STATUS.CANCELLED || 
      donation.status === DONATION_STATUS.RESCHEDULED) {
    return donation.status;
  }
  
  const scheduledDate = normalizeTimestamp(donation.scheduledAt);
  const items = donation.items || [];
  
  // If all items are completed, donation is completed
  if (items.length > 0 && items.every(item => item.status === 'completed')) {
    return DONATION_STATUS.COMPLETED;
  }
  
  // If scheduled in the future, it's scheduled
  if (scheduledDate && scheduledDate > now) {
    return DONATION_STATUS.SCHEDULED;
  }
  
  // If past scheduled date with items, it's pending
  if (scheduledDate && scheduledDate <= now && items.length > 0) {
    return DONATION_STATUS.PENDING;
  }
  
  // Fallback to persisted status
  return donation.status || DONATION_STATUS.SCHEDULED;
}

/**
 * Calculates campaign progress based on goal and current amount
 * Handles both monetary goals and item count goals
 * 
 * @param {Object} options - Progress calculation options
 * @param {number} options.goal - Campaign goal (monetary or item count)
 * @param {number} [options.currentAmount] - Current monetary amount raised
 * @param {Array} [options.completedItems] - Array of completed items
 * @returns {Object} Progress object with current, goal, and percentage
 * 
 * @example
 * getCampaignProgress({ goal: 1000, currentAmount: 250 })
 * // returns { current: 250, goal: 1000, percentage: 25 }
 * 
 * getCampaignProgress({ goal: 50, completedItems: [1,2,3] })
 * // returns { current: 3, goal: 50, percentage: 6 }
 */
export function getCampaignProgress({ goal, currentAmount, completedItems }) {
  if (!goal || goal <= 0) {
    return { current: 0, goal: 0, percentage: 0 };
  }
  
  let current = 0;
  
  // Priority: use currentAmount if provided
  if (typeof currentAmount === 'number' && currentAmount >= 0) {
    current = currentAmount;
  }
  // Fallback: count completed items
  else if (Array.isArray(completedItems)) {
    current = completedItems.length;
  }
  
  const percentage = Math.min(Math.round((current / goal) * 100), 100);
  
  return {
    current,
    goal,
    percentage
  };
}