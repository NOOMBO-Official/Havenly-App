import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Map as MapIcon, Search, Navigation, Compass, Layers, Info, Home, Briefcase } from 'lucide-react';

interface MapsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MapsModal({ isOpen, onClose }: MapsModalProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [markerPos, setMarkerPos] = useState({ x: 500, y: 400 });

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === 'Enter' && searchQuery.trim()) {
      // Randomize marker position on search
      setMarkerPos({
        x: Math.floor(Math.random() * 800) + 100,
        y: Math.floor(Math.random() * 600) + 100,
      });
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
              className="w-full max-w-6xl h-[85vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col bg-white/5 relative"
            >
              {/* Header Overlay */}
              <div className="absolute top-0 left-0 right-0 p-4 md:p-6 flex items-start justify-between z-10 pointer-events-none gap-4">
                <div className="flex-1 md:flex-none w-full md:w-80 apple-glass-heavy rounded-2xl p-4 border border-white/20 shadow-xl pointer-events-auto">
                  <div className="flex items-center gap-3 mb-4">
                    <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-green-400 to-emerald-600 flex items-center justify-center shadow-inner">
                      <MapIcon className="w-4 h-4 text-white" />
                    </div>
                    <h2 className="text-xl font-semibold text-white tracking-tight">Maps</h2>
                  </div>
                  
                  <div className="relative">
                    <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search Maps"
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      onKeyDown={handleSearch}
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-2 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-black/30 transition-colors"
                    />
                  </div>

                  <div className="mt-4 space-y-2 hidden md:block">
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-2">Favorites</h3>
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-blue-500/20 flex items-center justify-center text-blue-400">
                        <Home className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Home</div>
                        <div className="text-xs text-white/50">123 Main St</div>
                      </div>
                    </button>
                    <button className="w-full flex items-center gap-3 p-2 rounded-lg hover:bg-white/10 transition-colors text-left">
                      <div className="w-8 h-8 rounded-full bg-orange-500/20 flex items-center justify-center text-orange-400">
                        <Briefcase className="w-4 h-4" />
                      </div>
                      <div>
                        <div className="text-sm font-medium text-white">Work</div>
                        <div className="text-xs text-white/50">456 Market St</div>
                      </div>
                    </button>
                  </div>
                </div>

                <div className="flex flex-col gap-2 pointer-events-auto shrink-0">
                  <button onClick={onClose} className="p-3 bg-black/40 backdrop-blur-md text-white/70 hover:text-white rounded-full border border-white/10 shadow-lg transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-black/40 backdrop-blur-md text-white/70 hover:text-white rounded-full border border-white/10 shadow-lg transition-colors hidden md:block">
                    <Layers className="w-5 h-5" />
                  </button>
                  <button className="p-3 bg-black/40 backdrop-blur-md text-white/70 hover:text-white rounded-full border border-white/10 shadow-lg transition-colors hidden md:block">
                    <Info className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Controls Overlay */}
              <div className="absolute bottom-24 md:bottom-6 right-4 md:right-6 flex flex-col gap-2 z-10 pointer-events-auto">
                <button className="p-3 bg-black/40 backdrop-blur-md text-white/70 hover:text-white rounded-full border border-white/10 shadow-lg transition-colors">
                  <Navigation className="w-5 h-5" />
                </button>
                <div className="flex flex-col bg-black/40 backdrop-blur-md rounded-full border border-white/10 shadow-lg overflow-hidden hidden md:flex">
                  <button className="p-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors border-b border-white/10">
                    <span className="text-lg font-medium leading-none">+</span>
                  </button>
                  <button className="p-3 text-white/70 hover:text-white hover:bg-white/10 transition-colors">
                    <span className="text-lg font-medium leading-none">-</span>
                  </button>
                </div>
              </div>

              {/* Map Background (Mock) */}
              <div className="flex-1 bg-[#1A1A1A] relative overflow-hidden pb-24 md:pb-0">
                <div className="absolute inset-0 opacity-30" style={{
                  backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
                }} />
                
                {/* Mock Routes/Streets */}
                <svg className="absolute inset-0 w-full h-full" xmlns="http://www.w3.org/2000/svg">
                  <path d="M-100 200 Q 300 100 500 400 T 1200 300" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="12" />
                  <path d="M200 -100 Q 300 400 800 500 T 1000 900" fill="none" stroke="rgba(255,255,255,0.1)" strokeWidth="8" />
                  <path d="M400 200 L 400 600" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  <path d="M100 400 L 900 400" fill="none" stroke="rgba(255,255,255,0.05)" strokeWidth="4" />
                  
                  {/* Current Location Marker */}
                  <motion.circle animate={{ cx: markerPos.x, cy: markerPos.y }} r="8" fill="#3B82F6" className="animate-pulse" />
                  <motion.circle animate={{ cx: markerPos.x, cy: markerPos.y }} r="24" fill="rgba(59, 130, 246, 0.2)" className="animate-ping" />
                  <motion.circle animate={{ cx: markerPos.x, cy: markerPos.y }} r="3" fill="white" />
                </svg>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
