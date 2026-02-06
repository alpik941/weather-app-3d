import React from 'react';
import { AnimatePresence } from 'framer-motion';
import SettingsPanel from '../Settings/SettingsPanel';

export default function SettingsSection({ showSettings, onClose, onCitySelect, cardClass, fontClass }) {
  return (
    <AnimatePresence>
      {showSettings && (
        <SettingsPanel
          isOpen={showSettings}
          onClose={onClose}
          onCitySelect={onCitySelect}
          cardClass={cardClass}
          fontClass={fontClass}
        />
      )}
    </AnimatePresence>
  );
}
