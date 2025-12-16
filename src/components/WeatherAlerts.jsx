import React from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLanguage } from '../contexts/LanguageContext';
import { AlertTriangle, X, Clock } from 'lucide-react';
import { useTime } from '../contexts/TimeContext';

export default function WeatherAlerts({ alerts = [], onDismiss }) {
  const { t } = useLanguage();
  const { formatDate } = useTime();
  if (!alerts || alerts.length === 0) return null;

  return (
    <div className="fixed top-4 right-4 z-30 space-y-2 max-w-sm">
      <AnimatePresence>
        {alerts.map((alert, index) => (
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 300, scale: 0.8 }}
            animate={{ opacity: 1, x: 0, scale: 1 }}
            exit={{ opacity: 0, x: 300, scale: 0.8 }}
            className="bg-red-50/90 dark:bg-red-900/20 backdrop-blur-xl p-5 border-l-4 border-red-500 rounded-lg"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start">
                <AlertTriangle className="w-6 h-6 text-red-500 mr-4 mt-0.5 flex-shrink-0" />
                <div className="flex-1">
                  <h4 className="text-base font-bold text-red-800 dark:text-red-200">
                    {alert.event}
                  </h4>
                  <p className="text-sm text-red-700 dark:text-red-300 mt-2 line-clamp-2">
                    {alert.description}
                  </p>
                  <div className="flex items-center mt-3 text-sm text-red-600 dark:text-red-400">
                    <Clock className="w-4 h-4 mr-2" />
                    <span>
                      {t('until')} {formatDate(alert.end, { opts: { year: 'numeric', month: 'short', day: 'numeric' } })}
                    </span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => onDismiss(index)}
                className="text-red-500 hover:text-red-700 ml-3"
              >
                <X className="w-5 h-5" />
              </button>
            </div>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  );
}