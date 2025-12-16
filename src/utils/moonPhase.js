// Approximate but more physical moon phase calculations
// Returns object: {
//   illumination: 0..1 (physical fractional illumination, based on phase angle),
//   simpleIllumination: 0..1 (legacy cosine model),
//   ageDays, phaseCycle:0..1, waxing:boolean, name:string,
//   phaseAngleDeg: degrees (0 = full, 180 = new)
// }
// Synodic month average length:
const SYNODIC_MONTH = 29.530588853;

// Phase name thresholds (cycle: 0=new, 0.5=full, 1=back to new)
const PHASE_NAMES = [
  { key: 'new', at: 0 },
  { key: 'waxing_crescent', at: 0.03 },
  { key: 'first_quarter', at: 0.25 },
  { key: 'waxing_gibbous', at: 0.35 },
  { key: 'full', at: 0.5 },
  { key: 'waning_gibbous', at: 0.65 },
  { key: 'last_quarter', at: 0.75 },
  { key: 'waning_crescent', at: 0.97 }
];

function getPhaseName(cycle) {
  let name = 'new';
  for (let i = 0; i < PHASE_NAMES.length; i++) {
    if (cycle >= PHASE_NAMES[i].at) name = PHASE_NAMES[i].key;
  }
  return name;
}

// Convert date to Julian Day (UTC) using Meeus algorithm
function toJulianDay(date) {
  const year = date.getUTCFullYear();
  const month = date.getUTCMonth() + 1; // 1-12
  const day = date.getUTCDate() + (date.getUTCHours() + (date.getUTCMinutes() + date.getUTCSeconds() / 60) / 60) / 24;
  let Y = year;
  let M = month;
  if (M <= 2) { Y -= 1; M += 12; }
  const A = Math.floor(Y / 100);
  const B = 2 - A + Math.floor(A / 4);
  const JD = Math.floor(365.25 * (Y + 4716)) + Math.floor(30.6001 * (M + 1)) + day + B - 1524.5;
  return JD;
}

// Compute phase angle (degrees) using simplified series (Meeus Chap 48 approximation)
function computePhaseAngleDegrees(jd) {
  const T = (jd - 2451545.0) / 36525; // Julian centuries since J2000.0
  const D = normalizeAngle(297.8501921 + 445267.1114034 * T - 0.0018819 * T * T + T * T * T / 545868 - T * T * T * T / 113065000); // mean elongation of the Moon
  const M = normalizeAngle(357.5291092 + 35999.0502909 * T - 0.0001536 * T * T + T * T * T / 24490000); // Sun's mean anomaly
  const Mp = normalizeAngle(134.9633964 + 477198.8675055 * T + 0.0087414 * T * T + T * T * T / 69699 - T * T * T * T / 14712000); // Moon's mean anomaly
  // Phase angle i (deg)
  const i = 180 - D - 6.289 * Math.sin(deg2rad(Mp)) + 2.100 * Math.sin(deg2rad(M)) - 1.274 * Math.sin(deg2rad(2 * D - Mp))
    - 0.658 * Math.sin(deg2rad(2 * D)) - 0.214 * Math.sin(deg2rad(2 * Mp)) - 0.110 * Math.sin(deg2rad(D));
  return normalizeAngle(i);
}

function deg2rad(d) { return d * Math.PI / 180; }
function normalizeAngle(a) { return ((a % 360) + 360) % 360; }

export function calculateMoonPhase(date = new Date()) {
  // Legacy cycle & age using base reference (Meeus new moon reference): 2000-01-06 18:14 UT
  const base = Date.UTC(2000, 0, 6, 18, 14, 0);
  const now = date.getTime();
  const daysSince = (now - base) / 86400000;
  const age = daysSince % SYNODIC_MONTH; // lunar age in days
  const phaseCycle = (age / SYNODIC_MONTH + 1) % 1; // 0=new..1

  // Simple cosine illumination (legacy)
  const simpleIllumination = 0.5 * (1 - Math.cos(2 * Math.PI * phaseCycle));

  // Physical illumination via phase angle
  const jd = toJulianDay(date);
  const phaseAngleDeg = computePhaseAngleDegrees(jd); // 0=Full, 180=New (by formula design after normalization)
  // Adjust so that 0 corresponds to New for consistency with phaseCycle: invert
  // However: standard fractional illumination k = (1 + cos(i))/2 where i=phase angle (Sun-Earth-Moon)
  const illumination = (1 + Math.cos(deg2rad(phaseAngleDeg))) / 2;

  // Determine waxing from phaseCycle (kept), though alternative: use derivative of illumination.
  const waxing = phaseCycle < 0.5;
  const name = getPhaseName(phaseCycle);

  return { illumination, simpleIllumination, ageDays: age, phaseCycle, waxing, name, phaseAngleDeg };
}

export function moonPhaseForLocation(lat, lon, date = new Date()) {
  // Placeholder: currently location-independent (parallax & libration ignored)
  return calculateMoonPhase(date);
}
