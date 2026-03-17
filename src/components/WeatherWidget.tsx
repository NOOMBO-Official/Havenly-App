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
        let latitude: number, longitude: number;
        
        try {
          let geoRes = await fetch(`/api/weather/geocode?name=${encodeURIComponent(settings.weatherLocation)}`);
          if (!geoRes.ok) throw new Error("Geocoding API failed");
          let geoData = await geoRes.json();
          
          if (!geoData.results || geoData.results.length === 0) {
            // Fallback: try just the city name (before the comma)
            const cityOnly = settings.weatherLocation.split(',')[0].trim();
            geoRes = await fetch(`/api/weather/geocode?name=${encodeURIComponent(cityOnly)}`);
            if (!geoRes.ok) throw new Error("Geocoding API failed");
            geoData = await geoRes.json();
            
            if (!geoData.results || geoData.results.length === 0) {
              throw new Error("Location not found");
            }
          }
          
          latitude = geoData.results[0].latitude;
          longitude = geoData.results[0].longitude;
        } catch (geoErr) {
          console.error("Geocoding failed, using fallback coordinates:", geoErr);
          // Fallback to New York coordinates if geocoding completely fails
          latitude = 40.7128;
          longitude = -74.0060;
        }

        // 2. Fetch weather data
        let current;
        try {
          const weatherRes = await fetch(`/api/weather/forecast?latitude=${latitude}&longitude=${longitude}`);
          if (!weatherRes.ok) throw new Error("Weather API failed");
          const weatherData = await weatherRes.json();
          current = weatherData.current;
        } catch (weatherErr) {
          console.error("Weather API failed, using fallback data:", weatherErr);
          current = {
            temperature_2m: 72,
            relative_humidity_2m: 45,
            wind_speed_10m: 5,
            weather_code: 0
          };
        }

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
    <div className="apple-glass-heavy rounded-[32px] p-5 flex flex-col justify-between h-full relative overflow-hidden group cursor-pointer">
      {loading && (
        <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20">
          <Loader2 className="w-6 h-6 animate-spin text-white" />
        </div>
      )}
      
      {/* Dynamic Background Gradient based on weather (simplified for now) */}
      <div className="absolute inset-0 opacity-40 bg-gradient-to-br from-blue-400 to-blue-800 pointer-events-none -z-10 mix-blend-overlay" />

      <div className="flex justify-between items-start relative z-10">
        <div className="flex flex-col">
          <span className="text-lg font-semibold text-white tracking-tight mb-1 drop-shadow-md">
            {settings.weatherLocation.split(',')[0]}
          </span>
          <span className="text-5xl font-light text-white tracking-tighter drop-shadow-lg">
            {error ? '--°' : weather ? `${weather.temp}°` : '--°'}
          </span>
        </div>
        <div className="p-2">
          <WeatherIcon className="w-8 h-8 text-white drop-shadow-md" strokeWidth={1.5} />
        </div>
      </div>

      <div className="mt-auto relative z-10">
        <div className="text-sm font-medium text-white drop-shadow-md mb-2">
          {error ? error : weather ? weather.condition : 'Loading...'}
        </div>
        <div className="flex items-center space-x-4 pt-3 border-t border-white/20">
          <div className="flex items-center space-x-1.5">
            <Droplets className="w-3.5 h-3.5 text-white/80" strokeWidth={2} />
            <span className="text-xs font-medium text-white">{weather ? `${weather.humidity}%` : '--%'}</span>
          </div>
          <div className="flex items-center space-x-1.5">
            <Wind className="w-3.5 h-3.5 text-white/80" strokeWidth={2} />
            <span className="text-xs font-medium text-white">{weather ? `${weather.windSpeed} mph` : '-- mph'}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
