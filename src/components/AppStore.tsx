import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Store, X, Play, Download, Star } from 'lucide-react';

const APPS = [
  { id: '6', name: 'AI Outfit Styler', category: 'Lifestyle', rating: 4.9, icon: '👗', installed: false },
  { id: '1', name: 'Focus Timer', category: 'Productivity', rating: 4.8, icon: '⏱️', installed: true },
  { id: '2', name: 'Habit Tracker', category: 'Health', rating: 4.9, icon: '🌱', installed: false },
  { id: '3', name: 'Crypto Ticker', category: 'Finance', rating: 4.5, icon: '📈', installed: false },
  { id: '4', name: 'White Noise', category: 'Health', rating: 4.7, icon: '🌊', installed: true },
  { id: '5', name: 'Code Snippets', category: 'Developer', rating: 4.9, icon: '💻', installed: false },
];

export default function AppStore() {
  const [isOpen, setIsOpen] = useState(false);
  const [apps, setApps] = useState(APPS);

  const toggleInstall = (id: string) => {
    setApps(apps.map(app => app.id === id ? { ...app, installed: !app.installed } : app));
  };

  return (
    <>
      <button 
        onClick={() => setIsOpen(true)}
        className="p-3 rounded-full bg-aura-card hover:bg-aura-card-hover border border-aura-border text-aura-text transition-colors"
      >
        <Store className="w-5 h-5" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/60 backdrop-blur-md z-40"
            />
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="fixed inset-x-4 top-24 bottom-24 md:inset-x-auto md:left-1/2 md:-translate-x-1/2 md:w-[800px] bg-aura-card/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 z-50 shadow-2xl flex flex-col overflow-hidden"
            >
              <div className="flex justify-between items-center mb-8">
                <div>
                  <h2 className="text-3xl font-display font-medium text-aura-text tracking-tight">App Store</h2>
                  <p className="text-aura-muted mt-1">Discover and run mini-apps directly in Havenly.</p>
                </div>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 bg-white/5 rounded-full text-aura-muted hover:text-white hover:bg-white/10 transition-all"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 overflow-y-auto custom-scrollbar pr-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                {apps.map(app => (
                  <div key={app.id} className="bg-black/20 border border-white/5 rounded-[2rem] p-6 flex flex-col justify-between group hover:bg-white/5 transition-colors">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-4">
                        <div className="w-12 h-12 bg-white/10 rounded-2xl flex items-center justify-center text-2xl shadow-inner">
                          {app.icon}
                        </div>
                        <div>
                          <h3 className="text-lg font-medium text-aura-text">{app.name}</h3>
                          <p className="text-sm text-aura-muted">{app.category}</p>
                        </div>
                      </div>
                      <div className="flex items-center space-x-1 text-yellow-500 bg-yellow-500/10 px-2 py-1 rounded-full text-xs font-medium">
                        <Star className="w-3 h-3 fill-current" />
                        <span>{app.rating}</span>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-3 mt-4">
                      {app.installed ? (
                        <>
                          <button className="flex-1 flex items-center justify-center space-x-2 py-2.5 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-[0_0_15px_rgba(59,130,246,0.3)]">
                            <Play className="w-4 h-4 fill-current" />
                            <span>Run</span>
                          </button>
                          <button 
                            onClick={() => toggleInstall(app.id)}
                            className="px-4 py-2.5 bg-white/5 hover:bg-red-500/20 hover:text-red-400 text-aura-muted rounded-xl font-medium transition-colors"
                          >
                            Remove
                          </button>
                        </>
                      ) : (
                        <button 
                          onClick={() => toggleInstall(app.id)}
                          className="w-full flex items-center justify-center space-x-2 py-2.5 bg-white/10 hover:bg-white/20 text-aura-text rounded-xl font-medium transition-colors"
                        >
                          <Download className="w-4 h-4" />
                          <span>Install</span>
                        </button>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
