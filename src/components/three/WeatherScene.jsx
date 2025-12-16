import SunriseSunsetScene from './SunriseSunsetScene';

export default function WeatherScene({ weatherData }) {
  const sunrise = weatherData.sys.sunrise * 1000;
  const sunset = weatherData.sys.sunset * 1000;
  const currentTime = Date.now();
  const weather = weatherData.weather[0].main;

  return (
    <SunriseSunsetScene
      sunrise={sunrise}
      sunset={sunset}
      currentTime={currentTime}
      weather={weather}
    />
  );
}
