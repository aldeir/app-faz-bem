/**
 * Status Utilities for App Faz Bem
 * Centralized logic for campaign and donation status computation
 * 
 * @version 1.0.0
 * @author App Faz Bem Team
 */

// Version banner
console.log('[Status Utils] v1.0.0 loaded');

/**
 * Campaign status enumeration
 * @readonly
 * @enum {string}
 */
export const CAMPAIGN_STATUS = {
  UPCOMING: 'upcoming',
  ACTIVE: 'active', 
  COMPLETED: 'completed'
};

/**
 * Donation status enumeration
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
 * Handles Firestore Timestamp, Date objects, numbers, and ISO strings
 * 
 * @param {*} timestamp - Timestamp in various formats
 * @returns {Date|null} Normalized Date object or null if invalid
 * 
 * @example
 * normalizeTimestamp(new Date()) // returns Date
 * normalizeTimestamp(firestoreTimestamp) // returns Date
 * normalizeTimestamp('2023-12-01T10:00:00Z') // returns Date
 * normalizeTimestamp(1609459200000) // returns Date
 * normalizeTimestamp(null) // returns null
 */
export function normalizeTimestamp(timestamp) {
  if (!timestamp) return null;
  
  try {
    // Firestore Timestamp object
    if (timestamp && typeof timestamp.toDate === 'function') {
      return timestamp.toDate();
    }
    
    // Already a Date object
    if (timestamp instanceof Date) {
      return isNaN(timestamp.getTime()) ? null : timestamp;
    }
    
    // Number (Unix timestamp in milliseconds)
    if (typeof timestamp === 'number') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // String (ISO format)
    if (typeof timestamp === 'string') {
      const date = new Date(timestamp);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  } catch (error) {
    console.warn('[Status Utils] Failed to normalize timestamp:', timestamp, error);
    return null;
  }
}

/**
 * Computes campaign status based on dates and persisted status
 * Uses deterministic logic: checks expiresAt first, then startsAt, then status field
 * 
 * @param {Object} campaign - Campaign object
 * @param {*} campaign.startsAt - Campaign start date (Firestore Timestamp, Date, etc.)
 * @param {*} campaign.expiresAt - Campaign end date (Firestore Timestamp, Date, etc.)
 * @param {string} campaign.status - Persisted status field
 * @param {Date} [now=new Date()] - Current date for comparison
 * @returns {string} Campaign status (UPCOMING, ACTIVE, or COMPLETED)
 * 
 * @example
 * // Campaign that ended yesterday
 * computeCampaignStatus({
 *   expiresAt: new Date('2023-11-30'),
 *   startsAt: new Date('2023-11-01'), 
 *   status: 'active'
 * }) // returns 'completed'
 * 
 * // Campaign starting tomorrow
 * computeCampaignStatus({
 *   startsAt: new Date('2023-12-02'),
 *   status: 'upcoming'
 * }) // returns 'upcoming'
 */
export function computeCampaignStatus(campaign, now = new Date()) {
  if (!campaign) return CAMPAIGN_STATUS.COMPLETED;
  
  const endDate = normalizeTimestamp(campaign.expiresAt);
  const startDate = normalizeTimestamp(campaign.startsAt);
  
  // Priority 1: If campaign has expired, it's completed
  if (endDate && endDate < now) {
    return CAMPAIGN_STATUS.COMPLETED;
  }
  
  // Priority 2: If campaign hasn't started yet and is marked as upcoming
  if (campaign.status === CAMPAIGN_STATUS.UPCOMING && startDate && startDate > now) {
    return CAMPAIGN_STATUS.UPCOMING;
  }
  
  // Priority 3: If we have a valid end date in the future, it's active
  if (endDate && endDate >= now) {
    return CAMPAIGN_STATUS.ACTIVE;
  }
  
  // Priority 4: If no end date but has start date in the past, it's active
  if (startDate && startDate <= now) {
    return CAMPAIGN_STATUS.ACTIVE;
  }
  
  // Fallback: use persisted status or default to active
  return campaign.status || CAMPAIGN_STATUS.ACTIVE;
}

/**
 * Checks if a campaign is completed
 * Convenience function for common use case
 * 
 * @param {Object} campaign - Campaign object
 * @param {Date} [now=new Date()] - Current date for comparison
 * @returns {boolean} True if campaign is completed
 * 
 * @example
 * isCampaignCompleted({ expiresAt: new Date('2023-11-30') }) // true if past Nov 30
 */
export function isCampaignCompleted(campaign, now = new Date()) {
  return computeCampaignStatus(campaign, now) === CAMPAIGN_STATUS.COMPLETED;
}

/**
 * Computes donation status based on scheduling and item completion
 * Considers scheduledAt, items status, and persisted status
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