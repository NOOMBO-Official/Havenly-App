import { useState, useEffect, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Search, Sparkles, ArrowRight, Command, X, Clock, Cloud, Calendar, Music, Timer } from 'lucide-react';
import { useTimers } from '../contexts/TimersContext';

interface AiSearchModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function AiSearchModal({ isOpen, onClose }: AiSearchModalProps) {
  const [query, setQuery] = useState('');
  const [isSearching, setIsSearching] = useState(false);
  const [results, setResults] = useState<any[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const { addTimer } = useTimers();

  useEffect(() => {
    if (isOpen) {
      setTimeout(() => inputRef.current?.focus(), 100);
      setQuery('');
      setResults([]);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'k' && (e.metaKey || e.ctrlKey)) {
        e.preventDefault();
        if (!isOpen) {
          inputRef.current?.focus();
        }
      }
      if (e.key === 'Escape') {
        onClose();
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!query.trim()) {
      setResults([]);
      return;
    }

    setIsSearching(true);
    const timer = setTimeout(() => {
      let searchResults = [];

      // Quick Action: Timer
      const timerMatch = query.toLowerCase().match(/^timer\s+(\d+)(m|s|h)?$/);
      if (timerMatch) {
        const amount = parseInt(timerMatch[1]);
        const unit = timerMatch[2] || 'm';
        let seconds = amount;
        if (unit === 'm') seconds = amount * 60;
        if (unit === 'h') seconds = amount * 3600;

        searchResults.push({
          type: 'action',
          title: `Start ${amount}${unit} timer`,
          icon: Timer,
          color: 'text-orange-400',
          bg: 'bg-orange-500/20',
          action: () => {
            addTimer({
              label: `${amount}${unit} Timer`,
              duration: seconds,
              remaining: seconds,
              isRunning: true,
              type: 'timer'
            });
            onClose();
          }
        });
      }

      searchResults.push(
        { type: 'action', title: `Ask AVA about "${query}"`, icon: Sparkles, color: 'text-purple-400', bg: 'bg-purple-500/20', action: () => { console.log("Ask AVA"); onClose(); } },
        { type: 'app', title: 'Weather', subtitle: 'Check forecast', icon: Cloud, color: 'text-blue-400', bg: 'bg-blue-500/20', action: () => { onClose(); } },
        { type: 'app', title: 'Calendar', subtitle: 'Upcoming events', icon: Calendar, color: 'text-red-400', bg: 'bg-red-500/20', action: () => { onClose(); } },
        { type: 'app', title: 'Music', subtitle: 'Play something', icon: Music, color: 'text-emerald-400', bg: 'bg-emerald-500/20', action: () => { onClose(); } }
      );

      setResults(searchResults.filter(r => r.type === 'action' || r.title.toLowerCase().includes(query.toLowerCase())));
      setIsSearching(false);
    }, 300);

    return () => clearTimeout(timer);
  }, [query, addTimer, onClose]);

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
          <div className="fixed inset-0 z-[115] flex items-start justify-center pt-[10vh] md:pt-[15vh] pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: -20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: -20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-[calc(100%-2rem)] md:w-full max-w-2xl apple-glass-heavy rounded-[24px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col"
            >
              {/* Search Input */}
              <div className="flex items-center px-4 py-4 border-b border-white/10 bg-black/20 dark:bg-white/5">
                <Search className="w-6 h-6 text-aura-muted mr-3" />
                <input
                  ref={inputRef}
                  type="text"
                  value={query}
                  onChange={(e) => setQuery(e.target.value)}
                  placeholder="Search apps, ask AVA, or type a command..."
                  className="flex-1 bg-transparent text-xl text-aura-text placeholder:text-aura-muted focus:outline-none"
                />
                <div className="flex items-center gap-2 ml-3">
                  {query && (
                    <button onClick={() => setQuery('')} className="p-1 text-aura-muted hover:text-aura-text rounded-full hover:bg-white/10 transition-colors">
                      <X className="w-5 h-5" />
                    </button>
                  )}
                  <div className="hidden sm:flex items-center gap-1 px-2 py-1 rounded-md bg-white/10 text-aura-muted text-xs font-medium border border-white/5">
                    <Command className="w-3 h-3" /> K
                  </div>
                </div>
              </div>

              {/* Results Area */}
              <div className="max-h-[60vh] overflow-y-auto custom-scrollbar">
                {!query ? (
                  <div className="p-4">
                    <h3 className="text-xs font-semibold text-aura-muted uppercase tracking-wider mb-3 px-2">Recent</h3>
                    <div className="space-y-1">
                      {['Turn off living room lights', 'What\'s the weather tomorrow?', 'Play Focus playlist'].map((item, i) => (
                        <button key={i} className="w-full flex items-center gap-3 px-3 py-3 rounded-xl hover:bg-white/10 transition-colors text-left group">
                          <Clock className="w-4 h-4 text-aura-muted" />
                          <span className="text-sm text-aura-text flex-1">{item}</span>
                          <ArrowRight className="w-4 h-4 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                        </button>
                      ))}
                    </div>
                  </div>
                ) : (
                  <div className="p-2">
                    {isSearching ? (
                      <div className="flex items-center justify-center py-12 text-aura-muted">
                        <Sparkles className="w-5 h-5 animate-pulse mr-2 text-purple-400" />
                        <span className="text-sm font-medium">Searching...</span>
                      </div>
                    ) : results.length > 0 ? (
                      <div className="space-y-1">
                        {results.map((result, i) => (
                          <button 
                            key={i} 
                            onClick={result.action}
                            className="w-full flex items-center gap-4 px-4 py-3 rounded-xl hover:bg-white/10 transition-colors text-left group"
                          >
                            <div className={`p-2 rounded-lg ${result.bg} ${result.color}`}>
                              <result.icon className="w-5 h-5" />
                            </div>
                            <div className="flex-1">
                              <div className="text-sm font-medium text-aura-text">{result.title}</div>
                              {result.subtitle && <div className="text-xs text-aura-muted">{result.subtitle}</div>}
                            </div>
                            <ArrowRight className="w-4 h-4 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
                          </button>
                        ))}
                      </div>
                    ) : (
                      <div className="flex flex-col items-center justify-center py-12 text-aura-muted">
                        <Search className="w-8 h-8 mb-3 opacity-50" />
                        <span className="text-sm font-medium">No results found for "{query}"</span>
                      </div>
                    )}
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
