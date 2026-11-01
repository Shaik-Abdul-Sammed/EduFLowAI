/**
 * Centralized formatting and safe data rendering utilities for EduFlow AI.
 * Prevents DOM text leaks (undefined, NaN, null, [object Object]),
 * enforces Indian currency formatting (e.g., ₹1,50,000),
 * and standardizes user-friendly dates (e.g., "Oct 22, 2026").
 */

/**
 * Safely format an amount into Indian Rupee currency string with commas.
 * Example: 150000 -> "₹1,50,000"
 */
export function formatCurrency(amount, fallback = '₹0') {
  if (amount === null || amount === undefined || amount === '') return fallback;
  const num = Number(amount);
  if (isNaN(num)) return fallback;
  try {
    return `₹${num.toLocaleString('en-IN')}`;
  } catch {
    return `₹${num}`;
  }
}

/**
 * Safely format a date into a localized human-friendly string (e.g. "Oct 22, 2026").
 * Replaces raw ISO strings like 2026-10-22T00:00:00Z.
 */
export function formatDate(dateInput, fallback = 'N/A') {
  if (!dateInput) return fallback;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric'
    }).format(d);
  } catch {
    return fallback;
  }
}

/**
 * Safely format date and time (e.g., "Oct 22, 2026, 04:30 PM").
 */
export function formatDateTime(dateInput, fallback = 'N/A') {
  if (!dateInput) return fallback;
  const d = new Date(dateInput);
  if (isNaN(d.getTime())) return fallback;
  try {
    return new Intl.DateTimeFormat('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: 'numeric',
      minute: '2-digit',
      hour12: true
    }).format(d);
  } catch {
    return fallback;
  }
}

/**
 * Prevents screen leaks of undefined, null, NaN, or [object Object].
 */
export function safeText(val, fallback = 'N/A') {
  if (val === null || val === undefined) return fallback;
  if (typeof val === 'number' && isNaN(val)) return fallback;
  if (typeof val === 'object') {
    return fallback;
  }
  const str = String(val).trim();
  if (str === '' || str === 'undefined' || str === 'null' || str === 'NaN' || str === '[object Object]') {
    return fallback;
  }
  return str;
}
