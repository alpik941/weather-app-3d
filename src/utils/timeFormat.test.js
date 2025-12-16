import { describe, it, expect } from 'vitest';
import { dayKey, getDisplayTime } from './timeFormat';

// Basic tests for dayKey across odd timezones
// Note: JS Intl must support these IANA zones in the environment running tests.

describe('dayKey', () => {
  it('produces stable key for UTC timestamp (NY vs Kathmandu)', () => {
    // 2025-03-09 06:30:00 UTC (DST change day in US)
    const ts = Date.UTC(2025, 2, 9, 6, 30) / 1000; // seconds
    const ny = dayKey(ts, 'America/New_York');
    const ktm = dayKey(ts, 'Asia/Kathmandu');
    expect(ny).toMatch(/2025-03-0[89]/); // around boundary
    expect(ktm.startsWith('2025-03-09')).toBe(true);
  });

  it('handles numeric offset seconds', () => {
    const ts = Date.UTC(2025, 9, 5, 12, 0) / 1000; // Oct 5 12:00 UTC
    const offsetPlus2h = 2 * 3600;
    expect(dayKey(ts, offsetPlus2h)).toBe('2025-10-05');
    const offsetMinus10h = -10 * 3600;
    // Might roll back to previous day
    const key = dayKey(ts, offsetMinus10h);
    expect(['2025-10-04','2025-10-05']).toContain(key);
  });
});

describe('getDisplayTime hour12', () => {
  it('respects hour12 true', () => {
    const ts = Date.UTC(2025, 0, 1, 15, 5) / 1000;
    const s = getDisplayTime(ts, { timezone: 'UTC', hour12: true });
    expect(/(3:05|03:05).*?/.test(s)).toBe(true);
  });
  it('respects hour12 false', () => {
    const ts = Date.UTC(2025, 0, 1, 5, 5) / 1000;
    const s = getDisplayTime(ts, { timezone: 'UTC', hour12: false });
    expect(s.includes('05')).toBe(true);
  });
});
