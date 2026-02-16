import React, { useEffect, useState, useRef } from 'react';
import { motion } from 'framer-motion';
import { MapPin, X, Layers, Calendar, Play, Pause, SkipForward, SkipBack } from 'lucide-react';
import { useTime } from '../contexts/TimeContext';

export default function WeatherMap({ isOpen, onClose, lat, lon, city }) {
  const { formatTime, formatDate } = useTime();
  const [mapLayer, setMapLayer] = useState('temp');
  const [forecastMode, setForecastMode] = useState(false);
  const [currentFrame, setCurrentFrame] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [zoom, setZoom] = useState(8);
  const intervalRef = useRef(null);

  const apiBase = import.meta.env.VITE_API_BASE_URL || '/api';

  // Weather layer configurations
  const weatherLayers = {
    temp: {
      name: 'Temperature',
      url: `${apiBase}/openweather-tile/map/temp_new/{z}/{x}/{y}.png`,
      description: 'Temperature overlay'
    },
    precipitation: {
      name: 'Precipitation',
      url: `${apiBase}/openweather-tile/map/precipitation_new/{z}/{x}/{y}.png`,
      description: 'Precipitation intensity'
    },
    wind: {
      name: 'Wind',
      url: `${apiBase}/openweather-tile/map/wind_new/{z}/{x}/{y}.png`,
      description: 'Wind speed and direction'
    },
    clouds: {
      name: 'Clouds',
      url: `${apiBase}/openweather-tile/map/clouds_new/{z}/{x}/{y}.png`,
      description: 'Cloud coverage'
    },
    pressure: {
      name: 'Pressure',
      url: `${apiBase}/openweather-tile/map/pressure_new/{z}/{x}/{y}.png`,
      description: 'Atmospheric pressure'
    }
  };

  // Forecast frames (timestamps for animation)
  const forecastFrames = Array.from({ length: 8 }, (_, i) => {
    const now = new Date();
    now.setHours(now.getHours() + i * 3); // Every 3 hours
    const ts = Math.floor(now.getTime() / 1000);
    return {
      timestamp: ts,
      label: formatTime(ts, { opts: { hour: '2-digit', minute: '2-digit' } }),
      date: formatDate(ts, { opts: { month: 'short', day: 'numeric' } })
    };
  });

  // Animation controls
  useEffect(() => {
    if (isPlaying && forecastMode) {
      intervalRef.current = setInterval(() => {
        setCurrentFrame(prev => (prev + 1) % forecastFrames.length);
      }, 1000);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isPlaying, forecastMode, forecastFrames.length]);

  const togglePlayback = () => {
    setIsPlaying(!isPlaying);
  };

  const nextFrame = () => {
    setCurrentFrame(prev => (prev + 1) % forecastFrames.length);
  };

  const prevFrame = () => {
    setCurrentFrame(prev => (prev - 1 + forecastFrames.length) % forecastFrames.length);
  };

  const getCurrentMapUrl = () => {
    const baseUrl = `https://openweathermap.org/weathermap`;
    const params = new URLSearchParams({
      basemap: 'map',
      cities: 'true',
      layer: mapLayer,
      lat: lat.toString(),
      lon: lon.toString(),
      zoom: zoom.toString()
    });

    if (forecastMode && forecastFrames[currentFrame]) {
      params.append('date', forecastFrames[currentFrame].timestamp.toString());
    }

    return `${baseUrl}?${params.toString()}`;
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Backdrop */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/50 z-40"
        onClick={onClose}
      />

      {/* Map Modal */}
      <motion.div
        initial={{ opacity: 0, scale: 0.9 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.9 }}
        className="fixed inset-4 bg-white dark:bg-gray-800 rounded-2xl shadow-2xl z-50 overflow-hidden flex flex-col"
      >
        {/* Header */}
        <div className="flex items-center justify-between p-4 border-b border-gray-200 dark:border-gray-700 bg-white dark:bg-gray-800">
          <div className="flex items-center">
            <MapPin className="w-6 h-6 text-blue-500 mr-3" />
            <div>
              <h2 className="text-xl font-bold text-gray-800 dark:text-white">Weather Map</h2>
              <p className="text-gray-600 dark:text-gray-400">{city}</p>
            </div>
          </div>
          
          <div className="flex items-center space-x-4">
            {/* Forecast Mode Toggle */}
            <div className="flex items-center space-x-2">
              <Calendar className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <button
                onClick={() => {
                  setForecastMode(!forecastMode);
                  setIsPlaying(false);
                  setCurrentFrame(0);
                }}
                className={`px-3 py-1 rounded-lg text-sm font-medium transition-colors ${
                  forecastMode
                    ? 'bg-blue-500 text-white'
                    : 'bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white hover:bg-gray-200 dark:hover:bg-gray-600'
                }`}
              >
                {forecastMode ? 'Forecast' : 'Current'}
              </button>
            </div>

            {/* Layer Selector */}
            <div className="flex items-center space-x-2">
              <Layers className="w-5 h-5 text-gray-600 dark:text-gray-400" />
              <select
                value={mapLayer}
                onChange={(e) => setMapLayer(e.target.value)}
                className="bg-gray-100 dark:bg-gray-700 text-gray-800 dark:text-white rounded-lg px-3 py-1 text-sm border-none focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                {Object.entries(weatherLayers).map(([key, layer]) => (
                  <option key={key} value={key}>{layer.name}</option>
                ))}
              </select>
            </div>
            
            <button
              onClick={onClose}
              className="p-2 hover:bg-gray-100 dark:hover:bg-gray-700 rounded-lg transition-colors"
            >
              <X className="w-5 h-5 text-gray-500" />
            </button>
          </div>
        </div>

        {/* Forecast Controls */}
        {forecastMode && (
          <div className="p-4 bg-gray-50 dark:bg-gray-900 border-b border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-4">
                <button
                  onClick={prevFrame}
                  className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <SkipBack className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
                
                <button
                  onClick={togglePlayback}
                  className="p-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 transition-colors"
                >
                  {isPlaying ? <Pause className="w-4 h-4" /> : <Play className="w-4 h-4" />}
                </button>
                
                <button
                  onClick={nextFrame}
                  className="p-2 bg-white dark:bg-gray-700 rounded-lg hover:bg-gray-100 dark:hover:bg-gray-600 transition-colors"
                >
                  <SkipForward className="w-4 h-4 text-gray-600 dark:text-gray-400" />
                </button>
              </div>
              
              <div className="text-center">
                <p className="text-sm font-medium text-gray-800 dark:text-white">
                  {forecastFrames[currentFrame]?.label}
                </p>
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  {forecastFrames[currentFrame]?.date}
                </p>
              </div>
              
              <div className="text-right">
                <p className="text-xs text-gray-600 dark:text-gray-400">
                  Frame {currentFrame + 1} of {forecastFrames.length}
                </p>
              </div>
            </div>
            
            {/* Progress Bar */}
            <div className="mt-3">
              <div className="w-full bg-gray-200 dark:bg-gray-700 rounded-full h-2">
                <div
                  className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${((currentFrame + 1) / forecastFrames.length) * 100}%` }}
                />
              </div>
            </div>
          </div>
        )}

        {/* Map Content */}
        <div className="flex-1 relative">
          <iframe
            src={getCurrentMapUrl()}
            className="w-full h-full border-none"
            title="Interactive Weather Map"
            key={`${mapLayer}-${forecastMode}-${currentFrame}`}
          />
          
          {/* Map Controls */}
          <div className="absolute top-4 right-4 space-y-2">
            <button
              onClick={() => setZoom(Math.min(zoom + 1, 18))}
              className="block w-8 h-8 bg-white dark:bg-gray-800 rounded shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white font-bold"
            >
              +
            </button>
            <button
              onClick={() => setZoom(Math.max(zoom - 1, 1))}
              className="block w-8 h-8 bg-white dark:bg-gray-800 rounded shadow-lg hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors text-gray-800 dark:text-white font-bold"
            >
              −
            </button>
          </div>
          
          {/* Map Legend */}
          <div className="absolute bottom-4 left-4 bg-white dark:bg-gray-800 rounded-lg p-3 shadow-lg max-w-xs">
            <h4 className="font-semibold text-gray-800 dark:text-white mb-2">
              {weatherLayers[mapLayer].name} Layer
            </h4>
            <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
              {weatherLayers[mapLayer].description}
            </p>
            {forecastMode && (
              <div className="text-xs text-blue-600 dark:text-blue-400">
                <p>🔮 Forecast Mode Active</p>
                <p>Showing: {forecastFrames[currentFrame]?.label}</p>
              </div>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}