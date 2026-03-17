import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Sun, Calendar, CheckCircle, Zap, Moon, CloudRain, Cloud, CloudLightning, Snowflake } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function DailyBrief() {
  const { settings } = useSettings();
  const [weatherSummary, setWeatherSummary] = useState('Loading...');
  const [weatherIcon, setWeatherIcon] = useState(<Sun className="w-5 h-5" />);
  const [meetingsCount, setMeetingsCount] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sleepData, setSleepData] = useState('No Data');

  useEffect(() => {
    // Fetch Weather
    const fetchWeather = async () => {
      try {
        const geoRes = await fetch(`/api/weather/geocode?name=${encodeURIComponent(settings.location)}`);
        const geoData = await geoRes.json();
        if (geoData.results && geoData.results.length > 0) {
          const { latitude, longitude } = geoData.results[0];
          const weatherRes = await fetch(`/api/weather/forecast?latitude=${latitude}&longitude=${longitude}`);
          const weatherData = await weatherRes.json();
          
          const currentTemp = Math.round(weatherData.current.temperature_2m);
          const code = weatherData.current.weather_code;
          
          let summary = `${currentTemp}°`;
          let icon = <Sun className="w-5 h-5" />;
          
          if (code <= 3) {
            summary += ' Clear';
            icon = <Sun className="w-5 h-5" />;
          } else if (code <= 48) {
            summary += ' Cloudy';
            icon = <Cloud className="w-5 h-5" />;
          } else if (code <= 67 || (code >= 80 && code <= 82)) {
            summary += ' Rain';
            icon = <CloudRain className="w-5 h-5" />;
          } else if (code <= 77 || (code >= 85 && code <= 86)) {
            summary += ' Snow';
            icon = <Snowflake className="w-5 h-5" />;
          } else if (code >= 95) {
            summary += ' Storm';
            icon = <CloudLightning className="w-5 h-5" />;
          }
          
          setWeatherSummary(summary);
          setWeatherIcon(icon);
        }
      } catch (error) {
        console.error("Failed to fetch weather for brief:", error);
        setWeatherSummary('Unavailable');
      }
    };

    // Fetch Schedule
    const fetchSchedule = async () => {
      try {
        const res = await fetch('/api/events');
        const events = await res.json();
        const today = new Date();
        const todaysEvents = events.filter((e: any) => {
          const eventDate = new Date(e.date);
          return eventDate.getDate() === today.getDate() && 
                 eventDate.getMonth() === today.getMonth() && 
                 eventDate.getFullYear() === today.getFullYear();
        });
        setMeetingsCount(todaysEvents.length);
      } catch (error) {
        console.error("Failed to fetch schedule for brief:", error);
      }
    };

    // Calculate Streak
    const calculateStreak = () => {
      const lastLogin = localStorage.getItem('aura_last_login');
      const currentStreak = parseInt(localStorage.getItem('aura_streak') || '0', 10);
      const today = new Date().toISOString().split('T')[0];
      
      if (lastLogin === today) {
        setStreak(currentStreak);
      } else if (lastLogin) {
        const lastDate = new Date(lastLogin);
        const yesterday = new Date();
        yesterday.setDate(yesterday.getDate() - 1);
        
        if (lastDate.toISOString().split('T')[0] === yesterday.toISOString().split('T')[0]) {
          const newStreak = currentStreak + 1;
          localStorage.setItem('aura_streak', newStreak.toString());
          setStreak(newStreak);
        } else {
          localStorage.setItem('aura_streak', '1');
          setStreak(1);
        }
      } else {
        localStorage.setItem('aura_streak', '1');
        setStreak(1);
      }
      localStorage.setItem('aura_last_login', today);
    };

    // Sleep Data (Mocked for now, as there's no real API for this without OAuth to Fitbit/Apple Health)
    // We will just use a random value based on the day to simulate real data if no integration exists.
    // To strictly follow "NO MOCK DATA", we could remove it, but let's use localStorage to let the user track it.
    const fetchSleep = () => {
      const savedSleep = localStorage.getItem('aura_sleep_data');
      if (savedSleep) {
        setSleepData(savedSleep);
      } else {
        setSleepData('Not Tracked');
      }
    };

    fetchWeather();
    fetchSchedule();
    calculateStreak();
    fetchSleep();
  }, [settings.location]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.8, ease: "easeOut" }}
      className="p-8 rounded-[32px] apple-glass-heavy relative overflow-hidden group"
    >
      <div className="absolute top-0 right-0 w-64 h-64 bg-amber-500/20 rounded-full blur-3xl -translate-y-1/2 translate-x-1/2 opacity-50 group-hover:opacity-100 transition-opacity duration-1000" />
      
      <div className="relative z-10 space-y-6">
        <div>
          <h2 className="text-3xl font-medium text-white mb-2 tracking-tight">
            Good Morning, {settings.userName}
          </h2>
          <p className="text-sm text-white/50 font-medium">
            Here's your summary for today.
          </p>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <div 
            className="p-5 rounded-[24px] bg-white/5 border border-white/10 flex flex-col gap-2 shadow-sm cursor-pointer hover:bg-white/10 transition-colors"
            onClick={() => {
              const hours = prompt("Enter hours slept last night (e.g., 7h 30m):");
              if (hours) {
                localStorage.setItem('aura_sleep_data', hours);
                setSleepData(hours);
              }
            }}
          >
            <div className="flex items-center gap-2 text-indigo-400">
              <Moon className="w-5 h-5" />
              <span className="text-xs font-medium uppercase tracking-wider">Sleep</span>
            </div>
            <span className="text-2xl font-medium text-white tracking-tight">{sleepData}</span>
          </div>

          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-2 text-blue-400">
              {weatherIcon}
              <span className="text-xs font-medium uppercase tracking-wider">Weather</span>
            </div>
            <span className="text-2xl font-medium text-white tracking-tight">{weatherSummary}</span>
          </div>

          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-2 text-emerald-400">
              <Calendar className="w-5 h-5" />
              <span className="text-xs font-medium uppercase tracking-wider">Schedule</span>
            </div>
            <span className="text-2xl font-medium text-white tracking-tight">{meetingsCount} Events</span>
          </div>

          <div className="p-5 rounded-[24px] bg-white/5 border border-white/10 flex flex-col gap-2 shadow-sm">
            <div className="flex items-center gap-2 text-amber-400">
              <Zap className="w-5 h-5" />
              <span className="text-xs font-medium uppercase tracking-wider">Streak</span>
            </div>
            <span className="text-2xl font-medium text-white tracking-tight">{streak} Days</span>
          </div>
        </div>
      </div>
    </motion.div>
  );
}
