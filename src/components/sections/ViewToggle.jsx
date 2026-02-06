import React from 'react';
import { motion } from 'framer-motion';
import { Sun, Cloud, Activity } from 'lucide-react';

export default function ViewToggle({ currentView, setCurrentView, t, cardBase, cardSecondary, cardHeader }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`flex justify-center mb-8`}
    >
      <div className={`glass-card-intense p-3 rounded-3xl flex space-x-3 overflow-x-auto ${cardBase}`}>
        {[
          { key: 'today', label: t('today'), icon: Sun },
          { key: 'hourly', label: t('hourly'), icon: Activity },
          { key: 'weekly', label: t('weekly'), icon: Cloud },
          { key: 'activities', label: t('activities'), icon: Activity }
        ].map(({ key, label, icon: Icon }) => (
          <button
            key={key}
            onClick={() => setCurrentView(key)}
            className={`flex items-center px-6 py-3 rounded-2xl transition-all duration-400 whitespace-nowrap micro-bounce ${
              currentView === key
                ? `${cardBase} shadow-lg glow-animation backdrop-blur-sm`
                : `${cardSecondary} hover:bg-white/60 interactive-scale`
            }`}
            aria-label={label}
          >
            <Icon className={`w-5 h-5 mr-3 weather-icon ${cardHeader}`} />
            <span className="typography-caption font-semi">{label}</span>
          </button>
        ))}
      </div>
    </motion.div>
  );
}
