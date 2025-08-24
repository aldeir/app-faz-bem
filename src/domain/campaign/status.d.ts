/**
 * TypeScript declarations for Campaign Status Utilities
 * @version 2.1.0
 * @author App Faz Bem Team
 */

export type CampaignStatusType = 'UPCOMING' | 'ACTIVE' | 'PAUSED' | 'EXPIRED';

export interface CampaignBounds {
  readonly startsAt?: Date | string | null;
  readonly endsAt?: Date | string | null;
  readonly paused?: boolean;
  readonly now?: Date;
}

export interface CampaignStatusOptions {
  readonly strict?: boolean;
}

export declare const CampaignStatus: {
  readonly UPCOMING: 'UPCOMING';
  readonly ACTIVE: 'ACTIVE';
  readonly PAUSED: 'PAUSED';
  readonly EXPIRED: 'EXPIRED';
};

/**
 * Safely parses a date from various input formats
 */
export declare function parseDate(input: Date | string | number | null | undefined): Date | null;

/**
 * Computes campaign status based on temporal bounds and paused state
 * @throws {RangeError} When strict mode is enabled and startAt > endAt
 * @throws {TypeError} When strict mode is enabled and invalid date values are provided
 */
export declare function computeCampaignStatus(
  bounds?: CampaignBounds,
  options?: CampaignStatusOptions
): CampaignStatusType;

/**
 * Checks if campaign status represents an active state
 */
export declare function isActive(status: CampaignStatusType): boolean;

/**
 * Checks if campaign status represents an upcoming state
 */
export declare function isUpcoming(status: CampaignStatusType): boolean;

/**
 * Checks if campaign status represents a paused state
 */
export declare function isPaused(status: CampaignStatusType): boolean;

/**
 * Checks if campaign status represents an expired state
 */
export declare function isExpired(status: CampaignStatusType): boolean;

/**
 * Gets all available campaign statuses
 */
export declare function getAllStatuses(): CampaignStatusType[];

/**
 * Validates if a string is a valid campaign status
 */
export declare function isValidStatus(status: string): boolean;