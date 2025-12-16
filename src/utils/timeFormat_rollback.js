// Snapshot of previous basic time formatting (rollback version)
export function basicFormatTime(input, { locale, opts } = {}) {
  if (input == null) return '—';
  let date;
  if (typeof input === 'number') date = input < 1e12 ? new Date(input * 1000) : new Date(input); else if (input instanceof Date) date = input; else if (typeof input === 'string') date = new Date(input); else return '—';
  if (isNaN(date)) return '—';
  const base = { hour: '2-digit', minute: '2-digit', ...(opts || {}) };
  try { return date.toLocaleTimeString(locale || [], base); } catch { return date.toISOString().substring(11,16); }
}
export function basicFormatDate(input, { locale, opts } = {}) {
  if (input == null) return '—';
  let date;
  if (typeof input === 'number') date = input < 1e12 ? new Date(input * 1000) : new Date(input); else if (input instanceof Date) date = input; else if (typeof input === 'string') date = new Date(input); else return '—';
  if (isNaN(date)) return '—';
  try { return date.toLocaleDateString(locale, opts && Object.keys(opts).length ? opts : undefined); } catch { return date.toDateString(); }
}