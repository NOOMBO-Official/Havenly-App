import { useState, useEffect } from "react";
import { CloudRain, Droplets, Wind, Sun, Cloud, CloudLightning, Snowflake, Loader2 } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: React.ElementType;
}

const getWeatherIconAndCondition = (code: number) => {
  if (code === 0) return { icon: Sun, condition: "Clear sky" };
  if (code === 1 || code === 2 || code === 3) return { icon: Cloud, condition: "Partly cloudy" };
  if (code >= 45 && code <= 48) return { icon: Cloud, condition: "Fog" };
  if (code >= 51 && code <= 67) return { icon: CloudRain, condition: "Rain" };
  if (code >= 71 && code <= 77) return { icon: Snowflake, condition: "Snow" };
  if (code >= 80 && code <= 82) return { icon: CloudRain, condition: "Rain showers" };
  if (code >= 85 && code <= 86) return { icon: Snowflake, condition: "Snow showers" };
  if (code >= 95 && code <= 99) return { icon: CloudLightning, condition: "Thunderstorm" };
  return { icon: Cloud, condition: "Unknown" };
};

export default function WeatherWidget() {
  const { settings } = useSettings();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        // 1. Geocode the location
        // Try the full location first, if it fails, try just the city name
        let geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(settings.weatherLocation)}&count=1&language=en&format=json`);
        let geoData = await geoRes.json();
        
        if (!geoData.results || geoData.results.length === 0) {
          // Fallback: try just the city name (before the comma)
          const cityOnly = settings.weatherLocation.split(',')[0].trim();
          geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityOnly)}&count=1&language=en&format=json`);
          geoData = await geoRes.json();
          
          if (!geoData.results || geoData.results.length === 0) {
            throw new Error("Location not found");
          }
        }
        
        const { latitude, longitude } = geoData.results[0];

        // 2. Fetch weather data
        const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`);
        const weatherData = await weatherRes.json();

        const current = weatherData.current;
        const { icon, condition } = getWeatherIconAndCondition(current.weather_code);

        setWeather({
          temp: Math.round(current.temperature_2m),
          condition,
          humidity: current.relative_humidity_2m,
          windSpeed: Math.round(current.wind_speed_10m),
          icon
        });
      } catch (err: any) {
        console.error("Failed to fetch weather:", err);
        setError(err.message || "Failed to load weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    // Refresh every 30 minutes
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.weatherLocation]);

  const WeatherIcon = weather?.icon || Cloud;

  return (
    <div className="flex flex-col justify-between p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full relative overflow-hidden">
      {loading && (
        <div className="absolute inset-0 bg-aura-card/50 backdrop-blur-sm flex items-center justify-center z-10">
          <Loader2 className="w-6 h-6 animate-spin text-aura-muted" />
        </div>
      )}
      
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-1">
            {settings.weatherLocation}
          </span>
          <span className="text-4xl font-display font-light text-aura-text">
            {error ? '--°' : weather ? `${weather.temp}°` : '--°'}
          </span>
          <span className="text-sm text-aura-muted mt-1">
            {error ? error : weather ? weather.condition : 'Loading...'}
          </span>
        </div>
        <div className="p-3 rounded-full bg-aura-bg border border-aura-border text-aura-text">
          <WeatherIcon className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-aura-border">
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-aura-muted" strokeWidth={1.5} />
          <span className="text-xs text-aura-text">{weather ? `${weather.humidity}%` : '--%'}</span>
        </div>
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-aura-muted" strokeWidth={1.5} />
          <span className="text-xs text-aura-text">{weather ? `${weather.windSpeed} mph` : '-- mph'}</span>
        </div>
      </div>
    </div>
  );
}
