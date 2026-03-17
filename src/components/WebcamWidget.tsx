import { Camera, AlertCircle } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useEffect, useRef, useState } from "react";
import Hls from "hls.js";

export default function WebcamWidget() {
  const { settings } = useSettings();
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  useEffect(() => {
    let hls: Hls | null = null;
    setHasError(false);

    if (settings.webcamUrl && videoRef.current) {
      if (Hls.isSupported() && settings.webcamUrl.endsWith('.m3u8')) {
        hls = new Hls();
        hls.loadSource(settings.webcamUrl);
        hls.attachMedia(videoRef.current);
        hls.on(Hls.Events.MANIFEST_PARSED, () => {
          videoRef.current?.play().catch(e => console.error("Auto-play prevented", e));
        });
        hls.on(Hls.Events.ERROR, (event, data) => {
          if (data.fatal) {
            setHasError(true);
          }
        });
      } else if (videoRef.current.canPlayType('application/vnd.apple.mpegurl')) {
        // Native HLS support (Safari)
        videoRef.current.src = settings.webcamUrl;
        videoRef.current.addEventListener('loadedmetadata', () => {
          videoRef.current?.play().catch(e => console.error("Auto-play prevented", e));
        });
        videoRef.current.addEventListener('error', () => {
          setHasError(true);
        });
      }
    }

    return () => {
      if (hls) {
        hls.destroy();
      }
    };
  }, [settings.webcamUrl]);

  return (
    <div className="flex flex-col p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full relative overflow-hidden group">
      <div className="flex justify-between items-start mb-4 relative z-10">
        <span className="text-xs font-medium uppercase tracking-widest text-aura-muted flex items-center gap-2">
          <Camera className="w-3 h-3 text-emerald-400" />
          Live Camera
        </span>
        <div className="flex items-center gap-2">
          <div className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
          <span className="text-[10px] text-aura-muted uppercase tracking-wider">Live</span>
        </div>
      </div>

      <div className="flex-1 relative rounded-xl overflow-hidden bg-black/50 border border-white/5 flex items-center justify-center">
        {settings.webcamUrl ? (
          <>
            {settings.webcamUrl.endsWith('.m3u8') ? (
               <video 
                 ref={videoRef}
                 className={`w-full h-full object-cover ${hasError ? 'hidden' : 'block'}`}
                 autoPlay 
                 muted 
                 playsInline
               />
            ) : (
              <img 
                src={settings.webcamUrl} 
                alt="Live Webcam" 
                className={`w-full h-full object-cover ${hasError ? 'hidden' : 'block'}`}
                onError={() => setHasError(true)}
              />
            )}
            {hasError && (
              <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-4 text-center bg-black/80">
                <AlertCircle className="w-8 h-8 mb-2 opacity-80" />
                <p className="text-xs uppercase tracking-widest">Stream unavailable</p>
              </div>
            )}
          </>
        ) : (
          <div className="flex flex-col items-center justify-center text-aura-muted p-4 text-center">
            <AlertCircle className="w-8 h-8 mb-2 opacity-50" />
            <p className="text-xs">No camera configured.</p>
            <p className="text-[10px] mt-1 opacity-70">Set URL in Settings.</p>
          </div>
        )}
      </div>
    </div>
  );
}
