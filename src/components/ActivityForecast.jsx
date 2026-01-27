import React from 'react';
import { 
  Flower2, 
  Fish, 
  Waves, 
  Sprout, 
  Activity, 
  Target, 
  Crosshair, 
  Anchor, 
  Sailboat,
  Shirt
} from 'lucide-react';
import { useLanguage } from '../contexts/LanguageContext';

const activityIcons = {
  pollen: Flower2,
  fishing: Fish,
  waterRecreation: Waves,
  gardening: Sprout,
  running: Activity,
  golf: Target,
  hunting: Crosshair,
  kayaking: Anchor,
  yachting: Sailboat,
  clothing: Shirt
};

const getScoreColor = (score = 0) =>
  score >= 80 ? 'text-green-500' : score >= 60 ? 'text-yellow-500' : score >= 40 ? 'text-orange-500' : 'text-red-500';

const getScoreBackground = (score = 0) =>
  score >= 80 ? 'bg-green-500/10' : score >= 60 ? 'bg-yellow-500/10' : score >= 40 ? 'bg-orange-500/10' : 'bg-red-500/10';

const ActivityForecast = React.memo(function ActivityForecast({ data, fontClass }) {
  const { t } = useLanguage();
  if (!data) return null;

  const activities = [
    { key: 'pollen', name: t('pollen'), data: data.pollen },
    { key: 'fishing', name: t('fishing'), data: data.fishing },
    { key: 'waterRecreation', name: t('waterRecreation'), data: data.waterRecreation },
    { key: 'gardening', name: t('gardening'), data: data.gardening },
    { key: 'running', name: t('running'), data: data.running },
    { key: 'golf', name: t('golf'), data: data.golf },
    { key: 'hunting', name: t('hunting'), data: data.hunting },
    { key: 'kayaking', name: t('kayaking'), data: data.kayaking },
    { key: 'yachting', name: t('yachting'), data: data.yachting },
    { key: 'clothing', name: t('clothing'), data: data.clothing }
  ];

  return (
    <div className="mb-8">
      <h2 className={`text-2xl mb-8 text-center flex items-center justify-center ${fontClass || 'text-gray-900 dark:text-white'}`}>
        <Activity className="w-7 h-7 mr-3" />
        {t('activities')} {t('forecast')}
      </h2>

      <div className="bg-white/10 backdrop-blur-md p-8 rounded-xl">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {activities.map((a) => {
            const Icon = activityIcons[a.key];
            const act = a.data;
            if (!act) return null;
            const score = Math.round(act.score || 0);

            return (
              <div key={a.key} className={`bg-white/10 backdrop-blur-md p-6 rounded-lg ${getScoreBackground(score)} border border-white/30`}>
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center">
                    <Icon className={`w-7 h-7 mr-4 ${getScoreColor(score)}`} />
                    <h3 className="text-base font text-gray-800 dark:text-white">{a.name}</h3>
                  </div>
                  <div className={`text-xl font ${getScoreColor(score)}`}>{score}</div>
                </div>

                <div className="mb-3">
                  <div className="w-full bg-gray-200 dark:bg-gray-700 h-3 rounded-full">
                    <div
                      className={`h-3 rounded-full transition-all duration-800 ${
                        score >= 80 ? 'bg-green-500' : score >= 60 ? 'bg-yellow-500' : score >= 40 ? 'bg-orange-500' : 'bg-red-500'
                      }`}
                      style={{ width: `${score}%` }}
                    />
                  </div>
                </div>

                {act.description && (
                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-3">{act.description}</p>
                )}
                {act.recommendation && (
                  <p className={`text-base font-semi ${getScoreColor(score)}`}>{act.recommendation}</p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
});

export default ActivityForecast;