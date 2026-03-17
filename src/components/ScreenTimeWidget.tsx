import { Hourglass, LayoutDashboard, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';
import { useState, useEffect } from 'react';

export default function ScreenTimeWidget() {
  const [usageData, setUsageData] = useState<number[]>(Array(7).fill(0));
  const [todayUsage, setTodayUsage] = useState(0);

  useEffect(() => {
    // Load from local storage
    const loadUsage = () => {
      const stored = localStorage.getItem('dashboard-usage');
      if (stored) {
        try {
          const parsed = JSON.parse(stored);
          const today = new Date().getDay(); // 0 is Sunday, 1 is Monday
          const adjustedDay = today === 0 ? 6 : today - 1; // Make Monday 0, Sunday 6
          
          // Check if we need to reset for a new week
          const lastUpdate = localStorage.getItem('dashboard-usage-last-update');
          if (lastUpdate) {
            const lastDate = new Date(lastUpdate);
            const now = new Date();
            // If more than 7 days have passed or we crossed a week boundary
            const daysDiff = Math.floor((now.getTime() - lastDate.getTime()) / (1000 * 60 * 60 * 24));
            if (daysDiff > 0) {
              // Shift data or reset if it's a new week
              // For simplicity, we just keep the array and update the current day
            }
          }

          setUsageData(parsed);
          setTodayUsage(parsed[adjustedDay] || 0);
        } catch (e) {
          console.error("Failed to parse usage data", e);
        }
      }
    };

    loadUsage();

    // Track time spent
    const interval = setInterval(() => {
      setTodayUsage(prev => {
        const newUsage = prev + 1; // Add 1 minute
        
        setUsageData(currentData => {
          const newData = [...currentData];
          const today = new Date().getDay();
          const adjustedDay = today === 0 ? 6 : today - 1;
          newData[adjustedDay] = newUsage;
          localStorage.setItem('dashboard-usage', JSON.stringify(newData));
          localStorage.setItem('dashboard-usage-last-update', new Date().toISOString());
          return newData;
        });

        return newUsage;
      });
    }, 60000); // Update every minute

    return () => clearInterval(interval);
  }, []);

  const days = ['M', 'T', 'W', 'T', 'F', 'S', 'S'];
  
  // Ensure we have some visual if all 0
  const maxMinutes = Math.max(...usageData, 60); 

  const formatTime = (minutes: number) => {
    const h = Math.floor(minutes / 60);
    const m = minutes % 60;
    if (h > 0) return `${h}h ${m}m`;
    return `${m}m`;
  };

  const totalMinutes = usageData.reduce((a, b) => a + b, 0);
  const activeDays = usageData.filter(d => d > 0).length || 1;
  const dailyAverage = Math.floor(totalMinutes / activeDays);

  return (
    <div className="apple-glass-heavy rounded-[32px] p-5 flex flex-col h-full relative overflow-hidden group cursor-pointer">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-indigo-500">
          <Hourglass className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-aura-text tracking-tight">Dashboard Time</h2>
        </div>
        <ChevronRight className="w-5 h-5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex-1 flex flex-col justify-between">
        <div className="mb-4">
          <div className="text-3xl font-semibold tracking-tight text-aura-text">{formatTime(todayUsage)}</div>
          <div className="text-sm text-aura-muted font-medium flex items-center gap-1.5 mt-0.5">
            <LayoutDashboard className="w-4 h-4" />
            Today • Avg {formatTime(dailyAverage)}
          </div>
        </div>

        <div className="flex items-end justify-between gap-1.5 h-24">
          {usageData.map((minutes, i) => {
            const heightPercentage = Math.max((minutes / maxMinutes) * 100, 2); // At least 2% to show the bar
            const isWeekend = i >= 5;
            const color = isWeekend ? 'bg-indigo-500' : 'bg-indigo-400';
            
            return (
              <div key={i} className="flex flex-col items-center gap-1.5 flex-1 h-full justify-end">
                <div className="w-full bg-black/5 dark:bg-white/5 rounded-md relative overflow-hidden h-full">
                  <motion.div
                    initial={{ height: 0 }}
                    animate={{ height: `${heightPercentage}%` }}
                    transition={{ duration: 1, delay: i * 0.1, ease: [0.22, 1, 0.36, 1] }}
                    className={`absolute bottom-0 left-0 right-0 rounded-md ${color}`}
                  />
                </div>
                <span className="text-[10px] font-semibold text-aura-muted uppercase">{days[i]}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
