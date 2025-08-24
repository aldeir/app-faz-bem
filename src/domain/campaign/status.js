/**
 * Campaign status utilities
 * @version 2.1.0
 *
 * Backwards compatible with 2.0.0:
 *  - Adds optional strict mode via second parameter (options.strict)
 *  - When strict = false (default) behavior is unchanged:
 *      * Invalid date inputs cause a console.warn and status EXPIRED
 *  - When strict = true:
 *      * Invalid date inputs throw TypeError
 *      * startsAt > endsAt throws RangeError
 *
 * Status precedence (highest first):
 *  1. PAUSED (if bounds.paused === true)
 *  2. EXPIRED (now > endsAt)
 *  3. UPCOMING (now < startsAt)
 *  4. ACTIVE (otherwise)
 */

const CampaignStatus = Object.freeze({
  UPCOMING: 'UPCOMING',
  ACTIVE: 'ACTIVE',
  PAUSED: 'PAUSED',
  EXPIRED: 'EXPIRED'
});

/**
 * @typedef {Object} CampaignBounds
 * @property {Date|string|number|Object} [startsAt] - Campaign start (Date, ISO string, timestamp (ms), or { seconds, nanoseconds } Firestore-like)
 * @property {Date|string|number|Object} [endsAt] - Campaign end (Date, ISO string, timestamp (ms), or { seconds, nanoseconds } Firestore-like)
 * @property {boolean} [paused] - Explicit pause flag
 * @property {Date|string|number|Object} [now] - Override for "current time" (useful for tests)
 */

/**
 * @typedef {Object} CampaignStatusOptions
 * @property {boolean} [strict=false] - Enable strict validation (throws instead of fallback)
 * @property {boolean} [silent=false] - Suppress console warnings when not in strict mode
 */

/**
 * Internal: safe console warning (can be silenced)
 * @param {boolean} silent
 * @param  {...any} args
 */
function warn(silent, ...args) {
  if (!silent && typeof console !== 'undefined' && console.warn) {
    console.warn('[campaign-status]', ...args);
  }
}

/**
 * Attempt to parse various date input formats into a Date instance.
 * Accepted:
 *  - Date
 *  - ISO string
 *  - number (ms timestamp)
 *  - { seconds: number, nanoseconds?: number }  (Firestore Timestamp-like)
 * Returns Date or null if invalid/unparseable.
 *
 * NOTE: This is intentionally lenient; strict validation happens separately
 * when options.strict = true.
 *
 * @param {*} value
 * @returns {Date|null}
 */
function parseDate(value) {
  if (value === null || value === undefined) return null;

  // Already a Date
  if (value instanceof Date) {
    return isNaN(value.getTime()) ? null : value;
  }

  // Firestore-like object { seconds, nanoseconds? }
  if (
    typeof value === 'object' &&
    typeof value.seconds === 'number' &&
    (value.nanoseconds === null || value.nanoseconds === undefined || typeof value.nanoseconds === 'number')
  ) {
    try {
      const ms = (value.seconds * 1000) + Math.floor((value.nanoseconds || 0) / 1e6);
      const d = new Date(ms);
      return isNaN(d.getTime()) ? null : d;
    } catch {
      return null;
    }
  }

  // Numeric timestamp (ms)
  if (typeof value === 'number' && isFinite(value)) {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  // String (try ISO parse)
  if (typeof value === 'string') {
    const d = new Date(value);
    return isNaN(d.getTime()) ? null : d;
  }

  return null;
}

/**
 * Normalize a date input according to strict rules:
 *  - In strict mode: throw if invalid
 *  - In non-strict: return { date: Date|null, valid: boolean }
 *
 * @param {*} raw
 * @param {string} fieldName
 * @param {boolean} strict
 * @param {boolean} silent
 * @returns {{ date: Date|null, valid: boolean }}
 */
function normalizeDateInput(raw, fieldName, strict, silent) {
  const date = parseDate(raw);
  if (!date) {
    if (strict) {
      throw new TypeError(`Invalid ${fieldName}: expected a parseable date value`);
    } else if (raw !== null && raw !== undefined) {
      warn(silent, `Invalid ${fieldName} provided ->`, raw);
    }
    return { date: null, valid: false };
  }
  return { date, valid: true };
}

/**
 * Compute the campaign status.
 *
 * Non-strict (default) behavior (legacy):
 *  - Any invalid startsAt / endsAt makes the campaign EXPIRED (safest fallback).
 *
 * Strict mode:
 *  - Invalid date inputs throw TypeError
 *  - startsAt after endsAt throws RangeError
 *
 * @param {CampaignBounds} [bounds={}]
 * @param {CampaignStatusOptions} [options={}]
 * @returns {string} One of CampaignStatus.*
 */
function computeCampaignStatus(bounds = {}, options = {}) {
  const {
    startsAt,
    endsAt,
    paused,
    now
  } = bounds;

  const {
    strict = false,
    silent = false
  } = options;

  // 1. Paused precedence (no need to parse dates if paused)
  if (paused === true) {
    return CampaignStatus.PAUSED;
  }

  // 2. Parse dates
  const { date: nowDate, valid: _nowValid } = normalizeDateInput(now || new Date(), 'now', strict, silent);
  const { date: startDate, valid: startValid } = normalizeDateInput(startsAt, 'startsAt', strict, silent);
  const { date: endDate, valid: endValid } = normalizeDateInput(endsAt, 'endsAt', strict, silent);

  // In non-strict mode, invalid date(s) => EXPIRED fallback (mimic legacy)
  if (!strict) {
    if ((startsAt !== null && startsAt !== undefined && !startValid) || (endsAt !== null && endsAt !== undefined && !endValid)) {
      return CampaignStatus.EXPIRED;
    }
  }

  // 3. Strict consistency checks
  if (strict && startDate && endDate && startDate.getTime() > endDate.getTime()) {
    throw new RangeError('startsAt cannot be after endsAt');
  }

  // 4. Expiration check
  if (endDate && nowDate.getTime() > endDate.getTime()) {
    return CampaignStatus.EXPIRED;
  }

  // 5. Upcoming check
  if (startDate && nowDate.getTime() < startDate.getTime()) {
    return CampaignStatus.UPCOMING;
  }

  // 6. Active fallback
  return CampaignStatus.ACTIVE;
}

/**
 * Helpers
 */

/**
 * @param {string} status
 * @returns {boolean}
 */
function isValidStatus(status) {
  return Object.prototype.hasOwnProperty.call(CampaignStatus, status) || Object.values(CampaignStatus).includes(status);
}

/**
 * @returns {string[]}
 */
function getAllStatuses() {
  return Object.values(CampaignStatus);
}

/**
 * @param {string} status
 * @returns {boolean}
 */
function isUpcoming(status) {
  return status === CampaignStatus.UPCOMING;
}

/**
 * @param {string} status
 * @returns {boolean}
 */
function isActive(status) {
  return status === CampaignStatus.ACTIVE;
}

/**
 * @param {string} status
 * @returns {boolean}
 */
function isPaused(status) {
  return status === CampaignStatus.PAUSED;
}

/**
 * @param {string} status
 * @returns {boolean}
 */
function isExpired(status) {
  return status === CampaignStatus.EXPIRED;
}

/**
 * Convenience: returns normalized info (no breaking change; optional)
 * @param {CampaignBounds} bounds
 * @param {CampaignStatusOptions} [options]
 * @returns {{ status: string, startsAt: Date|null, endsAt: Date|null, now: Date, paused: boolean }}
 */
function getStatusTimeline(bounds = {}, options = {}) {
  const {
    startsAt,
    endsAt,
    paused,
    now
  } = bounds;

  const {
    strict = false,
    silent = false
  } = options;

  const { date: nowDate } = normalizeDateInput(now || new Date(), 'now', strict, silent);
  const { date: startDate } = normalizeDateInput(startsAt, 'startsAt', strict, silent);
  const { date: endDate } = normalizeDateInput(endsAt, 'endsAt', strict, silent);

  return {
    status: computeCampaignStatus(bounds, options),
    startsAt: startDate,
    endsAt: endDate,
    now: nowDate,
    paused: paused === true
  };
}

module.exports = {
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