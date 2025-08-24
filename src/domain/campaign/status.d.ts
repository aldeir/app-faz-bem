/**
 * Campaign status utilities (TypeScript declarations)
 * Mirrors implementation in status.js @version 2.1.0
 */

export const CampaignStatus: Readonly<{
  UPCOMING: 'UPCOMING';
  ACTIVE: 'ACTIVE';
  PAUSED: 'PAUSED';
  EXPIRED: 'EXPIRED';
}>;

export type CampaignStatusValue =
  | typeof CampaignStatus.UPCOMING
  | typeof CampaignStatus.ACTIVE
  | typeof CampaignStatus.PAUSED
  | typeof CampaignStatus.EXPIRED;

/**
 * Firestore-like timestamp object
 */
export interface FirestoreLikeTimestamp {
  seconds: number;
  nanoseconds?: number;
}

export type DateInput =
  | Date
  | string
  | number
  | FirestoreLikeTimestamp
  | undefined
  | null;

export interface CampaignBounds {
  startsAt?: DateInput;
  endsAt?: DateInput;
  paused?: boolean;
  /**
   * Override "current time" (useful for deterministic tests)
   */
  now?: DateInput;
}

export interface CampaignStatusOptions {
  /**
   * When true:
   *  - Invalid date inputs throw TypeError
   *  - startsAt > endsAt throws RangeError
   * Default false (legacy lenient mode)
   */
  strict?: boolean;
  /**
   * Suppress console warnings in non-strict mode
   */
  silent?: boolean;
}

/**
 * Determine campaign lifecycle status.
 * Precedence: PAUSED > EXPIRED > UPCOMING > ACTIVE
 */
export function computeCampaignStatus(
  bounds?: CampaignBounds,
  options?: CampaignStatusOptions
): CampaignStatusValue;

/**
 * Validate if a value is one of the enumerated statuses.
 */
export function isValidStatus(status: any): status is CampaignStatusValue;

/**
 * Get all possible status string values.
 */
export function getAllStatuses(): CampaignStatusValue[];

/**
 * Predicate helpers
 */
export function isUpcoming(status: CampaignStatusValue | string): boolean;
export function isActive(status: CampaignStatusValue | string): boolean;
export function isPaused(status: CampaignStatusValue | string): boolean;
export function isExpired(status: CampaignStatusValue | string): boolean;

export interface StatusTimeline {
  status: CampaignStatusValue;
  startsAt: Date | null;
  endsAt: Date | null;
  now: Date;
  paused: boolean;
}

/**
 * Convenience: returns normalized timeline data alongside computed status.
 * Will throw under same rules as computeCampaignStatus when strict = true.
 */
export function getStatusTimeline(
  bounds?: CampaignBounds,
  options?: CampaignStatusOptions
): StatusTimeline;
