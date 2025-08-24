/**
 * Centralized Campaign Status Utilities for App Faz Bem
 * Hardened, testable status computation with robust error handling
 * 
 * @version 2.0.0
 * @author App Faz Bem Team
 */

import { warn } from '../../lib/logging/logger.js';

/**
 * Campaign status enumeration - frozen for immutability
 * @readonly
 * @typedef {'UPCOMING' | 'ACTIVE' | 'PAUSED' | 'EXPIRED'} CampaignStatusType
 */

/**
 * Frozen campaign status enumeration
 * Prevents accidental modification at runtime
 */
export const CampaignStatus = Object.freeze({
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE', 
  PAUSED: 'PAUSED',
  EXPIRED: 'EXPIRED'
});

/**
 * Campaign bounds for status computation
 * @typedef {Object} CampaignBounds
 * @property {Date|string|null} [startsAt] - Campaign start date
 * @property {Date|string|null} [endsAt] - Campaign end date
 * @property {boolean} [paused] - Whether campaign is paused
 * @property {Date} [now] - Current date for comparison (defaults to new Date())
 */

/**
 * Safely parses a date from various input formats
 * @param {Date|string|number|null|undefined} input - Input to parse
 * @returns {Date|null} Parsed date or null if invalid
 * 
 * @example
 * parseDate('2023-12-01T10:00:00Z') // Returns Date object
 * parseDate(new Date()) // Returns the same Date object
 * parseDate(null) // Returns null
 * parseDate('invalid') // Returns null and logs warning
 */
export function parseDate(input) {
  if (!input) return null;
  
  try {
    // Already a Date object
    if (input instanceof Date) {
      return isNaN(input.getTime()) ? null : input;
    }
    
    // Firestore Timestamp object
    if (input && typeof input.toDate === 'function') {
      return input.toDate();
    }
    
    // Number (Unix timestamp in milliseconds)
    if (typeof input === 'number') {
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    }
    
    // String (ISO format)
    if (typeof input === 'string') {
      const date = new Date(input);
      return isNaN(date.getTime()) ? null : date;
    }
    
    return null;
  } catch (error) {
    warn('Failed to parse date input', { input, error: error.message });
    return null;
  }
}

/**
 * Computes campaign status based on temporal bounds and paused state
 * Uses defensive programming with fallback to EXPIRED for invalid inputs
 * 
 * @param {CampaignBounds} bounds - Campaign bounds object
 * @returns {CampaignStatusType} Computed status
 * 
 * @example
 * // Active campaign
 * computeCampaignStatus({
 *   startsAt: '2023-11-01T00:00:00Z',
 *   endsAt: '2023-12-31T23:59:59Z',
 *   paused: false,
 *   now: new Date('2023-11-15T12:00:00Z')
 * }) // Returns 'ACTIVE'
 * 
 * @example
 * // Paused campaign (overrides temporal logic)
 * computeCampaignStatus({
 *   startsAt: '2023-11-01T00:00:00Z',
 *   endsAt: '2023-12-31T23:59:59Z', 
 *   paused: true,
 *   now: new Date('2023-11-15T12:00:00Z')
 * }) // Returns 'PAUSED'
 * 
 * @example
 * // Invalid dates fallback
 * computeCampaignStatus({
 *   startsAt: 'invalid-date',
 *   endsAt: 'also-invalid'
 * }) // Returns 'EXPIRED' (safe fallback)
 */
export function computeCampaignStatus(bounds = {}) {
  const { startsAt, endsAt, paused = false, now = new Date() } = bounds;
  
  // Validate and normalize current time
  const currentTime = parseDate(now) || new Date();
  
  // Priority 1: Paused supersedes all temporal logic
  if (paused === true) {
    return CampaignStatus.PAUSED;
  }
  
  // Parse campaign boundaries
  const startDate = parseDate(startsAt);
  const endDate = parseDate(endsAt);
  
  // If dates are invalid, log warning and return safe fallback
  if ((startsAt && !startDate) || (endsAt && !endDate)) {
    warn('Invalid campaign dates provided, falling back to EXPIRED', {
      startsAt,
      endsAt,
      parsedStart: startDate,
      parsedEnd: endDate
    });
    return CampaignStatus.EXPIRED;
  }
  
  // Priority 2: Check if campaign has ended
  if (endDate && endDate < currentTime) {
    return CampaignStatus.EXPIRED;
  }
  
  // Priority 3: Check if campaign hasn't started yet
  if (startDate && startDate > currentTime) {
    return CampaignStatus.UPCOMING;
  }
  
  // Priority 4: Campaign is within active period
  if ((!startDate || startDate <= currentTime) && (!endDate || endDate >= currentTime)) {
    return CampaignStatus.ACTIVE;
  }
  
  // Fallback (should not reach here with valid logic, but defensive)
  return CampaignStatus.EXPIRED;
}

/**
 * Checks if campaign status represents an active state
 * @param {CampaignStatusType} status - Campaign status
 * @returns {boolean} True if status is ACTIVE
 * 
 * @example
 * isActive(CampaignStatus.ACTIVE) // true
 * isActive(CampaignStatus.PAUSED) // false
 */
export function isActive(status) {
  return status === CampaignStatus.ACTIVE;
}

/**
 * Checks if campaign status represents an upcoming state
 * @param {CampaignStatusType} status - Campaign status
 * @returns {boolean} True if status is UPCOMING
 * 
 * @example
 * isUpcoming(CampaignStatus.UPCOMING) // true
 * isUpcoming(CampaignStatus.ACTIVE) // false
 */
export function isUpcoming(status) {
  return status === CampaignStatus.UPCOMING;
}

/**
 * Checks if campaign status represents a paused state
 * @param {CampaignStatusType} status - Campaign status
 * @returns {boolean} True if status is PAUSED
 * 
 * @example
 * isPaused(CampaignStatus.PAUSED) // true
 * isPaused(CampaignStatus.ACTIVE) // false
 */
export function isPaused(status) {
  return status === CampaignStatus.PAUSED;
}

/**
 * Checks if campaign status represents an expired state
 * @param {CampaignStatusType} status - Campaign status
 * @returns {boolean} True if status is EXPIRED
 * 
 * @example
 * isExpired(CampaignStatus.EXPIRED) // true
 * isExpired(CampaignStatus.ACTIVE) // false
 */
export function isExpired(status) {
  return status === CampaignStatus.EXPIRED;
}

/**
 * Gets all available campaign statuses
 * @returns {CampaignStatusType[]} Array of all status values
 * 
 * @example
 * getAllStatuses() // ['UPCOMING', 'ACTIVE', 'PAUSED', 'EXPIRED']
 */
export function getAllStatuses() {
  return Object.values(CampaignStatus);
}/**
 * Centralized Campaign Status Utilities for App Faz Bem
 * Hardened, testable status computation with robust error handling
 *
 * @version 2.1.0  (adds optional strict mode + improved date validation)
 * CHANGELOG (local header extract):
 * 2.1.0
 *   - Added optional strict mode via second parameter: computeCampaignStatus(bounds, { strict: true })
 *   - In strict mode: invalid date inputs throw Error instead of silent fallback
 *   - Inverted date range validation (startsAt > endsAt)
 *   - Helpers: isCampaignExpired, isCampaignUpcoming
 */
import { warn } from '../../lib/logging/logger.js';

export const CampaignStatus = Object.freeze({
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  EXPIRED: 'EXPIRED'
});

/**
 * @typedef {Object} CampaignBounds
 * @property {Date|string|number|null} [startsAt]
 * @property {Date|string|number|null} [endsAt]
 * @property {boolean} [paused]
 * @property {Date|string|number} [now]
 */

/**
 * @typedef {Object} ComputeStatusOptions
 * @property {boolean} [strict=false]
 */

export function parseDate(input) {
  if (input == null) return null;
  if (input instanceof Date) return Number.isNaN(input.getTime()) ? null : input;
  if (typeof input === 'number') {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  if (typeof input === 'string') {
    const d = new Date(input);
    return Number.isNaN(d.getTime()) ? null : d;
  }
  // Firestore Timestamp?
  if (input && typeof input.toDate === 'function') {
    try {
      const d = input.toDate();
      return d instanceof Date && !Number.isNaN(d.getTime()) ? d : null;
    } catch {
      return null;
    }
  }
  warn('parseDate received unsupported type', { input });
  return null;
}

function validateDateRange({ startDate, endDate }, strict) {
  if (startDate && endDate && startDate > endDate) {
    const msg = '[campaign-status] Inverted date range: startsAt > endsAt';
    if (strict) throw new Error(msg);
    warn(msg, { startDate, endDate });
    return false;
  }
  return true;
}

/**
 * computeCampaignStatus(bounds, options?)
 * Strict mode: throws on invalid dates or inverted range.
 * Non-strict: warnings + EXPIRED fallback.
 */
export function computeCampaignStatus(bounds = {}, options = {}) {
  const { startsAt, endsAt, paused = false, now = new Date() } = bounds;
  const { strict = false } = options;

  const currentTime = parseDate(now) || new Date();

  if (paused === true) return CampaignStatus.PAUSED;

  const startDate = parseDate(startsAt);
  const endDate = parseDate(endsAt);

  const invalidStart = startsAt != null && !startDate;
  const invalidEnd = endsAt != null && !endDate;

  if (invalidStart || invalidEnd) {
    const meta = { startsAt, endsAt, parsedStart: startDate, parsedEnd: endDate };
    if (strict) {
      throw new Error('[campaign-status] Invalid campaign dates in strict mode');
    }
    warn('Invalid campaign dates provided, falling back to EXPIRED', meta);
    return CampaignStatus.EXPIRED;
  }

  if (!validateDateRange({ startDate, endDate }, strict)) {
    return CampaignStatus.EXPIRED;
  }

  if (endDate && endDate < currentTime) return CampaignStatus.EXPIRED;
  if (startDate && startDate > currentTime) return CampaignStatus.UPCOMING;
  if ((!startDate || startDate <= currentTime) && (!endDate || endDate >= currentTime)) {
    return CampaignStatus.ACTIVE;
  }

  return CampaignStatus.EXPIRED;
}

export function isCampaignExpired(bounds, options) {
  return computeCampaignStatus(bounds, options) === CampaignStatus.EXPIRED;
}

export function isCampaignUpcoming(bounds, options) {
  return computeCampaignStatus(bounds, options) === CampaignStatus.UPCOMING;
}

/**
 * Validates if a string is a valid campaign status
 * @param {string} status - Status string to validate
 * @returns {boolean} True if valid status
 * 
 * @example
 * isValidStatus('ACTIVE') // true
 * isValidStatus('INVALID') // false
 */
export function isValidStatus(status) {
  return getAllStatuses().includes(status);
}
