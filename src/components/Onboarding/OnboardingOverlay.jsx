import React, { useEffect, useState } from 'react';
import { X } from 'lucide-react';
import { useTime } from '../../contexts/TimeContext';
import { useLanguage } from '../../contexts/LanguageContext';

export default function OnboardingOverlay() {
  const [open, setOpen] = useState(false);
  const { hour12, setHour12 } = useTime();
  const { t } = useLanguage();

  useEffect(() => {
    const seen = localStorage.getItem('onboarding:v1');
    if (!seen) setOpen(true);
  }, []);

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50">
      <div className="w-[520px] max-w-[92vw] rounded-xl bg-white p-5 shadow-2xl dark:bg-gray-800 sm:p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-900 dark:text-white">{t('welcome') || 'Welcome'}</h3>
          <button
            onClick={() => { localStorage.setItem('onboarding:v1', 'dismissed'); setOpen(false); }}
            className="p-2 rounded hover:bg-gray-100 dark:hover:bg-gray-700"
          >
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>
        <div className="space-y-4 text-sm text-gray-700 dark:text-gray-300">
          <div>
            <div className="font-medium mb-1">{t('timeFormat') || 'Time Format'}</div>
            <div className="flex flex-wrap gap-2">
              <button onClick={() => setHour12(true)} className={`px-3 py-2 rounded ${hour12===true?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-700'}`}>12h</button>
              <button onClick={() => setHour12(false)} className={`px-3 py-2 rounded ${hour12===false?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-700'}`}>24h</button>
              <button onClick={() => setHour12(undefined)} className={`px-3 py-2 rounded ${hour12===undefined?'bg-blue-600 text-white':'bg-gray-100 dark:bg-gray-700'}`}>{t('auto')||'Auto'}</button>
            </div>
          </div>
          {/* Ignore DST removed */}
          <div className="text-xs text-gray-500 dark:text-gray-400">{t('youCanAddCitiesInSettings')||'You can add saved cities in Settings.'}</div>
        </div>
        <div className="mt-6 flex justify-end gap-2">
          <button onClick={() => { localStorage.setItem('onboarding:v1', 'dismissed'); setOpen(false); }} className="px-4 py-2 rounded bg-gray-200 dark:bg-gray-700">{t('done')||'Done'}</button>
        </div>
      </div>
    </div>
  );
}
