/**
 * Comprehensive test suite for campaign status utilities
 * Covers all edge cases and achieves 100% branch coverage
 * 
 * @version 2.0.0
 */

import { describe, it, expect, vi } from 'vitest';
import {
  CampaignStatus,
  computeCampaignStatus,
  parseDate,
  isActive,
  isUpcoming,
  isPaused,
  isExpired,
  getAllStatuses,
  isValidStatus
} from './status.js';

describe('CampaignStatus enum', () => {
  it('should be frozen and immutable', () => {
    expect(Object.isFrozen(CampaignStatus)).toBe(true);
    
    // Attempt to modify should throw in strict mode (which is normal in test environment)
    expect(() => {
      CampaignStatus.NEW_STATUS = 'NEW';
    }).toThrow();
    
    expect(CampaignStatus.NEW_STATUS).toBeUndefined();
  });
  
  it('should have correct status values', () => {
    expect(CampaignStatus.UPCOMING).toBe('UPCOMING');
    expect(CampaignStatus.ACTIVE).toBe('ACTIVE');
    expect(CampaignStatus.PAUSED).toBe('PAUSED');
    expect(CampaignStatus.EXPIRED).toBe('EXPIRED');
  });
});

describe('parseDate', () => {
  it('should parse valid Date objects', () => {
    const date = new Date('2023-12-01T10:00:00Z');
    expect(parseDate(date)).toEqual(date);
  });
  
  it('should parse valid ISO strings', () => {
    const isoString = '2023-12-01T10:00:00Z';
    const parsed = parseDate(isoString);
    expect(parsed).toBeInstanceOf(Date);
    expect(parsed.toISOString()).toBe('2023-12-01T10:00:00.000Z'); // JavaScript adds .000 for milliseconds
  });
  
  it('should parse Unix timestamps', () => {
    const timestamp = 1609459200000; // 2021-01-01T00:00:00Z
    const parsed = parseDate(timestamp);
    expect(parsed).toBeInstanceOf(Date);
    expect(parsed.getTime()).toBe(timestamp);
  });
  
  it('should handle Firestore Timestamp objects', () => {
    const mockTimestamp = {
      toDate: () => new Date('2023-12-01T10:00:00Z')
    };
    const parsed = parseDate(mockTimestamp);
    expect(parsed).toBeInstanceOf(Date);
    expect(parsed.toISOString()).toBe('2023-12-01T10:00:00.000Z');
  });
  
  it('should return null for null/undefined inputs', () => {
    expect(parseDate(null)).toBeNull();
    expect(parseDate(undefined)).toBeNull();
    expect(parseDate('')).toBeNull();
  });
  
  it('should return null for invalid dates', () => {
    expect(parseDate('invalid-date')).toBeNull();
    expect(parseDate(new Date('invalid'))).toBeNull();
    expect(parseDate(NaN)).toBeNull();
  });
  
  it('should handle parse errors gracefully', () => {
    const mockInput = {
      toDate: () => { throw new Error('Parse error'); }
    };
    expect(parseDate(mockInput)).toBeNull();
  });
});

describe('computeCampaignStatus', () => {
  const fixedNow = new Date('2023-12-15T12:00:00Z');
  
  describe('paused override logic', () => {
    it('should return PAUSED when paused is true, regardless of dates', () => {
      const bounds = {
        startsAt: '2023-12-01T00:00:00Z',
        endsAt: '2023-12-31T23:59:59Z',
        paused: true,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.PAUSED);
    });
    
    it('should return PAUSED even for expired campaigns when paused is true', () => {
      const bounds = {
        startsAt: '2023-11-01T00:00:00Z',
        endsAt: '2023-11-30T23:59:59Z', // Past end date
        paused: true,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.PAUSED);
    });
    
    it('should return PAUSED even for upcoming campaigns when paused is true', () => {
      const bounds = {
        startsAt: '2024-01-01T00:00:00Z', // Future start date
        endsAt: '2024-01-31T23:59:59Z',
        paused: true,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.PAUSED);
    });
  });
  
  describe('temporal logic when not paused', () => {
    it('should return EXPIRED when end date is in the past', () => {
      const bounds = {
        startsAt: '2023-11-01T00:00:00Z',
        endsAt: '2023-11-30T23:59:59Z', // Past end date
        paused: false,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.EXPIRED);
    });
    
    it('should return UPCOMING when start date is in the future', () => {
      const bounds = {
        startsAt: '2024-01-01T00:00:00Z', // Future start date
        endsAt: '2024-01-31T23:59:59Z',
        paused: false,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.UPCOMING);
    });
    
    it('should return ACTIVE when currently within campaign period', () => {
      const bounds = {
        startsAt: '2023-12-01T00:00:00Z', // Past start
        endsAt: '2023-12-31T23:59:59Z',   // Future end
        paused: false,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.ACTIVE);
    });
  });
  
  describe('boundary conditions', () => {
    it('should return ACTIVE exactly at start time', () => {
      const startTime = '2023-12-15T12:00:00Z';
      const bounds = {
        startsAt: startTime,
        endsAt: '2023-12-31T23:59:59Z',
        paused: false,
        now: new Date(startTime)
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.ACTIVE);
    });
    
    it('should return ACTIVE exactly at end time', () => {
      const endTime = '2023-12-15T12:00:00Z';
      const bounds = {
        startsAt: '2023-12-01T00:00:00Z',
        endsAt: endTime,
        paused: false,
        now: new Date(endTime)
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.ACTIVE);
    });
    
    it('should return UPCOMING just before start (1 second)', () => {
      const startTime = new Date('2023-12-15T12:00:00Z');
      const justBefore = new Date(startTime.getTime() - 1000);
      const bounds = {
        startsAt: startTime,
        endsAt: '2023-12-31T23:59:59Z',
        paused: false,
        now: justBefore
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.UPCOMING);
    });
    
    it('should return EXPIRED just after end (1 second)', () => {
      const endTime = new Date('2023-12-15T12:00:00Z');
      const justAfter = new Date(endTime.getTime() + 1000);
      const bounds = {
        startsAt: '2023-12-01T00:00:00Z',
        endsAt: endTime,
        paused: false,
        now: justAfter
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.EXPIRED);
    });
  });
  
  describe('missing date handling', () => {
    it('should return ACTIVE when no start date provided and end date is future', () => {
      const bounds = {
        endsAt: '2023-12-31T23:59:59Z',
        paused: false,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.ACTIVE);
    });
    
    it('should return ACTIVE when no end date provided and start date is past', () => {
      const bounds = {
        startsAt: '2023-12-01T00:00:00Z',
        paused: false,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.ACTIVE);
    });
    
    it('should return ACTIVE when no dates provided', () => {
      const bounds = {
        paused: false,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.ACTIVE);
    });
  });
  
  describe('invalid date handling', () => {
    it('should return EXPIRED for invalid start date', () => {
      const bounds = {
        startsAt: 'invalid-date',
        endsAt: '2023-12-31T23:59:59Z',
        paused: false,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.EXPIRED);
    });
    
    it('should return EXPIRED for invalid end date', () => {
      const bounds = {
        startsAt: '2023-12-01T00:00:00Z',
        endsAt: 'invalid-date',
        paused: false,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.EXPIRED);
    });
    
    it('should return EXPIRED for both invalid dates', () => {
      const bounds = {
        startsAt: 'invalid-start',
        endsAt: 'invalid-end',
        paused: false,
        now: fixedNow
      };
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.EXPIRED);
    });
  });
  
  describe('default parameter handling', () => {
    it('should use current time when now is not provided', () => {
      const bounds = {
        startsAt: '2020-01-01T00:00:00Z', // Past date
        endsAt: '2025-12-31T23:59:59Z'     // Future date
      };
      // Should be ACTIVE since we're between 2020 and 2025
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.ACTIVE);
    });
    
    it('should handle empty bounds object', () => {
      expect(computeCampaignStatus({})).toBe(CampaignStatus.ACTIVE);
    });
    
    it('should handle no parameters', () => {
      expect(computeCampaignStatus()).toBe(CampaignStatus.ACTIVE);
    });
    
    it('should handle invalid now parameter gracefully', () => {
      const bounds = {
        startsAt: '2023-12-01T00:00:00Z',
        endsAt: '2023-12-31T23:59:59Z',
        now: 'invalid-date'
      };
      // Should use current time (new Date()) and since we're between 2023-12-01 and 2023-12-31
      // and current time is likely in 2024/2025, the campaign should be EXPIRED
      expect(computeCampaignStatus(bounds)).toBe(CampaignStatus.EXPIRED);
    });
  });
});

describe('helper functions', () => {
  describe('isActive', () => {
    it('should return true for ACTIVE status', () => {
      expect(isActive(CampaignStatus.ACTIVE)).toBe(true);
    });
    
    it('should return false for non-ACTIVE statuses', () => {
      expect(isActive(CampaignStatus.UPCOMING)).toBe(false);
      expect(isActive(CampaignStatus.PAUSED)).toBe(false);
      expect(isActive(CampaignStatus.EXPIRED)).toBe(false);
    });
  });
  
  describe('isUpcoming', () => {
    it('should return true for UPCOMING status', () => {
      expect(isUpcoming(CampaignStatus.UPCOMING)).toBe(true);
    });
    
    it('should return false for non-UPCOMING statuses', () => {
      expect(isUpcoming(CampaignStatus.ACTIVE)).toBe(false);
      expect(isUpcoming(CampaignStatus.PAUSED)).toBe(false);
      expect(isUpcoming(CampaignStatus.EXPIRED)).toBe(false);
    });
  });
  
  describe('isPaused', () => {
    it('should return true for PAUSED status', () => {
      expect(isPaused(CampaignStatus.PAUSED)).toBe(true);
    });
    
    it('should return false for non-PAUSED statuses', () => {
      expect(isPaused(CampaignStatus.ACTIVE)).toBe(false);
      expect(isPaused(CampaignStatus.UPCOMING)).toBe(false);
      expect(isPaused(CampaignStatus.EXPIRED)).toBe(false);
    });
  });
  
  describe('isExpired', () => {
    it('should return true for EXPIRED status', () => {
      expect(isExpired(CampaignStatus.EXPIRED)).toBe(true);
    });
    
    it('should return false for non-EXPIRED statuses', () => {
      expect(isExpired(CampaignStatus.ACTIVE)).toBe(false);
      expect(isExpired(CampaignStatus.UPCOMING)).toBe(false);
      expect(isExpired(CampaignStatus.PAUSED)).toBe(false);
    });
  });
  
  describe('getAllStatuses', () => {
    it('should return all status values', () => {
      const statuses = getAllStatuses();
      expect(statuses).toHaveLength(4);
      expect(statuses).toContain(CampaignStatus.UPCOMING);
      expect(statuses).toContain(CampaignStatus.ACTIVE);
      expect(statuses).toContain(CampaignStatus.PAUSED);
      expect(statuses).toContain(CampaignStatus.EXPIRED);
    });
  });
  
  describe('isValidStatus', () => {
    it('should return true for valid statuses', () => {
      expect(isValidStatus('UPCOMING')).toBe(true);
      expect(isValidStatus('ACTIVE')).toBe(true);
      expect(isValidStatus('PAUSED')).toBe(true);
      expect(isValidStatus('EXPIRED')).toBe(true);
    });
    
    it('should return false for invalid statuses', () => {
      expect(isValidStatus('INVALID')).toBe(false);
      expect(isValidStatus('active')).toBe(false); // case sensitive
      expect(isValidStatus('')).toBe(false);
      expect(isValidStatus(null)).toBe(false);
      expect(isValidStatus(undefined)).toBe(false);
    });
  });
});