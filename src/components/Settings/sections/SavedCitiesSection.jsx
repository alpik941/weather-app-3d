import React from 'react';
import { MapPin, Plus, Trash2 } from 'lucide-react';

export default function SavedCitiesSection({
  t,
  savedCities,
  newCity,
  setNewCity,
  onAddCity,
  onRemoveCity,
  onCityClick
}) {
  return (
    <div className="mb-6">
      <h3 className="text-lg font-semibold text-gray-800 dark:text-white mb-4">{t('savedCities')}</h3>

      <form onSubmit={onAddCity} className="mb-4">
        <div className="flex space-x-2">
          <input
            type="text"
            value={newCity}
            onChange={(e) => setNewCity(e.target.value)}
            placeholder={t('addCityPlaceholder')}
            className="flex-1 p-3 border border-gray-300 dark:border-gray-600 rounded-lg bg-white dark:bg-gray-700 text-gray-800 dark:text-white text-sm"
            disabled={savedCities.length >= 10}
          />
          <button
            type="submit"
            disabled={!newCity.trim() || savedCities.length >= 10 || savedCities.includes(newCity.trim())}
            className="p-3 bg-blue-600 hover:bg-blue-700 disabled:bg-gray-400 text-white rounded-lg transition-colors"
          >
            <Plus className="w-4 h-4" />
          </button>
        </div>
        {savedCities.length >= 10 && (
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            {t('maxCitiesHint')}
          </p>
        )}
      </form>

      <div className="space-y-2">
        {savedCities.length === 0 ? (
          <p className="text-gray-500 dark:text-gray-400 text-sm text-center py-4">
            {t('noSavedCities')}
          </p>
        ) : (
          savedCities.map((city, index) => (
            <div
              key={index}
              className="flex items-center justify-between p-3 bg-gray-50 dark:bg-gray-700 rounded-lg"
            >
              <button
                onClick={() => onCityClick(city)}
                className="flex items-center flex-1 text-left hover:text-blue-600 dark:hover:text-blue-400 transition-colors"
              >
                <MapPin className="w-4 h-4 text-blue-500 mr-2" />
                <span className="text-gray-800 dark:text-white font-medium">{city}</span>
              </button>
              <button
                onClick={() => onRemoveCity(city)}
                className="p-1 text-red-500 hover:text-red-700 hover:bg-red-50 dark:hover:bg-red-900/20 rounded transition-colors"
              >
                <Trash2 className="w-4 h-4" />
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
