import {
  Play,
  Pause,
  SkipBack,
  SkipForward,
  Music,
  Maximize2,
} from "lucide-react";
import { useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";
import SpotifyModal from "./SpotifyModal";

export interface TrackInfo {
  name: string;
  artist: string;
  albumArt: string;
  isPlaying: boolean;
  progress: number;
  duration: number;
  volume: number;
}

export default function MediaWidget() {
  const { settings } = useSettings();
  const [track, setTrack] = useState<TrackInfo | null>(null);
  const [token, setToken] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [player, setPlayer] = useState<any>(null);

  const fetchToken = async () => {
    try {
      const res = await fetch("/api/spotify/token");
      if (res.ok) {
        const data = await res.json();
        setToken(data.access_token);
      }
    } catch (err) {
      console.error("Failed to fetch token", err);
    }
  };

  useEffect(() => {
    if (settings.integrations.spotify) {
      fetchToken();
    }
  }, [settings.integrations.spotify]);

  useEffect(() => {
    if (!token) return;

    let spotifyPlayer: any = null;

    const initializePlayer = () => {
      spotifyPlayer = new (window as any).Spotify.Player({
        name: 'AVA Assistant',
        getOAuthToken: (cb: (token: string) => void) => { cb(token); },
        volume: 0.5
      });

      setPlayer(spotifyPlayer);

      spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
        
        // Transfer playback to this device
        fetch('https://api.spotify.com/v1/me/player', {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            device_ids: [device_id],
            play: false,
          }),
        }).catch(err => console.error("Failed to transfer playback", err));
      });

      spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
      });

      spotifyPlayer.addListener('player_state_changed', (state: any) => {
        if (!state) {
          setTrack(null);
          return;
        }

        const currentTrack = state.track_window.current_track;
        if (currentTrack) {
          setTrack({
            name: currentTrack.name,
            artist: currentTrack.artists.map((a: any) => a.name).join(", "),
            albumArt: currentTrack.album.images[0]?.url || "",
            isPlaying: !state.paused,
            progress: state.position,
            duration: state.duration,
            volume: 50, // SDK doesn't report volume in state, we'll manage it separately if needed
          });
        }
      });

      spotifyPlayer.connect();
    };

    if (!(window as any).Spotify) {
      const script = document.createElement("script");
      script.src = "https://sdk.scdn.co/spotify-player.js";
      script.async = true;
      document.body.appendChild(script);

      (window as any).onSpotifyWebPlaybackSDKReady = initializePlayer;
    } else {
      initializePlayer();
    }

    return () => {
      if (spotifyPlayer) {
        spotifyPlayer.disconnect();
      }
    };
  }, [token]);

  // Fallback polling for progress updates since player_state_changed doesn't fire every second
  useEffect(() => {
    if (!token || !track?.isPlaying) return;
    
    const interval = setInterval(async () => {
      if (player) {
        const state = await player.getCurrentState();
        if (state) {
          setTrack(prev => prev ? { ...prev, progress: state.position } : null);
        }
      }
    }, 1000);
    
    return () => clearInterval(interval);
  }, [token, track?.isPlaying, player]);

  const handleControl = async (
    action: "play" | "pause" | "next" | "previous" | "volume",
    value?: number
  ) => {
    if (!player) return;

    try {
      if (action === "play") await player.resume();
      if (action === "pause") await player.pause();
      if (action === "next") await player.nextTrack();
      if (action === "previous") await player.previousTrack();
      if (action === "volume" && value !== undefined) {
        await player.setVolume(value / 100);
        setTrack(prev => prev ? { ...prev, volume: value } : null);
      }
    } catch (err) {
      console.error(`Failed to ${action}`, err);
    }
  };

  const formatTime = (ms: number) => {
    const totalSeconds = Math.floor(ms / 1000);
    const minutes = Math.floor(totalSeconds / 60);
    const seconds = totalSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, "0")}`;
  };

  if (!settings.integrations.spotify && !track) {
    return (
      <div className="flex flex-col items-center justify-center p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full text-center">
        <Music className="w-8 h-8 text-aura-muted mb-4" strokeWidth={1.5} />
        <span className="text-sm text-aura-text">Spotify Not Connected</span>
        <span className="text-xs text-aura-muted mt-2">
          Connect in Settings to view media
        </span>
      </div>
    );
  }

  return (
    <>
      <div
        className="group flex flex-col justify-between p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full relative overflow-hidden cursor-pointer hover:border-green-500/30 transition-colors"
        onClick={() => setIsModalOpen(true)}
      >
        {/* Background Blur */}
        {track?.albumArt ? (
          <div
            className="absolute inset-0 opacity-20 blur-2xl scale-110 pointer-events-none transition-all duration-1000 group-hover:opacity-30"
            style={{
              backgroundImage: `url(${track.albumArt})`,
              backgroundSize: "cover",
              backgroundPosition: "center",
            }}
          />
        ) : (
          <div className="absolute inset-0 bg-gradient-to-br from-green-500/10 to-transparent pointer-events-none" />
        )}

        <div className="flex justify-between items-start relative z-10">
          <div className="flex flex-col pr-4">
            <span className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-1 flex items-center gap-2">
              <Music className="w-3 h-3 text-green-400" />
              {track ? "Now Playing" : "Spotify"}
            </span>
            <span className="text-lg font-display font-medium text-aura-text line-clamp-1 mt-1">
              {track ? track.name : "Not Playing"}
            </span>
            <span className="text-sm text-aura-muted mt-1 line-clamp-1">
              {track ? track.artist : "Click to search & play"}
            </span>
          </div>
          <div className="w-14 h-14 rounded-2xl bg-green-500/10 flex items-center justify-center overflow-hidden border border-aura-border shrink-0 shadow-lg group-hover:scale-105 transition-transform">
            {track?.albumArt ? (
              <img
                src={track.albumArt}
                alt="Album Art"
                className="w-full h-full object-cover"
                referrerPolicy="no-referrer"
              />
            ) : (
              <Music className="w-6 h-6 text-green-400 opacity-50" />
            )}
          </div>
        </div>

        <div className="mt-6 pt-6 border-t border-aura-border/50 relative z-10">
          <div className="flex items-center justify-between mb-4">
            <span className="text-[10px] text-aura-muted font-mono">
              {track ? formatTime(track.progress) : "0:00"}
            </span>
            <div className="flex-1 mx-4 h-1 bg-aura-border rounded-full overflow-hidden">
              <div
                className="h-full bg-green-400 rounded-full transition-all duration-1000 ease-linear shadow-[0_0_10px_rgba(74,222,128,0.5)]"
                style={{
                  width: track
                    ? `${(track.progress / track.duration) * 100}%`
                    : "0%",
                }}
              />
            </div>
            <span className="text-[10px] text-aura-muted font-mono">
              {track ? formatTime(track.duration) : "0:00"}
            </span>
          </div>

          <div className="flex items-center justify-center space-x-6">
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleControl("previous");
              }}
              disabled={!track}
              className="p-2 text-aura-muted hover:text-aura-text transition-colors disabled:opacity-50"
            >
              <SkipBack className="w-5 h-5" strokeWidth={1.5} />
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleControl(track?.isPlaying ? "pause" : "play");
              }}
              disabled={!track}
              className="p-3 bg-aura-text text-aura-bg rounded-full hover:scale-105 transition-transform disabled:opacity-50 disabled:hover:scale-100 shadow-md"
            >
              {track?.isPlaying ? (
                <Pause className="w-5 h-5 fill-current" strokeWidth={1.5} />
              ) : (
                <Play className="w-5 h-5 fill-current" strokeWidth={1.5} />
              )}
            </button>
            <button
              onClick={(e) => {
                e.stopPropagation();
                handleControl("next");
              }}
              disabled={!track}
              className="p-2 text-aura-muted hover:text-aura-text transition-colors disabled:opacity-50"
            >
              <SkipForward className="w-5 h-5" strokeWidth={1.5} />
            </button>
          </div>
        </div>

        {/* Expand Icon */}
        <div className="absolute top-4 right-4 opacity-0 group-hover:opacity-100 transition-opacity pointer-events-none z-20">
          <div className="p-1.5 rounded-full bg-black/50 backdrop-blur-md text-white">
            <Maximize2 className="w-3 h-3" />
          </div>
        </div>
      </div>

      <SpotifyModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        token={token}
        track={track}
        handleControl={handleControl}
        formatTime={formatTime}
        deviceId={deviceId}
      />
    </>
  );
}
