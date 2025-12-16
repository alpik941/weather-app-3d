// Weather visualization gating helpers
// Define conditions that should hide celestial visuals
const HIDE_CONDITIONS = new Set(['Clouds', 'Rain', 'Snow', 'Fog', 'Mist', 'Dust', 'Drizzle', 'Thunderstorm']);

export const isDaytime = (currentMs, sunriseMs, sunsetMs) => {
  if (typeof sunriseMs === 'number' && typeof sunsetMs === 'number') {
    return currentMs >= sunriseMs && currentMs <= sunsetMs;
  }
  const h = new Date(currentMs || Date.now()).getHours();
  return h >= 6 && h < 18;
};

export const shouldShowSun = ({ currentMs = Date.now(), sunriseMs, sunsetMs, weather }) => {
  const day = isDaytime(currentMs, sunriseMs, sunsetMs);
  return day && weather === 'Clear';
};

export const shouldShowMoon = ({ currentMs = Date.now(), sunriseMs, sunsetMs, weather }) => {
  const day = isDaytime(currentMs, sunriseMs, sunsetMs);
  return !day && weather === 'Clear';
};

export const shouldShowStars = ({ currentMs = Date.now(), sunriseMs, sunsetMs, weather }) => {
  const day = isDaytime(currentMs, sunriseMs, sunsetMs);
  return !day && weather === 'Clear';
};

export const isAdverseWeather = (weather) => HIDE_CONDITIONS.has(weather);
