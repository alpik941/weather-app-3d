import { useEffect, useState } from 'react';
import { moonPhaseForLocation } from '../utils/moonPhase';
import { estimateMoonRiseSet } from '../utils/moonRiseSet';

/**
 * useMoonPhase
 * Returns { illumination, simpleIllumination, ageDays, phaseCycle, waxing, name, phaseAngleDeg, moonrise, moonset, loading, error }
 * If lat/lon not supplied and geolocation enabled, attempts browser geolocation (optional).
 */
export default function useMoonPhase({ lat, lon, autoLocate = false, refreshInterval = 60_000 } = {}) {
  const [phase, setPhase] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    let active = true;
    function compute() {
      try {
        const result = moonPhaseForLocation(lat, lon);
        let moonrise = null, moonset = null;
        try {
          if (lat != null && lon != null) {
            const rs = estimateMoonRiseSet(lat, lon, new Date());
            moonrise = rs.moonrise; moonset = rs.moonset;
          }
        } catch {}
        if (active) {
          setPhase({ ...result, moonrise, moonset });
          setLoading(false);
        }
      } catch (e) {
        if (active) {
          setError(e);
          setLoading(false);
        }
      }
    }

    if (lat != null && lon != null) {
      compute();
    } else if (autoLocate && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (pos) => {
          if (!active) return;
            const { latitude, longitude } = pos.coords;
            const result = moonPhaseForLocation(latitude, longitude);
            let moonrise = null, moonset = null;
            try {
              const rs = estimateMoonRiseSet(latitude, longitude, new Date());
              moonrise = rs.moonrise; moonset = rs.moonset;
            } catch {}
            setPhase({ ...result, moonrise, moonset });
            setLoading(false);
        },
        (err) => {
          if (active) {
            setError(err);
            setLoading(false);
          }
        },
        { enableHighAccuracy: false, maximumAge: 600000, timeout: 8000 }
      );
    } else {
      // fallback: compute generic
      compute();
    }

    const id = setInterval(compute, refreshInterval);
    return () => { active = false; clearInterval(id); };
  }, [lat, lon, autoLocate, refreshInterval]);

  return { ...(phase || {}), loading, error };
}
