// Weather data type definitions for JSDoc comments

/**
 * @typedef {Object} WeatherData
 * @property {string} name
 * @property {Object} sys
 * @property {string} sys.country
 * @property {number} sys.sunrise
 * @property {number} sys.sunset
 * @property {number} [sys.solar_noon]
 * @property {Object} main
 * @property {number} main.temp
 * @property {number} main.feels_like
 * @property {number} main.temp_min
 * @property {number} main.temp_max
 * @property {number} main.humidity
 * @property {number} main.pressure
 * @property {Array<Object>} weather
 * @property {string} weather[].main
 * @property {string} weather[].description
 * @property {string} weather[].icon
 * @property {Object} wind
 * @property {number} wind.speed
 * @property {number} wind.deg
 * @property {number} visibility
 * @property {Object} clouds
 * @property {number} clouds.all
 * @property {Object} coord
 * @property {number} coord.lat
 * @property {number} coord.lon
 * @property {number} [uv] // UV index if available
 */

/**
 * @typedef {Object} ForecastItem
 * @property {number} dt
 * @property {Object} main
 * @property {number} main.temp
 * @property {number} main.temp_min
 * @property {number} main.temp_max
 * @property {number} main.humidity
 * @property {Array<Object>} weather
 * @property {string} weather[].main
 * @property {string} weather[].description
 * @property {string} weather[].icon
 * @property {Object} wind
 * @property {number} wind.speed
 * @property {string} dt_txt
 */

/**
 * @typedef {Object} ForecastData
 * @property {Array<ForecastItem>} list
 * @property {Object} city
 * @property {string} city.name
 * @property {string} city.country
 */

/**
 * @typedef {Object} HourlyForecastItem
 * @property {number} dt
 * @property {number} temp
 * @property {number} feels_like
 * @property {number} humidity
 * @property {Array<Object>} weather
 * @property {string} weather[].main
 * @property {string} weather[].description
 * @property {string} weather[].icon
 * @property {number} wind_speed
 * @property {number} pop
 */

/**
 * @typedef {Object} HourlyForecast
 * @property {Array<HourlyForecastItem>} hourly
 */

/**
 * @typedef {Object} WeatherAlert
 * @property {string} sender_name
 * @property {string} event
 * @property {number} start
 * @property {number} end
 * @property {string} description
 * @property {Array<string>} tags
 * @property {('red'|'orange'|'yellow')} [severity='yellow'] Alert severity level
 *   - 'red': Most severe (tornado, hurricane, extreme weather)
 *   - 'orange': Moderate to high (heavy snow/rain/wind, ice storm)
 *   - 'yellow': Lower severity (snow/wind advisory, fog warning)
 */

/**
 * @typedef {Object} DailyForecastItem
 * @property {number} dt
 * @property {Object} temp
 * @property {number} temp.min
 * @property {number} temp.max
 * @property {Array<Object>} weather
 * @property {string} weather[].main
 * @property {string} weather[].description
 * @property {string} weather[].icon
 * @property {number} humidity
 * @property {number} wind_speed
 * @property {number} pop
 */

/**
 * @typedef {Object} ActivityCondition
 * @property {number} score
 * @property {string} description
 * @property {string} recommendation
 */

/**
 * @typedef {Object} ActivityForecast
 * @property {ActivityCondition} pollen
 * @property {ActivityCondition} fishing
 * @property {ActivityCondition} waterRecreation
 * @property {ActivityCondition} gardening
 * @property {ActivityCondition} running
 * @property {ActivityCondition} golf
 * @property {ActivityCondition} hunting
 * @property {ActivityCondition} kayaking
 * @property {ActivityCondition} yachting
 */

export {};

/**
 * @typedef {Object} AirQualityIndex
 * @property {('us-epa'|'openweather')} scale
 * @property {number} value
 * @property {('good'|'moderate'|'usg'|'unhealthy'|'veryUnhealthy'|'hazardous')} category
 */

/**
 * @typedef {Object} AirQuality
 * @property {('weatherapi'|'openweather')} source
 * @property {AirQualityIndex} index
 * @property {Object} components
 * @property {number} [components.pm2_5]
 * @property {number} [components.pm10]
 * @property {number} [components.o3]
 * @property {number} [components.no2]
 * @property {number} [components.so2]
 * @property {number} [components.co]
 * @property {number} [dt] // Unix timestamp (seconds)
 */