import { useLanguage } from '../contexts/LanguageContext';

// Hook that returns a stable translate function using LanguageContext
export function useTranslateWeatherDescription() {
  const { t } = useLanguage();

  const translate = (description) => {
    if (!description) return '';
    const lower = description.toLowerCase();

    if (lower.includes('clear') || lower.includes('sunny')) return t('clear');
    if (lower.includes('partly cloudy') || lower.includes('partly')) return t('partlyCloudy');
    if (lower.includes('overcast')) return t('overcast');
    if (lower.includes('cloud')) return t('cloudy');

    if (lower.includes('light rain') || lower.includes('drizzle')) return t('lightRainShower');
    if (lower.includes('heavy rain') || lower.includes('shower')) return t('heavyRain');
    if (lower.includes('moderate rain') || lower.includes('rain')) return t('rain');

    if (lower.includes('snow') || lower.includes('sleet')) return t('snow');
    if (lower.includes('thunder')) return t('thunderstorm');

    if (lower.includes('smoke')) return t('fog');
    if (lower.includes('mist') || lower.includes('haze')) return t('mist');
    if (lower.includes('fog')) return t('fog');

    const map = {
      'few clouds': t('partlyCloudy'),
      'scattered clouds': t('partlyCloudy'),
      'broken clouds': t('cloudy'),
      'overcast clouds': t('overcast'),
      'light intensity shower rain': t('lightRainShower'),
      'shower rain': t('rain'),
      'heavy intensity shower rain': t('heavyRain'),
      'ragged shower rain': t('rain'),
      'light intensity drizzle': t('lightRainShower'),
      'drizzle': t('lightRainShower'),
      'heavy intensity drizzle': t('rain'),
      'light intensity drizzle rain': t('lightRainShower'),
      'drizzle rain': t('rain'),
      'heavy intensity drizzle rain': t('heavyRain'),
      'heavy shower rain and drizzle': t('heavyRain'),
      'freezing rain': t('rain'),
      'light snow': t('snow'),
      'heavy snow': t('snow'),
      'light shower snow': t('snow'),
      'shower snow': t('snow'),
      'heavy shower snow': t('snow'),
      'thunderstorm with light rain': t('thunderstorm'),
      'thunderstorm with rain': t('thunderstorm'),
      'thunderstorm with heavy rain': t('thunderstorm'),
      'light thunderstorm': t('thunderstorm'),
      'thunderstorm': t('thunderstorm'),
      'heavy thunderstorm': t('thunderstorm'),
      'ragged thunderstorm': t('thunderstorm'),
      'thunderstorm with light drizzle': t('thunderstorm'),
      'thunderstorm with drizzle': t('thunderstorm'),
      'thunderstorm with heavy drizzle': t('thunderstorm'),
      'sand/dust whirls': t('fog'),
      'sand': t('fog'),
      'dust': t('fog'),
      'volcanic ash': t('fog'),
      'squalls': t('fog'),
      'tornado': t('fog'),
    };

    return map[lower] || description;
  };

  return translate;
}
