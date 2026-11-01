import { formatCurrency, formatDate, formatDateTime, safeText } from '../formatters';

describe('formatters utility', () => {
  describe('formatCurrency', () => {
    it('formats numbers into Indian rupee currency format with commas', () => {
      expect(formatCurrency(150000)).toBe('₹1,50,000');
      expect(formatCurrency(49000)).toBe('₹49,000');
      expect(formatCurrency(0)).toBe('₹0');
    });

    it('handles numeric strings properly', () => {
      expect(formatCurrency('2500000')).toBe('₹25,00,000');
    });

    it('returns fallback for invalid inputs', () => {
      expect(formatCurrency(null)).toBe('₹0');
      expect(formatCurrency(undefined)).toBe('₹0');
      expect(formatCurrency('abc', '₹0')).toBe('₹0');
    });
  });

  describe('formatDate', () => {
    it('formats ISO date strings to human-readable month day year', () => {
      const formatted = formatDate('2026-10-22T00:00:00Z');
      expect(formatted).toMatch(/Oct 22, 2026/);
    });

    it('handles invalid or empty dates with fallback', () => {
      expect(formatDate(null)).toBe('N/A');
      expect(formatDate(undefined)).toBe('N/A');
      expect(formatDate('invalid-date')).toBe('N/A');
    });
  });

  describe('formatDateTime', () => {
    it('formats datetime strings with time component', () => {
      const formatted = formatDateTime('2026-10-22T10:30:00Z');
      expect(formatted).toContain('2026');
      expect(formatted).toContain('Oct');
    });

    it('handles invalid dates with fallback', () => {
      expect(formatDateTime(null)).toBe('N/A');
      expect(formatDateTime('invalid')).toBe('N/A');
    });
  });

  describe('safeText', () => {
    it('returns text if valid', () => {
      expect(safeText('Hello')).toBe('Hello');
      expect(safeText(123)).toBe('123');
    });

    it('guards against null, undefined, NaN, and [object Object]', () => {
      expect(safeText(null)).toBe('N/A');
      expect(safeText(undefined)).toBe('N/A');
      expect(safeText(NaN)).toBe('N/A');
      expect(safeText('[object Object]')).toBe('N/A');
      expect(safeText({})).toBe('N/A');
    });
  });
});
