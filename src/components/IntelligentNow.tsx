import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Calendar, Moon, Music, Coffee, ArrowRight } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';

export default function IntelligentNow() {
  const { settings } = useSettings();
  const [currentTime, setCurrentTime] = useState(new Date());
  
  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 60000);
    return () => clearInterval(timer);
  }, []);

  const hour = currentTime.getHours();
  
  // Determine context based on time (simulated intelligence)
  let context = 'default';
  if (hour >= 21 || hour < 5) context = 'night';
  else if (hour >= 7 && hour <= 9) context = 'morning';
  else if (hour === 12) context = 'lunch';
  else if (hour >= 13 && hour <= 17) context = 'work';

  const renderContent = () => {
    switch (context) {
      case 'night':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-indigo-500/10 dark:bg-indigo-500/20 text-indigo-500 dark:text-indigo-400 rounded-2xl">
                <Moon className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white tracking-tight">Wind Down</h3>
                <p className="text-xs font-medium text-white/50">Screen time down 20% today. Good job.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium text-white transition-colors shadow-sm">
              Start Routine
            </button>
          </div>
        );
      case 'morning':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-amber-500/20 text-amber-400 rounded-2xl shadow-inner">
                <Coffee className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white tracking-tight">Morning Brief</h3>
                <p className="text-xs font-medium text-white/50">2 meetings today. First at 10:00 AM.</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-white/10 hover:bg-white/20 rounded-xl text-xs font-medium text-white transition-colors shadow-sm">
              View Brief
            </button>
          </div>
        );
      case 'lunch':
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-emerald-500/20 text-emerald-400 rounded-2xl shadow-inner">
                <Music className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white tracking-tight">Break Time</h3>
                <p className="text-xs font-medium text-white/50">Playing your "Focus & Chill" playlist.</p>
              </div>
            </div>
            <div className="flex gap-2">
              <button className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors shadow-sm">
                <div className="w-2.5 h-2.5 bg-white rounded-sm" />
              </button>
              <button className="w-8 h-8 flex items-center justify-center bg-white/10 hover:bg-white/20 rounded-full transition-colors shadow-sm">
                <div className="w-0 h-0 border-t-[5px] border-t-transparent border-l-[8px] border-l-white border-b-[5px] border-b-transparent ml-1" />
              </button>
            </div>
          </div>
        );
      case 'work':
      default:
        return (
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-4">
              <div className="p-3 bg-blue-500/20 text-blue-400 rounded-2xl shadow-inner">
                <Calendar className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-sm font-medium text-white tracking-tight">Up Next: Design Sync</h3>
                <p className="text-xs font-medium text-white/50">In 15 mins • Google Meet</p>
              </div>
            </div>
            <button className="px-4 py-2 bg-blue-500/20 hover:bg-blue-500/30 text-blue-400 rounded-xl text-xs font-medium transition-colors flex items-center gap-2 shadow-sm">
              Join Call <ArrowRight className="w-3 h-3" />
            </button>
          </div>
        );
    }
  };

  const isPanel = settings.nowPanelMode === 'panel';

  const content = (
    <motion.div
      layoutId="intelligent-now"
      className={`p-4 rounded-[24px] apple-glass-heavy shadow-sm overflow-hidden relative group border border-white/10 ${
        isPanel ? 'w-full max-w-md' : 'w-full h-full flex flex-col justify-center'
      }`}
    >
      <div className="absolute inset-0 bg-gradient-to-br from-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      {/* Siri-like glowing orb */}
      <div className="absolute -top-10 -right-10 w-32 h-32 bg-gradient-to-br from-blue-500 via-purple-500 to-pink-500 rounded-full blur-3xl opacity-20 animate-pulse pointer-events-none" />

      <div className="relative z-10">
        {renderContent()}
      </div>
    </motion.div>
  );

  if (isPanel) {
    return (
      <div className="fixed bottom-8 left-1/2 -translate-x-1/2 z-40 w-full max-w-md px-4">
        {content}
      </div>
    );
  }

  return content;
}
