import { useState, useEffect } from "react";
import { Clock as ClockIcon, X, Globe, Sun, Moon, MapPin } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { motion, AnimatePresence } from "framer-motion";

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date, timeZone?: string) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      second: isExpanded ? "2-digit" : undefined,
      hour12: !settings.use24HourFormat,
      timeZone: timeZone
    });
  };

  const formatDate = (date: Date, timeZone?: string) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
      timeZone: timeZone
    });
  };

  const worldClocks = [
    { city: "New York", timezone: "America/New_York" },
    { city: "London", timezone: "Europe/London" },
    { city: "Tokyo", timezone: "Asia/Tokyo" },
    { city: "Sydney", timezone: "Australia/Sydney" },
  ];

  const getDayNightIcon = (date: Date, timeZone: string) => {
    const hourString = date.toLocaleTimeString("en-US", { hour: 'numeric', hour12: false, timeZone });
    const hour = parseInt(hourString, 10);
    if (hour >= 6 && hour < 18) {
      return <Sun className="w-5 h-5 text-yellow-400" />;
    }
    return <Moon className="w-5 h-5 text-blue-300" />;
  };

  return (
    <>
      <motion.div 
        layoutId="clock-widget"
        className="flex flex-col justify-between p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full relative overflow-hidden group cursor-pointer"
        onClick={() => setIsExpanded(true)}
      >
        {/* Quick Action Overlay */}
        {settings.tapToExpand && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center pointer-events-none">
            <span className="text-white font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
              Tap to Expand
            </span>
          </div>
        )}

        <div className="flex justify-between items-start relative z-10">
          <span className="text-xs font-medium uppercase tracking-widest text-aura-muted flex items-center gap-2">
            <ClockIcon className="w-3 h-3 text-blue-400" />
            Local Time
          </span>
        </div>

        <div className="flex flex-col items-center justify-center flex-1 relative z-10">
          <div className="text-5xl md:text-6xl font-display font-medium text-aura-text tracking-tighter mb-2">
            {formatTime(time)}
          </div>
          <div className="text-sm text-aura-muted font-medium uppercase tracking-widest">
            {formatDate(time)}
          </div>
        </div>

        {/* Decorative background element */}
        <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
      </motion.div>

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
              layoutId="clock-widget"
              className="w-full max-w-4xl h-full max-h-[600px] rounded-[3rem] border border-aura-border bg-aura-card relative overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-aura-border">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-blue-500/20 border border-blue-500/30 text-blue-400">
                    <ClockIcon className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-display text-aura-text">World Clock</h2>
                    <p className="text-aura-muted">Local and global timezones</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-4 bg-aura-bg hover:bg-aura-border/50 rounded-full text-aura-text transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 flex flex-col md:flex-row overflow-hidden">
                {/* Main Local Time */}
                <div className="w-full md:w-1/2 border-r border-aura-border p-12 flex flex-col items-center justify-center relative overflow-hidden">
                  <div className="absolute inset-0 bg-gradient-to-b from-blue-500/5 to-transparent pointer-events-none" />
                  
                  <div className="relative z-10 flex flex-col items-center">
                    <h3 className="text-sm font-medium uppercase tracking-widest text-aura-muted mb-6 flex items-center gap-2">
                      <MapPin className="w-4 h-4" /> Current Location
                    </h3>
                    <div className="text-7xl lg:text-8xl font-display font-medium text-aura-text tracking-tighter mb-4 tabular-nums">
                      {formatTime(time)}
                    </div>
                    <div className="text-xl text-aura-muted font-medium uppercase tracking-widest">
                      {formatDate(time)}
                    </div>
                  </div>
                  
                  {/* Decorative circles */}
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[120%] aspect-square rounded-full border border-white/5 pointer-events-none" />
                  <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90%] aspect-square rounded-full border border-white/5 pointer-events-none" />
                </div>

                {/* World Clocks */}
                <div className="w-full md:w-1/2 p-8 bg-black/10 overflow-y-auto custom-scrollbar">
                  <h3 className="text-lg font-display text-aura-text mb-6 flex items-center gap-2">
                    <Globe className="w-5 h-5 text-aura-muted" />
                    Other Timezones
                  </h3>

                  <div className="space-y-4">
                    {worldClocks.map((clock) => (
                      <div key={clock.city} className="flex items-center justify-between p-6 rounded-2xl bg-aura-bg border border-aura-border hover:border-blue-500/30 transition-colors group">
                        <div>
                          <div className="text-xl font-medium text-aura-text mb-1">{clock.city}</div>
                          <div className="text-sm text-aura-muted">{formatDate(time, clock.timezone)}</div>
                        </div>
                        <div className="flex items-center gap-4">
                          <div className="text-2xl font-display font-medium text-aura-text tabular-nums">
                            {formatTime(time, clock.timezone).replace(/:\d{2} /, ' ')} {/* Remove seconds for world clocks */}
                          </div>
                          <div className="p-2 rounded-full bg-black/20 group-hover:bg-black/40 transition-colors">
                            {getDayNightIcon(time, clock.timezone)}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                  
                  <button className="mt-6 w-full py-4 border border-dashed border-aura-border rounded-2xl text-aura-muted hover:text-aura-text hover:border-aura-text/30 transition-colors font-medium">
                    + Add City
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
