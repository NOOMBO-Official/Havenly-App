import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Camera, Video, Image as ImageIcon, Maximize, RefreshCcw, Zap, Aperture } from 'lucide-react';

interface CameraModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CameraModal({ isOpen, onClose }: CameraModalProps) {
  const [mode, setMode] = useState<'photo' | 'video' | 'portrait'>('photo');
  const [isRecording, setIsRecording] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (isOpen && videoRef.current) {
      navigator.mediaDevices.getUserMedia({ video: true })
        .then(stream => {
          if (videoRef.current) {
            videoRef.current.srcObject = stream;
          }
        })
        .catch(err => console.error("Error accessing camera:", err));
    }

    return () => {
      if (videoRef.current && videoRef.current.srcObject) {
        const stream = videoRef.current.srcObject as MediaStream;
        stream.getTracks().forEach(track => track.stop());
      }
    };
  }, [isOpen]);

  const handleCapture = () => {
    if (mode === 'video') {
      setIsRecording(!isRecording);
    } else {
      // Simulate photo capture flash
      const flash = document.createElement('div');
      flash.className = 'absolute inset-0 bg-white z-50 animate-ping opacity-0';
      document.body.appendChild(flash);
      setTimeout(() => flash.remove(), 500);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/90 backdrop-blur-xl z-[100]"
          />
          <div className="fixed inset-0 z-[110] flex items-center justify-center pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.95 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full h-full md:w-[400px] md:h-[800px] md:rounded-[48px] overflow-hidden pointer-events-auto flex flex-col relative bg-black"
            >
              {/* Top Controls */}
              <div className="absolute top-0 left-0 right-0 p-6 flex justify-between items-center z-20 bg-gradient-to-b from-black/50 to-transparent">
                <button className="p-2 text-white/70 hover:text-white transition-colors">
                  <Zap className="w-6 h-6" />
                </button>
                <button className="p-2 text-white/70 hover:text-white transition-colors">
                  <Aperture className="w-6 h-6" />
                </button>
                <button onClick={onClose} className="p-2 text-white/70 hover:text-white transition-colors">
                  <X className="w-6 h-6" />
                </button>
              </div>

              {/* Viewfinder */}
              <div className="flex-1 relative bg-zinc-900 flex items-center justify-center overflow-hidden">
                <video 
                  ref={videoRef}
                  autoPlay 
                  playsInline 
                  muted 
                  className="absolute inset-0 w-full h-full object-cover"
                />
                
                {/* Grid Overlay */}
                <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none opacity-20">
                  <div className="border-r border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-r border-b border-white"></div>
                  <div className="border-b border-white"></div>
                  <div className="border-r border-white"></div>
                  <div className="border-r border-white"></div>
                  <div></div>
                </div>

                {/* Focus Square (Mock) */}
                <div className="absolute w-24 h-24 border border-yellow-400 opacity-50 pointer-events-none flex items-center justify-center">
                  <div className="w-2 h-2 bg-yellow-400 rounded-full"></div>
                </div>
              </div>

              {/* Bottom Controls */}
              <div className="h-auto min-h-[12rem] bg-black flex flex-col items-center justify-center pb-24 md:pb-8 pt-4 z-20">
                {/* Mode Selector */}
                <div className="flex gap-6 mb-6 overflow-x-auto px-4 w-full justify-center no-scrollbar">
                  {['video', 'photo', 'portrait'].map((m) => (
                    <button 
                      key={m}
                      onClick={() => setMode(m as any)}
                      className={`text-sm font-medium uppercase tracking-wider transition-colors ${mode === m ? 'text-yellow-400' : 'text-white/50'}`}
                    >
                      {m}
                    </button>
                  ))}
                </div>

                {/* Shutter Area */}
                <div className="flex items-center justify-between w-full px-12">
                  <button className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center overflow-hidden">
                    <img src="https://picsum.photos/seed/gallery/100/100" alt="Gallery" className="w-full h-full object-cover opacity-50" />
                  </button>

                  <button 
                    onClick={handleCapture}
                    className={`w-20 h-20 rounded-full border-4 border-white flex items-center justify-center p-1 transition-all ${isRecording ? 'scale-90' : 'scale-100'}`}
                  >
                    <div className={`w-full h-full rounded-full transition-all ${mode === 'video' ? 'bg-red-500' : 'bg-white'} ${isRecording ? 'rounded-md scale-50' : ''}`} />
                  </button>

                  <button className="w-12 h-12 rounded-full bg-zinc-800 flex items-center justify-center text-white/70 hover:text-white transition-colors">
                    <RefreshCcw className="w-6 h-6" />
                  </button>
                </div>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
