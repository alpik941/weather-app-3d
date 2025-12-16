// Rough moonrise/moonset approximation.
// NOTE: This is a simplified algorithm suitable for UI display, not for navigation.
// Strategy:
// 1. Sample the Moon's hour angle across the day using simplified lunar RA/Dec approximation.
// 2. Detect sign changes of altitude to find rise/set times (linear interpolation).
// 3. Fallback: if no rise or set (e.g., near polar regions), return null for that event.
// Accuracy: Typically within ~15-30 minutes for mid-latitudes; worse at high latitudes.

import { calculateMoonPhase } from './moonPhase';

// Constants
const DEG2RAD = Math.PI / 180;
const RAD2DEG = 180 / Math.PI;
const SIN = Math.sin; const COS = Math.cos; const ASIN = Math.asin; const ATAN2 = Math.atan2; const ACOS = Math.acos;

// Compute Julian Day at 0h UT for date
function julianDayAt0UT(date) {
  return Math.floor((date / 86400000) - 0.5) + 2440588.5; // epoch 1970 to JD
}

// Local sidereal time (approx) in degrees
function localSiderealTime(jd, lonDeg, hoursUT) {
  const T = (jd - 2451545.0) / 36525;
  let theta = 280.46061837 + 360.98564736629 * (jd - 2451545) + 0.000387933 * T * T - T * T * T / 38710000; // deg
  theta += lonDeg; // add longitude (east positive)
  theta += 360.98564736629 * (hoursUT / 24); // progress across the day
  return ((theta % 360) + 360) % 360;
}

// Very rough lunar ecliptic longitude approximation via phase cycle
function approximateLunarEclipticLongitude(date) {
  const { phaseCycle } = calculateMoonPhase(date);
  // New Moon ~ Sun's longitude; assume Sun longitude advances ~360 deg per year => ~0.9856 deg/day
  // We'll anchor a base Sun longitude at J2000 ~ 280 deg (approx) and add days since J2000 * 0.9856
  const daysSinceJ2000 = (date.getTime() - Date.UTC(2000,0,1,12,0,0)) / 86400000;
  const sunLon = (280 + 0.9856474 * daysSinceJ2000) % 360; // deg
  // Moon orbits ~13.176 deg/day relative to stars; relative to Sun adds phase offset
  const moonLon = (sunLon + phaseCycle * 360) % 360;
  return moonLon;
}

// Convert ecliptic longitude (assuming latitude ~0) to equatorial RA/Dec (deg)
function eclipticToEquatorial(lonDeg) {
  const epsilon = 23.4397 * DEG2RAD; // obliquity
  const lon = lonDeg * DEG2RAD;
  const sinLon = SIN(lon);
  const cosLon = COS(lon);
  const ra = ATAN2(cosLon * SIN(epsilon) * sinLon, cosLon) + (sinLon >=0 ? 0 : Math.PI); // simplified; adjust quadrant crudely
  const dec = ASIN(sinLon * SIN(epsilon));
  return { raDeg: ((ra * RAD2DEG) + 360) % 360, decDeg: dec * RAD2DEG };
}

function altitudeOf(raDeg, decDeg, latDeg, lstDeg) {
  const H = (lstDeg - raDeg + 540) % 360 - 180; // hour angle in [-180,180]
  const h = ASIN(SIN(decDeg*DEG2RAD)*SIN(latDeg*DEG2RAD) + COS(decDeg*DEG2RAD)*COS(latDeg*DEG2RAD)*COS(H*DEG2RAD));
  return h * RAD2DEG;
}

export function estimateMoonRiseSet(latDeg, lonDeg, date = new Date()) {
  // Work at each hour, refine with linear interpolation near horizon crossing (0 deg altitude)
  const jd0 = julianDayAt0UT(date);
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth();
  const day = date.getUTCDate();
  const baseDate = new Date(Date.UTC(year, month, day, 0, 0, 0));

  let previousAlt = null;
  let rise = null; let set = null;

  const samples = [];
  for (let hour=0; hour<=24; hour++) {
    const sampleDate = new Date(baseDate.getTime() + hour * 3600000);
    const lonEcl = approximateLunarEclipticLongitude(sampleDate);
    const { raDeg, decDeg } = eclipticToEquatorial(lonEcl);
    const lst = localSiderealTime(jd0, lonDeg, hour);
    const alt = altitudeOf(raDeg, decDeg, latDeg, lst);
    samples.push({ hour, alt });
    if (previousAlt !== null) {
      if (previousAlt < 0 && alt >= 0 && rise === null) {
        // interpolate
        const frac = previousAlt === alt ? 0 : (0 - previousAlt)/(alt - previousAlt);
        rise = hour - 1 + frac;
      }
      if (previousAlt >= 0 && alt < 0 && set === null) {
        const frac = previousAlt === alt ? 0 : (previousAlt - 0)/(previousAlt - alt);
        set = hour - 1 + frac;
      }
    }
    previousAlt = alt;
  }

  function hourFracToDate(hf) {
    if (hf == null) return null;
    const ms = baseDate.getTime() + hf * 3600000;
    return new Date(ms);
  }

  return { moonrise: hourFracToDate(rise), moonset: hourFracToDate(set), samples };
}

export function formatTime(date, locale='en-US', opts={ hour: '2-digit', minute: '2-digit' }) {
  if (!date) return '—';
  try { return date.toLocaleTimeString(locale, opts); } catch { return date.toISOString().substring(11,16); }
}
