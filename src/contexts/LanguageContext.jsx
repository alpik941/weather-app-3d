/* eslint-disable react-refresh/only-export-components */
import React, { createContext, useContext, useState, useEffect } from 'react';

const translations = {
  // App Title
  appTitle: {
    en: 'Alpik941',
    es: 'Alpik941',
    fr: 'Alpik941',
    de: 'Alpik941',
    it: 'Alpik941',
    pt: 'Alpik941',
    ru: 'Alpik941',
    zh: 'Alpik941',
    ja: 'Alpik941',
    ko: 'Alpik941',
  },
  // UI Common
  subtitle: {
    en: 'Advanced 3D Weather Experience', es: 'Experiencia meteorológica 3D avanzada', fr: 'Expérience météo 3D avancée', de: 'Erweitertes 3D-Wettererlebnis', it: 'Esperienza meteo 3D avanzata', pt: 'Experiência de clima 3D avançada', ru: 'Продвинутый 3D‑погодный опыт', zh: '高级 3D 天气体验', ja: '高度な3D天気体験', ko: '고급 3D 날씨 경험'
  },
  loading: {
    en: 'Loading weather data...', es: 'Cargando datos del tiempo...', fr: 'Chargement des données météo...', de: 'Wetterdaten werden geladen...', it: 'Caricamento dati meteo...', pt: 'Carregando dados do clima...', ru: 'Загрузка данных о погоде...', zh: '正在加载天气数据…', ja: '天気データを読み込み中…', ko: '날씨 데이터를 불러오는 중...'
  },
  fetchError: {
    en: 'Failed to load weather data.', es: 'No se pudieron cargar los datos del tiempo.', fr: 'Échec du chargement des données météo.', de: 'Wetterdaten konnten nicht geladen werden.', it: 'Impossibile caricare i dati meteo.', pt: 'Falha ao carregar os dados do clima.', ru: 'Не удалось загрузить данные о погоде.', zh: '无法加载天气数据。', ja: '天気データの読み込みに失敗しました。', ko: '날씨 데이터를 불러오지 못했습니다.'
  },
  locationError: {
    en: 'Unable to get your location. Please check your browser permissions.', es: 'No se pudo obtener tu ubicación. Revisa los permisos del navegador.', fr: 'Impossible d’obtenir votre position. Vérifiez les autorisations du navigateur.', de: 'Standort konnte nicht ermittelt werden. Bitte Browserberechtigungen prüfen.', it: 'Impossibile ottenere la tua posizione. Controlla le autorizzazioni del browser.', pt: 'Não foi possível obter sua localização. Verifique as permissões do navegador.', ru: 'Не удалось определить ваше местоположение. Проверьте разрешения браузера.', zh: '无法获取您的位置。请检查浏览器权限。', ja: '位置情報を取得できませんでした。ブラウザの権限を確認してください。', ko: '위치를 가져올 수 없습니다. 브라우저 권한을 확인하세요.'
  },
  findLocation: {
    en: 'Find My Location', es: 'Encontrar mi ubicación', fr: 'Trouver ma position', de: 'Meinen Standort finden', it: 'Trova la mia posizione', pt: 'Encontrar minha localização', ru: 'Моё местоположение', zh: '获取我的位置', ja: '現在地を探す', ko: '내 위치 찾기'
  },
  showOnMap: {
    en: 'Show on Map', es: 'Mostrar en el mapa', fr: 'Afficher sur la carte', de: 'Auf der Karte anzeigen', it: 'Mostra sulla mappa', pt: 'Mostrar no mapa', ru: 'Показать на карте', zh: '在地图上显示', ja: '地図で表示', ko: '지도에서 보기'
  },
  fiveDayForecast: {
    en: '5-Day Forecast', es: 'Pronóstico de 5 días', fr: 'Prévisions sur 5 jours', de: '5‑Tage‑Vorhersage', it: 'Previsioni a 5 giorni', pt: 'Previsão de 5 dias', ru: 'Прогноз на 5 дней', zh: '5天预报', ja: '5日間の予報', ko: '5일 예보'
  },
  // Navigation
  today: {
    en: 'Today',
    es: 'Hoy',
    fr: 'Aujourd\'hui',
    de: 'Heute',
    it: 'Oggi',
    pt: 'Hoje',
    ru: 'Сегодня',
    zh: '今天',
    ja: '今日',
    ko: '오늘'
  },
  hourly: {
    en: 'Hourly',
    es: 'Por Hora',
    fr: 'Horaire',
    de: 'Stündlich',
    it: 'Orario',
    pt: 'Por Hora',
    ru: 'Почасовой',
    zh: '每小时',
    ja: '時間別',
    ko: '시간별'
  },
  weekly: {
    en: '7 Days',
    es: '7 Días',
    fr: '7 Jours',
    de: '7 Tage',
    it: '7 Giorni',
    pt: '7 Dias',
    ru: '7 Дней',
    zh: '7天',
    ja: '7日間',
    ko: '7일'
  },
  activities: {
    en: 'Activities',
    es: 'Actividades',
    fr: 'Activités',
    de: 'Aktivitäten',
    it: 'Attività',
    pt: 'Atividades',
    ru: 'Активности',
    zh: '活动',
    ja: 'アクティビティ',
    ko: '활동'
  },
  forecast: {
    en: 'Forecast', es: 'Pronóstico', fr: 'Prévisions', de: 'Vorhersage', it: 'Previsioni', pt: 'Previsão', ru: 'Прогноз', zh: '预报', ja: '予報', ko: '예보'
  },
  threeDayHourly: {
    en: '3-Day Hourly Forecast', es: 'Pronóstico por hora (3 días)', fr: 'Prévisions horaires (3 jours)', de: '3-Tage-Stündliche Vorhersage', it: 'Previsioni orarie (3 giorni)', pt: 'Previsão horária (3 dias)', ru: 'Почасовой прогноз (3 дня)', zh: '3天天气每小时预报', ja: '3日間の毎時予報', ko: '3일 시간별 예보'
  },
  sevenDayForecast: {
    en: '7-Day Forecast', es: 'Pronóstico de 7 días', fr: 'Prévisions sur 7 jours', de: '7-Tage-Vorhersage', it: 'Previsioni a 7 giorni', pt: 'Previsão de 7 dias', ru: 'Прогноз на 7 дней', zh: '7天天气预报', ja: '7日間の予報', ko: '7일 예보'
  },
  now: {
    en: 'Now', es: 'Ahora', fr: 'Maintenant', de: 'Jetzt', it: 'Ora', pt: 'Agora', ru: 'Сейчас', zh: '现在', ja: '今', ko: '지금'
  },
  tomorrow: {
    en: 'Tomorrow', es: 'Mañana', fr: 'Demain', de: 'Morgen', it: 'Domani', pt: 'Amanhã', ru: 'Завтра', zh: '明天', ja: '明日', ko: '내일'
  },
  until: {
    en: 'Until', es: 'Hasta', fr: 'Jusqu\'à', de: 'Bis', it: 'Fino a', pt: 'Até', ru: 'До', zh: '直到', ja: 'まで', ko: '까지'
  },
  // Weather Details
  windSpeed: {
    en: 'Wind Speed',
    es: 'Velocidad del Viento',
    fr: 'Vitesse du Vent',
    de: 'Windgeschwindigkeit',
    it: 'Velocità del Vento',
    pt: 'Velocidade do Vento',
    ru: 'Скорость Ветра',
    zh: '风速',
    ja: '風速',
    ko: '풍속'
  },
  humidity: {
    en: 'Humidity',
    es: 'Humedad',
    fr: 'Humidité',
    de: 'Luftfeuchtigkeit',
    it: 'Umidità',
    pt: 'Umidade',
    ru: 'Влажность',
    zh: '湿度',
    ja: '湿度',
    ko: '습도'
  },
  visibility: {
    en: 'Visibility',
    es: 'Visibilidad',
    fr: 'Visibilité',
    de: 'Sichtweite',
    it: 'Visibilità',
    pt: 'Visibilidade',
    ru: 'Видимость',
    zh: '能见度',
    ja: '視程',
    ko: '가시거리'
  },
  pressure: {
    en: 'Pressure',
    es: 'Presión',
    fr: 'Pression',
    de: 'Luftdruck',
    it: 'Pressione',
    pt: 'Pressão',
    ru: 'Давление',
    zh: '气压',
    ja: '気圧',
    ko: '기압'
  },
  airQuality: {
    en: 'Air Quality', es: 'Calidad del aire', fr: 'Qualité de l’air', de: 'Luftqualität', it: 'Qualità dell’aria', pt: 'Qualidade do ar', ru: 'Качество воздуха', zh: '空气质量', ja: '大気質', ko: '대기 질'
  },
  aqiIndex: {
    en: 'Index', es: 'Índice', fr: 'Indice', de: 'Index', it: 'Indice', pt: 'Índice', ru: 'Индекс', zh: '指数', ja: '指数', ko: '지수'
  },
  aqiGood: {
    en: 'Good', es: 'Bueno', fr: 'Bon', de: 'Gut', it: 'Buono', pt: 'Bom', ru: 'Хорошо', zh: '优', ja: '良好', ko: '좋음'
  },
  aqiModerate: {
    en: 'Moderate', es: 'Moderado', fr: 'Modéré', de: 'Mäßig', it: 'Moderato', pt: 'Moderado', ru: 'Умеренно', zh: '良', ja: '並', ko: '보통'
  },
  aqiUSG: {
    en: 'Unhealthy for Sensitive Groups', es: 'Dañino para grupos sensibles', fr: 'Malsain pour groupes sensibles', de: 'Ungesund für sensible Gruppen', it: 'Nocivo per i sensibili', pt: 'Nocivo para grupos sensíveis', ru: 'Вредно для чувствительных групп', zh: '对敏感人群不健康', ja: '敏感な人には不健康', ko: '민감군에 나쁨'
  },
  aqiUnhealthy: {
    en: 'Unhealthy', es: 'Dañino', fr: 'Malsain', de: 'Ungesund', it: 'Nocivo', pt: 'Nocivo', ru: 'Вредно', zh: '不健康', ja: '健康に悪い', ko: '나쁨'
  },
  aqiVeryUnhealthy: {
    en: 'Very Unhealthy', es: 'Muy dañino', fr: 'Très malsain', de: 'Sehr ungesund', it: 'Molto nocivo', pt: 'Muito nocivo', ru: 'Очень вредно', zh: '非常不健康', ja: '非常に悪い', ko: '매우 나쁨'
  },
  aqiHazardous: {
    en: 'Hazardous', es: 'Peligroso', fr: 'Dangereux', de: 'Gefährlich', it: 'Pericoloso', pt: 'Perigoso', ru: 'Опасно', zh: '危险', ja: '危険', ko: '위험'
  },
  pm25: { en: 'PM2.5', es: 'PM2.5', fr: 'PM2,5', de: 'PM2,5', it: 'PM2,5', pt: 'PM2,5', ru: 'PM2.5', zh: 'PM2.5', ja: 'PM2.5', ko: 'PM2.5' },
  pm10: { en: 'PM10', es: 'PM10', fr: 'PM10', de: 'PM10', it: 'PM10', pt: 'PM10', ru: 'PM10', zh: 'PM10', ja: 'PM10', ko: 'PM10' },
  o3: { en: 'O₃', es: 'O₃', fr: 'O₃', de: 'O₃', it: 'O₃', pt: 'O₃', ru: 'O₃', zh: '臭氧', ja: 'オゾン', ko: '오존' },
  // UV index
  uvIndex: {
    en: 'UV Index', es: 'Índice UV', fr: 'Indice UV', de: 'UV-Index', it: 'Indice UV', pt: 'Índice UV', ru: 'Индекс УФ', zh: '紫外线指数', ja: 'UV指数', ko: '자외선 지수'
  },
  uvLow: { en: 'Low', es: 'Bajo', fr: 'Faible', de: 'Niedrig', it: 'Basso', pt: 'Baixo', ru: 'Низкий', zh: '低', ja: '低い', ko: '낮음' },
  uvModerate: { en: 'Moderate', es: 'Moderado', fr: 'Modéré', de: 'Mäßig', it: 'Moderato', pt: 'Moderado', ru: 'Умеренный', zh: '中等', ja: '中程度', ko: '보통' },
  uvHigh: { en: 'High', es: 'Alto', fr: 'Élevé', de: 'Hoch', it: 'Alto', pt: 'Alto', ru: 'Высокий', zh: '高', ja: '高い', ko: '높음' },
  uvVeryHigh: { en: 'Very High', es: 'Muy Alto', fr: 'Très Élevé', de: 'Sehr hoch', it: 'Molto alto', pt: 'Muito alto', ru: 'Очень высокий', zh: '很高', ja: '非常に高い', ko: '매우 높음' },
  uvExtreme: { en: 'Extreme', es: 'Extremo', fr: 'Extrême', de: 'Extrem', it: 'Estremo', pt: 'Extremo', ru: 'Экстремальный', zh: '极高', ja: '極端', ko: '매우 심함' },
  feelsLike: {
    en: 'Feels Like',
    es: 'Sensación Térmica',
    fr: 'Ressenti',
    de: 'Gefühlt',
    it: 'Percepita',
    pt: 'Sensação',
    ru: 'Ощущается',
    zh: '体感温度',
    ja: '体感',
    ko: '체감온도'
  },
  sunrise: {
    en: 'Sunrise',
    es: 'Amanecer',
    fr: 'Lever du soleil',
    de: 'Sonnenaufgang',
    it: 'Alba',
    pt: 'Nascer do sol',
    ru: 'Восход',
    zh: '日出',
    ja: '日の出',
    ko: '일출'
  },
  sunset: {
    en: 'Sunset',
    es: 'Atardecer',
    fr: 'Coucher du soleil',
    de: 'Sonnenuntergang',
    it: 'Tramonto',
    pt: 'Pôr do sol',
    ru: 'Закат',
    zh: '日落',
    ja: '日の入り',
    ko: '일몰'
  },
  noon: {
    en: 'Noon',
    es: 'Mediodía',
    fr: 'Midi',
    de: 'Mittag',
    it: 'Mezzogiorno',
    pt: 'Meio-dia',
    ru: 'Полдень',
    zh: '正午',
    ja: '正午',
    ko: '정오'
  },
  high: {
    en: 'High',
    es: 'Máxima',
    fr: 'Max',
    de: 'Hoch',
    it: 'Massima',
    pt: 'Máxima',
    ru: 'Макс',
    zh: '最高',
    ja: '最高',
    ko: '최고'
  },
  low: {
    en: 'Low',
    es: 'Mínima',
    fr: 'Min',
    de: 'Tief',
    it: 'Minima',
    pt: 'Mínima',
    ru: 'Мин',
    zh: '最低',
    ja: '最低',
    ko: '최저'
  },
  dayLength: {
    en: 'Day Length',
    es: 'Duración del Día',
    fr: 'Durée du Jour',
    de: 'Tageslänge',
    it: 'Durata del Giorno',
    pt: 'Duração do Dia',
    ru: 'Продолжительность Дня',
    zh: '日照时长',
    ja: '日照時間',
    ko: '일조시간'
  },
  currentTime: {
    en: 'Local time',
    ru: 'Местное время'
  },
  // Time format settings
  timeFormat: { en: 'Time Format', ru: 'Формат времени' },
  timeDisplay: { en: 'Display Mode', ru: 'Режим отображения' },
  timeFormat12hDesc: { en: '12-hour clock (AM/PM)', ru: '12-часовой формат (AM/PM)' },
  timeFormat24hDesc: { en: '24-hour clock', ru: '24-часовой формат' },
  timeFormatAutoDesc: { en: 'Automatic (follow locale)', ru: 'Авто (локаль)' },
  cycle: { en: 'Cycle', ru: 'Сменить' },
  auto: { en: 'Auto', ru: 'Авто' },
  // Advanced time settings
  advancedTime: { en: 'Advanced Time', ru: 'Дополнительные настройки времени', es: 'Tiempo Avanzado', fr: 'Temps Avancé', de: 'Erweiterte Zeit', it: 'Tempo Avanzato', pt: 'Tempo Avançado', zh: '高级时间', ja: '詳細時間設定', ko: '고급 시간' },
  rollbackMode: { en: 'Rollback Mode', ru: 'Режим отката', es: 'Modo de Retorno', fr: 'Mode Repli', de: 'Rollback-Modus', it: 'Modalità Rollback', pt: 'Modo de Reversão', zh: '回退模式', ja: 'ロールバックモード', ko: '롤백 모드' },
  rollbackDesc: { en: 'Use legacy local browser time formatting.', ru: 'Использовать старое локальное форматирование времени.', es: 'Usar formato de tiempo local heredado.', fr: 'Utiliser l’ancien format local du navigateur.', de: 'Altes lokales Zeitformat des Browsers verwenden.', it: 'Usa il vecchio formato orario locale.', pt: 'Usar formato local legado.', zh: '使用旧的本地时间格式。', ja: '旧ブラウザのローカル時間形式を使用。', ko: '이전 로컬 시간 형식을 사용.' },
  // Weather Conditions
  clear: {
    en: 'Clear',
    es: 'Despejado',
    fr: 'Dégagé',
    de: 'Klar',
    it: 'Sereno',
    pt: 'Limpo',
    ru: 'Ясно',
    zh: '晴朗',
    ja: '晴れ',
    ko: '맑음'
  },
  partlyCloudy: {
    en: 'Partly Cloudy',
    es: 'Parcialmente Nublado',
    fr: 'Partiellement Nuageux',
    de: 'Teilweise Bewölkt',
    it: 'Parzialmente Nuvoloso',
    pt: 'Parcialmente Nublado',
    ru: 'Переменная Облачность',
    zh: '多云',
    ja: '一部曇り',
    ko: '부분적으로 흐림'
  },
  overcast: {
    en: 'Overcast',
    es: 'Nublado',
    fr: 'Couvert',
    de: 'Bedeckt',
    it: 'Coperto',
    pt: 'Nublado',
    ru: 'Пасмурно',
    zh: '阴天',
    ja: '曇り',
    ko: '흐림'
  },
  lightRainShower: {
    en: 'Light Rain Shower',
    es: 'Lluvia Ligera',
    fr: 'Averse Légère',
    de: 'Leichter Regenschauer',
    it: 'Pioggia Leggera',
    pt: 'Chuva Leve',
    ru: 'Легкий Дождь',
    zh: '小雨',
    ja: '小雨',
    ko: '가벼운 소나기'
  },
  rain: {
    en: 'Rain',
    es: 'Lluvia',
    fr: 'Pluie',
    de: 'Regen',
    it: 'Pioggia',
    pt: 'Chuva',
    ru: 'Дождь',
    zh: '雨',
    ja: '雨',
    ko: '비'
  },
  heavyRain: {
    en: 'Heavy Rain',
    es: 'Lluvia Intensa',
    fr: 'Pluie Forte',
    de: 'Starker Regen',
    it: 'Pioggia Forte',
    pt: 'Chuva Forte',
    ru: 'Сильный Дождь',
    zh: '大雨',
    ja: '大雨',
    ko: '폭우'
  },
  snow: {
    en: 'Snow',
    es: 'Nieve',
    fr: 'Neige',
    de: 'Schnee',
    it: 'Neve',
    pt: 'Neve',
    ru: 'Снег',
    zh: '雪',
    ja: '雪',
    ko: '눈'
  },
  thunderstorm: {
    en: 'Thunderstorm',
    es: 'Tormenta',
    fr: 'Orage',
    de: 'Gewitter',
    it: 'Temporale',
    pt: 'Tempestade',
    ru: 'Гроза',
    zh: '雷暴',
    ja: '雷雨',
    ko: '뇌우'
  },
  fog: {
    en: 'Fog',
    es: 'Niebla',
    fr: 'Brouillard',
    de: 'Nebel',
    it: 'Nebbia',
    pt: 'Névoa',
    ru: 'Туман',
    zh: '雾',
    ja: '霧',
    ko: '안개'
  },
  mist: {
    en: 'Mist',
    es: 'Neblina',
    fr: 'Brume',
    de: 'Dunst',
    it: 'Foschia',
    pt: 'Neblina',
    ru: 'Дымка',
    zh: '薄雾',
    ja: 'かすみ',
    ko: '박무'
  },
  cloudy: {
    en: 'Cloudy',
    es: 'Nublado',
    fr: 'Nuageux',
    de: 'Bewölkt',
    it: 'Nuvoloso',
    pt: 'Nublado',
    ru: 'Облачно',
    zh: '多云',
    ja: '曇り',
    ko: '흐림'
  },
  // Activities
  pollen: {
    en: 'Pollen',
    es: 'Polen',
    fr: 'Pollen',
    de: 'Pollen',
    it: 'Polline',
    pt: 'Pólen',
    ru: 'Пыльца',
    zh: '花粉',
    ja: '花粉',
    ko: '꽃가루'
  },
  fishing: {
    en: 'Fishing',
    es: 'Pesca',
    fr: 'Pêche',
    de: 'Angeln',
    it: 'Pesca',
    pt: 'Pesca',
    ru: 'Рыбалка',
    zh: '钓鱼',
    ja: '釣り',
    ko: '낚시'
  },
  waterRecreation: {
    en: 'Water Recreation',
    es: 'Recreación Acuática',
    fr: 'Loisirs Aquatiques',
    de: 'Wassersport',
    it: 'Sport Acquatici',
    pt: 'Recreação Aquática',
    ru: 'Водный Отдых',
    zh: '水上娱乐',
    ja: '水上レクリエーション',
    ko: '수상 레크리에이션'
  },
  gardening: {
    en: 'Garden & Vegetable Garden',
    es: 'Jardín y Huerto',
    fr: 'Jardin et Potager',
    de: 'Garten & Gemüsegarten',
    it: 'Giardino e Orto',
    pt: 'Jardim e Horta',
    ru: 'Сад и Огород',
    zh: '花园和菜园',
    ja: '庭園と菜園',
    ko: '정원과 채소밭'
  },
  running: {
    en: 'Running',
    es: 'Correr',
    fr: 'Course',
    de: 'Laufen',
    it: 'Corsa',
    pt: 'Corrida',
    ru: 'Бег',
    zh: '跑步',
    ja: 'ランニング',
    ko: '달리기'
  },
  golf: {
    en: 'Golf',
    es: 'Golf',
    fr: 'Golf',
    de: 'Golf',
    it: 'Golf',
    pt: 'Golfe',
    ru: 'Гольф',
    zh: '高尔夫',
    ja: 'ゴルフ',
    ko: '골프'
  },
  hunting: {
    en: 'Hunting',
    es: 'Caza',
    fr: 'Chasse',
    de: 'Jagd',
    it: 'Caccia',
    pt: 'Caça',
    ru: 'Охота',
    zh: '狩猎',
    ja: '狩猟',
    ko: '사냥'
  },
  kayaking: {
    en: 'Kayaking',
    es: 'Kayak',
    fr: 'Kayak',
    de: 'Kajakfahren',
    it: 'Kayak',
    pt: 'Caiaque',
    ru: 'Каякинг',
    zh: '皮划艇',
    ja: 'カヤック',
    ko: '카약'
  },
  yachting: {
    en: 'Yachting',
    es: 'Navegación',
    fr: 'Yachting',
    de: 'Segeln',
    it: 'Yachting',
    pt: 'Iatismo',
    ru: 'Яхтинг',
    zh: '游艇',
    ja: 'ヨット',
    ko: '요트'
  },
  clothing: {
    en: 'Clothing Comfort',
    es: 'Comodidad de Ropa',
    fr: 'Confort Vestimentaire',
    de: 'Kleidungskomfort',
    it: 'Comfort Abbigliamento',
    pt: 'Conforto da Roupa',
    ru: 'Комфорт Одежды',
    zh: '服装舒适度',
    ja: '服装の快適さ',
    ko: '의류 편안함'
  },
  // Settings
  settings: {
    en: 'Settings',
    es: 'Configuración',
    fr: 'Paramètres',
    de: 'Einstellungen',
    it: 'Impostazioni',
    pt: 'Configurações',
    ru: 'Настройки',
    zh: '设置',
    ja: '設定',
    ko: '설정'
  },
  language: {
    en: 'Language',
    es: 'Idioma',
    fr: 'Langue',
    de: 'Sprache',
    it: 'Lingua',
    pt: 'Idioma',
    ru: 'Язык',
    zh: '语言',
    ja: '言語',
    ko: '언어'
  },
  feedback: {
    en: 'Feedback',
    es: 'Comentarios',
    fr: 'Commentaires',
    de: 'Feedback',
    it: 'Feedback',
    pt: 'Feedback',
    ru: 'Отзыв',
    zh: '反馈',
    ja: 'フィードバック',
    ko: '피드백'
  },
  rateApp: {
    en: 'Rate App',
    es: 'Calificar App',
    fr: 'Noter l\'App',
    de: 'App Bewerten',
    it: 'Valuta App',
    pt: 'Avaliar App',
    ru: 'Оценить Приложение',
    zh: '评价应用',
    ja: 'アプリを評価',
    ko: '앱 평가'
  }
  ,
  // SearchBar
  searchHint: {
    en: 'Search for a city...', es: 'Buscar una ciudad...', fr: 'Rechercher une ville...', de: 'Nach einer Stadt suchen...', it: 'Cerca una città...', pt: 'Pesquisar uma cidade...', ru: 'Найдите город...', zh: '搜索城市…', ja: '都市を検索…', ko: '도시 검색...'
  },
  searchPlaceholder: {
    en: 'Search for cities...', es: 'Buscar ciudades...', fr: 'Rechercher des villes...', de: 'Nach Städten suchen...', it: 'Cerca città...', pt: 'Pesquisar cidades...', ru: 'Поиск городов...', zh: '搜索城市…', ja: '都市を検索…', ko: '도시 검색...'
  },
  useMyLocation: {
    en: 'Use my location', es: 'Usar mi ubicación', fr: 'Utiliser ma position', de: 'Meinen Standort verwenden', it: 'Usa la mia posizione', pt: 'Usar minha localização', ru: 'Моё местоположение', zh: '使用我的位置', ja: '現在地を使用', ko: '내 위치 사용'
  },
  searchingCities: {
    en: 'Searching cities...', es: 'Buscando ciudades...', fr: 'Recherche de villes...', de: 'Städte werden gesucht...', it: 'Ricerca città...', pt: 'Pesquisando cidades...', ru: 'Поиск городов...', zh: '正在搜索城市…', ja: '都市を検索中…', ko: '도시 검색 중...'
  },
  recentSearches: {
    en: 'Recent Searches', es: 'Búsquedas Recientes', fr: 'Recherches Récentes', de: 'Letzte Suchanfragen', it: 'Ricerche Recenti', pt: 'Pesquisas Recentes', ru: 'Недавние запросы', zh: '最近的搜索', ja: '最近の検索', ko: '최근 검색'
  },
  citySuggestions: {
    en: 'City Suggestions', es: 'Sugerencias de ciudades', fr: 'Suggestions de villes', de: 'Stadtvorschläge', it: 'Suggerimenti di città', pt: 'Sugestões de cidades', ru: 'Подсказки городов', zh: '城市建议', ja: '都市の候補', ko: '도시 제안'
  },
  noCitiesFound: {
    en: 'No cities found for', es: 'No se encontraron ciudades para', fr: 'Aucune ville trouvée pour', de: 'Keine Städte gefunden für', it: 'Nessuna città trovata per', pt: 'Nenhuma cidade encontrada para', ru: 'Города не найдены для', zh: '未找到相关城市：', ja: '該当する都市はありません:', ko: '해당 도시를 찾을 수 없음'
  },
  searchFor: {
    en: 'Search for', es: 'Buscar', fr: 'Rechercher', de: 'Suchen nach', it: 'Cerca', pt: 'Pesquisar por', ru: 'Искать', zh: '搜索', ja: '検索', ko: '검색'
  },
  // Settings Panel
  savedCities: {
    en: 'Saved Cities', es: 'Ciudades Guardadas', fr: 'Villes Enregistrées', de: 'Gespeicherte Städte', it: 'Città Salvate', pt: 'Cidades Salvas', ru: 'Сохраненные города', zh: '已保存的城市', ja: '保存した都市', ko: '저장된 도시'
  },
  units: {
    en: 'Units', es: 'Unidades', fr: 'Unités', de: 'Einheiten', it: 'Unità', pt: 'Unidades', ru: 'Единицы', zh: '单位', ja: '単位', ko: '단위'
  },
  addCityPlaceholder: {
    en: 'Add city (max 10)', es: 'Agregar ciudad (máx. 10)', fr: 'Ajouter une ville (max 10)', de: 'Stadt hinzufügen (max. 10)', it: 'Aggiungi città (max 10)', pt: 'Adicionar cidade (máx. 10)', ru: 'Добавить город (макс. 10)', zh: '添加城市（最多10个）', ja: '都市を追加（最大10件）', ko: '도시 추가 (최대 10개)'
  },
  maxCitiesHint: {
    en: 'Maximum 10 cities allowed. Remove one to add another.', es: 'Máximo 10 ciudades. Elimina una para añadir otra.', fr: 'Maximum 10 villes. Supprimez-en une pour en ajouter une autre.', de: 'Maximal 10 Städte. Entfernen Sie eine, um eine weitere hinzuzufügen.', it: 'Massimo 10 città. Rimuovine una per aggiungerne un’altra.', pt: 'Máximo de 10 cidades. Remova uma para adicionar outra.', ru: 'Максимум 10 городов. Удалите один, чтобы добавить другой.', zh: '最多允许10个城市。要添加新城市请先删除一个。', ja: '最大10都市まで。追加するには一つ削除してください。', ko: '최대 10개 도시. 다른 도시를 추가하려면 하나를 제거하세요.'
  },
  noSavedCities: {
    en: 'No saved cities yet. Add up to 10 cities for quick access.', es: 'Aún no hay ciudades guardadas. Agrega hasta 10 ciudades para acceso rápido.', fr: 'Aucune ville enregistrée. Ajoutez jusqu’à 10 villes pour un accès rapide.', de: 'Noch keine gespeicherten Städte. Fügen Sie bis zu 10 Städte hinzu.', it: 'Nessuna città salvata. Aggiungi fino a 10 città per accesso rapido.', pt: 'Nenhuma cidade salva ainda. Adicione até 10 para acesso rápido.', ru: 'Нет сохраненных городов. Добавьте до 10 для быстрого доступа.', zh: '还没有保存城市。最多添加10个以便快速访问。', ja: '保存された都市はまだありません。最大10件まで追加できます。', ko: '저장된 도시가 없습니다. 빠른 접근을 위해 최대 10개까지 추가하세요.'
  },
  accountAndSubscription: {
    en: 'Account & Subscription', es: 'Cuenta y Suscripción', fr: 'Compte et Abonnement', de: 'Konto & Abonnement', it: 'Account e Abbonamento', pt: 'Conta e Assinatura', ru: 'Аккаунт и подписка', zh: '账户与订阅', ja: 'アカウントとサブスクリプション', ko: '계정 및 구독'
  },
  user: { en: 'User', es: 'Usuario', fr: 'Utilisateur', de: 'Benutzer', it: 'Utente', pt: 'Usuário', ru: 'Пользователь', zh: '用户', ja: 'ユーザー', ko: '사용자' },
  freePlan: { en: 'Free Plan', es: 'Plan Gratis', fr: 'Forfait Gratuit', de: 'Kostenloser Plan', it: 'Piano Gratuito', pt: 'Plano Gratuito', ru: 'Бесплатный план', zh: '免费套餐', ja: '無料プラン', ko: '무료 요금제' },
  basicFeatures: { en: 'Basic weather features', es: 'Funciones meteorológicas básicas', fr: 'Fonctionnalités météo de base', de: 'Grundlegende Wetterfunktionen', it: 'Funzioni meteo di base', pt: 'Recursos meteorológicos básicos', ru: 'Базовые погодные функции', zh: '基础天气功能', ja: '基本的な天気機能', ko: '기본 날씨 기능' },
  currentPlan: { en: 'Current', es: 'Actual', fr: 'Actuel', de: 'Aktuell', it: 'Attuale', pt: 'Atual', ru: 'Текущий', zh: '当前', ja: '現在', ko: '현재' },
  upgradeToPro: { en: 'Upgrade to Pro', es: 'Actualizar a Pro', fr: 'Passer à Pro', de: 'Auf Pro upgraden', it: 'Passa a Pro', pt: 'Atualizar para Pro', ru: 'Обновиться до Pro', zh: '升级到专业版', ja: 'Pro にアップグレード', ko: '프로로 업그레이드' },
  proFeatures: { en: 'Pro Features', es: 'Funciones Pro', fr: 'Fonctionnalités Pro', de: 'Pro-Funktionen', it: 'Funzionalità Pro', pt: 'Recursos Pro', ru: 'Функции Pro', zh: '专业版功能', ja: 'Pro 機能', ko: '프로 기능' },
  feature14Day: { en: 'Extended 14-day forecast', es: 'Pronóstico extendido de 14 días', fr: 'Prévisions sur 14 jours étendues', de: 'Erweiterte 14-Tage-Vorhersage', it: 'Previsioni estese a 14 giorni', pt: 'Previsão estendida de 14 dias', ru: 'Расширенный прогноз на 14 дней', zh: '扩展14天天气预报', ja: '14日間の拡張予報', ko: '확장 14일 예보' },
  featureSevereAlerts: { en: 'Severe weather alerts', es: 'Alertas de clima severo', fr: 'Alertes météo sévères', de: 'Unwetterwarnungen', it: 'Allerte meteo gravi', pt: 'Alertas de clima severo', ru: 'Предупреждения о сильной погоде', zh: '严重天气警报', ja: '厳しい気象警報', ko: '심각한 기상 알림' },
  featureHistorical: { en: 'Historical weather data', es: 'Datos meteorológicos históricos', fr: 'Données météorologiques historiques', de: 'Historische Wetterdaten', it: 'Dati meteorologici storici', pt: 'Dados meteorológicos históricos', ru: 'Исторические погодные данные', zh: '历史天气数据', ja: '過去の天気データ', ko: '과거 날씨 데이터' },
  featureMaps: { en: 'Advanced weather maps', es: 'Mapas meteorológicos avanzados', fr: 'Cartes météo avancées', de: 'Erweiterte Wetterkarten', it: 'Mappe meteo avanzate', pt: 'Mapas meteorológicos avançados', ru: 'Расширенные погодные карты', zh: '高级天气地图', ja: '高度な天気マップ', ko: '고급 날씨 지도' },
  featurePriorityApi: { en: 'Priority API access', es: 'Acceso prioritario a la API', fr: 'Accès prioritaire à l’API', de: 'Priorisierter API-Zugang', it: 'Accesso API prioritario', pt: 'Acesso prioritário à API', ru: 'Приоритетный доступ к API', zh: '优先API访问', ja: '優先 API アクセス', ko: '우선 API 액세스' },
  featureAdFree: { en: 'Ad-free experience', es: 'Experiencia sin anuncios', fr: 'Expérience sans publicité', de: 'Werbefreie Nutzung', it: 'Esperienza senza pubblicità', pt: 'Experiência sem anúncios', ru: 'Без рекламы', zh: '无广告体验', ja: '広告なしの体験', ko: '광고 없는 경험' },
  signOut: { en: 'Sign Out', es: 'Cerrar sesión', fr: 'Se déconnecter', de: 'Abmelden', it: 'Disconnetti', pt: 'Sair', ru: 'Выйти', zh: '退出登录', ja: 'サインアウト', ko: '로그아웃' },
  signInRegisterPro: { en: 'Sign In / Register for Pro', es: 'Iniciar sesión / Registrarse para Pro', fr: 'Se connecter / S’inscrire à Pro', de: 'Anmelden / Für Pro registrieren', it: 'Accedi / Registrati per Pro', pt: 'Entrar / Registrar para Pro', ru: 'Войти / Зарегистрироваться для Pro', zh: '登录/注册专业版', ja: 'Pro にサインイン/登録', ko: '프로에 로그인/등록' },
  appearance: { en: 'Appearance', es: 'Apariencia', fr: 'Apparence', de: 'Erscheinungsbild', it: 'Aspetto', pt: 'Aparência', ru: 'Внешний вид', zh: '外观', ja: '外観', ko: '모양새' },
  lightMode: { en: 'Light Mode', es: 'Modo Claro', fr: 'Mode Clair', de: 'Heller Modus', it: 'Modalità Chiara', pt: 'Modo Claro', ru: 'Светлая тема', zh: '浅色模式', ja: 'ライトモード', ko: '라이트 모드' },
  darkMode: { en: 'Dark Mode', es: 'Modo Oscuro', fr: 'Mode Sombre', de: 'Dunkler Modus', it: 'Modalità Scura', pt: 'Modo Escuro', ru: 'Тёмная тема', zh: '深色模式', ja: 'ダークモード', ko: '다크 모드' },
  temperatureHeader: { en: 'Temperature', es: 'Temperatura', fr: 'Température', de: 'Temperatur', it: 'Temperatura', pt: 'Temperatura', ru: 'Температура', zh: '温度', ja: '気温', ko: '기온' },
  celsiusUnit: { en: 'Celsius (°C)', es: 'Celsius (°C)', fr: 'Celsius (°C)', de: 'Celsius (°C)', it: 'Celsius (°C)', pt: 'Celsius (°C)', ru: 'Цельсий (°C)', zh: '摄氏 (°C)', ja: '摂氏 (°C)', ko: '섭씨 (°C)' },
  fahrenheitUnit: { en: 'Fahrenheit (°F)', es: 'Fahrenheit (°F)', fr: 'Fahrenheit (°F)', de: 'Fahrenheit (°F)', it: 'Fahrenheit (°F)', pt: 'Fahrenheit (°F)', ru: 'Фаренгейт (°F)', zh: '华氏 (°F)', ja: '華氏 (°F)', ko: '화씨 (°F)' },
  support: { en: 'Support', es: 'Soporte', fr: 'Support', de: 'Support', it: 'Supporto', pt: 'Suporte', ru: 'Поддержка', zh: '支持', ja: 'サポート', ko: '지원' },
  supportEmail: { en: 'Support email', es: 'Correo de soporte', fr: 'Email du support', de: 'Support-E-Mail', it: 'Email di supporto', pt: 'E-mail de suporte', ru: 'Почта поддержки', zh: '支持邮箱', ja: 'サポートメール', ko: '지원 이메일' },
  resetWelcome: { en: 'Show Welcome Screen', es: 'Mostrar pantalla de bienvenida', fr: 'Afficher l\'écran de bienvenue', de: 'Willkommensbildschirm anzeigen', it: 'Mostra schermata di benvenuto', pt: 'Mostrar tela de boas-vindas', ru: 'Показать приветственный экран', zh: '显示欢迎屏幕', ja: 'ウェルカム画面を表示', ko: '환영 화면 표시' },
  welcomeResetMessage: { en: 'Welcome screen reset! Refresh the page to see it again.', es: '¡Pantalla de bienvenida restablecida! Actualiza la página para verla de nuevo.', fr: 'Écran de bienvenue réinitialisé ! Actualisez la page pour le revoir.', de: 'Willkommensbildschirm zurückgesetzt! Seite aktualisieren, um ihn erneut zu sehen.', it: 'Schermata di benvenuto ripristinata! Aggiorna la pagina per vederla di nuovo.', pt: 'Tela de boas-vindas redefinida! Atualize a página para vê-la novamente.', ru: 'Приветственный экран сброшен! Обновите страницу, чтобы увидеть его снова.', zh: '欢迎屏幕已重置！刷新页面以再次查看。', ja: 'ウェルカム画面がリセットされました！ページを更新して再度表示してください。', ko: '환영 화면이 재설정되었습니다! 페이지를 새로고침하여 다시 보세요.' },
  offlineSnapshot: { en: 'Offline snapshot', es: 'Instantánea sin conexión', fr: 'Instantané hors ligne', de: 'Offline-Schnappschuss', it: 'Istante offline', pt: 'Instantâneo offline', ru: 'Оффлайн-снимок', zh: '离线快照', ja: 'オフラインスナップショット', ko: '오프라인 스냅샷' },
  contactDevelopers: { en: 'Contact Developers', es: 'Contactar a los desarrolladores', fr: 'Contacter les développeurs', de: 'Entwickler kontaktieren', it: 'Contatta gli sviluppatori', pt: 'Contatar desenvolvedores', ru: 'Связаться с разработчиками', zh: '联系开发者', ja: '開発者に連絡', ko: '개발자에게 문의' },
  rateExperience: { en: 'Rate your experience', es: 'Califica tu experiencia', fr: 'Évaluez votre expérience', de: 'Bewerten Sie Ihre Erfahrung', it: 'Valuta la tua esperienza', pt: 'Avalie sua experiência', ru: 'Оцените ваш опыт', zh: '为您的体验评分', ja: '体験を評価', ko: '경험 평가' },
  yourFeedback: { en: 'Your feedback', es: 'Tus comentarios', fr: 'Votre avis', de: 'Ihr Feedback', it: 'Il tuo feedback', pt: 'Seu feedback', ru: 'Ваш отзыв', zh: '您的反馈', ja: 'あなたのフィードバック', ko: '피드백' },
  feedbackPlaceholder: { en: 'Tell us what you think...', es: 'Cuéntanos qué piensas...', fr: 'Dites-nous ce que vous en pensez...', de: 'Sagen Sie uns, was Sie denken...', it: 'Dicci cosa ne pensi...', pt: 'Diga-nos o que você acha...', ru: 'Расскажите, что вы думаете...', zh: '告诉我们您的想法…', ja: 'ご意見をお聞かせください…', ko: '생각을 알려주세요...' },
  submitFeedback: { en: 'Submit Feedback', es: 'Enviar comentarios', fr: 'Envoyer le feedback', de: 'Feedback senden', it: 'Invia feedback', pt: 'Enviar feedback', ru: 'Отправить отзыв', zh: '提交反馈', ja: 'フィードバックを送信', ko: '피드백 제출' },
  thankYouFeedback: { en: 'Thank you for your feedback!', es: '¡Gracias por tus comentarios!', fr: 'Merci pour votre retour !', de: 'Danke für Ihr Feedback!', it: 'Grazie per il tuo feedback!', pt: 'Obrigado pelo seu feedback!', ru: 'Спасибо за ваш отзыв!', zh: '感谢您的反馈！', ja: 'フィードバックありがとうございます！', ko: '피드백 감사합니다!'},
  // Wind unit labels
  wind_ms_label: { en: 'm/s (meters per second)', es: 'm/s (metros por segundo)', fr: 'm/s (mètres par seconde)', de: 'm/s (Meter pro Sekunde)', it: 'm/s (metri al secondo)', pt: 'm/s (metros por segundo)', ru: 'м/с (метров в секунду)', zh: 'm/s（米/秒）', ja: 'm/s（メートル/秒）', ko: 'm/s (초당 미터)' },
  wind_kmh_label: { en: 'km/h (kilometers per hour)', es: 'km/h (kilómetros por hora)', fr: 'km/h (kilomètres par heure)', de: 'km/h (Kilometer pro Stunde)', it: 'km/h (chilometri orari)', pt: 'km/h (quilômetros por hora)', ru: 'км/ч (километров в час)', zh: 'km/h（公里/小时）', ja: 'km/h（キロ/時）', ko: 'km/h (시간당 킬로미터)' },
  wind_mph_label: { en: 'mph (miles per hour)', es: 'mph (millas por hora)', fr: 'mph (miles par heure)', de: 'mph (Meilen pro Stunde)', it: 'mph (miglia orarie)', pt: 'mph (milhas por hora)', ru: 'миль/ч (миль в час)', zh: 'mph（英里/小时）', ja: 'mph（マイル/時）', ko: 'mph (시간당 마일)' },
  wind_kn_label: { en: 'kn (knots)', es: 'kn (nudos)', fr: 'kn (nœuds)', de: 'kn (Knoten)', it: 'kn (nodi)', pt: 'kn (nós)', ru: 'уз (узлы)', zh: 'kn（节）', ja: 'kn（ノット）', ko: 'kn (노트)' },
  wind_points_label: { en: 'points (0–12 Beaufort scale)', es: 'puntos (escala Beaufort 0–12)', fr: 'points (échelle de Beaufort 0–12)', de: 'Punkte (Beaufort-Skala 0–12)', it: 'punti (scala Beaufort 0–12)', pt: 'pontos (escala Beaufort 0–12)', ru: 'баллы (шкала Бофорта 0–12)', zh: '级（蒲福风级0–12）', ja: 'ポイント（ビューフォート風力階級 0–12）', ko: '포인트 (보퍼트 0–12)'}
  ,
  // Astronomy / Moon
  astronomyTitle: { en: 'Astronomy', es: 'Astronomía', fr: 'Astronomie', de: 'Astronomie', it: 'Astronomia', pt: 'Astronomia', ru: 'Астрономия', zh: '天文', ja: '天文学', ko: '천문' },
  moonPhase: { en: 'Moon Phase', es: 'Fase Lunar', fr: 'Phase Lunaire', de: 'Mondphase', it: 'Fase Lunare', pt: 'Fase da Lua', ru: 'Фаза Луны', zh: '月相', ja: '月相', ko: '달의 위상' },
  moonrise: { en: 'Moonrise', es: 'Salida de la Luna', fr: 'Lever de la Lune', de: 'Mondaufgang', it: 'Sorgere della Luna', pt: 'Nascer da Lua', ru: 'Восход Луны', zh: '月出', ja: '月の出', ko: '월출' },
  moonset: { en: 'Moonset', es: 'Puesta de la Luna', fr: 'Coucher de la Lune', de: 'Monduntergang', it: 'Tramonto della Luna', pt: 'Pôr da Lua', ru: 'Заход Луны', zh: '月落', ja: '月の入', ko: '월몰' },
  moonIllumination: { en: 'Illumination', es: 'Iluminación', fr: 'Illumination', de: 'Beleuchtung', it: 'Illuminazione', pt: 'Iluminação', ru: 'Освещённость', zh: '照明', ja: '照度', ko: '조도' },
  moonAge: { en: 'Age', es: 'Edad', fr: 'Âge', de: 'Alter', it: 'Età', pt: 'Idade', ru: 'Возраст', zh: '月龄', ja: '月齢', ko: '월령' },
  moon_new: { en: 'New Moon', es: 'Luna Nueva', fr: 'Nouvelle Lune', de: 'Neumond', it: 'Luna Nuova', pt: 'Lua Nova', ru: 'Новолуние', zh: '新月', ja: '新月', ko: '삭' },
  moon_waxing_crescent: { en: 'Waxing Crescent', es: 'Creciente', fr: 'Premier Croissant', de: 'Zunehmende Sichel', it: 'Crescente', pt: 'Crescente', ru: 'Растущий Серп', zh: '娥眉月', ja: '三日月（上弦前）', ko: '초승달' },
  moon_first_quarter: { en: 'First Quarter', es: 'Cuarto Creciente', fr: 'Premier Quartier', de: 'Zunehmendes Halbmond', it: 'Primo Quarto', pt: 'Quarto Crescente', ru: 'Первая Четверть', zh: '上弦月', ja: '上弦', ko: '상현' },
  moon_waxing_gibbous: { en: 'Waxing Gibbous', es: 'Gibosa Creciente', fr: 'Gibbeuse Croissante', de: 'Zunehmender Dreiviertelmond', it: 'Gibbosa Crescente', pt: 'Gibosa Crescente', ru: 'Растущая Выпуклая', zh: '盈凸月', ja: '十三夜/月齢11-14', ko: '상현 망간' },
  moon_full: { en: 'Full Moon', es: 'Luna Llena', fr: 'Pleine Lune', de: 'Vollmond', it: 'Luna Piena', pt: 'Lua Cheia', ru: 'Полнолуние', zh: '满月', ja: '満月', ko: '보름달' },
  moon_waning_gibbous: { en: 'Waning Gibbous', es: 'Gibosa Menguante', fr: 'Gibbeuse Décroissante', de: 'Abnehmender Dreiviertelmond', it: 'Gibbosa Calante', pt: 'Gibosa Minguante', ru: 'Убывающая Выпуклая', zh: '亏凸月', ja: '十六夜/月齢16-18', ko: '하현 망간 전' },
  moon_last_quarter: { en: 'Last Quarter', es: 'Cuarto Menguante', fr: 'Dernier Quartier', de: 'Letztes Viertel', it: 'Ultimo Quarto', pt: 'Quarto Minguante', ru: 'Последняя Четверть', zh: '下弦月', ja: '下弦', ko: '하현' },
  moon_waning_crescent: { en: 'Waning Crescent', es: 'Menguante', fr: 'Dernier Croissant', de: 'Abnehmende Sichel', it: 'Calante', pt: 'Minguante', ru: 'Убывающий Серп', zh: '残月', ja: '有明月', ko: '그믐달' },
  
  // Welcome Modal
  welcome: { en: 'Welcome', es: 'Bienvenido', fr: 'Bienvenue', de: 'Willkommen', it: 'Benvenuto', pt: 'Bem-vindo', ru: 'Добро пожаловать', zh: '欢迎', ja: 'ようこそ', ko: '환영합니다' },
  welcomeSubtitle: { en: 'Configure your preferences', es: 'Configura tus preferencias', fr: 'Configurez vos préférences', de: 'Konfigurieren Sie Ihre Einstellungen', it: 'Configura le tue preferenze', pt: 'Configure suas preferências', ru: 'Настройте ваши предпочтения', zh: '配置您的偏好设置', ja: 'お好みを設定してください', ko: '당신의 선호도를 설정하세요' },
  timeFormatDesc: { en: 'Auto: Uses your system settings', es: 'Auto: Usa la configuración del sistema', fr: 'Auto: Utilise les paramètres de votre système', de: 'Auto: Verwendet Ihre Systemeinstellungen', it: 'Auto: Utilizza le impostazioni di sistema', pt: 'Auto: Usa as configurações do seu sistema', ru: 'Авто: использует системные параметры', zh: '自动：使用您的系统设置', ja: '自動：お使いのシステム設定を使用します', ko: '자동：시스템 설정 사용' },
  rollbackModeDesc: { en: 'Use fallback services', es: 'Usar servicios de respaldo', fr: 'Utiliser les services de secours', de: 'Verwenden Sie Fallback-Services', it: 'Utilizza servizi di fallback', pt: 'Usar serviços de fallback', ru: 'Использовать резервные сервисы', zh: '使用备用服务', ja: 'フォールバックサービスを使用', ko: '대체 서비스 사용' },
  thanksFromAdmin: { en: 'Thanks from Admin', es: 'Gracias del Administrador', fr: 'Merci de l\'Administrateur', de: 'Danke vom Admin', it: 'Grazie da Admin', pt: 'Obrigado do Admin', ru: 'Спасибо от администратора', zh: '管理员的感谢', ja: '管理者からのお礼', ko: '관리자 감사의 말' },
  adminMessage: { en: 'Thank you for using Alpik941 Weather App! We appreciate your feedback and support. Enjoy accurate weather forecasts and beautiful 3D visualization!', es: '¡Gracias por usar la aplicación de clima Alpik941! Apreciamos tus comentarios y apoyo. ¡Disfruta pronósticos de clima precisos y hermosa visualización en 3D!', fr: 'Merci d\'utiliser l\'application météo Alpik941 ! Nous apprécions vos commentaires et votre soutien. Profitez de prévisions météo précises et d\'une belle visualisation 3D !', de: 'Vielen Dank, dass Sie die Alpik941-Wetter-App verwenden! Wir schätzen Ihr Feedback und Ihre Unterstützung. Genießen Sie genaue Wettervorhersagen und schöne 3D-Visualisierung!', it: 'Grazie per aver utilizzato l\'app meteorologica Alpik941! Apprezziamo il tuo feedback e il tuo supporto. Goditi previsioni meteorologiche accurate e una bellissima visualizzazione 3D!', pt: 'Obrigado por usar o aplicativo de clima Alpik941! Apreciamos seu feedback e suporte. Desfrute de previsões de clima precisas e bela visualização 3D!', ru: 'Спасибо за использование приложения Alpik941 Weather! Мы ценим вашу обратную связь и поддержку. Наслаждайтесь точными прогнозами погоды и красивой 3D-визуализацией!', zh: '感谢您使用Alpik941天气应用！我们感谢您的反馈和支持。享受准确的天气预报和美丽的3D可视化！', ja: 'Alpik941天気アプリをご使用いただきありがとうございます！フィードバックとサポートに感謝します。正確な天気予報と美しい3D可視化をお楽しみください！', ko: 'Alpik941 날씨 앱을 사용해주셔서 감사합니다! 피드백과 지원에 감사드립니다. 정확한 날씨 예보와 아름다운 3D 시각화를 즐기세요!' },
  getStarted: { en: 'Get Started', es: 'Comenzar', fr: 'Commencer', de: 'Beginnen', it: 'Inizia', pt: 'Começar', ru: 'Начать', zh: '开始', ja: '開始', ko: '시작하기' },
  on: { en: 'ON', es: 'ENCENDIDO', fr: 'ACTIVÉ', de: 'AN', it: 'ACCESO', pt: 'LIGADO', ru: 'ВКЛ', zh: '开启', ja: 'オン', ko: '켜짐' },
  off: { en: 'OFF', es: 'APAGADO', fr: 'DÉSACTIVÉ', de: 'AUS', it: 'SPENTO', pt: 'DESLIGADO', ru: 'ВЫКЛ', zh: '关闭', ja: 'オフ', ko: '꺼짐' }
};

export const LanguageContext = createContext(undefined);

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

export const LanguageProvider = ({ children }) => {
  const [language, setLanguage] = useState(() => {
    const saved = localStorage.getItem('weather-language');
    return saved || 'en';
  });

  useEffect(() => {
    localStorage.setItem('weather-language', language);
  }, [language]);

  const t = (key) => {
    return translations[key]?.[language] || key;
  };

  const value = {
    language,
    setLanguage,
    t
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};