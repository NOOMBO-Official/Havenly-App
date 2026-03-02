import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Search,
  X,
  Volume2,
  VolumeX
} from "lucide-react";
import { useState, useEffect } from "react";
import { createPortal } from "react-dom";
import { motion, AnimatePresence } from "motion/react";
import { TrackInfo } from "./MediaWidget";

interface SpotifyModalProps {
  isOpen: boolean;
  onClose: () => void;
  token: string | null;
  track: TrackInfo | null;
  handleControl: (action: "play" | "pause" | "next" | "previous" | "volume", value?: number) => void;
  formatTime: (ms: number) => string;
  deviceId?: string | null;
}

export default function SpotifyModal({
  isOpen,
  onClose,
  token,
  track,
  handleControl,
  formatTime,
  deviceId,
}: SpotifyModalProps) {
  const [searchQuery, setSearchQuery] = useState("");
  const [searchResults, setSearchResults] = useState<any[]>([]);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    if (!searchQuery || !token) {
      setSearchResults([]);
      return;
    }

    const delayDebounceFn = setTimeout(async () => {
      setIsSearching(true);
      try {
        const res = await fetch(
          `https://api.spotify.com/v1/search?q=${encodeURIComponent(searchQuery)}&type=track&limit=10`,
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );
        if (res.ok) {
          const data = await res.json();
          setSearchResults(data.tracks.items);
        }
      } catch (err) {
        console.error("Search failed", err);
      } finally {
        setIsSearching(false);
      }
    }, 500);

    return () => clearTimeout(delayDebounceFn);
  }, [searchQuery, token]);

  const playTrack = async (uri: string) => {
    if (!token) return;
    try {
      const url = deviceId 
        ? `https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`
        : `https://api.spotify.com/v1/me/player/play`;
        
      await fetch(url, {
        method: "PUT",
        headers: { Authorization: `Bearer ${token}` },
        body: JSON.stringify({ uris: [uri] }),
      });
      setSearchQuery("");
      setSearchResults([]);
    } catch (err) {
      console.error("Failed to play track", err);
    }
  };

  const modalContent = (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          key="spotify-modal"
          initial={{ opacity: 0, y: "100%" }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: "100%" }}
          transition={{ type: "spring", damping: 25, stiffness: 200 }}
          className="fixed inset-0 bg-aura-bg z-[100] overflow-hidden flex flex-col"
        >
          {/* Background blur from current track */}
            {track?.albumArt ? (
              <div
                className="absolute inset-0 opacity-40 blur-[100px] scale-150 pointer-events-none transition-all duration-1000"
                style={{
                  backgroundImage: `url(${track.albumArt})`,
                  backgroundSize: "cover",
                  backgroundPosition: "center",
                }}
              />
            ) : (
              <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-black pointer-events-none" />
            )}
            <div className="absolute inset-0 bg-black/40 pointer-events-none" />

            <div className="relative z-10 p-8 md:p-12 lg:p-24 flex flex-col h-full max-w-6xl mx-auto w-full">
              {/* Header */}
              <div className="flex justify-between items-center mb-12">
                <div className="flex items-center space-x-4">
                  <div className="p-3 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 text-white shadow-lg shadow-green-500/30">
                    <Music className="w-6 h-6" />
                  </div>
                  <span className="font-display font-semibold tracking-tight text-aura-text text-2xl">
                    Spotify
                  </span>
                </div>
                <button
                  onClick={onClose}
                  className="p-3 text-aura-muted hover:text-aura-text transition-all duration-300 rounded-full hover:bg-white/10 hover:scale-110 active:scale-95"
                >
                  <X className="w-7 h-7" />
                </button>
              </div>

              {/* Search */}
              <div className="relative mb-12 shrink-0 group">
                <Search className="absolute left-6 top-1/2 -translate-y-1/2 w-6 h-6 text-aura-muted group-focus-within:text-green-400 transition-colors" />
                <input
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search for songs, artists, or albums..."
                  className="w-full bg-black/40 backdrop-blur-xl border border-white/10 rounded-full py-5 pl-16 pr-6 text-lg text-aura-text focus:outline-none focus:border-green-500/50 focus:ring-4 focus:ring-green-500/10 transition-all shadow-2xl"
                />
              </div>

              {/* Content Area */}
              <div className="flex-1 overflow-y-auto min-h-0 mb-12 custom-scrollbar">
                {searchQuery ? (
                  <div className="space-y-3 pr-4">
                    {isSearching ? (
                      <div className="flex items-center justify-center h-48">
                        <div className="animate-pulse flex space-x-2">
                          <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full" style={{ animationDelay: '0.2s' }}></div>
                          <div className="w-3 h-3 bg-green-500 rounded-full" style={{ animationDelay: '0.4s' }}></div>
                        </div>
                      </div>
                    ) : searchResults.length > 0 ? (
                      searchResults.map((result) => (
                        <button
                          key={result.id}
                          onClick={() => playTrack(result.uri)}
                          className="w-full flex items-center space-x-5 p-4 rounded-2xl hover:bg-white/5 border border-transparent hover:border-white/10 transition-all text-left group"
                        >
                          <div className="relative w-14 h-14 rounded-xl overflow-hidden shadow-md">
                            <img
                              src={
                                result.album.images[2]?.url ||
                                result.album.images[0]?.url
                              }
                              alt=""
                              className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
                            />
                            <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                              <Play className="w-6 h-6 text-white fill-current" />
                            </div>
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="text-aura-text font-medium text-lg truncate group-hover:text-green-400 transition-colors">
                              {result.name}
                            </div>
                            <div className="text-aura-muted truncate">
                              {result.artists
                                .map((a: any) => a.name)
                                .join(", ")}
                            </div>
                          </div>
                        </button>
                      ))
                    ) : (
                      <div className="text-center text-aura-muted py-12 text-lg">
                        No results found for "{searchQuery}"
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="flex flex-col items-center justify-center h-full">
                    <div className="w-72 h-72 md:w-[28rem] md:h-[28rem] rounded-[2.5rem] overflow-hidden shadow-[0_20px_50px_rgba(0,0,0,0.5)] mb-12 relative group">
                      {track?.albumArt ? (
                        <>
                          <img
                            src={track.albumArt}
                            alt="Album Art"
                            className="w-full h-full object-cover transition-transform duration-1000 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-transparent to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
                        </>
                      ) : (
                        <div className="w-full h-full bg-white/5 backdrop-blur-xl border border-white/10 flex items-center justify-center">
                          <Music className="w-32 h-32 text-white/20" />
                        </div>
                      )}
                    </div>
                    <h2 className="text-5xl md:text-6xl font-display font-bold tracking-tight text-white mb-4 text-center px-4 line-clamp-1 drop-shadow-lg">
                      {track ? track.name : "Not Playing"}
                    </h2>
                    <p className="text-2xl md:text-3xl text-white/60 font-medium text-center px-4 line-clamp-1">
                      {track
                        ? track.artist
                        : "Search for a song to start listening"}
                    </p>
                  </div>
                )}
              </div>

              {/* Player Controls */}
              <div className="shrink-0 pt-8">
                <div className="flex items-center justify-between mb-8">
                  <span className="text-sm text-white/50 font-mono w-16 text-right tracking-wider">
                    {track ? formatTime(track.progress) : "0:00"}
                  </span>
                  <div className="flex-1 mx-8 h-2.5 bg-white/10 rounded-full overflow-hidden cursor-pointer relative group">
                    <div
                      className="absolute top-0 left-0 h-full bg-gradient-to-r from-green-500 to-green-400 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_20px_rgba(74,222,128,0.6)]"
                      style={{
                        width: track
                          ? `${(track.progress / track.duration) * 100}%`
                          : "0%",
                      }}
                    />
                    <div className="absolute top-0 left-0 h-full w-full bg-white/20 opacity-0 group-hover:opacity-100 transition-opacity" />
                  </div>
                  <span className="text-sm text-white/50 font-mono w-16 tracking-wider">
                    {track ? formatTime(track.duration) : "0:00"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  {/* Volume Control */}
                  <div className="flex items-center space-x-4 w-1/4 group">
                    <button 
                      onClick={() => handleControl("volume", track?.volume === 0 ? 50 : 0)}
                      className="text-white/50 hover:text-white transition-colors"
                    >
                      {track?.volume === 0 ? <VolumeX className="w-6 h-6" /> : <Volume2 className="w-6 h-6" />}
                    </button>
                    <input 
                      type="range" 
                      min="0" 
                      max="100" 
                      value={track?.volume ?? 50}
                      onChange={(e) => handleControl("volume", parseInt(e.target.value))}
                      className="w-full h-1.5 bg-white/10 rounded-lg appearance-none cursor-pointer accent-white opacity-50 group-hover:opacity-100 transition-opacity"
                    />
                  </div>

                  {/* Playback Controls */}
                  <div className="flex items-center justify-center space-x-8 md:space-x-12 flex-1">
                    <button
                      onClick={() => handleControl("previous")}
                      disabled={!track}
                      className="p-4 text-white/60 hover:text-white transition-all disabled:opacity-30 hover:scale-110 active:scale-95"
                    >
                      <SkipBack className="w-10 h-10" strokeWidth={1.5} />
                    </button>
                    <button
                      onClick={() =>
                        handleControl(track?.isPlaying ? "pause" : "play")
                      }
                      disabled={!track}
                      className="p-6 bg-white text-black rounded-full hover:scale-105 active:scale-95 transition-all disabled:opacity-50 disabled:hover:scale-100 shadow-[0_0_40px_rgba(255,255,255,0.3)]"
                    >
                      {track?.isPlaying ? (
                        <Pause
                          className="w-10 h-10 fill-current"
                          strokeWidth={1.5}
                        />
                      ) : (
                        <Play
                          className="w-10 h-10 fill-current translate-x-1"
                          strokeWidth={1.5}
                        />
                      )}
                    </button>
                    <button
                      onClick={() => handleControl("next")}
                      disabled={!track}
                      className="p-4 text-white/60 hover:text-white transition-all disabled:opacity-30 hover:scale-110 active:scale-95"
                    >
                      <SkipForward className="w-10 h-10" strokeWidth={1.5} />
                    </button>
                  </div>
                  
                  {/* Empty div to balance flex layout */}
                  <div className="w-1/4" />
                </div>
              </div>
            </div>
        </motion.div>
      )}
    </AnimatePresence>
  );

  return createPortal(modalContent, document.body);
}
