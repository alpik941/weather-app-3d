import { describe, it, expect } from 'vitest';
import { validateWarning, filterWarningsBySeverity, sortWarningsBySeverity, normalizeAlertsForDisplay } from '../services/weatherService';

describe('Warning Validation', () => {
  describe('validateWarning', () => {
    it('should validate a correct warning object', () => {
      const warning = {
        level: 'yellow',
        event: 'Snowfall Warning',
        description: 'Heavy snow expected',
        start: 1735468800,
        end: 1735497600,
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject warning without level', () => {
      const warning = {
        event: 'Snowfall Warning',
        description: 'Heavy snow expected',
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing warning level');
    });

    it('should reject invalid severity level', () => {
      const warning = {
        level: 'purple',
        event: 'Snowfall Warning',
        description: 'Heavy snow expected',
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Invalid warning level'))).toBe(true);
    });

    it('should reject warning without event', () => {
      const warning = {
        level: 'yellow',
        description: 'Heavy snow expected',
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing event title');
    });

    it('should reject warning without description', () => {
      const warning = {
        level: 'yellow',
        event: 'Snowfall Warning',
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Missing description');
    });

    it('should reject warning with empty event string', () => {
      const warning = {
        level: 'yellow',
        event: '   ',
        description: 'Heavy snow expected',
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('non-empty string'))).toBe(true);
    });

    it('should reject invalid timestamp', () => {
      const warning = {
        level: 'yellow',
        event: 'Snowfall Warning',
        description: 'Heavy snow expected',
        start: -100,
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('positive Unix timestamp'))).toBe(true);
    });

    it('should reject start time >= end time', () => {
      const warning = {
        level: 'yellow',
        event: 'Snowfall Warning',
        description: 'Heavy snow expected',
        start: 1735497600,
        end: 1735468800,
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(false);
      expect(result.errors.some((e) => e.includes('Start time must be before end time'))).toBe(true);
    });

    it('should accept optional fields', () => {
      const warning = {
        level: 'orange',
        event: 'Heavy Snow Warning',
        description: 'Heavy snow with strong winds',
        tags: ['Ottawa', 'Eastern Ontario'],
        sender_name: 'Environment Canada',
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(true);
      expect(result.errors).toHaveLength(0);
    });

    it('should reject invalid tags (not array)', () => {
      const warning = {
        level: 'yellow',
        event: 'Snowfall Warning',
        description: 'Heavy snow expected',
        tags: 'not-an-array',
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('Tags must be an array');
    });

    it('should reject non-string tags', () => {
      const warning = {
        level: 'yellow',
        event: 'Snowfall Warning',
        description: 'Heavy snow expected',
        tags: ['Ottawa', 123],
      };
      const result = validateWarning(warning);
      expect(result.isValid).toBe(false);
      expect(result.errors).toContain('All tags must be strings');
    });

    it('should handle null or undefined warning', () => {
      const result1 = validateWarning(null);
      expect(result1.isValid).toBe(false);
      expect(result1.errors).toContain('Warning must be a valid object');

      const result2 = validateWarning(undefined);
      expect(result2.isValid).toBe(false);
      expect(result2.errors).toContain('Warning must be a valid object');
    });
  });

  describe('filterWarningsBySeverity', () => {
    const warnings = [
      { level: 'yellow', event: 'Snowfall', description: 'Light snow' },
      { level: 'orange', event: 'Heavy Snow', description: 'Heavy snow' },
      { level: 'red', event: 'Tornado', description: 'Tornado warning' },
      { level: 'yellow', event: 'Wind', description: 'Strong wind' },
    ];

    it('should filter by single severity level', () => {
      const result = filterWarningsBySeverity(warnings, 'yellow');
      expect(result).toHaveLength(2);
      expect(result.every((w) => w.level === 'yellow')).toBe(true);
    });

    it('should filter by multiple severity levels', () => {
      const result = filterWarningsBySeverity(warnings, ['red', 'orange']);
      expect(result).toHaveLength(2);
      expect(result.every((w) => ['red', 'orange'].includes(w.level))).toBe(true);
    });

    it('should return empty array if no matches', () => {
      const result = filterWarningsBySeverity(warnings, 'purple');
      expect(result).toHaveLength(0);
    });

    it('should handle non-array input', () => {
      const result = filterWarningsBySeverity(null, 'yellow');
      expect(result).toEqual([]);
    });
  });

  describe('sortWarningsBySeverity', () => {
    const warnings = [
      { level: 'yellow', event: 'Snowfall', description: 'Light snow' },
      { level: 'orange', event: 'Heavy Snow', description: 'Heavy snow' },
      { level: 'red', event: 'Tornado', description: 'Tornado warning' },
      { level: 'yellow', event: 'Wind', description: 'Strong wind' },
    ];

    it('should sort by severity (red > orange > yellow)', () => {
      const result = sortWarningsBySeverity(warnings);
      expect(result[0].level).toBe('red');
      expect(result[1].level).toBe('orange');
      expect(result[2].level).toBe('yellow');
      expect(result[3].level).toBe('yellow');
    });

    it('should preserve order within same severity', () => {
      const result = sortWarningsBySeverity(warnings);
      const yellowWarnings = result.filter((w) => w.level === 'yellow');
      expect(yellowWarnings[0].event).toBe('Snowfall');
      expect(yellowWarnings[1].event).toBe('Wind');
    });

    it('should not mutate original array', () => {
      const original = [...warnings];
      sortWarningsBySeverity(warnings);
      expect(warnings).toEqual(original);
    });

    it('should handle empty array', () => {
      const result = sortWarningsBySeverity([]);
      expect(result).toEqual([]);
    });

    it('should handle null/undefined', () => {
      const result1 = sortWarningsBySeverity(null);
      expect(result1).toEqual([]);

      const result2 = sortWarningsBySeverity(undefined);
      expect(result2).toEqual([]);
    });
  });

  describe('normalizeAlertsForDisplay', () => {
    it('filters ended alerts and keeps only active ones', () => {
      const now = 2_000;
      const alerts = [
        { event: 'Snowfall Warning', description: 'Ended', severity: 'yellow', start: 1_000, end: 1_500 },
        { event: 'Snowfall Warning', description: 'Active', severity: 'yellow', start: 1_800, end: 3_000 },
      ];

      const result = normalizeAlertsForDisplay(alerts, { nowSeconds: now });
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('Active');
    });

    it('filters upcoming alerts (start > now)', () => {
      const now = 2_000;
      const alerts = [
        { event: 'Snowfall Warning', description: 'Upcoming', severity: 'yellow', start: 2_500, end: 3_000 },
      ];

      const result = normalizeAlertsForDisplay(alerts, { nowSeconds: now });
      expect(result).toEqual([]);
    });

    it('deduplicates by phenomenon type and prefers higher severity', () => {
      const now = 2_000;
      const alerts = [
        { event: 'Snowfall Warning', description: 'y', severity: 'yellow', start: 1_000, end: 3_000 },
        { event: 'Snowfall Warning', description: 'o', severity: 'orange', start: 1_000, end: 2_500 },
      ];

      const result = normalizeAlertsForDisplay(alerts, { nowSeconds: now });
      expect(result).toHaveLength(1);
      expect(result[0].severity).toBe('orange');
    });

    it('deduplicates by phenomenon type and prefers later end when same severity', () => {
      const now = 2_000;
      const alerts = [
        { event: 'Snowfall Warning', description: 'short', severity: 'yellow', start: 1_000, end: 2_500 },
        { event: 'Snowfall Warning', description: 'long', severity: 'yellow', start: 1_000, end: 4_000 },
      ];

      const result = normalizeAlertsForDisplay(alerts, { nowSeconds: now });
      expect(result).toHaveLength(1);
      expect(result[0].description).toBe('long');
    });
  });
});
