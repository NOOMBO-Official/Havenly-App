import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { LayoutGrid, X, Search, Sparkles, Folder, AppWindow } from 'lucide-react';

interface AppLibraryModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AppLibraryModal({ isOpen, onClose }: AppLibraryModalProps) {
  const [searchQuery, setSearchQuery] = useState('');

  const categories = [
    {
      name: 'Productivity',
      apps: [
        { name: 'Calendar', icon: '📅', color: 'bg-red-500' },
        { name: 'Notes', icon: '📝', color: 'bg-yellow-500' },
        { name: 'Reminders', icon: '✅', color: 'bg-blue-500' },
        { name: 'Mail', icon: '✉️', color: 'bg-sky-500' },
      ]
    },
    {
      name: 'Media',
      apps: [
        { name: 'Music', icon: '🎵', color: 'bg-pink-500' },
        { name: 'Photos', icon: '🖼️', color: 'bg-purple-500' },
        { name: 'Podcasts', icon: '🎙️', color: 'bg-indigo-500' },
        { name: 'TV', icon: '📺', color: 'bg-gray-800' },
      ]
    },
    {
      name: 'Utilities',
      apps: [
        { name: 'Weather', icon: '🌤️', color: 'bg-blue-400' },
        { name: 'Calculator', icon: '🧮', color: 'bg-orange-500' },
        { name: 'Clock', icon: '⏱️', color: 'bg-black' },
        { name: 'Settings', icon: '⚙️', color: 'bg-gray-500' },
      ]
    },
    {
      name: 'AI & Smart Home',
      apps: [
        { name: 'AVA Chat', icon: '✨', color: 'bg-purple-600' },
        { name: 'Home', icon: '🏠', color: 'bg-amber-500' },
        { name: 'Automations', icon: '⚡', color: 'bg-emerald-500' },
        { name: 'Devices', icon: '📱', color: 'bg-teal-500' },
      ]
    }
  ];

  const filteredCategories = categories.map(cat => ({
    ...cat,
    apps: cat.apps.filter(app => app.name.toLowerCase().includes(searchQuery.toLowerCase()))
  })).filter(cat => cat.apps.length > 0);

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-xl z-[100]"
          />
          <div className="fixed inset-0 z-[115] flex items-center justify-center md:p-6 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-full h-full md:h-[80vh] max-w-5xl apple-glass-heavy rounded-none md:rounded-[40px] shadow-2xl border-0 md:border border-white/20 overflow-hidden pointer-events-auto flex flex-col pb-24 md:pb-0"
            >
              {/* Header */}
              <div className="flex flex-col sm:flex-row sm:items-center justify-between p-4 sm:p-6 border-b border-white/10 gap-4">
                <div className="flex items-center justify-between w-full sm:w-auto">
                  <div className="flex items-center gap-3">
                    <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                      <LayoutGrid className="w-6 h-6" />
                    </div>
                    <h2 className="text-xl sm:text-2xl font-semibold tracking-tight text-aura-text">
                      App Library
                    </h2>
                  </div>
                  <button
                    onClick={onClose}
                    className="sm:hidden p-2 text-aura-muted hover:text-aura-text bg-black/5 dark:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
                
                <div className="flex items-center gap-2 md:gap-4 w-full sm:w-auto">
                  <div className="relative w-full sm:w-auto">
                    <Search className="w-5 h-5 absolute left-3 top-1/2 -translate-y-1/2 text-aura-muted" />
                    <input
                      type="text"
                      placeholder="Search apps..."
                      value={searchQuery}
                      onChange={(e) => setSearchQuery(e.target.value)}
                      className="w-full sm:w-48 md:w-64 pl-10 pr-4 py-2 bg-black/20 dark:bg-white/10 border border-white/10 rounded-full text-sm text-aura-text placeholder:text-aura-muted focus:outline-none focus:ring-2 focus:ring-indigo-500/50 transition-all"
                    />
                  </div>
                  <button
                    onClick={onClose}
                    className="hidden sm:block p-2 text-aura-muted hover:text-aura-text bg-black/5 dark:bg-white/5 rounded-full transition-colors"
                  >
                    <X className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Content */}
              <div className="flex-1 overflow-y-auto p-8 custom-scrollbar">
                {searchQuery ? (
                  <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-6 gap-6">
                    {filteredCategories.flatMap(cat => cat.apps).map((app, i) => (
                      <motion.button
                        key={i}
                        initial={{ opacity: 0, scale: 0.8 }}
                        animate={{ opacity: 1, scale: 1 }}
                        transition={{ delay: i * 0.05 }}
                        className="flex flex-col items-center gap-3 group"
                      >
                        <div className={`w-20 h-20 rounded-2xl ${app.color} flex items-center justify-center text-3xl shadow-lg group-hover:scale-105 transition-transform duration-300`}>
                          {app.icon}
                        </div>
                        <span className="text-sm font-medium text-aura-text">{app.name}</span>
                      </motion.button>
                    ))}
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
                    {categories.map((category, i) => (
                      <motion.div
                        key={i}
                        initial={{ opacity: 0, y: 20 }}
                        animate={{ opacity: 1, y: 0 }}
                        transition={{ delay: i * 0.1 }}
                        className="apple-glass p-6 rounded-[32px] border border-white/10"
                      >
                        <h3 className="text-sm font-semibold text-aura-muted uppercase tracking-wider mb-4 flex items-center gap-2">
                          <Folder className="w-4 h-4" />
                          {category.name}
                        </h3>
                        <div className="grid grid-cols-2 gap-4">
                          {category.apps.map((app, j) => (
                            <button key={j} className="flex flex-col items-center gap-2 group">
                              <div className={`w-16 h-16 rounded-2xl ${app.color} flex items-center justify-center text-2xl shadow-md group-hover:scale-105 transition-transform duration-300`}>
                                {app.icon}
                              </div>
                              <span className="text-xs font-medium text-aura-text truncate w-full text-center">{app.name}</span>
                            </button>
                          ))}
                        </div>
                      </motion.div>
                    ))}
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
