// Timezone-aware formatting utilities
// Accepts either a tz identifier (IANA) or numeric offset seconds.

/**
 * Format a UNIX timestamp (seconds) in a specific timezone.
 * @param {number|null|undefined} tsSeconds - Unix timestamp in seconds (UTC reference)
 * @param {string|number|undefined} timezone - IANA timezone string (e.g., 'Europe/Berlin') or offset seconds from UTC
 * @param {Intl.DateTimeFormatOptions} opts - Formatting options
 * @returns {string}
 */
export function formatTimestampTZ(tsSeconds, timezone, opts = { hour: '2-digit', minute: '2-digit' }) {
  if (tsSeconds == null) return '—';
  const ms = tsSeconds * 1000;
  try {
    if (typeof timezone === 'string' && timezone.includes('/')) {
      return new Intl.DateTimeFormat(undefined, { timeZone: timezone, ...opts }).format(new Date(ms));
    }
    // Numeric offset (seconds) fallback
    if (typeof timezone === 'number' && !isNaN(timezone)) {
      const shifted = new Date(ms + timezone * 1000); // shift from UTC by offset seconds
      return new Intl.DateTimeFormat(undefined, { timeZone: 'UTC', ...opts }).format(shifted);
    }
    return new Date(ms).toLocaleTimeString([], opts);
  } catch {
    return new Date(ms).toLocaleTimeString([], opts);
  }
}

/**
 * Format a Date (moonrise/moonset) with timezone if given.
 * Assumes date already in local user timezone; for IANA target, reconstruct.
 */
export function formatDateTZ(dateObj, timezone, opts = { hour: '2-digit', minute: '2-digit' }) {
  if (!dateObj) return '—';
  try {
    if (typeof timezone === 'string' && timezone.includes('/')) {
      return new Intl.DateTimeFormat(undefined, { timeZone: timezone, ...opts }).format(dateObj);
    }
    if (typeof timezone === 'number') {
      const shifted = new Date(dateObj.getTime() + timezone * 1000);
      return new Intl.DateTimeFormat(undefined, { timeZone: 'UTC', ...opts }).format(shifted);
    }
    return dateObj.toLocaleTimeString([], opts);
  } catch {
    return dateObj.toISOString().substring(11,16);
  }
}

/**
 * Unified display function.
 * Accepts either a unix seconds numeric, Date, or ISO string.
 * hour12 preference overrides default locale if provided.
 */
export function getDisplayTime(input, { timezone, hour12, locale, opts } = {}) {
  if (input == null) return '—';
  let date;
  if (typeof input === 'number') {
    // treat as unix seconds if < 1e12 else ms
    if (input < 1e12) date = new Date(input * 1000); else date = new Date(input);
  } else if (input instanceof Date) {
    date = input;
  } else if (typeof input === 'string') {
    const parsed = new Date(input);
    if (!isNaN(parsed)) date = parsed; else return '—';
  } else {
    return '—';
  }
  const baseOpts = { hour: '2-digit', minute: '2-digit', ...opts };
  if (hour12 != null) baseOpts.hour12 = hour12;
  try {
    if (typeof timezone === 'string' && timezone.includes('/')) {
      return new Intl.DateTimeFormat(locale, { timeZone: timezone, ...baseOpts }).format(date);
    }
    if (typeof timezone === 'number') {
      const shifted = new Date(date.getTime() + timezone * 1000);
      return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...baseOpts }).format(shifted);
    }
    return date.toLocaleTimeString(locale || [], baseOpts);
  } catch {
    return date.toISOString().substring(11,16);
  }
}

export function getDisplayDate(input, { timezone, locale, opts } = {}) {
  if (input == null) return '—';
  let date;
  if (typeof input === 'number') {
    if (input < 1e12) date = new Date(input * 1000); else date = new Date(input);
  } else if (input instanceof Date) date = input; else if (typeof input === 'string') {
    const parsed = new Date(input); if (!isNaN(parsed)) date = parsed; else return '—';
  }
  // If caller provides opts, respect them as-is. Otherwise default to Y-M-D.
  const baseOpts = (opts && Object.keys(opts).length > 0)
    ? { ...opts }
    : { year: 'numeric', month: 'short', day: 'numeric' };
  try {
    if (typeof timezone === 'string' && timezone.includes('/')) {
      return new Intl.DateTimeFormat(locale, { timeZone: timezone, ...baseOpts }).format(date);
    }
    if (typeof timezone === 'number' && !isNaN(timezone)) {
      const shifted = new Date(date.getTime() + timezone * 1000);
      return new Intl.DateTimeFormat(locale, { timeZone: 'UTC', ...baseOpts }).format(shifted);
    }
    return new Intl.DateTimeFormat(locale, baseOpts).format(date);
  } catch { return date.toDateString(); }
}

/**
 * Compute a stable day key (YYYY-MM-DD) for a given timestamp/date in a target timezone.
 * Accepts unix seconds, ms, Date, or ISO string.
 * For numeric timezone offset (seconds) shifts the date before extracting components.
 * This is critical for grouping hourly forecasts by the forecast location day rather than user local day.
 * @param {number|Date|string} input
 * @param {string|number|undefined} timezone IANA tz id or offset seconds
 * @returns {string} e.g. '2025-10-05'
 */
export function dayKey(input, timezone) {
  if (input == null) return '';
  let date;
  if (typeof input === 'number') {
    date = input < 1e12 ? new Date(input * 1000) : new Date(input);
  } else if (input instanceof Date) {
    date = new Date(input.getTime());
  } else if (typeof input === 'string') {
    const parsed = new Date(input);
    if (isNaN(parsed)) return '';
    date = parsed;
  } else {
    return '';
  }
  try {
    if (typeof timezone === 'string' && timezone.includes('/')) {
      const parts = new Intl.DateTimeFormat('en-CA', { timeZone: timezone, year: 'numeric', month: '2-digit', day: '2-digit' }).formatToParts(date);
      const y = parts.find(p => p.type === 'year')?.value;
      const m = parts.find(p => p.type === 'month')?.value;
      const d = parts.find(p => p.type === 'day')?.value;
      return `${y}-${m}-${d}`;
    }
    if (typeof timezone === 'number' && !isNaN(timezone)) {
      const shifted = new Date(date.getTime() + timezone * 1000);
      const y = shifted.getUTCFullYear();
      const m = String(shifted.getUTCMonth() + 1).padStart(2, '0');
      const d = String(shifted.getUTCDate()).padStart(2, '0');
      return `${y}-${m}-${d}`;
    }
    // default: derive from local date but convert to ISO-like key
    const y = date.getFullYear();
    const m = String(date.getMonth() + 1).padStart(2, '0');
    const d = String(date.getDate()).padStart(2, '0');
    return `${y}-${m}-${d}`;
  } catch {
    return '';
  }
}

/**
 * Convenience: produce a numeric sortable day start epoch (seconds) for grouping/comparisons in target timezone.
 * This is optional; mainly used if we need ordering without string parsing.
 */
export function dayStartEpoch(input, timezone) {
  const key = dayKey(input, timezone);
  if (!key) return 0;
  try {
    if (typeof timezone === 'string' && timezone.includes('/')) {
      // Interpret key in that timezone by constructing midnight via Date.parse on ISO with Z then adjusting
      // Simpler: get first hour element from formatToParts approach again.
      const [y, m, d] = key.split('-').map(Number);
      // Create date in target timezone by using UTC then later formatting; here approximate by using Date.UTC
      return Math.floor(Date.UTC(y, m - 1, d) / 1000);
    }
    if (typeof timezone === 'number') {
      const [y, m, d] = key.split('-').map(Number);
      return Math.floor((Date.UTC(y, m - 1, d) - timezone * 1000) / 1000);
    }
    return Math.floor(new Date(key).getTime() / 1000);
  } catch { return 0; }
}
