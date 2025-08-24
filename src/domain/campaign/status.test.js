/* eslint-disable no-console */
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
} = require('./status');

describe('campaign status module', () => {
  let originalNow;
  let nowDate;

  beforeAll(() => {
    originalNow = Date.now;
  });

  beforeEach(() => {
    nowDate = new Date('2024-01-10T12:00:00.000Z');
    // Freeze "now" via Date.now so internal new Date() inside code gets consistent base (only used if bounds.now absent)
    Date.now = () => nowDate.getTime();
  });

  afterEach(() => {
    Date.now = originalNow;
    jest.restoreAllMocks();
  });

  describe('CampaignStatus enum', () => {
    test('has expected members', () => {
      expect(CampaignStatus).toEqual({
        UPCOMING: 'UPCOMING',
        ACTIVE: 'ACTIVE',
        PAUSED: 'PAUSED',
        EXPIRED: 'EXPIRED'
      });
    });

    test('is frozen (immutable)', () => {
      expect(Object.isFrozen(CampaignStatus)).toBe(true);
      expect(() => { CampaignStatus.NEW = 'X'; }).toThrow();
    });

    test('getAllStatuses returns all values', () => {
      const vals = getAllStatuses();
      expect(vals.sort()).toEqual([
        'UPCOMING', 'ACTIVE', 'PAUSED', 'EXPIRED'
      ].sort());
    });

    test('isValidStatus positive and negative cases', () => {
      expect(isValidStatus('ACTIVE')).toBe(true);
      expect(isValidStatus('PAUSED')).toBe(true);
      expect(isValidStatus('EXPIRED')).toBe(true);
      expect(isValidStatus('UPCOMING')).toBe(true);
      expect(isValidStatus('unknown')).toBe(false);
      expect(isValidStatus(null)).toBe(false);
    });
  });

  describe('computeCampaignStatus - legacy / non-strict behavior', () => {
    test('returns PAUSED precedence over other states', () => {
      const status = computeCampaignStatus({
        paused: true,
        startsAt: new Date(nowDate.getTime() + 10_000),
        endsAt: new Date(nowDate.getTime() - 10_000)
      });
      expect(status).toBe(CampaignStatus.PAUSED);
    });

    test('ACTIVE when within range', () => {
      const status = computeCampaignStatus({
        startsAt: new Date(nowDate.getTime() - 60_000),
        endsAt: new Date(nowDate.getTime() + 60_000)
      });
      expect(status).toBe(CampaignStatus.ACTIVE);
    });

    test('ACTIVE when start equals now', () => {
      const status = computeCampaignStatus({
        startsAt: new Date(nowDate.getTime()),
        endsAt: new Date(nowDate.getTime() + 60_000)
      });
      expect(status).toBe(CampaignStatus.ACTIVE);
    });

    test('ACTIVE when end equals now (not expired yet)', () => {
      const status = computeCampaignStatus({
        startsAt: new Date(nowDate.getTime() - 60_000),
        endsAt: new Date(nowDate.getTime())
      });
      expect(status).toBe(CampaignStatus.ACTIVE);
    });

    test('UPCOMING when now is before start', () => {
      const status = computeCampaignStatus({
        startsAt: new Date(nowDate.getTime() + 60_000),
        endsAt: new Date(nowDate.getTime() + 120_000)
      });
      expect(status).toBe(CampaignStatus.UPCOMING);
    });

    test('EXPIRED when now is after end', () => {
      const status = computeCampaignStatus({
        startsAt: new Date(nowDate.getTime() - 120_000),
        endsAt: new Date(nowDate.getTime() - 60_000)
      });
      expect(status).toBe(CampaignStatus.EXPIRED);
    });

    test('EXPIRED fallback for invalid startsAt', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const status = computeCampaignStatus({
        startsAt: 'not-a-date',
        endsAt: new Date(nowDate.getTime() + 60_000)
      });
      expect(status).toBe(CampaignStatus.EXPIRED);
      expect(spy).toHaveBeenCalled();
    });

    test('EXPIRED fallback for invalid endsAt', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const status = computeCampaignStatus({
        startsAt: new Date(nowDate.getTime() - 60_000),
        endsAt: {}
      });
      expect(status).toBe(CampaignStatus.EXPIRED);
      expect(spy).toHaveBeenCalled();
    });

    test('EXPIRED fallback for both invalid dates (both warnings)', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const status = computeCampaignStatus({
        startsAt: 'xxx',
        endsAt: 'yyy'
      });
      expect(status).toBe(CampaignStatus.EXPIRED);
      expect(spy.mock.calls.length).toBeGreaterThanOrEqual(1);
    });

    test('ACTIVE when no dates provided (legacy behavior)', () => {
      const status = computeCampaignStatus({});
      expect(status).toBe(CampaignStatus.ACTIVE);
    });

    test('start > end scenario (non-strict) still returns EXPIRED if end < now', () => {
      const status = computeCampaignStatus({
        startsAt: new Date(nowDate.getTime() + 86_400_000), // +1 day
        endsAt: new Date(nowDate.getTime() - 86_400_000) // -1 day
      });
      expect(status).toBe(CampaignStatus.EXPIRED);
    });

    test('silent option suppresses warnings', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      const status = computeCampaignStatus({
        startsAt: 'invalid-date'
      }, { silent: true });
      expect(status).toBe(CampaignStatus.EXPIRED);
      expect(spy).not.toHaveBeenCalled();
    });

    test('now override respected', () => {
      const customNow = new Date('2024-02-01T00:00:00.000Z');
      const status = computeCampaignStatus({
        startsAt: new Date('2024-02-01T00:00:10.000Z'),
        endsAt: new Date('2024-03-01T00:00:00.000Z'),
        now: customNow
      });
      expect(status).toBe(CampaignStatus.UPCOMING);
    });
  });

  describe('computeCampaignStatus - strict mode', () => {
    test('throws TypeError for invalid startsAt', () => {
      expect(() => computeCampaignStatus({ startsAt: 'bad' }, { strict: true }))
        .toThrow(TypeError);
    });

    test('throws TypeError for invalid endsAt', () => {
      expect(() => computeCampaignStatus({ endsAt: 'nope' }, { strict: true }))
        .toThrow(TypeError);
    });

    test('throws RangeError when startsAt > endsAt', () => {
      const startsAt = new Date(nowDate.getTime() + 86_400_000);
      const endsAt = new Date(nowDate.getTime() - 86_400_000);
      expect(() => computeCampaignStatus({ startsAt, endsAt }, { strict: true }))
        .toThrow(RangeError);
    });

    test('no console.warn emitted when strict throws', () => {
      const spy = jest.spyOn(console, 'warn').mockImplementation(() => {});
      try {
        computeCampaignStatus({ startsAt: 'invalid' }, { strict: true });
      } catch (e) {
        // swallow
      }
      expect(spy).not.toHaveBeenCalled();
    });

    test('valid path still returns ACTIVE', () => {
      const status = computeCampaignStatus({
        startsAt: new Date(nowDate.getTime() - 10_000),
        endsAt: new Date(nowDate.getTime() + 10_000)
      }, { strict: true });
      expect(status).toBe(CampaignStatus.ACTIVE);
    });

    test('UPCOMING in strict', () => {
      const status = computeCampaignStatus({
        startsAt: new Date(nowDate.getTime() + 10_000),
        endsAt: new Date(nowDate.getTime() + 20_000)
      }, { strict: true });
      expect(status).toBe(CampaignStatus.UPCOMING);
    });

    test('EXPIRED in strict', () => {
      const status = computeCampaignStatus({
        startsAt: new Date(nowDate.getTime() - 20_000),
        endsAt: new Date(nowDate.getTime() - 10_000)
      }, { strict: true });
      expect(status).toBe(CampaignStatus.EXPIRED);
    });

    test('PAUSED precedence in strict', () => {
      const status = computeCampaignStatus({
        paused: true,
        startsAt: new Date(nowDate.getTime() - 20_000),
        endsAt: new Date(nowDate.getTime() - 10_000)
      }, { strict: true });
      expect(status).toBe(CampaignStatus.PAUSED);
    });
  });

  describe('helper functions', () => {
    test('isUpcoming', () => {
      expect(isUpcoming(CampaignStatus.UPCOMING)).toBe(true);
      expect(isUpcoming(CampaignStatus.ACTIVE)).toBe(false);
    });
    test('isActive', () => {
      expect(isActive(CampaignStatus.ACTIVE)).toBe(true);
      expect(isActive(CampaignStatus.EXPIRED)).toBe(false);
    });
    test('isPaused', () => {
      expect(isPaused(CampaignStatus.PAUSED)).toBe(true);
      expect(isPaused(CampaignStatus.ACTIVE)).toBe(false);
    });
    test('isExpired', () => {
      expect(isExpired(CampaignStatus.EXPIRED)).toBe(true);
      expect(isExpired(CampaignStatus.UPCOMING)).toBe(false);
    });
  });

  describe('getStatusTimeline', () => {
    test('returns normalized dates and status (non-strict)', () => {
      const startsAt = new Date(nowDate.getTime() - 5_000);
      const endsAt = new Date(nowDate.getTime() + 5_000);
      const timeline = getStatusTimeline({ startsAt, endsAt });
      expect(timeline.status).toBe(CampaignStatus.ACTIVE);
      expect(timeline.startsAt.getTime()).toBe(startsAt.getTime());
      expect(timeline.endsAt.getTime()).toBe(endsAt.getTime());
      expect(timeline.now).toBeInstanceOf(Date);
      expect(timeline.paused).toBe(false);
    });

    test('paused reflected in timeline', () => {
      const timeline = getStatusTimeline({ paused: true });
      expect(timeline.status).toBe(CampaignStatus.PAUSED);
      expect(timeline.paused).toBe(true);
    });

    test('strict timeline throws on invalid input (same rules)', () => {
      expect(() => getStatusTimeline({ startsAt: 'nope' }, { strict: true }))
        .toThrow(TypeError);
    });

    test('timeline consistent with computeCampaignStatus', () => {
      const bounds = {
        startsAt: new Date(nowDate.getTime() + 30_000),
        endsAt: new Date(nowDate.getTime() + 60_000)
      };
      const status = computeCampaignStatus(bounds);
      const timeline = getStatusTimeline(bounds);
      expect(timeline.status).toBe(status);
    });
  });
});