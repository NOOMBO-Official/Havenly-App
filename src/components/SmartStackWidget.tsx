import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { ChevronUp, ChevronDown, Sparkles } from 'lucide-react';
import WeatherWidget from './WeatherWidget';
import CalendarWidget from './CalendarWidget';
import NewsWidget from './NewsWidget';
import { useSettings } from '../contexts/SettingsContext';

const WIDGETS = [
  { id: 'weather', component: WeatherWidget },
  { id: 'calendar', component: CalendarWidget },
  { id: 'news', component: NewsWidget },
];

export default function SmartStackWidget() {
  const [currentIndex, setCurrentIndex] = useState(0);
  const [direction, setDirection] = useState(1);
  const { settings } = useSettings();

  useEffect(() => {
    const timer = setInterval(() => {
      setDirection(1);
      setCurrentIndex((prev) => (prev + 1) % WIDGETS.length);
    }, 10000); // Rotate every 10 seconds

    return () => clearInterval(timer);
  }, []);

  const handleNext = () => {
    setDirection(1);
    setCurrentIndex((prev) => (prev + 1) % WIDGETS.length);
  };

  const handlePrev = () => {
    setDirection(-1);
    setCurrentIndex((prev) => (prev - 1 + WIDGETS.length) % WIDGETS.length);
  };

  const CurrentWidget = WIDGETS[currentIndex].component;

  return (
    <div className="relative w-full h-full group">
      {/* Smart Stack Indicator */}
      <div className="absolute top-3 right-3 z-20 flex flex-col items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
        <button onClick={handlePrev} className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md">
          <ChevronUp className="w-3 h-3" />
        </button>
        <div className="flex flex-col gap-1 my-1">
          {WIDGETS.map((_, i) => (
            <div key={i} className={`w-1.5 h-1.5 rounded-full transition-colors ${i === currentIndex ? 'bg-white' : 'bg-white/30'}`} />
          ))}
        </div>
        <button onClick={handleNext} className="p-1 rounded-full bg-black/20 hover:bg-black/40 text-white backdrop-blur-md">
          <ChevronDown className="w-3 h-3" />
        </button>
      </div>

      <div className="absolute top-3 left-3 z-20 flex items-center gap-1 px-2 py-1 rounded-full bg-black/20 backdrop-blur-md text-white/80 text-[10px] font-medium opacity-0 group-hover:opacity-100 transition-opacity">
        <Sparkles className="w-3 h-3 text-purple-400" />
        Smart Stack
      </div>

      <div className="w-full h-full overflow-hidden rounded-[32px] relative">
        <AnimatePresence initial={false} custom={direction} mode="popLayout">
          <motion.div
            key={currentIndex}
            custom={direction}
            initial={{ y: direction > 0 ? '100%' : '-100%', opacity: 0, scale: 0.9 }}
            animate={{ y: 0, opacity: 1, scale: 1 }}
            exit={{ y: direction > 0 ? '-100%' : '100%', opacity: 0, scale: 0.9 }}
            transition={{ type: 'spring', stiffness: 300, damping: 30 }}
            className="absolute inset-0 w-full h-full"
          >
            <CurrentWidget />
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
