import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { AlertTriangle, X, AlertCircle, Info } from 'lucide-react';

/**
 * ValidationErrorModal - модальное окно для отображения ошибок валидации данных
 * Показывает предупреждения о:
 * - Некорректных типах осадков (дождь при температуре < 0°C)
 * - Ошибках времени рассвета/заката
 * - Несоответствиях между алертами и текущей погодой
 * 
 * @param {Object} props
 * @param {Array} props.errors - массив ошибок валидации
 * @param {function} props.onClose - callback при закрытии
 */
const ValidationErrorModal = ({ errors = [], onClose }) => {
  if (!errors || errors.length === 0) return null;

  const getSeverityIcon = (severity) => {
    switch (severity) {
      case 'error':
        return <AlertTriangle className="w-6 h-6 text-red-500" />;
      case 'warning':
        return <AlertCircle className="w-6 h-6 text-orange-500" />;
      case 'info':
      default:
        return <Info className="w-6 h-6 text-blue-500" />;
    }
  };

  const getSeverityStyles = (severity) => {
    switch (severity) {
      case 'error':
        return {
          bg: 'bg-red-50/95 dark:bg-red-900/30',
          border: 'border-l-4 border-red-500',
          text: 'text-red-800 dark:text-red-200',
        };
      case 'warning':
        return {
          bg: 'bg-orange-50/95 dark:bg-orange-900/30',
          border: 'border-l-4 border-orange-500',
          text: 'text-orange-800 dark:text-orange-200',
        };
      case 'info':
      default:
        return {
          bg: 'bg-blue-50/95 dark:bg-blue-900/30',
          border: 'border-l-4 border-blue-500',
          text: 'text-blue-800 dark:text-blue-200',
        };
    }
  };

  const getErrorTitle = (type) => {
    switch (type) {
      case 'precipitation_type_error':
        return 'Precipitation Type Error';
      case 'sun_times_error':
        return 'Sunrise/Sunset Data Error';
      case 'alert_weather_mismatch':
        return 'Alert-Weather Inconsistency';
      case 'day_length_error':
        return 'Day Length Calculation Error';
      default:
        return 'Data Validation Error';
    }
  };

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.9, opacity: 0, y: 20 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.9, opacity: 0, y: 20 }}
          className="relative w-full max-w-lg mx-4 bg-white dark:bg-gray-800 rounded-xl shadow-2xl overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between px-6 py-4 bg-red-500 dark:bg-red-600">
            <div className="flex items-center gap-3">
              <AlertTriangle className="w-6 h-6 text-white" />
              <h2 className="text-xl font-bold text-white">Data Validation Warnings</h2>
            </div>
            <button
              onClick={onClose}
              className="p-1 rounded-full hover:bg-red-600 dark:hover:bg-red-700 transition-colors"
              aria-label="Close"
            >
              <X className="w-5 h-5 text-white" />
            </button>
          </div>

          {/* Errors List */}
          <div className="max-h-96 overflow-y-auto p-6 space-y-4">
            {errors.map((error, index) => {
              const styles = getSeverityStyles(error.severity);
              return (
                <div
                  key={index}
                  className={`${styles.bg} ${styles.border} rounded-lg p-4`}
                >
                  <div className="flex items-start gap-3">
                    {getSeverityIcon(error.severity)}
                    <div className="flex-1">
                      <h3 className={`font-semibold text-sm ${styles.text} mb-1`}>
                        {getErrorTitle(error.type)}
                      </h3>
                      <p className={`text-sm ${styles.text}`}>
                        {error.message}
                      </p>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Footer */}
          <div className="px-6 py-4 bg-gray-50 dark:bg-gray-900 border-t border-gray-200 dark:border-gray-700">
            <div className="flex items-center justify-between">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                {errors.length} validation {errors.length === 1 ? 'issue' : 'issues'} detected
              </p>
              <button
                onClick={onClose}
                className="px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg font-medium transition-colors"
              >
                Understood
              </button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
};

export default ValidationErrorModal;
