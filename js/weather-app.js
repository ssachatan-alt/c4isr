/**
 * Global Weather App Engine & Multi-Language Translation System
 * Part of C4ISRnova — Designed by S SACHATAN
 * Provides clean, multi-country live weather, auto-detect location, and city search.
 */

const WeatherApp = (() => {
  let currentLang = 'en';
  let currentCity = {
    name: 'New Delhi',
    country: 'India',
    lat: 28.6139,
    lon: 77.2090
  };
  let weatherData = null;
  let tempUnit = 'C'; // 'C' or 'F'

  // Multi-Language Dictionary
  const I18N = {
    en: {
      appName: 'GLOBAL WEATHER STATION',
      searchPlaceholder: 'Search city, capital, or country (e.g. London, Tokyo, Paris)...',
      autoDetect: 'AUTO-DETECT MY LOCATION',
      detecting: 'DETECTING LOCATION...',
      currentWeather: 'CURRENT WEATHER',
      feelsLike: 'Feels like',
      humidity: 'HUMIDITY',
      wind: 'WIND',
      visibility: 'VISIBILITY',
      pressure: 'BAROMETER',
      uvIndex: 'UV INDEX',
      sunrise: 'SUNRISE',
      sunset: 'SUNSET',
      high: 'H',
      low: 'L',
      hourlyForecast: '24-HOUR HOURLY FORECAST',
      weeklyForecast: '7-DAY STRATEGIC FORECAST',
      viewOnMap: 'VIEW IN C4ISR MAP',
      quickPicks: 'GLOBAL PRESETS:',
      today: 'Today',
      days: ['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'],
      weatherCodes: {
        0: 'Clear Sky',
        1: 'Mainly Clear',
        2: 'Partly Cloudy',
        3: 'Overcast',
        45: 'Foggy',
        48: 'Depositing Rime Fog',
        51: 'Light Drizzle',
        53: 'Moderate Drizzle',
        55: 'Dense Drizzle',
        61: 'Slight Rain',
        63: 'Moderate Rain',
        65: 'Heavy Rain',
        71: 'Slight Snow',
        73: 'Moderate Snow',
        75: 'Heavy Snow',
        77: 'Snow Grains',
        80: 'Passing Showers',
        81: 'Moderate Showers',
        82: 'Violent Showers',
        85: 'Slight Snow Showers',
        86: 'Heavy Snow Showers',
        95: 'Thunderstorm',
        96: 'Thunderstorm with Hail',
        99: 'Severe Hail Storm'
      }
    },
    es: {
      appName: 'ESTACIÓN METEOROLÓGICA GLOBAL',
      searchPlaceholder: 'Buscar ciudad, capital o país (ej. Madrid, Tokio, París)...',
      autoDetect: 'DETECTAR MI UBICACIÓN',
      detecting: 'DETECTANDO UBICACIÓN...',
      currentWeather: 'CLIMA ACTUAL',
      feelsLike: 'Sensación térmica',
      humidity: 'HUMEDAD',
      wind: 'VIENTO',
      visibility: 'VISIBILIDAD',
      pressure: 'BARÓMETRO',
      uvIndex: 'ÍNDICE UV',
      sunrise: 'AMANECER',
      sunset: 'ATARDECER',
      high: 'Máx',
      low: 'Mín',
      hourlyForecast: 'PRONÓSTICO DE 24 HORAS',
      weeklyForecast: 'PRONÓSTICO DE 7 DÍAS',
      viewOnMap: 'VER EN MAPA C4ISR',
      quickPicks: 'PAÍSES DESTACADOS:',
      today: 'Hoy',
      days: ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb'],
      weatherCodes: {
        0: 'Cielo Despejado',
        1: 'Mayormente Despejado',
        2: 'Parcialmente Nublado',
        3: 'Nublado',
        45: 'Niebla',
        48: 'Niebla con Escarcha',
        51: 'Llovizna Ligera',
        53: 'Llovizna Moderada',
        55: 'Llovizna Densa',
        61: 'Lluvia Ligera',
        63: 'Lluvia Moderada',
        65: 'Lluvia Fuerte',
        71: 'Nieve Ligera',
        73: 'Nieve Moderada',
        75: 'Nieve Intensa',
        77: 'Granizo Menudo',
        80: 'Chubascos Leves',
        81: 'Chubascos Moderados',
        82: 'Chubascos Violentos',
        85: 'Chubascos de Nieve',
        86: 'Fuertes Chubascos de Nieve',
        95: 'Tormenta Eléctrica',
        96: 'Tormenta con Granizo',
        99: 'Tormenta Severa con Granizo'
      }
    },
    fr: {
      appName: 'STATION MÉTÉOROLOGIQUE MONDIALE',
      searchPlaceholder: 'Rechercher ville, capitale ou pays (ex. Paris, Tokyo, Londres)...',
      autoDetect: 'DÉTECTER MA POSITION',
      detecting: 'DÉTECTION EN COURS...',
      currentWeather: 'MÉTÉO ACTUELLE',
      feelsLike: 'Ressenti',
      humidity: 'HUMIDITÉ',
      wind: 'VENT',
      visibility: 'VISIBILITÉ',
      pressure: 'BAROMÈTRE',
      uvIndex: 'INDICE UV',
      sunrise: 'LEVER DU SOLEIL',
      sunset: 'COUCHER DU SOLEIL',
      high: 'Max',
      low: 'Min',
      hourlyForecast: 'PRÉVISIONS SUR 24 HEURES',
      weeklyForecast: 'PRÉVISIONS SUR 7 JOURS',
      viewOnMap: 'VOIR SUR LE CARTE C4ISR',
      quickPicks: 'SÉLECTION MONDIALE:',
      today: 'Aujourd\'hui',
      days: ['Dim', 'Lun', 'Mar', 'Mer', 'Jeu', 'Ven', 'Sam'],
      weatherCodes: {
        0: 'Ciel Dégagé',
        1: 'Principalement Dégagé',
        2: 'Partiellement Nuageux',
        3: 'Couvert',
        45: 'Brouillard',
        48: 'Brouillard Givrant',
        51: 'Bruine Légère',
        53: 'Bruine Modérée',
        55: 'Bruine Dense',
        61: 'Pluie Légère',
        63: 'Pluie Modérée',
        65: 'Forte Pluie',
        71: 'Neige Légère',
        73: 'Neige Modérée',
        75: 'Forte Neige',
        77: 'Grains de Neige',
        80: 'Averses Légères',
        81: 'Averses Modérées',
        82: 'Averses Violentes',
        85: 'Averses de Neige',
        86: 'Fortes Averses de Neige',
        95: 'Orage',
        96: 'Orage avec Grêle',
        99: 'Orage Violent avec Grêle'
      }
    },
    de: {
      appName: 'GLOBALE WETTERSTATION',
      searchPlaceholder: 'Stadt, Hauptstadt oder Land suchen (z. B. Berlin, Tokio, Wien)...',
      autoDetect: 'STANDORT AUTOMATISCH ERKENNEN',
      detecting: 'STANDORT WIRD ERMITTELT...',
      currentWeather: 'AKTUELLES WETTER',
      feelsLike: 'Gefühlt wie',
      humidity: 'LUFTFEUCHTIGKEIT',
      wind: 'WIND',
      visibility: 'SICHTWEITE',
      pressure: 'BAROMETER',
      uvIndex: 'UV-INDEX',
      sunrise: 'SONNENAUFGANG',
      sunset: 'SONNENUNTERGANG',
      high: 'Max',
      low: 'Min',
      hourlyForecast: '24-STUNDEN-VORHERSAGE',
      weeklyForecast: '7-TAGE-VORHERSAGE',
      viewOnMap: 'IN C4ISR-KARTE ANZEIGEN',
      quickPicks: 'LÄNDERAUSWAHL:',
      today: 'Heute',
      days: ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'],
      weatherCodes: {
        0: 'Klarer Himmel',
        1: 'Überwiegend Klar',
        2: 'Teilweise Bewölkt',
        3: 'Bedeckt',
        45: 'Nebel',
        48: 'Raureifnebel',
        51: 'Leichter Nieselregen',
        53: 'Mäßiger Nieselregen',
        55: 'Dichter Nieselregen',
        61: 'Leichter Regen',
        63: 'Mäßiger Regen',
        65: 'Starker Regen',
        71: 'Leichter Schneefall',
        73: 'Mäßiger Schneefall',
        75: 'Starker Schneefall',
        77: 'Schneegriesel',
        80: 'Regenschauer',
        81: 'Mäßige Regenschauer',
        82: 'Heftige Regenschauer',
        85: 'Schneeschauer',
        86: 'Starke Schneeschauer',
        95: 'Gewitter',
        96: 'Gewitter mit Hagel',
        99: 'Schweres Hagelgewitter'
      }
    },
    hi: {
      appName: 'वैश्विक मौसम केंद्र',
      searchPlaceholder: 'शहर, राजधानी या देश खोजें (उदा. दिल्ली, मुंबई, टोक्यो)...',
      autoDetect: 'मेरा स्थान स्वतः पहचानें',
      detecting: 'स्थान पहचाना जा रहा है...',
      currentWeather: 'वर्तमान मौसम',
      feelsLike: 'अनुमानित तापमान',
      humidity: 'आर्द्रता',
      wind: 'वायु गति',
      visibility: 'दृश्यता',
      pressure: 'वायुदाब',
      uvIndex: 'यूवी इंडेक्स',
      sunrise: 'सूर्योदय',
      sunset: 'सूर्यास्त',
      high: 'अधिकतम',
      low: 'न्यूनतम',
      hourlyForecast: '24 घंटे का पूर्वानुमान',
      weeklyForecast: '7 दिनों का रणनीतिक पूर्वानुमान',
      viewOnMap: 'C4ISR मानचित्र पर देखें',
      quickPicks: 'प्रमुख शहर:',
      today: 'आज',
      days: ['रवि', 'सोम', 'मंगल', 'बुध', 'गुरु', 'शुक्र', 'शनि'],
      weatherCodes: {
        0: 'साफ़ आसमान',
        1: 'अधिकांशतः साफ़',
        2: 'आंशिक रूप से बादल',
        3: 'घने बादल',
        45: 'कोहरा',
        48: 'सफेद घना कोहरा',
        51: 'हल्की बूंदाबांदी',
        53: 'मध्यम बूंदाबांदी',
        55: 'तेज बूंदाबांदी',
        61: 'हल्की बारिश',
        63: 'मध्यम बारिश',
        65: 'भारी बारिश',
        71: 'हल्की बर्फबारी',
        73: 'मध्यम बर्फबारी',
        75: 'भारी बर्फबारी',
        77: 'ओले के दाने',
        80: 'वर्षा बौछार',
        81: 'मध्यम बौछार',
        82: 'तेज मूसलाधार बौछार',
        85: 'हल्के हिमपात की बौछार',
        86: 'भारी हिमपात की बौछार',
        95: 'गरज के साथ तूफान',
        96: 'ओलावृष्टि के साथ तूफान',
        99: 'भीषण ओलावृष्टि'
      }
    },
    ja: {
      appName: 'グローバル気象観測ステーション',
      searchPlaceholder: '都市、首都、国を検索 (例: 東京、ロンドン、パリ)...',
      autoDetect: '現在地を自動検出',
      detecting: '位置情報を取得中...',
      currentWeather: '現在の気象状況',
      feelsLike: '体感温度',
      humidity: '湿度',
      wind: '風速',
      visibility: '視程',
      pressure: '気圧',
      uvIndex: 'UV指数',
      sunrise: '日の出',
      sunset: '日の入り',
      high: '最高',
      low: '最低',
      hourlyForecast: '24時間ごとの予報',
      weeklyForecast: '週間7日間の予報',
      viewOnMap: 'C4ISRマップで表示',
      quickPicks: '世界主要都市:',
      today: '今日',
      days: ['日', '月', '火', '水', '木', '金', '土'],
      weatherCodes: {
        0: '快晴',
        1: '晴れ',
        2: '一部曇り',
        3: '曇り',
        45: '霧',
        48: '着氷性の霧',
        51: '小雨 / 霧雨',
        53: '霧雨 (中程度)',
        55: '激しい霧雨',
        61: '小雨',
        63: '雨 (中程度)',
        65: '激しい大雨',
        71: '小雪',
        73: '雪 (中程度)',
        75: '大雪',
        77: '霧雪',
        80: 'にわか雨',
        81: '中程度のにわか雨',
        82: '激しいにわか雨',
        85: 'にわか雪',
        86: '激しいにわか雪',
        95: '雷雨',
        96: '雹を伴う雷雨',
        99: '猛烈な雹を伴う雷雨'
      }
    },
    ru: {
      appName: 'ГЛОБАЛЬНАЯ МЕТЕОСТАНЦИЯ',
      searchPlaceholder: 'Поиск города, столицы или страны (напр. Москва, Лондон)...',
      autoDetect: 'ОПРЕДЕЛИТЬ МОЕ МЕСТОПОЛОЖЕНИЕ',
      detecting: 'ОПРЕДЕЛЕНИЕ МЕСТОПОЛОЖЕНИЯ...',
      currentWeather: 'ТЕКУЩАЯ ПОГОДА',
      feelsLike: 'Ощущается как',
      humidity: 'ВЛАЖНОСТЬ',
      wind: 'ВЕТЕР',
      visibility: 'ВИДИМОСТЬ',
      pressure: 'ДАВЛЕНИЕ',
      uvIndex: 'УФ-ИНДЕКС',
      sunrise: 'ВОСХОД',
      sunset: 'ЗАКАТ',
      high: 'Макс',
      low: 'Мин',
      hourlyForecast: '24-ЧАСОВОЙ ПРОГНОЗ',
      weeklyForecast: '7-ДНЕВНЫЙ ПРОГНОЗ',
      viewOnMap: 'ПОКАЗАТЬ НА КАРТЕ C4ISR',
      quickPicks: 'СТРАНЫ МИРА:',
      today: 'Сегодня',
      days: ['Вс', 'Пн', 'Вт', 'Ср', 'Чт', 'Пт', 'Сб'],
      weatherCodes: {
        0: 'Ясно',
        1: 'Преимущественно ясно',
        2: 'Переменная облачность',
        3: 'Пасмурно',
        45: 'Туман',
        48: 'Изморозь',
        51: 'Легкая морось',
        53: 'Умеренная морось',
        55: 'Плотная морось',
        61: 'Небольшой дождь',
        63: 'Умеренный дождь',
        65: 'Сильный дождь',
        71: 'Небольшой снегопад',
        73: 'Умеренный снег',
        75: 'Сильный снегопад',
        77: 'Снежные зерна',
        80: 'Кратковременный дождь',
        81: 'Умеренный ливень',
        82: 'Сильный ливень',
        85: 'Снегопад',
        86: 'Сильный снегопад',
        95: 'Гроза',
        96: 'Гроза с градом',
        99: 'Сильная гроза с градом'
      }
    },
    ar: {
      appName: 'محطة الأرصاد الجوية العالمية',
      searchPlaceholder: 'ابحث عن مدينة أو عاصمة أو بلد (مثل القاهرة، دبي، لندن)...',
      autoDetect: 'تحديد موقعي المباشر تلقائياً',
      detecting: 'جاري تحديد الموقع...',
      currentWeather: 'الطقس الحالي',
      feelsLike: 'الحرارة المحسوسة',
      humidity: 'الرطوبة',
      wind: 'الرياح',
      visibility: 'الرؤية',
      pressure: 'الضغط الجوي',
      uvIndex: 'مؤشر الأشعة',
      sunrise: 'الشروق',
      sunset: 'الغروب',
      high: 'أقصى',
      low: 'أدنى',
      hourlyForecast: 'توقعات 24 ساعة القادمة',
      weeklyForecast: 'توقعات 7 أيام القادمة',
      viewOnMap: 'عرض في خريطة C4ISR',
      quickPicks: 'دول مختارة:',
      today: 'اليوم',
      days: ['الأحد', 'الاثنين', 'الثلاثاء', 'الأربعاء', 'الخميس', 'الجمعة', 'السبت'],
      weatherCodes: {
        0: 'سماء صافية',
        1: 'صافٍ غالباً',
        2: 'غائم جزئياً',
        3: 'غائم كلياً',
        45: 'ضباب',
        48: 'ضباب جليدي',
        51: 'رذاذ خفيف',
        53: 'رذاذ معتدل',
        55: 'رذاذ كثيف',
        61: 'مطر خفيف',
        63: 'مطر معتدل',
        65: 'أمطار غزيرة',
        71: 'ثلوج خفيفة',
        73: 'ثلوج معتدلة',
        75: 'ثلوج كثيفة',
        77: 'حبيبات ثلجية',
        80: 'زخات مطر خفيفة',
        81: 'زخات مطر متوسطة',
        82: 'زخات مطر عنيفة',
        85: 'زخات ثلجية خفيفة',
        86: 'عاصفة ثلجية',
        95: 'عاصفة رعدية',
        96: 'عاصفة رعدية مصحوبة بالبَرَد',
        99: 'عاصفة بَرَد شديدة'
      }
    },
    zh: {
      appName: '全球全天候气象中心',
      searchPlaceholder: '搜索城市、首都或国家 (例如: 北京、上海、伦敦、东京)...',
      autoDetect: '自动定位当前位置',
      detecting: '正在获取定位...',
      currentWeather: '当前天气',
      feelsLike: '体感温度',
      humidity: '湿度',
      wind: '风速',
      visibility: '能见度',
      pressure: '气压',
      uvIndex: '紫外线指数',
      sunrise: '日出',
      sunset: '日落',
      high: '最高',
      low: '最低',
      hourlyForecast: '24小时逐时预报',
      weeklyForecast: '7天战略气象预报',
      viewOnMap: '在 C4ISR 地图中查看',
      quickPicks: '全球主要城市:',
      today: '今天',
      days: ['周日', '周一', '周二', '周三', '周四', '周五', '周六'],
      weatherCodes: {
        0: '晴朗无云',
        1: '大部晴朗',
        2: '多云',
        3: '阴天',
        45: '有雾',
        48: '冰雾',
        51: '小毛毛雨',
        53: '中毛毛雨',
        55: '密毛毛雨',
        61: '小雨',
        63: '中雨',
        65: '大雨 / 暴雨',
        71: '小雪',
        73: '中雪',
        75: '大雪 / 暴雪',
        77: '雪粒',
        80: '轻度阵雨',
        81: '中度阵雨',
        82: '强阵雨',
        85: '轻度阵雪',
        86: '强阵雪',
        95: '雷阵雨',
        96: '雷雨伴有冰雹',
        99: '强雷雨伴有冰雹'
      }
    },
    pt: {
      appName: 'ESTAÇÃO METEOROLÓGICA GLOBAL',
      searchPlaceholder: 'Buscar cidade, capital ou país (ex: Brasília, Lisboa, Tóquio)...',
      autoDetect: 'DETECTAR LOCALIZAÇÃO AO VIVO',
      detecting: 'DETECTANDO LOCALIZAÇÃO...',
      currentWeather: 'TEMPO ATUAL',
      feelsLike: 'Sensação',
      humidity: 'UMIDADE',
      wind: 'VENTO',
      visibility: 'VISIBILIDADE',
      pressure: 'BARÔMETRO',
      uvIndex: 'ÍNDICE UV',
      sunrise: 'NASCER DO SOL',
      sunset: 'PÔR DO SOL',
      high: 'Máx',
      low: 'Mín',
      hourlyForecast: 'PREVISÃO DE 24 HORAS',
      weeklyForecast: 'PREVISÃO DE 7 DIAS',
      viewOnMap: 'VER NO MAPA C4ISR',
      quickPicks: 'DESTAQUES GLOBAIS:',
      today: 'Hoje',
      days: ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'],
      weatherCodes: {
        0: 'Céu Limpo',
        1: 'Predominantemente Limpo',
        2: 'Parcialmente Nublado',
        3: 'Nublado',
        45: 'Neblina',
        48: 'Nevoeiro com Geada',
        51: 'Garoa Leve',
        53: 'Garoa Moderada',
        55: 'Garoa Densa',
        61: 'Chuva Leve',
        63: 'Chuva Moderada',
        65: 'Chuva Forte',
        71: 'Neve Leve',
        73: 'Neve Moderada',
        75: 'Neve Intensa',
        77: 'Grãos de Neve',
        80: 'Pancadas Leves',
        81: 'Pancadas Moderadas',
        82: 'Pancadas Violentas',
        85: 'Pancadas de Neve',
        86: 'Fortes Pancadas de Neve',
        95: 'Tempestade com Trovões',
        96: 'Tempestade com Granizo',
        99: 'Tempestade Severa com Granizo'
      }
    }
  };

  // Curated World Presets
  const GLOBAL_PRESETS = [
    { name: 'New Delhi', country: 'India', flag: '🇮🇳', lat: 28.6139, lon: 77.2090 },
    { name: 'Mumbai', country: 'India', flag: '🇮🇳', lat: 19.0760, lon: 72.8777 },
    { name: 'Bengaluru', country: 'India', flag: '🇮🇳', lat: 12.9716, lon: 77.5946 },
    { name: 'Washington D.C.', country: 'United States', flag: '🇺🇸', lat: 38.9072, lon: -77.0369 },
    { name: 'New York', country: 'United States', flag: '🇺🇸', lat: 40.7128, lon: -74.0060 },
    { name: 'London', country: 'United Kingdom', flag: '🇬🇧', lat: 51.5074, lon: -0.1278 },
    { name: 'Tokyo', country: 'Japan', flag: '🇯🇵', lat: 35.6762, lon: 139.6503 },
    { name: 'Paris', country: 'France', flag: '🇫🇷', lat: 48.8566, lon: 2.3522 },
    { name: 'Berlin', country: 'Germany', flag: '🇩🇪', lat: 52.5200, lon: 13.4050 },
    { name: 'Dubai', country: 'United Arab Emirates', flag: '🇦🇪', lat: 25.2048, lon: 55.2708 },
    { name: 'Singapore', country: 'Singapore', flag: '🇸🇬', lat: 1.3521, lon: 103.8198 },
    { name: 'Sydney', country: 'Australia', flag: '🇦🇺', lat: -33.8688, lon: 151.2093 },
    { name: 'Cairo', country: 'Egypt', flag: '🇪🇬', lat: 30.0444, lon: 31.2357 },
    { name: 'Brasília', country: 'Brazil', flag: '🇧🇷', lat: -15.7975, lon: -47.8919 },
    { name: 'Moscow', country: 'Russia', flag: '🇷🇺', lat: 55.7558, lon: 37.6173 },
    { name: 'Beijing', country: 'China', flag: '🇨🇳', lat: 39.9042, lon: 116.4074 },
    { name: 'Toronto', country: 'Canada', flag: '🇨🇦', lat: 43.6532, lon: -79.3832 },
    { name: 'Cape Town', country: 'South Africa', flag: '🇿🇦', lat: -33.9249, lon: 18.4241 }
  ];

  function getTranslation(key) {
    const dict = I18N[currentLang] || I18N.en;
    return dict[key] || I18N.en[key] || key;
  }

  function getWeatherDesc(code) {
    const dict = I18N[currentLang] || I18N.en;
    return dict.weatherCodes[code] || I18N.en.weatherCodes[code] || 'Fair';
  }

  // Weather SVG Icons based on code and day/night
  function getWeatherIcon(code, isDay = 1) {
    if (code === 0) {
      // Clear
      return isDay
        ? `<svg class="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><circle cx="12" cy="12" r="5" stroke-width="2" fill="#fbbf24" fill-opacity="0.3"></circle><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 1v2m0 18v2M4.22 4.22l1.42 1.42m12.72 12.72l1.42 1.42M1 12h2m18 0h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42"></path></svg>`
        : `<svg class="w-12 h-12 text-indigo-300 drop-shadow-[0_0_15px_rgba(165,180,252,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="#a5b4fc" fill-opacity="0.3" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"></path></svg>`;
    } else if (code <= 2) {
      // Partly Cloudy
      return `<svg class="w-12 h-12 text-yellow-300 drop-shadow-[0_0_12px_rgba(253,224,71,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 3v1m0 16v1m9-9h-1M4 12H3m15.364 6.364l-.707-.707M6.343 6.343l-.707-.707m12.728 0l-.707.707M6.343 17.657l-.707.707M16 12a4 4 0 11-8 0 4 4 0 018 0z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M17 19h1a3 3 0 000-6h-.1a5 5 0 00-9.8 0H8a3 3 0 000 6h9z" fill="#60a5fa" fill-opacity="0.3"></path></svg>`;
    } else if (code === 3) {
      // Overcast
      return `<svg class="w-12 h-12 text-gray-400 drop-shadow-[0_0_12px_rgba(156,163,175,0.4)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="#9ca3af" fill-opacity="0.25" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"></path></svg>`;
    } else if (code >= 51 && code <= 67) {
      // Rain
      return `<svg class="w-12 h-12 text-cyan-400 drop-shadow-[0_0_12px_rgba(34,211,238,0.5)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="#38bdf8" fill-opacity="0.2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M8 19v3m4-3v3m4-3v3"></path></svg>`;
    } else if (code >= 71 && code <= 86) {
      // Snow
      return `<svg class="w-12 h-12 text-blue-200 drop-shadow-[0_0_12px_rgba(191,219,254,0.6)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2v20M2 12h20m-4.5-7.5l-11 11m0-11l11 11"></path><circle cx="12" cy="12" r="3" fill="#bfdbfe" fill-opacity="0.4"></circle></svg>`;
    } else if (code >= 95) {
      // Thunderstorm
      return `<svg class="w-12 h-12 text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.7)]" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="#64748b" fill-opacity="0.3" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"></path><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" fill="#fbbf24" d="M13 11l-3 5h4l-2 5 6-7h-4l3-3z"></path></svg>`;
    }
    // Default Fog / Fair
    return `<svg class="w-12 h-12 text-teal-300" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M3 15a4 4 0 004 4h9a5 5 0 10-.1-9.999 5.002 5.002 0 00-9.78 2.096A4.001 4.001 0 003 15z"></path><line x1="4" y1="21" x2="20" y2="21" stroke-width="2"></line></svg>`;
  }

  // Fetch Forecast from Open-Meteo
  async function fetchCityWeather(city) {
    currentCity = city;
    const loadingBanner = document.getElementById('weather-loading');
    if (loadingBanner) loadingBanner.classList.remove('hidden');

    try {
      TacticalAudio.playScan();
      const url = `https://api.open-meteo.com/v1/forecast?latitude=${city.lat}&longitude=${city.lon}&current=temperature_2m,relative_humidity_2m,apparent_temperature,is_day,precipitation,weather_code,cloud_cover,surface_pressure,wind_speed_10m,wind_direction_10m,wind_gusts_10m,uv_index&hourly=temperature_2m,weather_code,precipitation_probability&daily=weather_code,temperature_2m_max,temperature_2m_min,sunrise,sunset,uv_index_max,precipitation_sum&timezone=auto`;
      
      const res = await fetch(url);
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      weatherData = await res.json();
      renderWeatherView();
      TacticalAudio.playLock();
    } catch (err) {
      console.error('Weather fetch error:', err);
    } finally {
      if (loadingBanner) loadingBanner.classList.add('hidden');
    }
  }

  // Auto-Detect Location (GPS or GeoJS IP fallback)
  async function autoDetectLocation() {
    TacticalAudio.playPing();
    const btn = document.getElementById('btn-weather-autodetect');
    if (btn) {
      btn.innerText = `⏳ ${getTranslation('detecting')}`;
      btn.disabled = true;
    }

    const fallbackToIP = async () => {
      try {
        const res = await fetch('https://get.geojs.io/v1/ip/geo.json');
        const data = await res.json();
        if (data && data.latitude && data.longitude) {
          fetchCityWeather({
            name: data.city || 'Detected City',
            country: data.country || '',
            lat: parseFloat(data.latitude),
            lon: parseFloat(data.longitude)
          });
        }
      } catch (e) {
        console.error('IP Geolocation error:', e);
      } finally {
        if (btn) {
          btn.innerText = `📍 ${getTranslation('autoDetect')}`;
          btn.disabled = false;
        }
      }
    };

    if (navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        async (position) => {
          const lat = position.coords.latitude;
          const lon = position.coords.longitude;
          try {
            // Reverse geocode via BigDataCloud or OpenStreetMap
            const res = await fetch(`https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lon}`);
            const data = await res.json();
            const city = data.address?.city || data.address?.town || data.address?.village || data.address?.county || 'Current Location';
            const country = data.address?.country || '';
            fetchCityWeather({ name: city, country: country, lat, lon });
          } catch (e) {
            fetchCityWeather({ name: 'My Coordinates', country: '', lat, lon });
          } finally {
            if (btn) {
              btn.innerText = `📍 ${getTranslation('autoDetect')}`;
              btn.disabled = false;
            }
          }
        },
        (error) => {
          console.warn('GPS location declined or unavailable, trying IP fallback:', error.message);
          fallbackToIP();
        },
        { timeout: 7000 }
      );
    } else {
      fallbackToIP();
    }
  }

  // Search Cities via Open-Meteo Geocoding API
  async function searchCities(query) {
    if (!query || query.trim().length < 2) return [];
    try {
      const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query.trim())}&count=8&language=${currentLang}&format=json`;
      const res = await fetch(url);
      const data = await res.json();
      return data.results || [];
    } catch (err) {
      console.error('City search error:', err);
      return [];
    }
  }

  // Render Weather View UI
  function renderWeatherView() {
    if (!weatherData) return;
    const c = weatherData.current;
    const d = weatherData.daily;
    const h = weatherData.hourly;

    // Convert Temp if needed
    const formatT = (celsius) => {
      if (tempUnit === 'F') {
        return Math.round((celsius * 9/5) + 32) + '°F';
      }
      return Math.round(celsius) + '°C';
    };

    // Header & Location
    const locTitle = document.getElementById('weather-city-name');
    if (locTitle) locTitle.innerText = `${currentCity.name}${currentCity.country ? ', ' + currentCity.country : ''}`;

    const locCoords = document.getElementById('weather-city-coords');
    if (locCoords) locCoords.innerText = `${currentCity.lat.toFixed(2)}°N, ${currentCity.lon.toFixed(2)}°E`;

    // Weather Icon & Condition Text
    const iconContainer = document.getElementById('weather-condition-icon');
    if (iconContainer) iconContainer.innerHTML = getWeatherIcon(c.weather_code, c.is_day);

    const conditionText = document.getElementById('weather-condition-text');
    if (conditionText) conditionText.innerText = getWeatherDesc(c.weather_code);

    // Current Temp & High/Low
    const currentTemp = document.getElementById('weather-temp-current');
    if (currentTemp) currentTemp.innerText = formatT(c.temperature_2m);

    const feelsLikeEl = document.getElementById('weather-feels-like');
    if (feelsLikeEl) feelsLikeEl.innerText = `${getTranslation('feelsLike')} ${formatT(c.apparent_temperature)}`;

    const hiLoEl = document.getElementById('weather-high-low');
    if (hiLoEl && d && d.temperature_2m_max) {
      hiLoEl.innerText = `${getTranslation('high')}: ${formatT(d.temperature_2m_max[0])}  |  ${getTranslation('low')}: ${formatT(d.temperature_2m_min[0])}`;
    }

    // Metrics Cards
    const humEl = document.getElementById('weather-metric-humidity');
    if (humEl) humEl.innerText = `${c.relative_humidity_2m}%`;

    const windEl = document.getElementById('weather-metric-wind');
    if (windEl) windEl.innerText = `${c.wind_speed_10m} km/h`;

    const pressEl = document.getElementById('weather-metric-pressure');
    if (pressEl) pressEl.innerText = `${Math.round(c.surface_pressure)} hPa`;

    const uvEl = document.getElementById('weather-metric-uv');
    if (uvEl) {
      const uv = c.uv_index || 0;
      let uvLabel = 'Low';
      if (uv >= 3) uvLabel = 'Moderate';
      if (uv >= 6) uvLabel = 'High';
      if (uv >= 8) uvLabel = 'Very High';
      uvEl.innerText = `${uv.toFixed(1)} (${uvLabel})`;
    }

    const sunriseEl = document.getElementById('weather-metric-sunrise');
    if (sunriseEl && d && d.sunrise) {
      const timeStr = d.sunrise[0].split('T')[1] || '';
      sunriseEl.innerText = timeStr;
    }

    const sunsetEl = document.getElementById('weather-metric-sunset');
    if (sunsetEl && d && d.sunset) {
      const timeStr = d.sunset[0].split('T')[1] || '';
      sunsetEl.innerText = timeStr;
    }

    // Render 24-Hour Hourly Forecast
    renderHourlyStrip(h, formatT);

    // Render 7-Day Forecast
    renderWeeklyForecast(d, formatT);

    // Update translated static labels
    updateStaticLabels();
  }

  function renderHourlyStrip(h, formatT) {
    const container = document.getElementById('weather-hourly-container');
    if (!container || !h || !h.time) return;

    const now = new Date();
    const currentHour = now.getHours();
    let html = '';

    // Next 24 hours
    for (let i = currentHour; i < currentHour + 24 && i < h.time.length; i++) {
      const timeStr = h.time[i].split('T')[1] || '';
      const temp = formatT(h.temperature_2m[i]);
      const code = h.weather_code[i];
      const pop = h.precipitation_probability ? h.precipitation_probability[i] : 0;
      const hourNum = parseInt(timeStr.split(':')[0], 10);
      const isDayTime = hourNum >= 6 && hourNum < 19 ? 1 : 0;

      html += `
        <div class="flex-shrink-0 flex flex-col items-center justify-between p-2.5 bg-black/50 border border-emerald-500/20 hover:border-emerald-500/50 rounded-lg w-20 text-center transition-all">
          <span class="text-[11px] text-gray-400 font-mono">${timeStr}</span>
          <div class="my-1 scale-75">${getWeatherIcon(code, isDayTime)}</div>
          <span class="text-xs font-bold text-white font-mono">${temp}</span>
          ${pop > 10 ? `<span class="text-[9px] text-cyan-400 font-mono mt-0.5">💧 ${pop}%</span>` : `<span class="text-[9px] text-gray-600 font-mono mt-0.5">&bull;</span>`}
        </div>
      `;
    }
    container.innerHTML = html;
  }

  function renderWeeklyForecast(d, formatT) {
    const container = document.getElementById('weather-weekly-container');
    if (!container || !d || !d.time) return;

    const days = I18N[currentLang]?.days || I18N.en.days;
    let html = '';

    for (let i = 0; i < Math.min(7, d.time.length); i++) {
      const date = new Date(d.time[i]);
      const dayName = i === 0 ? getTranslation('today') : days[date.getDay()];
      const code = d.weather_code[i];
      const maxT = formatT(d.temperature_2m_max[i]);
      const minT = formatT(d.temperature_2m_min[i]);
      const desc = getWeatherDesc(code);

      html += `
        <div class="flex items-center justify-between py-2 px-3 bg-black/40 border border-emerald-500/15 hover:border-emerald-500/40 rounded-lg transition-all text-xs">
          <div class="w-20 font-bold text-emerald-400 font-mono">${dayName}</div>
          <div class="flex items-center gap-2 flex-1 justify-center">
            <div class="scale-50 -my-3">${getWeatherIcon(code, 1)}</div>
            <span class="text-gray-300 text-[11px] truncate max-w-[130px] hidden sm:inline">${desc}</span>
          </div>
          <div class="flex items-center gap-2 font-mono text-right">
            <span class="text-white font-bold">${maxT}</span>
            <span class="text-gray-500 text-[11px]">${minT}</span>
          </div>
        </div>
      `;
    }
    container.innerHTML = html;
  }

  function updateStaticLabels() {
    const t = (id, key) => {
      const el = document.getElementById(id);
      if (el) el.innerText = getTranslation(key);
    };

    t('lbl-weather-app-name', 'appName');
    t('lbl-weather-hourly', 'hourlyForecast');
    t('lbl-weather-weekly', 'weeklyForecast');
    t('lbl-weather-quick-picks', 'quickPicks');
    t('lbl-weather-view-map', 'viewOnMap');
    t('lbl-metric-humidity-title', 'humidity');
    t('lbl-metric-wind-title', 'wind');
    t('lbl-metric-pressure-title', 'pressure');
    t('lbl-metric-uv-title', 'uvIndex');
    t('lbl-metric-sunrise-title', 'sunrise');
    t('lbl-metric-sunset-title', 'sunset');

    const searchInput = document.getElementById('weather-search-input');
    if (searchInput) searchInput.placeholder = getTranslation('searchPlaceholder');

    const autoBtn = document.getElementById('btn-weather-autodetect');
    if (autoBtn) autoBtn.innerText = `📍 ${getTranslation('autoDetect')}`;
  }

  function setLanguage(lang) {
    if (!I18N[lang]) return;
    currentLang = lang;
    TacticalAudio.playClick();
    updateStaticLabels();
    if (weatherData) renderWeatherView();
  }

  function toggleUnit() {
    tempUnit = tempUnit === 'C' ? 'F' : 'C';
    TacticalAudio.playClick();
    const btn = document.getElementById('btn-weather-unit');
    if (btn) btn.innerText = `°${tempUnit}`;
    if (weatherData) renderWeatherView();
  }

  function viewCityOnMap() {
    TacticalAudio.playPing();
    if (map && currentCity) {
      map.flyTo([currentCity.lat, currentCity.lon], 11, { duration: 2.0 });
      if (typeof dropTargetPin === 'function') {
        dropTargetPin(currentCity.lat, currentCity.lon, currentCity.name);
      }
      if (typeof switchMainTab === 'function') {
        switchMainTab('map');
      }
    }
  }

  // Populate Quick Country Preset Buttons
  function renderPresets() {
    const container = document.getElementById('weather-presets-container');
    if (!container) return;

    let html = '';
    GLOBAL_PRESETS.forEach(p => {
      html += `
        <button onclick="WeatherApp.fetchCityWeather({ name: '${p.name}', country: '${p.country}', lat: ${p.lat}, lon: ${p.lon} })" class="px-2.5 py-1 tactical-btn text-[11px] rounded-full flex items-center gap-1.5 whitespace-nowrap">
          <span>${p.flag}</span>
          <span class="font-bold text-gray-200">${p.name}</span>
        </button>
      `;
    });
    container.innerHTML = html;
  }

  // Live Autocomplete City Search Listener
  function initSearchListener() {
    const input = document.getElementById('weather-search-input');
    const dropdown = document.getElementById('weather-search-results');
    if (!input || !dropdown) return;

    let debounceTimer = null;

    input.addEventListener('input', () => {
      clearTimeout(debounceTimer);
      const q = input.value.trim();
      if (q.length < 2) {
        dropdown.classList.add('hidden');
        return;
      }

      debounceTimer = setTimeout(async () => {
        const results = await searchCities(q);
        if (results && results.length > 0) {
          dropdown.innerHTML = results.map(r => `
            <div class="px-3 py-2 hover:bg-emerald-950/60 cursor-pointer text-xs border-b border-tac-border/30 flex items-center justify-between" onclick="WeatherApp.selectCity(${r.latitude}, ${r.longitude}, '${r.name.replace(/'/g, "\\'")}', '${(r.country || '').replace(/'/g, "\\'")}')">
              <span class="font-bold text-white">${r.name}</span>
              <span class="text-gray-400 text-[10px]">${r.admin1 ? r.admin1 + ', ' : ''}${r.country || ''}</span>
            </div>
          `).join('');
          dropdown.classList.remove('hidden');
        } else {
          dropdown.innerHTML = `<div class="p-2 text-xs text-gray-500">No matching cities found</div>`;
          dropdown.classList.remove('hidden');
        }
      }, 250);
    });

    // Close dropdown on click outside
    document.addEventListener('click', (e) => {
      if (!input.contains(e.target) && !dropdown.contains(e.target)) {
        dropdown.classList.add('hidden');
      }
    });

    input.addEventListener('keydown', (e) => {
      if (e.key === 'Enter') {
        const first = dropdown.querySelector('div');
        if (first) first.click();
      }
    });
  }

  function selectCity(lat, lon, name, country) {
    const input = document.getElementById('weather-search-input');
    const dropdown = document.getElementById('weather-search-results');
    if (input) input.value = '';
    if (dropdown) dropdown.classList.add('hidden');

    fetchCityWeather({ name, country, lat, lon });
  }

  function init() {
    renderPresets();
    initSearchListener();
    fetchCityWeather(currentCity);
  }

  return {
    init,
    fetchCityWeather,
    autoDetectLocation,
    setLanguage,
    toggleUnit,
    viewCityOnMap,
    selectCity,
    getCurrentCity: () => currentCity
  };
})();
