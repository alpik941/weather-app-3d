import { describe, it, expect } from 'vitest';
import { calculateMoonPhase } from './moonPhase';

// We approximate dates by offsetting from known base new moon (2000-01-06 18:14 UT)
// Age targets (days): new=0, first_quarter≈7.38, full≈14.77, last_quarter≈22.15
// We'll construct dates by adding milliseconds to the base and then check name/illumination proximity.

const BASE = Date.UTC(2000,0,6,18,14,0);
const DAY_MS = 86400000;

function dateFromAge(ageDays) { return new Date(BASE + ageDays * DAY_MS); }

// Helper to find illumination near expected fraction with tolerance
function within(val, target, tol) { return Math.abs(val - target) <= tol; }

describe('calculateMoonPhase boundary phases', () => {
  it('detects new moon near age 0', () => {
    const res = calculateMoonPhase(new Date(BASE));
    expect(res.name).toBe('new');
    expect(res.illumination).toBeLessThan(0.05);
  });

  it('detects first quarter (~0.25 cycle)', () => {
    const d = dateFromAge(29.530588853 * 0.25);
    const res = calculateMoonPhase(d);
    expect(['waxing_crescent','first_quarter']).toContain(res.name);
    expect(within(res.phaseCycle,0.25,0.03)).toBe(true);
  });

  it('detects full moon (~0.5 cycle)', () => {
    const d = dateFromAge(29.530588853 * 0.5);
    const res = calculateMoonPhase(d);
    expect(['full','waxing_gibbous','waning_gibbous']).toContain(res.name);
    expect(within(res.phaseCycle,0.5,0.03)).toBe(true);
    expect(res.illumination).toBeGreaterThan(0.9);
  });

  it('detects last quarter (~0.75 cycle)', () => {
    const d = dateFromAge(29.530588853 * 0.75);
    const res = calculateMoonPhase(d);
    expect(['waning_gibbous','last_quarter','waning_crescent']).toContain(res.name);
    expect(within(res.phaseCycle,0.75,0.03)).toBe(true);
  });
});
