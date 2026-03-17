import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, CloudRain, Sun, Cloud, Wind, Droplets, Search, MapPin, Calendar } from 'lucide-react';

interface WeatherModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WeatherModal({ isOpen, onClose }: WeatherModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [city, setCity] = useState('San Francisco');

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      setCity(searchQuery.trim());
      setSearchQuery('');
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-4xl h-[80vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col relative"
            >
              {/* Dynamic Background based on weather */}
              <div className="absolute inset-0 bg-gradient-to-b from-blue-400 to-blue-800 z-0" />
              <div className="absolute inset-0 z-0 opacity-50 mix-blend-overlay" style={{
                backgroundImage: `url("data:image/svg+xml,%3Csvg viewBox='0 0 200 200' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noiseFilter'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.65' numOctaves='3' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noiseFilter)'/%3E%3C/svg%3E")`,
              }} />

              {/* Header */}
              <div className="flex items-center justify-between px-4 md:px-6 py-4 z-10 gap-4">
                <div className="flex-1 relative">
                  <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                  <input 
                    type="text"
                    placeholder="Search city..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    onKeyDown={handleSearch}
                    className="bg-black/20 border border-white/10 rounded-full pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-black/30 transition-colors w-full md:w-64 backdrop-blur-md"
                  />
                </div>
                <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors backdrop-blur-md bg-black/10 shrink-0">
                  <X className="w-5 h-5" />
                </button>
              </div>

              {/* Main Content */}
              <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-6 z-10 flex flex-col items-center pb-24 md:pb-6">
                {/* Current Weather */}
                <div className="text-center mt-8 mb-16">
                  <h1 className="text-4xl font-semibold text-white mb-2 flex items-center justify-center gap-2">
                    <MapPin className="w-6 h-6" /> {city}
                  </h1>
                  <div className="text-8xl font-thin text-white tracking-tighter mb-2">68°</div>
                  <div className="text-xl text-white/90 font-medium mb-1">Mostly Clear</div>
                  <div className="text-white/80 font-medium">H:72° L:55°</div>
                </div>

                {/* Hourly Forecast */}
                <div className="w-full max-w-3xl bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-6 mb-6">
                  <p className="text-white/80 text-sm font-medium mb-4 pb-4 border-b border-white/10">
                    Clear conditions expected around 8:00 PM.
                  </p>
                  <div className="flex justify-between items-center overflow-x-auto custom-scrollbar pb-2 gap-6">
                    {['Now', '5 PM', '6 PM', '7 PM', '8 PM', '9 PM', '10 PM', '11 PM'].map((time, i) => (
                      <div key={time} className="flex flex-col items-center gap-3 min-w-[40px]">
                        <span className="text-white font-medium">{time}</span>
                        {i === 0 || i > 4 ? <Sun className="w-6 h-6 text-yellow-300" /> : <Cloud className="w-6 h-6 text-white" />}
                        <span className="text-white text-lg">{68 - Math.abs(i - 2)}°</span>
                      </div>
                    ))}
                  </div>
                </div>

                {/* 10-Day Forecast & Details Grid */}
                <div className="w-full max-w-3xl grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* 10-Day */}
                  <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-6">
                    <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider mb-4 flex items-center gap-2">
                      <Calendar className="w-4 h-4" /> 10-Day Forecast
                    </h3>
                    <div className="space-y-4">
                      {['Today', 'Tue', 'Wed', 'Thu', 'Fri'].map((day, i) => (
                        <div key={day} className="flex items-center justify-between border-b border-white/5 pb-3 last:border-0 last:pb-0">
                          <span className="text-white font-medium w-12">{day}</span>
                          {i % 2 === 0 ? <Sun className="w-5 h-5 text-yellow-300" /> : <CloudRain className="w-5 h-5 text-blue-300" />}
                          <div className="flex items-center gap-3 w-32">
                            <span className="text-white/50 text-sm w-6 text-right">{55 + i}°</span>
                            <div className="flex-1 h-1 bg-black/30 rounded-full overflow-hidden">
                              <div className="h-full bg-gradient-to-r from-blue-400 to-yellow-400 rounded-full" style={{ width: '60%', marginLeft: '20%' }} />
                            </div>
                            <span className="text-white font-medium text-sm w-6">{72 - i}°</span>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>

                  {/* Details */}
                  <div className="grid grid-cols-2 gap-4">
                    <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex flex-col justify-between">
                      <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                        <Wind className="w-4 h-4" /> Wind
                      </h3>
                      <div className="text-3xl font-light text-white mt-2">12 <span className="text-lg">mph</span></div>
                      <div className="text-white/70 text-sm mt-1">WSW</div>
                    </div>
                    <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex flex-col justify-between">
                      <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                        <Droplets className="w-4 h-4" /> Humidity
                      </h3>
                      <div className="text-3xl font-light text-white mt-2">64%</div>
                      <div className="text-white/70 text-sm mt-1">The dew point is 55° right now.</div>
                    </div>
                    <div className="bg-black/20 backdrop-blur-xl border border-white/20 rounded-3xl p-4 flex flex-col justify-between col-span-2">
                      <h3 className="text-white/50 text-xs font-semibold uppercase tracking-wider flex items-center gap-2">
                        <Sun className="w-4 h-4" /> UV Index
                      </h3>
                      <div className="text-3xl font-light text-white mt-2">4 <span className="text-lg">Moderate</span></div>
                      <div className="w-full h-1.5 bg-gradient-to-r from-green-400 via-yellow-400 to-red-500 rounded-full mt-3" />
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
