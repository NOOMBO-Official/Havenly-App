import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import { useSettings } from './SettingsContext';

interface SpotifyContextType {
  token: string | null;
  player: any | null;
  deviceId: string | null;
  isPaused: boolean;
  isActive: boolean;
  currentTrack: any | null;
  login: () => void;
  logout: () => void;
  play: (uri?: string) => Promise<void>;
  pause: () => Promise<void>;
  next: () => Promise<void>;
  previous: () => Promise<void>;
  setVolume: (volume: number) => Promise<void>;
}

const SpotifyContext = createContext<SpotifyContextType | undefined>(undefined);

const CLIENT_ID = import.meta.env.VITE_SPOTIFY_CLIENT_ID || '';
const REDIRECT_URI = window.location.origin + '/spotify-callback';
const SCOPES = [
  'streaming',
  'user-read-email',
  'user-read-private',
  'user-library-read',
  'user-library-modify',
  'user-read-playback-state',
  'user-modify-playback-state',
  'user-read-currently-playing'
];

export function SpotifyProvider({ children }: { children: ReactNode }) {
  const [token, setToken] = useState<string | null>(null);
  const [player, setPlayer] = useState<any | null>(null);
  const [deviceId, setDeviceId] = useState<string | null>(null);
  const [isPaused, setIsPaused] = useState(true);
  const [isActive, setIsActive] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any | null>(null);
  const { settings, updateSettings } = useSettings();

  useEffect(() => {
    // Check for token in URL hash (implicit grant flow)
    const hash = window.location.hash;
    let _token = window.localStorage.getItem('spotify_token');

    if (!_token && hash) {
      const tokenMatch = hash.match(/#access_token=([^&]*)/);
      if (tokenMatch) {
        _token = tokenMatch[1];
        window.localStorage.setItem('spotify_token', _token);
        window.location.hash = '';
        updateSettings({ integrations: { ...settings.integrations, spotify: true } });
      }
    }

    if (_token && settings.integrations.spotify) {
      setToken(_token);
    } else if (!settings.integrations.spotify) {
      setToken(null);
      window.localStorage.removeItem('spotify_token');
    }
  }, [settings.integrations.spotify]);

  useEffect(() => {
    if (!token) return;

    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    window.onSpotifyWebPlaybackSDKReady = () => {
      const _player = new window.Spotify.Player({
        name: 'Havenly Dashboard',
        getOAuthToken: (cb: (token: string) => void) => { cb(token); },
        volume: 0.5
      });

      setPlayer(_player);

      _player.addListener('ready', ({ device_id }: { device_id: string }) => {
        console.log('Ready with Device ID', device_id);
        setDeviceId(device_id);
      });

      _player.addListener('not_ready', ({ device_id }: { device_id: string }) => {
        console.log('Device ID has gone offline', device_id);
      });

      _player.addListener('player_state_changed', (state: any) => {
        if (!state) return;
        setCurrentTrack(state.track_window.current_track);
        setIsPaused(state.paused);
        
        _player.getCurrentState().then((state: any) => {
          (!state) ? setIsActive(false) : setIsActive(true);
        });
      });

      _player.connect();
    };

    return () => {
      if (player) player.disconnect();
    };
  }, [token]);

  const login = () => {
    if (!CLIENT_ID) {
      alert('Please set VITE_SPOTIFY_CLIENT_ID in your environment variables.');
      return;
    }
    const authUrl = `https://accounts.spotify.com/authorize?client_id=${CLIENT_ID}&response_type=token&redirect_uri=${encodeURIComponent(REDIRECT_URI)}&scope=${encodeURIComponent(SCOPES.join(' '))}`;
    window.location.href = authUrl;
  };

  const logout = () => {
    setToken(null);
    window.localStorage.removeItem('spotify_token');
    if (player) player.disconnect();
    updateSettings({ integrations: { ...settings.integrations, spotify: false } });
  };

  const play = async (uri?: string) => {
    if (!token || !deviceId) return;
    const body = uri ? JSON.stringify({ uris: [uri] }) : undefined;
    await fetch(`https://api.spotify.com/v1/me/player/play?device_id=${deviceId}`, {
      method: 'PUT',
      body,
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${token}`
      },
    });
  };

  const pause = async () => {
    if (!player) return;
    await player.pause();
  };

  const next = async () => {
    if (!player) return;
    await player.nextTrack();
  };

  const previous = async () => {
    if (!player) return;
    await player.previousTrack();
  };

  const setVolume = async (volume: number) => {
    if (!player) return;
    await player.setVolume(volume);
  };

  return (
    <SpotifyContext.Provider value={{ token, player, deviceId, isPaused, isActive, currentTrack, login, logout, play, pause, next, previous, setVolume }}>
      {children}
    </SpotifyContext.Provider>
  );
}

export function useSpotify() {
  const context = useContext(SpotifyContext);
  if (context === undefined) {
    throw new Error('useSpotify must be used within a SpotifyProvider');
  }
  return context;
}

declare global {
  interface Window {
    onSpotifyWebPlaybackSDKReady: () => void;
    Spotify: any;
  }
}
