import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Camera, AlertCircle, ChevronRight } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import Hls from "hls.js";

export default function SwipeWebcamScreen({ children }: { children: React.ReactNode }) {
  const { settings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const [hasError, setHasError] = useState(false);

  // Prevent body scroll when webcam is open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  useEffect(() => {
    let hls: Hls | null = null;
    setHasError(false);

    if (isOpen && settings.webcamUrl && videoRef.current) {
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
  }, [isOpen, settings.webcamUrl]);

  return (
    <div className="relative w-full min-h-screen bg-black overflow-x-hidden">
      {/* Main Dashboard Content */}
      <motion.div
        animate={{ x: isOpen ? "-100%" : 0 }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="w-full min-h-screen bg-aura-bg relative z-10"
      >
        {children}
        
        {/* Swipe Indicator / Button */}
        {!isOpen && settings.webcamUrl && (
          <button 
            onClick={() => setIsOpen(true)}
            className="fixed right-0 top-1/2 -translate-y-1/2 p-2 bg-black/20 hover:bg-black/40 backdrop-blur-md rounded-l-2xl border-y border-l border-white/10 text-white/50 hover:text-white transition-all flex flex-col items-center justify-center z-50 group shadow-lg"
          >
            <Camera className="w-4 h-4 mb-1 group-hover:scale-110 transition-transform" />
            <div className="text-[8px] font-semibold uppercase tracking-widest rotate-180" style={{ writingMode: 'vertical-rl' }}>Live Feed</div>
          </button>
        )}
      </motion.div>

      {/* Webcam Screen (Revealed when swiped left) */}
      <motion.div 
        animate={{ x: isOpen ? 0 : "100%" }}
        initial={{ x: "100%" }}
        transition={{ type: "spring", stiffness: 300, damping: 30 }}
        className="fixed inset-0 z-20 bg-black flex flex-col"
      >
        <div className="p-6 flex justify-between items-center bg-gradient-to-b from-black/80 to-transparent absolute top-0 w-full z-30">
          <div className="flex items-center gap-3">
            <div className="w-3 h-3 rounded-full bg-red-500 animate-pulse" />
            <span className="text-white font-medium tracking-widest uppercase text-sm">Live Feed</span>
          </div>
          <button 
            onClick={() => setIsOpen(false)}
            className="p-3 bg-white/10 hover:bg-white/20 rounded-full text-white backdrop-blur-md transition-colors flex items-center gap-2"
          >
            <ChevronRight className="w-5 h-5" />
            <span className="text-xs font-medium uppercase tracking-wider pr-1">Back</span>
          </button>
        </div>

        <div className="flex-1 flex items-center justify-center relative">
          {settings.webcamUrl ? (
            <>
              {settings.webcamUrl.endsWith('.m3u8') ? (
                 <video 
                   ref={videoRef}
                   className={`w-full h-full object-contain ${hasError ? 'hidden' : 'block'}`}
                   autoPlay 
                   muted 
                   playsInline
                 />
              ) : (
                <img 
                  src={settings.webcamUrl} 
                  alt="Live Webcam Fullscreen" 
                  className={`w-full h-full object-contain ${hasError ? 'hidden' : 'block'}`}
                  onError={() => setHasError(true)}
                />
              )}
              {hasError && (
                <div className="absolute inset-0 flex flex-col items-center justify-center text-red-500 p-8 text-center bg-black/80 rounded-3xl border border-red-500/30 backdrop-blur-md">
                  <AlertCircle className="w-12 h-12 mb-4 opacity-80" />
                  <p className="text-lg font-medium uppercase tracking-widest">Stream unavailable</p>
                  <p className="text-sm mt-2 opacity-70">Connection failed or stream is offline.</p>
                </div>
              )}
            </>
          ) : (
            <div className="flex flex-col items-center justify-center text-white/50 p-8 text-center bg-white/5 rounded-3xl border border-white/10 backdrop-blur-md">
              <AlertCircle className="w-12 h-12 mb-4 opacity-50" />
              <p className="text-lg font-medium">No camera configured</p>
              <p className="text-sm mt-2 opacity-70">Set your webcam URL in Settings to view the live feed here.</p>
            </div>
          )}
        </div>
      </motion.div>
    </div>
  );
}
