import { describe, it, expect, vi, beforeEach, afterEach } from 'vitest';
import { parseDate } from '@/lib/form/util';

describe('parseDate parser', () => {
  let originalDate: DateConstructor;

  beforeEach(() => {
    // Mock current date to September 14, 2025 for consistent testing
    originalDate = global.Date;
    vi.useFakeTimers();
    vi.setSystemTime(new Date('2025-09-14T12:00:00.000Z'));
  });

  afterEach(() => {
    vi.useRealTimers();
  });

  describe('valid date inputs', () => {
    it('should accept valid ISO date format', () => {
      const result = parseDate('2025-09-14');

      expect(result).toEqual({ value: '2025-09-14' });
      expect('error' in result).toBe(false);
    });

    it('should accept past dates', () => {
      const result = parseDate('2025-09-13');

      expect(result).toEqual({ value: '2025-09-13' });
      expect('error' in result).toBe(false);
    });

    it('should accept today as valid', () => {
      const result = parseDate('2025-09-14');

      expect(result).toEqual({ value: '2025-09-14' });
      expect('error' in result).toBe(false);
    });

    it('should accept dates from previous months', () => {
      const result = parseDate('2025-08-15');

      expect(result).toEqual({ value: '2025-08-15' });
      expect('error' in result).toBe(false);
    });

    it('should accept dates from previous years', () => {
      const result = parseDate('2024-09-14');

      expect(result).toEqual({ value: '2024-09-14' });
      expect('error' in result).toBe(false);
    });
  });

  describe('invalid date inputs', () => {
    it('should reject empty string', () => {
      const result = parseDate('');

      expect(result).toEqual({
        value: undefined,
        error: 'Date is required'
      });
    });

    it('should reject null input', () => {
      const result = parseDate(null);

      expect(result).toEqual({
        value: undefined,
        error: 'Date is required'
      });
    });

    it('should reject future dates', () => {
      const result = parseDate('2025-09-15');

      expect(result).toEqual({
        value: undefined,
        error: 'Cannot create entries for future dates'
      });
    });

    it('should reject invalid date format (MM/DD/YYYY)', () => {
      const result = parseDate('09/14/2025');

      expect(result).toEqual({
        value: undefined,
        error: 'Date must be in YYYY-MM-DD format'
      });
    });

    it('should reject invalid date format (DD-MM-YYYY)', () => {
      const result = parseDate('14-09-2025');

      expect(result).toEqual({
        value: undefined,
        error: 'Date must be in YYYY-MM-DD format'
      });
    });

    it('should reject invalid date format (YYYY/MM/DD)', () => {
      const result = parseDate('2025/09/14');

      expect(result).toEqual({
        value: undefined,
        error: 'Date must be in YYYY-MM-DD format'
      });
    });

    it('should reject incomplete date formats', () => {
      const result = parseDate('2025-09');

      expect(result).toEqual({
        value: undefined,
        error: 'Date must be in YYYY-MM-DD format'
      });
    });

    it('should reject non-date strings', () => {
      const result = parseDate('not-a-date');

      expect(result).toEqual({
        value: undefined,
        error: 'Date must be in YYYY-MM-DD format'
      });
    });

    it('should reject invalid dates that match format (Feb 30)', () => {
      const result = parseDate('2025-02-30');

      expect(result).toEqual({
        value: undefined,
        error: 'Invalid date'
      });
    });

    it('should reject invalid dates that match format (month 13)', () => {
      const result = parseDate('2025-13-01');

      expect(result).toEqual({
        value: undefined,
        error: 'Invalid date'
      });
    });

    it('should reject dates with invalid day (day 32)', () => {
      const result = parseDate('2025-09-32');

      expect(result).toEqual({
        value: undefined,
        error: 'Invalid date'
      });
    });
  });

  describe('edge cases', () => {
    it('should handle leap year dates correctly (valid)', () => {
      // Mock date to leap year for testing
      vi.setSystemTime(new Date('2024-03-01T12:00:00.000Z'));

      const result = parseDate('2024-02-29');

      expect(result).toEqual({ value: '2024-02-29' });
      expect('error' in result).toBe(false);
    });

    it('should handle leap year dates correctly (invalid in non-leap year)', () => {
      // Mock date to non-leap year
      vi.setSystemTime(new Date('2025-03-01T12:00:00.000Z'));

      const result = parseDate('2025-02-29');

      expect(result).toEqual({
        value: undefined,
        error: 'Invalid date'
      });
    });

    it('should handle year boundaries correctly', () => {
      // Test December 31st
      vi.setSystemTime(new Date('2025-01-01T12:00:00.000Z'));

      const result = parseDate('2024-12-31');

      expect(result).toEqual({ value: '2024-12-31' });
      expect('error' in result).toBe(false);
    });

    it('should handle month boundaries correctly', () => {
      // Test end of month
      vi.setSystemTime(new Date('2025-02-01T12:00:00.000Z'));

      const result = parseDate('2025-01-31');

      expect(result).toEqual({ value: '2025-01-31' });
      expect('error' in result).toBe(false);
    });
  });

  describe('parser contract compliance', () => {
    it('should return Field<string> type structure', () => {
      const validResult = parseDate('2025-09-14');
      const invalidResult = parseDate('invalid');

      // Valid result should have value property, no error
      expect(validResult).toHaveProperty('value');
      expect(validResult).not.toHaveProperty('error');

      // Invalid result should have error property, undefined value
      expect(invalidResult).toHaveProperty('error');
      expect(invalidResult).toHaveProperty('value');
      expect(invalidResult.value).toBeUndefined();
    });

    it('should accept HTMLInputElement["value"] type input', () => {
      // This tests the FieldParser<string> contract
      const inputValue: string = '2025-09-14';
      const result = parseDate(inputValue);

      expect(result).toEqual({ value: '2025-09-14' });
    });

    it('should handle null input (HTMLInputElement.value can be null)', () => {
      const result = parseDate(null);

      expect(result).toEqual({
        value: undefined,
        error: 'Date is required'
      });
    });
  });
});
