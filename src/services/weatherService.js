// Web-only weather services (Vite). Removed React Native cross-platform layer.
// Environment keys (Vite)
const WEATHERAPI_KEY = import.meta.env.VITE_WEATHERAPI_KEY;
const OPENWEATHER_API_KEY = import.meta.env.VITE_OPENWEATHER_API_KEY;

// Provider base URLs
const WEATHERAPI_BASE_URL = 'https://api.weatherapi.com/v1';
const OPENWEATHER_BASE_URL = 'https://api.openweathermap.org/data/2.5';
const SUNRISE_SUNSET_BASE_URL = 'https://api.sunrisesunset.io/json';

// --- helpers ---
const convertUTCToTimestamp = (iso) => {
  try {
    if (!iso) return Math.floor(Date.now() / 1000);
    const d = new Date(iso);
    return isNaN(d.getTime()) ? Math.floor(Date.now() / 1000) : Math.floor(d.getTime() / 1000);
  } catch {
    return Math.floor(Date.now() / 1000);
  }
};

const normalizeCondition = (text, ctx = {}) => {
  const description = (text || '').toLowerCase();
  const visKm = typeof ctx.visKm === 'number' ? ctx.visKm : undefined;
  const cloud = typeof ctx.cloud === 'number' ? ctx.cloud : undefined;
  const isObscuration = /(fog|mist|haze|smoke)/i.test(description);
  if (isObscuration && (visKm != null && visKm >= 9) && (cloud != null && cloud <= 20)) {
    return { main: 'Clear', description: 'clear' };
  }
  let main;
  if (/(thunder)/i.test(description)) main = 'Thunderstorm';
  else if (/(rain|drizzle)/i.test(description)) main = 'Rain';
  else if (/(snow|sleet)/i.test(description)) main = 'Snow';
  else if (/(overcast)/i.test(description)) main = 'Clouds';
  else if (/(cloud)/i.test(description)) main = 'Clouds';
  else if (/(fog|mist|haze|smoke)/i.test(description)) main = 'Fog';
  else main = 'Clear';
  return { main, description };
};

// Sunrise/Sunset helper (fallback to parsing local provider strings)
export const getSunriseSunsetData = async (lat, lon) => {
  try {
    const res = await fetch(`${SUNRISE_SUNSET_BASE_URL}?lat=${lat}&lng=${lon}`);
    if (!res.ok) throw new Error('sunrise-sunset failed');
    const data = await res.json();
    const toISO = (s) => {
      // API returns local civil time; keep as ISO string for downstream conversion
      return new Date(s).toISOString();
    };
    return {
      sunrise: toISO(data.results.sunrise),
      sunset: toISO(data.results.sunset),
      solar_noon: toISO(data.results.solar_noon),
    };
  } catch (e) {
    console.warn('SunriseSunset fallback:', e);
    return null;
  }
};

const convertWeatherApiToWeatherData = async (data) => {
  const today = data.forecast.forecastday[0];
  const sunData = await getSunriseSunsetData(data.location.lat, data.location.lon);
  let sunrise; let sunset; let solarNoon;
  if (sunData) {
    sunrise = convertUTCToTimestamp(sunData.sunrise);
    sunset = convertUTCToTimestamp(sunData.sunset);
    solarNoon = convertUTCToTimestamp(sunData.solar_noon);
  } else {
    const parseTime = (timeStr, date) => {
      try {
        const [time, period] = timeStr.split(' ');
        let [hours, minutes] = time.split(':').map(Number);
        if (period === 'PM' && hours !== 12) hours += 12;
        if (period === 'AM' && hours === 12) hours = 0;
        const d = new Date(date);
        d.setHours(hours, minutes, 0, 0);
        return Math.floor(d.getTime() / 1000);
      } catch { return Math.floor(Date.now() / 1000); }
    };
    sunrise = parseTime(today.astro.sunrise, today.date);
    sunset = parseTime(today.astro.sunset, today.date);
  }
  const condNow = normalizeCondition(data.current.condition.text, { visKm: data.current.vis_km, cloud: data.current.cloud });
  return {
    name: data.location.name,
    sys: { country: data.location.country, sunrise, sunset, solar_noon: solarNoon, tz_id: data.location.tz_id },
    timezone: data.location.tz_id,
    main: {
      temp: data.current.temp_c,
      feels_like: data.current.feelslike_c,
      temp_min: data.forecast.forecastday[0].day.mintemp_c,
      temp_max: data.forecast.forecastday[0].day.maxtemp_c,
      humidity: data.current.humidity,
      pressure: data.current.pressure_mb,
    },
    weather: [{
      main: condNow.main,
      description: condNow.description,
      icon: data.current.condition.icon,
    }],
    wind: { speed: data.current.wind_kph / 3.6, deg: data.current.wind_degree },
    visibility: data.current.vis_km * 1000,
    clouds: { all: data.current.cloud },
    coord: { lat: data.location.lat, lon: data.location.lon },
    uv: typeof data.current?.uv === 'number' ? data.current.uv : undefined,
  };
};

/**
 * Normalize US EPA category text key from index value 1-6
 * @param {number} idx
 * @returns {'good'|'moderate'|'usg'|'unhealthy'|'veryUnhealthy'|'hazardous'}
 */
const usEpaCategory = (idx) => {
  switch (idx) {
    case 1: return 'good';
    case 2: return 'moderate';
    case 3: return 'usg'; // Unhealthy for Sensitive Groups
    case 4: return 'unhealthy';
    case 5: return 'veryUnhealthy';
    case 6: return 'hazardous';
    default: return 'moderate';
  }
};

/**
 * Map OpenWeather 1-5 AQI to US-like categories
 * @param {number} idx
 * @returns {'good'|'moderate'|'usg'|'unhealthy'|'veryUnhealthy'|'hazardous'}
 */
const owCategory = (idx) => {
  switch (idx) {
    case 1: return 'good';
    case 2: return 'moderate'; // OW "fair" ~ moderate
    case 3: return 'usg';
    case 4: return 'unhealthy';
    case 5: return 'veryUnhealthy';
    default: return 'moderate';
  }
};

/**
 * Get Air Quality Index and components for coordinates
 * Uses WeatherAPI.com first (us-epa-index), falls back to OpenWeather Air Pollution API.
 * @param {number} lat
 * @param {number} lon
 * @returns {Promise<import('../types/weather.js').AirQuality|null>}
 */
export const getAirQuality = async (lat, lon) => {
  try {
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&days=1&aqi=yes&alerts=no`
    );
    if (!response.ok) throw new Error('AQI via WeatherAPI not found');
    const data = await response.json();
    const aq = data?.current?.air_quality || {};
    const idx = Number(aq['us-epa-index'] || aq['us_epa_index'] || 0);
    const components = {
      pm2_5: aq.pm2_5 != null ? Number(aq.pm2_5) : undefined,
      pm10: aq.pm10 != null ? Number(aq.pm10) : undefined,
      o3: aq.o3 != null ? Number(aq.o3) : undefined,
      no2: aq.no2 != null ? Number(aq.no2) : undefined,
      so2: aq.so2 != null ? Number(aq.so2) : undefined,
      co: aq.co != null ? Number(aq.co) : undefined,
    };
    return {
      source: 'weatherapi',
      index: { scale: 'us-epa', value: idx || 0, category: usEpaCategory(idx || 0) },
      components,
      dt: typeof data.current?.last_updated_epoch === 'number' ? data.current.last_updated_epoch : undefined
    };
  } catch (e) {
    // fallback to OpenWeather
    try {
      const url = `${OPENWEATHER_BASE_URL}/air_pollution?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}`;
      const res = await fetch(url);
      if (!res.ok) throw new Error('OpenWeather AQI not available');
      const ow = await res.json();
      const item = Array.isArray(ow?.list) && ow.list.length ? ow.list[0] : null;
      if (!item) throw new Error('No air pollution list');
      const idx = Number(item.main?.aqi || 0); // 1-5
      return {
        source: 'openweather',
        index: { scale: 'openweather', value: idx, category: owCategory(idx) },
        components: {
          pm2_5: item.components?.pm2_5,
          pm10: item.components?.pm10,
          o3: item.components?.o3,
          no2: item.components?.no2,
          so2: item.components?.so2,
          co: item.components?.co,
        },
        dt: typeof item.dt === 'number' ? item.dt : undefined,
      };
    } catch (fallbackErr) {
      console.warn('Air quality service unavailable:', fallbackErr);
      return null;
    }
  }
};

/**
 * Get current weather data for a city
 * @param {string} city - City name
 * @param {string} units - Temperature units ('metric' or 'imperial')
 * @returns {Promise<WeatherData>} Weather data
 */
export const getWeatherData_legacy = async (city, units = 'metric') => {
  try {
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${city}&days=1&aqi=no&alerts=no`
    );
    if (!response.ok) throw new Error('Weather data not found');
    const data = await response.json();
    return await convertWeatherApiToWeatherData(data);
  } catch (error) {
    console.error('WeatherAPI.com failed, falling back to OpenWeatherMap:', error);
    // Fallback to OpenWeatherMap
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/weather?q=${city}&appid=${OPENWEATHER_API_KEY}&units=${units}`
    );
    if (!response.ok) throw new Error('Weather data not found');
    return await response.json();
  }
};

// Web API: expose unified names expected by the app
export const getWeatherData = async (city, units = 'metric') => {
  return getWeatherData_legacy(city, units);
};

/**
 * Get forecast data for a city
 * @param {string} city - City name
 * @param {string} units - Temperature units ('metric' or 'imperial')
 * @returns {Promise<ForecastData>} Forecast data
 */
export const getForecastData_legacy = async (city, units = 'metric') => {
  try {
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${city}&days=5&aqi=no&alerts=no`
    );
    if (!response.ok) {
      console.warn('WeatherAPI.com forecast failed, falling back to OpenWeatherMap');
      // Fallback to OpenWeatherMap
      const fallbackResponse = await fetch(
        `${OPENWEATHER_BASE_URL}/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=${units}`
      );
      if (!fallbackResponse.ok) throw new Error('Forecast data not found');
      const owData = await fallbackResponse.json();
      console.info('[Forecast] Provider=OpenWeatherMap, days=5 (fixed window)');
      // Attach timezone if possible (OpenWeather provides city.timezone seconds offset)
      try {
        if (owData?.city) {
          owData.city.timezone_offset_seconds = owData.city.timezone;
          // OpenWeather doesn't give IANA tz id; leave undefined for consistency
        }
      } catch {}
      return owData;
    }
    const data = await response.json();
    
    // Convert WeatherAPI.com forecast to OpenWeatherMap format
    const forecastList = [];
    for (const day of data.forecast.forecastday) {
      for (let hour = 0; hour < 24; hour += 3) { // Every 3 hours like OpenWeatherMap
        const hourData = day.hour[hour];
        if (hourData) {
          const norm = normalizeCondition(hourData.condition.text, { visKm: hourData.vis_km, cloud: hourData.cloud });
          forecastList.push({
            // Prefer provided epoch (seconds) to avoid local timezone interpretation issues
            dt: typeof hourData.time_epoch === 'number' ? hourData.time_epoch : Math.floor(new Date(hourData.time).getTime() / 1000),
            main: {
              temp: hourData.temp_c,
              temp_min: hourData.temp_c - 2,
              temp_max: hourData.temp_c + 2,
              humidity: hourData.humidity
            },
            weather: [{
              main: norm.main,
              description: norm.description,
              icon: hourData.condition.icon
            }],
            wind: {
              speed: hourData.wind_kph / 3.6
            },
            dt_txt: hourData.time,
            timezone: data.location.tz_id // propagate IANA tz id for downstream formatting
          });
        }
      }
    }
    // Count unique calendar days present
    const uniqueDays = new Set(
      forecastList.map((it) => new Date(it.dt * 1000).toDateString())
    ).size;

    if (uniqueDays < 5) {
      // WeatherAPI key likely limited to <5 days. Fallback to OpenWeather 5-day API.
      console.warn(`WeatherAPI.com returned ${uniqueDays} days (<5). Falling back to OpenWeatherMap 5-day.`);
      const fallbackResponse = await fetch(
        `${OPENWEATHER_BASE_URL}/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=${units}`
      );
      if (fallbackResponse.ok) {
        const owData = await fallbackResponse.json();
        console.info(`[Forecast] Provider=OpenWeatherMap, days=5 (fixed window)`);
        return owData;
      }
      // If fallback also fails, proceed with what we have
      console.warn('OpenWeatherMap fallback failed, using partial WeatherAPI data');
    } else {
      console.info(`[Forecast] Provider=WeatherAPI.com, days=${uniqueDays}`);
    }

    return {
      list: forecastList,
      city: {
        name: data.location.name,
        country: data.location.country,
        timezone: data.location.tz_id
      },
      timezone: data.location.tz_id
    };
  } catch (error) {
    console.error('WeatherAPI.com forecast failed, falling back to OpenWeatherMap:', error);
    // Fallback to OpenWeatherMap
    const response = await fetch(
      `${OPENWEATHER_BASE_URL}/forecast?q=${city}&appid=${OPENWEATHER_API_KEY}&units=${units}`
    );
    if (!response.ok) throw new Error('Forecast data not found');
    const owData = await response.json();
    console.info('[Forecast] Provider=OpenWeatherMap (error fallback), days=5 (fixed window)');
    return owData;
  }
};

export const getForecastData = async (city, units = 'metric') => {
  return getForecastData_legacy(city, units);
};

/**
 * Get hourly forecast data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Temperature units
 * @returns {Promise<HourlyForecast>} Hourly forecast data
 */
export const getHourlyForecast = async (lat, lon, units = 'metric') => {
  try {
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&days=3&aqi=no&alerts=no`
    );
    if (!response.ok) throw new Error('Hourly forecast not found');
    const data = await response.json();
    
    // Convert WeatherAPI.com hourly data to our format
    const hourlyData = [];
    for (const day of data.forecast.forecastday) {
      for (const hour of day.hour) {
        const norm = normalizeCondition(hour.condition.text, { visKm: hour.vis_km, cloud: hour.cloud });
        hourlyData.push({
          dt: typeof hour.time_epoch === 'number' ? hour.time_epoch : Math.floor(new Date(hour.time).getTime() / 1000),
          temp: hour.temp_c,
          feels_like: hour.feelslike_c,
          humidity: hour.humidity,
          weather: [{
            main: norm.main,
            description: norm.description,
            icon: hour.condition.icon
          }],
          wind_speed: hour.wind_kph / 3.6,
          pop: hour.chance_of_rain / 100,
          timezone: data.location.tz_id
        });
      }
    }
    
    return { hourly: hourlyData, timezone: data.location.tz_id };
  } catch (error) {
    console.warn('WeatherAPI.com hourly forecast not available:', error);
    return { hourly: [], timezone: undefined };
  }
};

/**
 * Get weekly forecast data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Temperature units
 * @returns {Promise<Object>} Weekly forecast data
 */
export const getWeeklyForecast = async (lat, lon, units = 'metric') => {
  try {
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&days=7&aqi=no&alerts=no`
    );
    if (!response.ok) throw new Error('Weekly forecast not found');
    const data = await response.json();
    
    // Convert WeatherAPI.com daily data to our format
    const dailyData = data.forecast.forecastday.map((day) => {
      const norm = normalizeCondition(day.day.condition.text);
      return ({
      dt: typeof day.date_epoch === 'number' ? day.date_epoch : Math.floor(new Date(day.date).getTime() / 1000),
      temp: {
        min: day.day.mintemp_c,
        max: day.day.maxtemp_c
      },
      weather: [{
        main: norm.main,
        description: norm.description,
        icon: day.day.condition.icon
      }],
      humidity: day.day.avghumidity,
      wind_speed: day.day.maxwind_kph / 3.6,
      pop: day.day.daily_chance_of_rain / 100,
      timezone: data.location.tz_id
    });
    });
    const dayCount = dailyData.length;
    if (dayCount >= 7) {
      console.info(`[Weekly] Provider=WeatherAPI.com, days=${dayCount}`);
      return { daily: dailyData, timezone: data.location.tz_id };
    }
    console.warn(`[Weekly] WeatherAPI.com returned ${dayCount} days (<7). Falling back to Open‑Meteo.`);
    throw new Error('Insufficient WeatherAPI weekly days');
  } catch (error) {
    console.warn('WeatherAPI.com weekly forecast not available or insufficient:', error);
    // Fallback: Open-Meteo 7-day daily forecast
    try {
      const params = new URLSearchParams({
        latitude: String(lat),
        longitude: String(lon),
        timezone: 'auto',
        forecast_days: '7',
        daily: [
          'weathercode',
          'temperature_2m_max',
          'temperature_2m_min',
          'wind_speed_10m_max',
          'precipitation_probability_max'
        ].join(',') ,
        // Units: keep celsius; request wind speed in m/s
        wind_speed_unit: 'ms',
        temperature_unit: 'celsius'
      });
      const omResponse = await fetch(`https://api.open-meteo.com/v1/forecast?${params.toString()}`);
      if (!omResponse.ok) throw new Error('Open-Meteo weekly forecast not found');
      const om = await omResponse.json();

      // Map Open-Meteo weather codes to our schema
      const codeToMainDesc = (code) => {
        // Based on Open-Meteo WMO weather codes
        const map = {
          0: ['Clear', 'clear sky'],
          1: ['Clouds', 'mainly clear'],
          2: ['Clouds', 'partly cloudy'],
          3: ['Clouds', 'overcast'],
          45: ['Fog', 'fog'],
          48: ['Fog', 'depositing rime fog'],
          51: ['Rain', 'light drizzle'],
          53: ['Rain', 'moderate drizzle'],
          55: ['Rain', 'dense drizzle'],
          56: ['Rain', 'light freezing drizzle'],
          57: ['Rain', 'dense freezing drizzle'],
          61: ['Rain', 'slight rain'],
          63: ['Rain', 'moderate rain'],
          65: ['Rain', 'heavy rain'],
          66: ['Rain', 'light freezing rain'],
          67: ['Rain', 'heavy freezing rain'],
          71: ['Snow', 'slight snow'],
          73: ['Snow', 'moderate snow'],
          75: ['Snow', 'heavy snow'],
          77: ['Snow', 'snow grains'],
          80: ['Rain', 'rain showers'],
          81: ['Rain', 'heavy rain showers'],
          82: ['Rain', 'violent rain showers'],
          85: ['Snow', 'snow showers'],
          86: ['Snow', 'heavy snow showers'],
          95: ['Thunderstorm', 'thunderstorm'],
          96: ['Thunderstorm', 'thunderstorm with hail'],
          99: ['Thunderstorm', 'heavy thunderstorm with hail']
        };
        return map[code] || ['Clear', 'clear'];
      };

      const times = om.daily?.time || [];
      const tmin = om.daily?.temperature_2m_min || [];
      const tmax = om.daily?.temperature_2m_max || [];
      const wind = om.daily?.wind_speed_10m_max || [];
      const pop = om.daily?.precipitation_probability_max || [];
      const codes = om.daily?.weathercode || [];

      const daily = times.map((dateStr, i) => {
          const [main, desc] = codeToMainDesc(codes[i]);
        return {
          dt: Math.floor(new Date(dateStr).getTime() / 1000),
          temp: { min: tmin[i], max: tmax[i] },
          weather: [{ main, description: desc, icon: '' }],
          humidity: undefined,
          wind_speed: typeof wind[i] === 'number' ? wind[i] : 0,
          pop: typeof pop[i] === 'number' ? pop[i] / 100 : 0,
          timezone: om?.timezone || om?.timezone_abbreviation // best-effort
        };
      }).slice(0, 7);

      console.info(`[Weekly] Provider=Open-Meteo, days=${daily.length}`);
      return { daily, timezone: om?.timezone };
    } catch (fallbackErr) {
      console.error('Open-Meteo weekly fallback failed:', fallbackErr);
      return { daily: [], timezone: undefined };
    }
  }
};

/**
 * Get weather alerts
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @returns {Promise<WeatherAlert[]>} Weather alerts
 */
export const getWeatherAlerts = async (lat, lon) => {
  try {
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&days=1&aqi=no&alerts=yes`
    );
    if (!response.ok) {
      console.warn('Weather alerts not available for this location');
      return [];
    }
    const data = await response.json();
    
    if (!data.alerts || !data.alerts.alert) {
      return [];
    }
    
    return data.alerts.alert.map((alert) => ({
      sender_name: alert.headline || 'Weather Service',
      event: alert.event || alert.headline,
      start: new Date(alert.effective).getTime() / 1000,
      end: new Date(alert.expires).getTime() / 1000,
      description: alert.desc || alert.instruction,
      tags: alert.areas ? alert.areas.split(';') : []
    }));
  } catch (error) {
    console.warn('Weather alerts service unavailable:', error);
    return [];
  }
};

/**
 * Get activity forecast data
 * @param {number} lat - Latitude
 * @param {number} lon - Longitude
 * @param {string} units - Temperature units
 * @returns {Promise<ActivityForecast>} Activity forecast data
 */
export const getActivityForecast = async (lat, lon, units = 'metric') => {
  try {
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&days=1&aqi=yes&alerts=no`
    );
    if (!response.ok) throw new Error('Activity forecast not found');
    const data = await response.json();

    const current = data.current;
    const today = data.forecast.forecastday[0];

    const calculateActivityScore = (activity) => {
      const temp = current.temp_c;
      const humidity = current.humidity;
      const windSpeed = current.wind_kph;
      const precipitation = today.day.daily_chance_of_rain;
      const uvIndex = current.uv;

      switch (activity) {
        case 'pollen':
          return Math.max(0, 100 - (windSpeed * 2) - (precipitation * 0.5));
        case 'fishing':
          return Math.max(0, 80 - (windSpeed * 1) - (precipitation * 0.3));
        case 'waterRecreation':
          return temp > 20 ? Math.max(0, 90 - (precipitation * 0.4)) : 30;
        case 'gardening':
          return Math.max(0, 85 - (precipitation * 0.35) - (windSpeed * 1.5));
        case 'running':
          return temp > 5 && temp < 25 ? Math.max(0, 90 - (precipitation * 0.5)) : 50;
        case 'golf':
          return Math.max(0, 85 - (precipitation * 0.4) - (windSpeed * 1.2));
        case 'hunting':
          return Math.max(0, 75 - (precipitation * 0.25) - (windSpeed * 0.8));
        case 'kayaking':
          return Math.max(0, 80 - (precipitation * 0.3) - (windSpeed * 1.5));
        case 'yachting':
          return windSpeed > 5 && windSpeed < 40 ? Math.max(0, 85 - (precipitation * 0.35)) : 40;
        case 'clothing': {
          let clothingScore = 100;
          if (temp < 0) clothingScore -= 40;
          else if (temp < 10) clothingScore -= 25;
          else if (temp < 15) clothingScore -= 15;
          else if (temp > 30) clothingScore -= 20;
          else if (temp > 35) clothingScore -= 35;
          clothingScore -= windSpeed * 1.5;
          if (humidity > 80) clothingScore -= 15;
          else if (humidity > 70) clothingScore -= 10;
          clothingScore -= precipitation * 0.4;
          return Math.max(0, clothingScore);
        }
        default:
          return 50;
      }
    };

    return {
      pollen: {
        score: calculateActivityScore('pollen'),
        description: 'Pollen levels and air quality conditions',
        recommendation: calculateActivityScore('pollen') > 70 ? 'Good conditions' : 'Consider precautions'
      },
      fishing: {
        score: calculateActivityScore('fishing'),
        description: 'Weather conditions for fishing',
        recommendation: calculateActivityScore('fishing') > 70 ? 'Great fishing weather' : 'Fair conditions'
      },
      waterRecreation: {
        score: calculateActivityScore('waterRecreation'),
        description: 'Conditions for water activities',
        recommendation: calculateActivityScore('waterRecreation') > 70 ? 'Perfect for water sports' : 'Check conditions'
      },
      gardening: {
        score: calculateActivityScore('gardening'),
        description: 'Garden and vegetable garden conditions',
        recommendation: calculateActivityScore('gardening') > 70 ? 'Great for gardening' : 'Indoor activities recommended'
      },
      running: {
        score: calculateActivityScore('running'),
        description: 'Running and outdoor exercise conditions',
        recommendation: calculateActivityScore('running') > 70 ? 'Perfect running weather' : 'Consider indoor exercise'
      },
      golf: {
        score: calculateActivityScore('golf'),
        description: 'Golf playing conditions',
        recommendation: calculateActivityScore('golf') > 70 ? 'Excellent golf weather' : 'Check course conditions'
      },
      hunting: {
        score: calculateActivityScore('hunting'),
        description: 'Hunting conditions and visibility',
        recommendation: calculateActivityScore('hunting') > 70 ? 'Good hunting conditions' : 'Limited visibility'
      },
      kayaking: {
        score: calculateActivityScore('kayaking'),
        description: 'Kayaking and paddling conditions',
        recommendation: calculateActivityScore('kayaking') > 70 ? 'Great for kayaking' : 'Calm waters recommended'
      },
      yachting: {
        score: calculateActivityScore('yachting'),
        description: 'Sailing and yachting conditions',
        recommendation: calculateActivityScore('yachting') > 70 ? 'Perfect sailing weather' : 'Check wind conditions'
      },
      clothing: {
        score: calculateActivityScore('clothing'),
        description: 'Clothing comfort and recommendations',
        recommendation: (() => {
          const temp = data.current.temp_c;
          if (temp < 0) return 'Heavy winter coat, gloves, hat required';
          if (temp < 10) return 'Warm jacket, long pants, closed shoes';
          if (temp < 15) return 'Light jacket or sweater recommended';
          if (temp < 20) return 'Long sleeves or light layers';
          if (temp < 25) return 'Comfortable in light clothing';
          if (temp < 30) return 'Light, breathable fabrics recommended';
          return 'Minimal clothing, stay hydrated';
        })()
      }
    };
  } catch (error) {
    console.warn('WeatherAPI.com activity data not available, using default values');
    // Return default activity scores as fallback
    return {
      pollen: { score: 50, description: 'Pollen data unavailable', recommendation: 'Check local conditions' },
      fishing: { score: 50, description: 'Fishing data unavailable', recommendation: 'Check local conditions' },
      waterRecreation: { score: 50, description: 'Water recreation data unavailable', recommendation: 'Check local conditions' },
      gardening: { score: 50, description: 'Gardening data unavailable', recommendation: 'Check local conditions' },
      running: { score: 50, description: 'Running data unavailable', recommendation: 'Check local conditions' },
      golf: { score: 50, description: 'Golf data unavailable', recommendation: 'Check local conditions' },
      hunting: { score: 50, description: 'Hunting data unavailable', recommendation: 'Check local conditions' },
      kayaking: { score: 50, description: 'Kayaking data unavailable', recommendation: 'Check local conditions' },
      yachting: { score: 50, description: 'Yachting data unavailable', recommendation: 'Check local conditions' },
      clothing: { score: 50, description: 'Clothing data unavailable', recommendation: 'Check local conditions' }
    };
  }
};

/**
 * Get user's current location
 * @returns {Promise<{lat: number, lon: number}>} Location coordinates
 */
export const getCurrentLocation = () => {
  return new Promise((resolve, reject) => {
    if (!navigator.geolocation) {
      reject(new Error('Geolocation is not supported'));
      return;
    }

    navigator.geolocation.getCurrentPosition(
      (position) => {
        resolve({
          lat: position.coords.latitude,
          lon: position.coords.longitude
        });
      },
      (error) => {
        reject(new Error('Failed to get location'));
      },
      {
        enableHighAccuracy: true,
        timeout: 10000,
        maximumAge: 300000
      }
    );
  });
};

/**
 * Get current weather by coordinates
 * @param {number} lat
 * @param {number} lon
 * @param {'metric'|'imperial'} units
 */
export const getWeatherDataByCoords = async (lat, lon, units = 'metric') => {
  try {
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&days=1&aqi=no&alerts=no`
    );
    if (response.ok) {
      const data = await response.json();
      return await convertWeatherApiToWeatherData(data);
    }
  } catch {}
  // Fallback OpenWeatherMap
  const res = await fetch(
    `${OPENWEATHER_BASE_URL}/weather?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=${units}`
  );
  if (!res.ok) throw new Error('Weather by coords not found');
  return await res.json();
};

/**
 * Get 5-day forecast by coordinates (3-hourly list)
 * @param {number} lat
 * @param {number} lon
 * @param {'metric'|'imperial'} units
 */
export const getForecastDataByCoords = async (lat, lon, units = 'metric') => {
  try {
    // WeatherAPI free tier provides up to 3 days. We'll still try and convert; backfill handled in UI.
    const response = await fetch(
      `${WEATHERAPI_BASE_URL}/forecast.json?key=${WEATHERAPI_KEY}&q=${lat},${lon}&days=5&aqi=no&alerts=no`
    );
    if (response.ok) {
      const data = await response.json();
      // Reuse existing conversion path from getForecastData
      const tmpCity = `${lat},${lon}`;
      // Build list similarly to city path
      const forecastList = [];
      for (const day of data.forecast.forecastday) {
        for (let hour = 0; hour < 24; hour += 3) {
          const hourData = day.hour[hour];
          if (hourData) {
            const norm = normalizeCondition(hourData.condition.text, { visKm: hourData.vis_km, cloud: hourData.cloud });
            forecastList.push({
              dt: typeof hourData.time_epoch === 'number' ? hourData.time_epoch : Math.floor(new Date(hourData.time).getTime() / 1000),
              main: { temp: hourData.temp_c, temp_min: hourData.temp_c - 2, temp_max: hourData.temp_c + 2, humidity: hourData.humidity },
              weather: [{ main: norm.main, description: norm.description, icon: hourData.condition.icon }],
              wind: { speed: hourData.wind_kph / 3.6 },
              dt_txt: hourData.time,
              timezone: data.location.tz_id
            });
          }
        }
      }
      return { list: forecastList, city: { name: tmpCity, country: data.location.country, timezone: data.location.tz_id }, timezone: data.location.tz_id };
    }
  } catch {}
  // Fallback OpenWeatherMap 5-day
  const res = await fetch(
    `${OPENWEATHER_BASE_URL}/forecast?lat=${lat}&lon=${lon}&appid=${OPENWEATHER_API_KEY}&units=${units}`
  );
  if (!res.ok) throw new Error('Forecast by coords not found');
  return await res.json();
};

/**
 * Convert temperature between units
 * from/to: 'celsius' | 'fahrenheit'
 */
export const convertTemperature = (temp, from, to) => {
  if (from === to) return temp;
  if (from === 'celsius' && to === 'fahrenheit') return (temp * 9) / 5 + 32;
  if (from === 'fahrenheit' && to === 'celsius') return ((temp - 32) * 5) / 9;
  return temp;
};

/**
 * Format temperature for display with degree symbol and unit letter
 * unit: 'celsius' | 'fahrenheit'
 * value: number (in the source unit context)
 * Returns: e.g., '20° C' or '20° F'
 */
export const formatTemperatureDisplay = (unit, value) => {
  const suffix = unit === 'fahrenheit' ? 'F' : 'C';
  const rounded = Math.round(Number(value));
  return `${rounded}°${suffix}`;
};