import { useEffect, useRef, useState } from 'react';
import { useSettings } from '../contexts/SettingsContext';
import { motion, AnimatePresence } from 'motion/react';

export default function DynamicWallpaper() {
  const { settings } = useSettings();
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [weatherCondition, setWeatherCondition] = useState('clear');

  useEffect(() => {
    if (settings.wallpaperMode === 'weather') {
      // Fetch weather condition (simplified for demo)
      fetch(`/api/weather/geocode?name=${encodeURIComponent(settings.weatherLocation)}`)
        .then(res => res.json())
        .then(data => {
          if (data.results?.[0]) {
            const { latitude, longitude } = data.results[0];
            return fetch(`/api/weather/forecast?latitude=${latitude}&longitude=${longitude}`);
          }
        })
        .then(res => res?.json())
        .then(data => {
          if (data?.current?.weather_code !== undefined) {
            const code = data.current.weather_code;
            if (code <= 3) setWeatherCondition('clear');
            else if (code <= 49) setWeatherCondition('cloudy');
            else if (code <= 69) setWeatherCondition('rain');
            else if (code <= 79) setWeatherCondition('snow');
            else setWeatherCondition('storm');
          }
        })
        .catch(console.error);
    }
  }, [settings.wallpaperMode, settings.weatherLocation]);

  useEffect(() => {
    if (settings.wallpaperMode === 'static') return;

    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      time += 0.002;

      // Determine colors based on theme and autopilot mode
      let color1 = settings.theme === 'dark' ? [15, 23, 42] : [241, 245, 249]; // slate-900 / slate-100
      let color2 = settings.theme === 'dark' ? [88, 28, 135] : [216, 180, 254]; // purple-900 / purple-300
      let color3 = settings.theme === 'dark' ? [30, 58, 138] : [191, 219, 254]; // blue-900 / blue-200

      if (settings.wallpaperMode === 'time-of-day') {
        const hour = new Date().getHours();
        if (hour >= 5 && hour < 12) { // Morning
          color2 = [253, 186, 116]; // orange-300
          color3 = [252, 211, 77]; // amber-300
        } else if (hour >= 12 && hour < 17) { // Afternoon
          color2 = [125, 211, 252]; // sky-300
          color3 = [56, 189, 248]; // sky-400
        } else if (hour >= 17 && hour < 20) { // Evening
          color2 = [244, 114, 182]; // pink-400
          color3 = [167, 139, 250]; // violet-400
        } else { // Night
          color2 = [30, 27, 75]; // indigo-950
          color3 = [15, 23, 42]; // slate-900
        }
      } else if (settings.wallpaperMode === 'weather') {
        if (weatherCondition === 'clear') {
          color2 = [253, 224, 71]; // yellow-300
          color3 = [125, 211, 252]; // sky-300
        } else if (weatherCondition === 'cloudy') {
          color2 = [148, 163, 184]; // slate-400
          color3 = [203, 213, 225]; // slate-300
        } else if (weatherCondition === 'rain') {
          color2 = [56, 189, 248]; // sky-400
          color3 = [100, 116, 139]; // slate-500
        } else if (weatherCondition === 'snow') {
          color2 = [241, 245, 249]; // slate-100
          color3 = [226, 232, 240]; // slate-200
        }
      } else if (settings.autopilotMode === 'productivity') {
        color2 = settings.theme === 'dark' ? [21, 128, 61] : [134, 239, 172]; // green
        color3 = settings.theme === 'dark' ? [3, 105, 161] : [125, 211, 252]; // sky
      } else if (settings.autopilotMode === 'relax') {
        color2 = settings.theme === 'dark' ? [190, 18, 60] : [253, 164, 175]; // rose
        color3 = settings.theme === 'dark' ? [180, 83, 9] : [252, 211, 77]; // amber
      } else if (settings.autopilotMode === 'focus') {
        color2 = settings.theme === 'dark' ? [67, 56, 202] : [165, 180, 252]; // indigo
        color3 = settings.theme === 'dark' ? [126, 34, 206] : [216, 180, 254]; // purple
      }

      // Create gradient blobs
      const drawBlob = (x: number, y: number, radius: number, color: number[]) => {
        const gradient = ctx.createRadialGradient(x, y, 0, x, y, radius);
        gradient.addColorStop(0, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0.4)`);
        gradient.addColorStop(1, `rgba(${color[0]}, ${color[1]}, ${color[2]}, 0)`);
        ctx.fillStyle = gradient;
        ctx.beginPath();
        ctx.arc(x, y, radius, 0, Math.PI * 2);
        ctx.fill();
      };

      ctx.globalCompositeOperation = settings.theme === 'dark' ? 'screen' : 'multiply';

      // Moving blobs
      drawBlob(
        width * 0.5 + Math.sin(time) * width * 0.3,
        height * 0.5 + Math.cos(time * 0.8) * height * 0.3,
        Math.max(width, height) * 0.6,
        color2
      );

      drawBlob(
        width * 0.5 + Math.cos(time * 1.2) * width * 0.4,
        height * 0.5 + Math.sin(time * 1.1) * height * 0.4,
        Math.max(width, height) * 0.7,
        color3
      );

      animationFrameId = requestAnimationFrame(render);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    
    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [settings.theme, settings.autopilotMode, settings.wallpaperMode, weatherCondition]);

  return (
    <div className="fixed inset-0 pointer-events-none z-[-1] overflow-hidden bg-aura-bg transition-colors duration-1000">
      <AnimatePresence mode="wait">
        {settings.wallpaperMode !== 'static' && (
          <motion.canvas
            key={`${settings.theme}-${settings.autopilotMode}-${settings.wallpaperMode}-${weatherCondition}`}
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 2 }}
            ref={canvasRef}
            className="absolute inset-0 w-full h-full opacity-60 dark:opacity-40 blur-3xl"
          />
        )}
      </AnimatePresence>
      {/* Noise overlay for texture */}
      <div className="absolute inset-0 opacity-[0.03] dark:opacity-[0.05] mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
    </div>
  );
}
