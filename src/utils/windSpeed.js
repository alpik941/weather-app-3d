/**
 * @typedef {'ms' | 'kmh' | 'mph' | 'kn' | 'points'} WindSpeedUnit
 */

/**
 * Convert wind speed from m/s to specified unit
 * @param {number} speedMs - Wind speed in meters per second
 * @param {WindSpeedUnit} toUnit - Target unit
 * @returns {number} Converted wind speed
 */
export const convertWindSpeed = (speedMs, toUnit) => {
  switch (toUnit) {
    case 'ms':
      return speedMs;
    case 'kmh':
      return speedMs * 3.6;
    case 'mph':
      return speedMs * 2.237;
    case 'kn':
      return speedMs * 1.944;
    case 'points':
      return windSpeedToBeaufort(speedMs);
    default:
      return speedMs;
  }
};

/**
 * Format a wind speed value (already in target unit) with consistent rounding:
 * - m/s & km/h: 1 decimal if < 10, else no decimals
  export const convertWindSpeed = (speedMs, toUnit) => {
 * - points (Beaufort): integer
 * - Always trims trailing zeros
 * @param {number} rawMs - original speed in m/s
 * @param {WindSpeedUnit} unit - target unit
 * @returns {string}
 */
export const formatWindSpeed = (rawMs, unit) => {
  const value = convertWindSpeed(rawMs, unit);
  if (unit === 'points') return String(value);
  let rounded;
  switch (unit) {
    case 'ms':
    case 'kmh':
      rounded = value < 10 ? value.toFixed(1) : Math.round(value).toString();
      break;
    case 'mph':
    case 'kn':
      rounded = value < 20 ? value.toFixed(1) : Math.round(value).toString();
      break;
    default:
      rounded = value.toFixed(1);
  }
  // Remove trailing .0
  if (rounded.includes('.')) {
    rounded = rounded.replace(/\.0$/, '');
  }
  return rounded;
};

/**
 * Get wind speed unit display string
 * @param {WindSpeedUnit} unit - Wind speed unit
 * @returns {string} Unit display string
 */
export const getWindSpeedUnit = (unit) => {
  switch (unit) {
    case 'ms':
      return 'm/s';
    case 'kmh':
      return 'km/h';
    case 'mph':
      return 'mph';
    case 'kn':
      return 'kn';
    case 'points':
      return 'pts';
    default:
      return 'm/s';
  }
};

/**
 * Convert wind speed to Beaufort scale
 * @param {number} speedMs - Wind speed in m/s
 * @returns {number} Beaufort scale value (0-12)
 */
const windSpeedToBeaufort = (speedMs) => {
  if (speedMs < 0.3) return 0;
  if (speedMs < 1.6) return 1;
  if (speedMs < 3.4) return 2;
  if (speedMs < 5.5) return 3;
  if (speedMs < 8.0) return 4;
  if (speedMs < 10.8) return 5;
  if (speedMs < 13.9) return 6;
  if (speedMs < 17.2) return 7;
  if (speedMs < 20.8) return 8;
  if (speedMs < 24.5) return 9;
  if (speedMs < 28.5) return 10;
  if (speedMs < 32.7) return 11;
  return 12;
};