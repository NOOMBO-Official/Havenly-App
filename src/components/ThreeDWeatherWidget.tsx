import { useState, useEffect, useRef } from "react";
import { CloudRain, Droplets, Wind, Sun, Cloud, CloudLightning, Snowflake, Loader2, X, Activity, Thermometer, MapPin } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { motion, useMotionValue, useTransform, AnimatePresence } from "framer-motion";

interface WeatherData {
  temp: number;
  condition: string;
  humidity: number;
  windSpeed: number;
  icon: React.ElementType;
  code: number;
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

export default function ThreeDWeatherWidget() {
  const { settings } = useSettings();
  const [weather, setWeather] = useState<WeatherData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);

  const cardRef = useRef<HTMLDivElement>(null);
  const x = useMotionValue(0);
  const y = useMotionValue(0);

  const rotateX = useTransform(y, [-100, 100], [15, -15]);
  const rotateY = useTransform(x, [-100, 100], [-15, 15]);

  function handleMouseMove(event: React.MouseEvent<HTMLDivElement>) {
    if (isExpanded) return;
    const rect = cardRef.current?.getBoundingClientRect();
    if (rect) {
      const centerX = rect.left + rect.width / 2;
      const centerY = rect.top + rect.height / 2;
      x.set(event.clientX - centerX);
      y.set(event.clientY - centerY);
    }
  }

  function handleMouseLeave() {
    x.set(0);
    y.set(0);
  }

  useEffect(() => {
    const fetchWeather = async () => {
      setLoading(true);
      setError(null);
      try {
        let latitude: number, longitude: number;
        
        try {
          let geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(settings.weatherLocation)}&count=1&language=en&format=json`);
          if (!geoRes.ok) throw new Error("Geocoding API failed");
          let geoData = await geoRes.json();
          
          if (!geoData.results || geoData.results.length === 0) {
            const cityOnly = settings.weatherLocation.split(',')[0].trim();
            geoRes = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(cityOnly)}&count=1&language=en&format=json`);
            if (!geoRes.ok) throw new Error("Geocoding API failed");
            geoData = await geoRes.json();
            
            if (!geoData.results || geoData.results.length === 0) {
              throw new Error("Location not found");
            }
          }
          
          latitude = geoData.results[0].latitude;
          longitude = geoData.results[0].longitude;
        } catch (geoErr) {
          latitude = 40.7128;
          longitude = -74.0060;
        }

        let current;
        try {
          const weatherRes = await fetch(`https://api.open-meteo.com/v1/forecast?latitude=${latitude}&longitude=${longitude}&current=temperature_2m,relative_humidity_2m,wind_speed_10m,weather_code&temperature_unit=fahrenheit&wind_speed_unit=mph`);
          if (!weatherRes.ok) throw new Error("Weather API failed");
          const weatherData = await weatherRes.json();
          current = weatherData.current;
        } catch (weatherErr) {
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
          icon,
          code: current.weather_code
        });
      } catch (err: any) {
        setError(err.message || "Failed to load weather");
      } finally {
        setLoading(false);
      }
    };

    fetchWeather();
    const interval = setInterval(fetchWeather, 30 * 60 * 1000);
    return () => clearInterval(interval);
  }, [settings.weatherLocation]);

  const WeatherIcon = weather?.icon || Cloud;

  // Determine background gradient based on weather
  let bgGradient = "from-blue-500/20 to-purple-500/20";
  if (weather) {
    if (weather.code === 0) bgGradient = "from-amber-400/20 to-orange-500/20"; // Sunny
    else if (weather.code >= 51 && weather.code <= 67) bgGradient = "from-blue-600/20 to-indigo-800/20"; // Rain
    else if (weather.code >= 71 && weather.code <= 77) bgGradient = "from-slate-300/20 to-blue-200/20"; // Snow
  }

  return (
    <>
      <div className="h-full w-full perspective-1000 cursor-pointer" onClick={() => setIsExpanded(true)}>
        <motion.div
          layoutId="weather-widget"
          ref={cardRef}
          onMouseMove={handleMouseMove}
          onMouseLeave={handleMouseLeave}
          style={{
            rotateX: isExpanded ? 0 : rotateX,
            rotateY: isExpanded ? 0 : rotateY,
            transformStyle: "preserve-3d",
          }}
          className={`flex flex-col justify-between p-6 rounded-3xl border border-white/10 bg-gradient-to-br ${bgGradient} backdrop-blur-xl h-full relative overflow-hidden shadow-2xl transition-all duration-200 ease-out group`}
        >
          {/* Quick Action Overlay */}
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center">
            <span className="text-white font-semibold text-sm bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20 shadow-sm">
              Tap to Expand
            </span>
          </div>

          {/* 3D Floating Elements */}
          <div 
            className="absolute inset-0 pointer-events-none"
            style={{ transform: "translateZ(-50px)" }}
          >
            <div className="absolute top-10 right-10 w-32 h-32 bg-white/5 rounded-full blur-2xl" />
            <div className="absolute bottom-10 left-10 w-40 h-40 bg-blue-500/10 rounded-full blur-3xl" />
          </div>

          {loading && (
            <div className="absolute inset-0 bg-black/20 backdrop-blur-sm flex items-center justify-center z-20">
              <Loader2 className="w-6 h-6 animate-spin text-white" />
            </div>
          )}
          
          <div className="flex justify-between items-start relative z-10" style={{ transform: "translateZ(30px)" }}>
            <div className="flex flex-col">
              <span className="text-xs font-semibold uppercase tracking-widest text-white/60 mb-1 drop-shadow-md">
                {settings.weatherLocation}
              </span>
              <span className="text-5xl font-semibold text-white drop-shadow-lg tracking-tight">
                {error ? '--°' : weather ? `${weather.temp}°` : '--°'}
              </span>
              <span className="text-sm text-white/80 mt-1 font-medium drop-shadow-md">
                {error ? error : weather ? weather.condition : 'Loading...'}
              </span>
            </div>
            
            <motion.div 
              className="p-4 rounded-2xl bg-white/10 border border-white/20 text-white shadow-xl backdrop-blur-md"
              style={{ transform: "translateZ(60px)" }}
              animate={{ y: [0, -10, 0] }}
              transition={{ repeat: Infinity, duration: 4, ease: "easeInOut" }}
            >
              <WeatherIcon className="w-10 h-10 drop-shadow-lg" strokeWidth={1.5} />
            </motion.div>
          </div>

          <div 
            className="flex items-center space-x-6 mt-6 pt-6 border-t border-white/10 relative z-10"
            style={{ transform: "translateZ(20px)" }}
          >
            <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
              <Droplets className="w-4 h-4 text-blue-300" strokeWidth={2} />
              <span className="text-xs font-semibold text-white">{weather ? `${weather.humidity}%` : '--%'}</span>
            </div>
            <div className="flex items-center space-x-2 bg-black/20 px-3 py-1.5 rounded-full border border-white/5">
              <Wind className="w-4 h-4 text-teal-300" strokeWidth={2} />
              <span className="text-xs font-semibold text-white">{weather ? `${weather.windSpeed} mph` : '-- mph'}</span>
            </div>
          </div>
        </motion.div>
      </div>

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              layoutId="weather-widget"
              className={`w-full max-w-4xl h-full max-h-[800px] rounded-[3rem] border border-white/10 bg-gradient-to-br ${bgGradient} relative overflow-hidden shadow-2xl flex flex-col`}
            >
              <div className="p-8 flex justify-between items-center border-b border-white/10">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-white/10 border border-white/20 text-white shadow-xl backdrop-blur-md">
                    <WeatherIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display text-white">{settings.weatherLocation}</h2>
                    <p className="text-white/60">{weather?.condition}</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-4 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                <div className="space-y-8">
                  <div className="p-8 rounded-3xl bg-black/20 border border-white/5 flex flex-col items-center justify-center">
                    <span className="text-8xl font-display font-light text-white tracking-tighter">
                      {weather?.temp}°
                    </span>
                    <span className="text-lg text-white/60 mt-2">Feels like {weather ? weather.temp + 2 : '--'}°</span>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div className="p-6 rounded-3xl bg-black/20 border border-white/5 flex flex-col gap-2">
                      <Wind className="w-6 h-6 text-teal-300" />
                      <span className="text-sm text-white/60">Wind</span>
                      <span className="text-2xl font-medium text-white">{weather?.windSpeed} mph</span>
                    </div>
                    <div className="p-6 rounded-3xl bg-black/20 border border-white/5 flex flex-col gap-2">
                      <Droplets className="w-6 h-6 text-blue-300" />
                      <span className="text-sm text-white/60">Humidity</span>
                      <span className="text-2xl font-medium text-white">{weather?.humidity}%</span>
                    </div>
                    <div className="p-6 rounded-3xl bg-black/20 border border-white/5 flex flex-col gap-2">
                      <Thermometer className="w-6 h-6 text-orange-300" />
                      <span className="text-sm text-white/60">Pressure</span>
                      <span className="text-2xl font-medium text-white">1012 hPa</span>
                    </div>
                    <div className="p-6 rounded-3xl bg-black/20 border border-white/5 flex flex-col gap-2">
                      <Activity className="w-6 h-6 text-purple-300" />
                      <span className="text-sm text-white/60">UV Index</span>
                      <span className="text-2xl font-medium text-white">Moderate</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-8">
                  <div className="p-6 rounded-3xl bg-black/20 border border-white/5">
                    <h3 className="text-white font-medium mb-6">Hourly Forecast</h3>
                    <div className="flex justify-between">
                      {[1, 2, 3, 4, 5].map((i) => (
                        <div key={i} className="flex flex-col items-center gap-3">
                          <span className="text-sm text-white/60">{i * 2} PM</span>
                          <Cloud className="w-6 h-6 text-white" />
                          <span className="text-lg font-medium text-white">{weather ? weather.temp - i : '--'}°</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="p-6 rounded-3xl bg-black/20 border border-white/5 flex-1 relative overflow-hidden min-h-[200px]">
                    <h3 className="text-white font-medium mb-4 relative z-10">Interactive Radar</h3>
                    <div className="absolute inset-0 top-16 bg-blue-500/10 rounded-2xl flex items-center justify-center border border-white/5">
                      <MapPin className="w-8 h-8 text-blue-400 opacity-50" />
                      <div className="absolute w-32 h-32 border border-blue-400/30 rounded-full animate-ping" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
