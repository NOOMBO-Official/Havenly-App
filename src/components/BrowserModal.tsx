import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Globe, ChevronLeft, ChevronRight, RotateCw, Share, Plus, Copy, Lock } from 'lucide-react';

interface BrowserModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function BrowserModal({ isOpen, onClose }: BrowserModalProps) {
  const [url, setUrl] = useState('apple.com');
  const [inputUrl, setInputUrl] = useState('apple.com');
  const [isLoading, setIsLoading] = useState(false);

  const handleNavigate = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setUrl(inputUrl);
    setTimeout(() => setIsLoading(false), 1000); // Simulate loading
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
              className="w-full max-w-6xl h-[85vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col relative bg-[#1c1c1e]"
            >
              {/* Browser Chrome */}
              <div className="bg-[#2c2c2e] border-b border-white/10 flex flex-col">
                {/* Tabs Area (Mock) */}
                <div className="h-10 hidden md:flex items-end px-4 gap-2 pt-2">
                  <div className="bg-[#1c1c1e] rounded-t-xl px-4 py-2 flex items-center gap-2 min-w-[200px] border-t border-x border-white/10 relative">
                    <Globe className="w-4 h-4 text-white/50" />
                    <span className="text-sm text-white truncate w-32">{url}</span>
                    <button className="absolute right-2 p-1 text-white/50 hover:text-white rounded-full">
                      <X className="w-3 h-3" />
                    </button>
                  </div>
                  <button className="p-2 text-white/50 hover:text-white transition-colors mb-1">
                    <Plus className="w-4 h-4" />
                  </button>
                </div>

                {/* Toolbar */}
                <div className="h-14 flex items-center px-2 md:px-4 gap-2 md:gap-4">
                  <div className="flex items-center gap-1 md:gap-2">
                    <button className="p-2 text-white/50 hover:text-white rounded-full transition-colors">
                      <ChevronLeft className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-white/30 rounded-full cursor-not-allowed hidden md:block">
                      <ChevronRight className="w-5 h-5" />
                    </button>
                    <button className="p-2 text-white/70 hover:text-white rounded-full transition-colors hidden md:block" onClick={() => { setIsLoading(true); setTimeout(() => setIsLoading(false), 1000); }}>
                      <RotateCw className={`w-4 h-4 ${isLoading ? 'animate-spin' : ''}`} />
                    </button>
                  </div>

                  <form onSubmit={handleNavigate} className="flex-1 max-w-2xl mx-auto relative">
                    <Lock className="w-3 h-3 text-white/50 absolute left-4 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      value={inputUrl}
                      onChange={(e) => setInputUrl(e.target.value)}
                      className="w-full bg-[#1c1c1e] border border-white/10 rounded-xl pl-10 pr-4 py-2 text-sm text-white text-center focus:text-left focus:outline-none focus:ring-2 focus:ring-blue-500/50 transition-all"
                    />
                    {isLoading && (
                      <div className="absolute bottom-0 left-0 h-0.5 bg-blue-500 rounded-full" style={{ width: '30%', animation: 'progress 1s ease-in-out infinite' }} />
                    )}
                  </form>

                  <div className="flex items-center gap-1 md:gap-2">
                    <button className="p-2 text-white/70 hover:text-white rounded-full transition-colors hidden md:block">
                      <Share className="w-4 h-4" />
                    </button>
                    <button className="p-2 text-white/70 hover:text-white rounded-full transition-colors hidden md:block">
                      <Copy className="w-4 h-4" />
                    </button>
                    <button onClick={onClose} className="p-2 text-white/70 hover:text-white bg-white/10 rounded-full transition-colors ml-1 md:ml-2">
                      <X className="w-5 h-5" />
                    </button>
                  </div>
                </div>
              </div>

              {/* Web Content Area (Mock) */}
              <div className="flex-1 bg-white relative overflow-y-auto custom-scrollbar flex flex-col items-center justify-center pb-24 md:pb-0">
                {isLoading ? (
                  <div className="text-gray-400 flex flex-col items-center gap-4">
                    <RotateCw className="w-8 h-8 animate-spin" />
                    <p>Loading {url}...</p>
                  </div>
                ) : (
                  <div className="w-full h-full flex flex-col">
                    {/* Mock Apple Homepage */}
                    <div className="bg-black text-white py-3 text-center text-sm">
                      Get $180–$650 in credit when you trade in iPhone 11 or higher.
                    </div>
                    <div className="flex-1 flex flex-col items-center justify-center bg-[#fbfbfd] text-center p-8">
                      <h1 className="text-6xl font-semibold text-black tracking-tight mb-2">iPhone 15 Pro</h1>
                      <p className="text-2xl text-black/80 font-light mb-6">Titanium. So strong. So light. So Pro.</p>
                      <div className="flex gap-4">
                        <button className="px-6 py-2 bg-blue-600 text-white rounded-full font-medium hover:bg-blue-700 transition-colors">Learn more</button>
                        <button className="px-6 py-2 text-blue-600 hover:underline font-medium transition-colors">Buy</button>
                      </div>
                      <img src="https://picsum.photos/seed/iphone/800/400" alt="iPhone" className="mt-12 rounded-3xl shadow-2xl max-w-full h-auto object-cover" />
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
