import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Search, ListMusic, Mic2, Radio, MoreHorizontal } from 'lucide-react';

interface PodcastsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function PodcastsModal({ isOpen, onClose }: PodcastsModalProps) {
  const [isPlaying, setIsPlaying] = useState(false);
  const [activeTab, setActiveTab] = useState('Listen Now');

  const podcasts = [
    { id: 1, title: 'The Daily', publisher: 'The New York Times', image: 'https://picsum.photos/seed/pod1/200/200', color: 'from-blue-500 to-purple-500' },
    { id: 2, title: 'Huberman Lab', publisher: 'Scicomm Media', image: 'https://picsum.photos/seed/pod2/200/200', color: 'from-slate-800 to-black' },
    { id: 3, title: 'SmartLess', publisher: 'Wondery', image: 'https://picsum.photos/seed/pod3/200/200', color: 'from-orange-400 to-red-500' },
    { id: 4, title: 'Stuff You Should Know', publisher: 'iHeartPodcasts', image: 'https://picsum.photos/seed/pod4/200/200', color: 'from-green-400 to-emerald-600' },
  ];

  const episodes = [
    { id: 1, title: 'The AI Revolution', podcast: 'Tech Talk', duration: '45 min', date: 'Today' },
    { id: 2, title: 'Understanding Sleep', podcast: 'Huberman Lab', duration: '2 hr 15 min', date: 'Yesterday' },
    { id: 3, title: 'History of Rome', podcast: 'History Extra', duration: '55 min', date: 'Oct 12' },
  ];

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
              className="w-full max-w-6xl h-[85vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col md:flex-row relative bg-[#1c1c1e]"
            >
              {/* Sidebar */}
              <div className={`w-full md:w-64 border-b md:border-b-0 md:border-r border-white/10 flex flex-col bg-[#2c2c2e]/50 shrink-0 ${activeTab ? 'hidden md:flex' : 'flex flex-1'}`}>
                <div className="p-4 flex items-center justify-between">
                  <div className="relative flex-1 mr-2">
                    <Search className="w-4 h-4 text-white/50 absolute left-3 top-1/2 -translate-y-1/2" />
                    <input 
                      type="text"
                      placeholder="Search"
                      className="w-full bg-black/20 border border-white/10 rounded-xl pl-9 pr-4 py-1.5 text-sm text-white placeholder:text-white/50 focus:outline-none focus:bg-black/30 transition-colors"
                    />
                  </div>
                  <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors md:hidden">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-2 space-y-1 pb-24 md:pb-2">
                  {['Listen Now', 'Browse', 'Top Charts'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${
                        activeTab === tab ? 'bg-purple-500/20 text-purple-400' : 'text-white hover:bg-white/5'
                      }`}
                    >
                      {tab === 'Listen Now' && <Play className="w-5 h-5" />}
                      {tab === 'Browse' && <Search className="w-5 h-5" />}
                      {tab === 'Top Charts' && <ListMusic className="w-5 h-5" />}
                      <span className="font-medium">{tab}</span>
                    </button>
                  ))}
                  
                  <div className="mt-8 mb-2 px-2 text-xs font-semibold text-white/50 uppercase tracking-wider">Library</div>
                  {['Shows', 'Saved', 'Downloaded', 'Latest Episodes'].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab)}
                      className={`w-full flex items-center gap-3 p-2 rounded-xl transition-colors ${
                        activeTab === tab ? 'bg-purple-500/20 text-purple-400' : 'text-white hover:bg-white/5'
                      }`}
                    >
                      {tab === 'Shows' && <Mic2 className="w-5 h-5" />}
                      {tab === 'Saved' && <ListMusic className="w-5 h-5" />}
                      {tab === 'Downloaded' && <Radio className="w-5 h-5" />}
                      {tab === 'Latest Episodes' && <Play className="w-5 h-5" />}
                      <span className="font-medium">{tab}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Main Content Area */}
              <div className={`flex-1 flex flex-col relative bg-[#1c1c1e] overflow-hidden ${!activeTab ? 'hidden md:flex' : 'flex'}`}>
                {/* Header */}
                <div className="h-14 flex items-center justify-between px-4 md:px-8 border-b border-white/10 shrink-0">
                  <div className="flex items-center gap-2">
                    <button onClick={() => setActiveTab('')} className="p-2 text-purple-500 hover:text-purple-400 hover:bg-white/10 rounded-lg transition-colors md:hidden flex items-center gap-1">
                      <span className="text-sm font-medium">Menu</span>
                    </button>
                    <h2 className="text-xl font-bold text-white hidden md:block">{activeTab}</h2>
                  </div>
                  <h2 className="text-xl font-bold text-white md:hidden">{activeTab}</h2>
                  <button onClick={onClose} className="p-2 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors hidden md:block">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                <div className="flex-1 overflow-y-auto custom-scrollbar p-8 pb-32">
                  {/* Up Next Section */}
                  <h3 className="text-2xl font-bold text-white mb-6">Up Next</h3>
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-12">
                    {podcasts.map((podcast) => (
                      <div key={podcast.id} className="group cursor-pointer">
                        <div className="relative aspect-square rounded-2xl overflow-hidden mb-3 shadow-lg group-hover:shadow-xl transition-all group-hover:scale-105">
                          <img src={podcast.image} alt={podcast.title} className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/20 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <div className="w-12 h-12 rounded-full bg-white/20 backdrop-blur-md flex items-center justify-center">
                              <Play className="w-6 h-6 text-white fill-white ml-1" />
                            </div>
                          </div>
                        </div>
                        <h4 className="text-white font-medium truncate">{podcast.title}</h4>
                        <p className="text-white/50 text-sm truncate">{podcast.publisher}</p>
                      </div>
                    ))}
                  </div>

                  {/* Latest Episodes */}
                  <h3 className="text-2xl font-bold text-white mb-6">Latest Episodes</h3>
                  <div className="space-y-4">
                    {episodes.map((episode) => (
                      <div key={episode.id} className="flex items-center gap-4 p-4 bg-[#2c2c2e] rounded-2xl hover:bg-[#3a3a3c] transition-colors cursor-pointer group">
                        <div className="w-16 h-16 rounded-xl bg-zinc-800 shrink-0 overflow-hidden relative">
                          <img src={`https://picsum.photos/seed/ep${episode.id}/100/100`} alt="Episode" className="w-full h-full object-cover" />
                          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                            <Play className="w-6 h-6 text-white fill-white" />
                          </div>
                        </div>
                        <div className="flex-1 min-w-0">
                          <div className="text-xs text-purple-400 font-medium mb-1">{episode.date}</div>
                          <h4 className="text-white font-medium truncate mb-1">{episode.title}</h4>
                          <p className="text-white/50 text-sm truncate">{episode.podcast}</p>
                        </div>
                        <div className="text-white/50 text-sm whitespace-nowrap">
                          {episode.duration}
                        </div>
                        <button className="w-8 h-8 rounded-full border border-white/20 flex items-center justify-center text-white hover:bg-white/10 transition-colors shrink-0">
                          <MoreHorizontal className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Now Playing Bar */}
                <div className="absolute bottom-0 left-0 right-0 h-auto md:h-20 py-4 md:py-0 bg-[#2c2c2e]/90 backdrop-blur-xl border-t border-white/10 flex flex-col md:flex-row items-center px-4 md:px-6 gap-4 md:gap-6">
                  <div className="flex items-center gap-4 w-full md:w-1/3">
                    <div className="w-12 h-12 rounded-lg bg-zinc-800 overflow-hidden shrink-0">
                      <img src="https://picsum.photos/seed/nowplaying/100/100" alt="Now Playing" className="w-full h-full object-cover" />
                    </div>
                    <div className="min-w-0 flex-1">
                      <div className="text-white font-medium truncate">The AI Revolution</div>
                      <div className="text-white/50 text-sm truncate">Tech Talk</div>
                    </div>
                    <div className="md:hidden flex items-center gap-4">
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-1" />}
                      </button>
                    </div>
                  </div>

                  <div className="w-full md:flex-1 flex flex-col items-center justify-center max-w-xl hidden md:flex">
                    <div className="flex items-center gap-6 mb-2">
                      <button className="text-white/70 hover:text-white transition-colors">
                        <SkipBack className="w-6 h-6" />
                      </button>
                      <button 
                        onClick={() => setIsPlaying(!isPlaying)}
                        className="w-10 h-10 rounded-full bg-white text-black flex items-center justify-center hover:scale-105 transition-transform"
                      >
                        {isPlaying ? <Pause className="w-5 h-5 fill-black" /> : <Play className="w-5 h-5 fill-black ml-1" />}
                      </button>
                      <button className="text-white/70 hover:text-white transition-colors">
                        <SkipForward className="w-6 h-6" />
                      </button>
                    </div>
                    <div className="w-full flex items-center gap-3 text-xs text-white/50">
                      <span>12:34</span>
                      <div className="flex-1 h-1 bg-white/20 rounded-full overflow-hidden">
                        <div className="h-full bg-white w-1/3 rounded-full" />
                      </div>
                      <span>-32:26</span>
                    </div>
                  </div>

                  <div className="w-full md:w-1/3 justify-end items-center gap-4 hidden md:flex">
                    <Volume2 className="w-5 h-5 text-white/70" />
                    <div className="w-24 h-1 bg-white/20 rounded-full overflow-hidden">
                      <div className="h-full bg-white w-2/3 rounded-full" />
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
