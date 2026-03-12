import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, Activity } from 'lucide-react';

export default function ViewToggle({ currentView, setCurrentView, t, cardBase, cardSecondary, cardHeader }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`mb-6 flex justify-center sm:mb-8`}
    >
      <div className={`glass-card-intense mx-auto w-full max-w-md rounded-3xl p-2 sm:w-auto sm:max-w-none sm:p-3 ${cardBase}`}>
        <div className="grid grid-cols-2 gap-2 sm:flex sm:space-x-3">
          {[
            { key: 'today', label: t('today'), icon: Sun },
            { key: 'hourly', label: t('hourly'), icon: Activity },
            { key: 'weekly', label: t('weekly'), icon: Cloud },
            { key: 'activities', label: t('activities'), icon: Activity }
          ].map(({ key, label, icon: Icon }) => (
            <button
              key={key}
              onClick={() => setCurrentView(key)}
              className={`flex min-w-0 items-center justify-center rounded-2xl px-3 py-2.5 transition-all duration-400 micro-bounce sm:px-6 sm:py-3 ${
                currentView === key
                  ? `${cardBase} shadow-lg glow-animation backdrop-blur-sm`
                  : `${cardSecondary} hover:bg-white/60 interactive-scale`
              }`}
              aria-label={label}
            >
              <Icon className={`mr-2 h-4 w-4 weather-icon sm:mr-3 sm:h-5 sm:w-5 ${cardHeader}`} />
              <span className="min-w-0 truncate text-sm font-semi sm:text-base">{label}</span>
            </button>
          ))}
        </div>
      </div>
    </motion.div>
  );
}
