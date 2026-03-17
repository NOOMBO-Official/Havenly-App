import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Play, Pause, SkipBack, SkipForward, Volume2, Shuffle, Repeat, Heart, Music as MusicIcon } from 'lucide-react';
import { useSpotifyPlayer } from '../hooks/useSpotifyPlayer';
import { useSettings } from '../contexts/SettingsContext';

interface MusicModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function MusicModal({ isOpen, onClose }: MusicModalProps) {
  const { isReady, currentTrack, isPlaying, progress, togglePlay, nextTrack, previousTrack, setVolume } = useSpotifyPlayer();
  const { settings } = useSettings();
  const [localProgress, setLocalProgress] = useState(progress);

  useEffect(() => {
    setLocalProgress(progress);
  }, [progress]);

  const handleConnect = async () => {
    try {
      const response = await fetch('/api/auth/spotify/url');
      if (!response.ok) throw new Error('Failed to get auth URL');
      const { url } = await response.json();
      const authWindow = window.open(url, 'oauth_popup', 'width=600,height=700');
      if (!authWindow) alert('Please allow popups for this site to connect your account.');
    } catch (error) {
      console.error('OAuth error:', error);
    }
  };

  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'SPOTIFY_AUTH_SUCCESS') {
        window.location.reload(); // Reload to initialize Spotify player
      }
    };
    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, []);

  const albumArt = currentTrack?.album?.images?.[0]?.url || "https://images.unsplash.com/photo-1614613535308-eb5fbd3d2c17";
  const trackName = currentTrack?.name || "Not Playing";
  const artistName = currentTrack?.artists?.[0]?.name || "Connect Spotify to start listening";

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
              className="w-full max-w-4xl h-[70vh] apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex"
            >
              {/* Sidebar */}
              <div className="w-64 border-r border-white/10 bg-black/20 p-6 hidden md:flex flex-col">
                <div className="flex items-center gap-3 mb-8">
                  <div className="w-8 h-8 rounded-xl bg-gradient-to-br from-pink-500 to-rose-500 flex items-center justify-center shadow-inner">
                    <MusicIcon className="w-4 h-4 text-white" />
                  </div>
                  <h2 className="text-xl font-semibold text-white tracking-tight">Music</h2>
                </div>
                
                <div className="space-y-6 flex-1">
                  {!isReady && (
                    <button 
                      onClick={handleConnect}
                      className="w-full py-2 px-4 bg-emerald-500 text-white rounded-xl hover:bg-emerald-600 transition-colors text-sm font-medium"
                    >
                      Connect Spotify
                    </button>
                  )}
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Library</h3>
                    <ul className="space-y-1">
                      {['Listen Now', 'Browse', 'Radio'].map(item => (
                        <li key={item}>
                          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-sm font-medium transition-colors">
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                  <div>
                    <h3 className="text-xs font-semibold text-white/50 uppercase tracking-wider mb-3">Playlists</h3>
                    <ul className="space-y-1">
                      {['Focus Flow', 'Chill Vibes', 'Workout', 'Favorites'].map(item => (
                        <li key={item}>
                          <button className="w-full text-left px-3 py-2 rounded-lg hover:bg-white/10 text-white/80 hover:text-white text-sm font-medium transition-colors">
                            {item}
                          </button>
                        </li>
                      ))}
                    </ul>
                  </div>
                </div>
              </div>

              {/* Main Content */}
              <div className="flex-1 flex flex-col relative">
                {/* Background Blur */}
                <div className="absolute inset-0 z-0 opacity-30">
                  <img 
                    src={albumArt} 
                    alt="Album Art Blur" 
                    className="w-full h-full object-cover blur-3xl"
                  />
                </div>

                {/* Top Bar */}
                <div className="flex justify-end p-4 z-10">
                  <button onClick={onClose} className="p-2 text-white/50 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                    <X className="w-5 h-5" />
                  </button>
                </div>

                {/* Player Area */}
                <div className="flex-1 flex flex-col items-center justify-center p-8 pb-24 md:pb-8 z-10">
                  <motion.div 
                    className="w-64 h-64 md:w-80 md:h-80 rounded-2xl shadow-2xl overflow-hidden mb-8"
                    whileHover={{ scale: 1.02 }}
                    transition={{ type: 'spring', stiffness: 300, damping: 20 }}
                  >
                    <img 
                      src={albumArt} 
                      alt="Album Art" 
                      className="w-full h-full object-cover"
                    />
                  </motion.div>

                  <div className="w-full max-w-md text-center mb-8">
                    <h2 className="text-2xl font-bold text-white mb-1">{trackName}</h2>
                    <p className="text-white/60 text-lg">{artistName}</p>
                  </div>

                  {/* Controls */}
                  <div className="w-full max-w-md space-y-6">
                    {/* Progress Bar */}
                    <div className="space-y-2">
                      <div className="h-1.5 bg-white/20 rounded-full overflow-hidden cursor-pointer">
                        <div 
                          className="h-full bg-white rounded-full"
                          style={{ width: `${(localProgress / (currentTrack?.duration_ms || 1)) * 100}%` }}
                        />
                      </div>
                      <div className="flex justify-between text-xs text-white/50 font-medium font-mono">
                        <span>{Math.floor(localProgress / 60000)}:{(Math.floor((localProgress % 60000) / 1000)).toString().padStart(2, '0')}</span>
                        <span>{currentTrack ? `${Math.floor(currentTrack.duration_ms / 60000)}:${(Math.floor((currentTrack.duration_ms % 60000) / 1000)).toString().padStart(2, '0')}` : '0:00'}</span>
                      </div>
                    </div>

                    {/* Buttons */}
                    <div className="flex items-center justify-between px-4">
                      <button className="p-2 text-white/50 hover:text-white transition-colors">
                        <Shuffle className="w-5 h-5" />
                      </button>
                      <div className="flex items-center gap-6">
                        <button onClick={previousTrack} className="p-2 text-white hover:text-white/80 transition-colors">
                          <SkipBack className="w-8 h-8 fill-current" />
                        </button>
                        <button 
                          onClick={togglePlay}
                          className="w-16 h-16 bg-white text-black rounded-full flex items-center justify-center hover:scale-105 transition-transform shadow-lg"
                        >
                          {isPlaying ? <Pause className="w-8 h-8 fill-current" /> : <Play className="w-8 h-8 fill-current ml-1" />}
                        </button>
                        <button onClick={nextTrack} className="p-2 text-white hover:text-white/80 transition-colors">
                          <SkipForward className="w-8 h-8 fill-current" />
                        </button>
                      </div>
                      <button className="p-2 text-white/50 hover:text-white transition-colors">
                        <Repeat className="w-5 h-5" />
                      </button>
                    </div>

                    {/* Volume */}
                    <div className="flex items-center gap-3 px-8 pt-4">
                      <Volume2 className="w-4 h-4 text-white/50" />
                      <input 
                        type="range" 
                        min="0" 
                        max="1" 
                        step="0.01" 
                        defaultValue="0.5"
                        onChange={(e) => setVolume(parseFloat(e.target.value))}
                        className="flex-1 h-1 bg-white/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-3 [&::-webkit-slider-thumb]:h-3 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full"
                      />
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
