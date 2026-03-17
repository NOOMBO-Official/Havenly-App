import { useState, useEffect, useCallback } from 'react';

export function useSpotifyPlayer() {
  const [player, setPlayer] = useState<any>(null);
  const [isReady, setIsReady] = useState(false);
  const [currentTrack, setCurrentTrack] = useState<any>(null);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [deviceId, setDeviceId] = useState<string | null>(null);

  useEffect(() => {
    const script = document.createElement('script');
    script.src = 'https://sdk.scdn.co/spotify-player.js';
    script.async = true;
    document.body.appendChild(script);

    (window as any).onSpotifyWebPlaybackSDKReady = () => {
      fetch('/api/spotify/token')
        .then(res => res.json())
        .then(data => {
          if (!data.access_token) return;

          const spotifyPlayer = new (window as any).Spotify.Player({
            name: 'Havenly Dashboard',
            getOAuthToken: (cb: (token: string) => void) => { cb(data.access_token); },
            volume: 0.5
          });

          spotifyPlayer.addListener('ready', ({ device_id }: { device_id: string }) => {
            console.log('Ready with Device ID', device_id);
            setDeviceId(device_id);
            setIsReady(true);
            
            // Transfer playback to this device
            fetch('https://api.spotify.com/v1/me/player', {
              method: 'PUT',
              headers: {
                'Authorization': `Bearer ${data.access_token}`,
                'Content-Type': 'application/json',
              },
              body: JSON.stringify({
                device_ids: [device_id],
                play: false,
              }),
            });
          });

          spotifyPlayer.addListener('not_ready', ({ device_id }: { device_id: string }) => {
            console.log('Device ID has gone offline', device_id);
            setIsReady(false);
          });

          spotifyPlayer.addListener('player_state_changed', (state: any) => {
            if (!state) return;
            setCurrentTrack(state.track_window.current_track);
            setIsPlaying(!state.paused);
            setProgress(state.position);
          });

          spotifyPlayer.connect();
          setPlayer(spotifyPlayer);
        })
        .catch(console.error);
    };

    return () => {
      if (player) player.disconnect();
    };
  }, []);

  const togglePlay = useCallback(() => {
    if (player) player.togglePlay();
  }, [player]);

  const nextTrack = useCallback(() => {
    if (player) player.nextTrack();
  }, [player]);

  const previousTrack = useCallback(() => {
    if (player) player.previousTrack();
  }, [player]);

  const setVolume = useCallback((volume: number) => {
    if (player) player.setVolume(volume);
  }, [player]);

  return {
    isReady,
    currentTrack,
    isPlaying,
    progress,
    togglePlay,
    nextTrack,
    previousTrack,
    setVolume,
    deviceId
  };
}
