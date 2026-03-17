import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Sparkles, X, ScanSearch, Copy, Check } from 'lucide-react';

interface ScreenAnalysisOverlayProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function ScreenAnalysisOverlay({ isOpen, onClose }: ScreenAnalysisOverlayProps) {
  const [isScanning, setIsScanning] = useState(true);
  const [analysisResult, setAnalysisResult] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    if (isOpen) {
      setIsScanning(true);
      setAnalysisResult(null);
      setCopied(false);

      // Simulate scanning delay
      const timer = setTimeout(() => {
        setIsScanning(false);
        setAnalysisResult("I can see you are looking at your dashboard. You have a few upcoming meetings and your focus mode is currently active. Would you like me to summarize your next tasks?");
      }, 2500);

      return () => clearTimeout(timer);
    }
  }, [isOpen]);

  const handleCopy = () => {
    if (analysisResult) {
      navigator.clipboard.writeText(analysisResult);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[200] pointer-events-none flex items-center justify-center"
        >
          {/* Scanning Overlay */}
          {isScanning && (
            <>
              {/* Screen Edge Glow */}
              <motion.div 
                className="absolute inset-0 pointer-events-none z-50 overflow-hidden"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
              >
                <div className="absolute inset-0 border-[4px] border-transparent rounded-3xl" style={{
                  background: 'linear-gradient(black, black) padding-box, linear-gradient(90deg, #3b82f6, #8b5cf6, #ec4899, #3b82f6) border-box',
                  backgroundSize: '200% 100%',
                  animation: 'border-dance 3s linear infinite',
                  maskImage: 'linear-gradient(black, black)',
                  WebkitMaskImage: 'linear-gradient(black, black)',
                  maskComposite: 'exclude',
                  WebkitMaskComposite: 'xor',
                }} />
                <div className="absolute inset-0 shadow-[inset_0_0_100px_rgba(139,92,246,0.2)] rounded-3xl" />
              </motion.div>

              {/* Scanning Line */}
              <motion.div
                className="absolute top-0 left-0 right-0 h-32 bg-gradient-to-b from-transparent via-purple-500/20 to-transparent"
                initial={{ top: '-10%' }}
                animate={{ top: '110%' }}
                transition={{ duration: 2.5, repeat: Infinity, ease: "linear" }}
              >
                <div className="absolute top-1/2 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-purple-400 to-transparent shadow-[0_0_20px_rgba(168,85,247,0.8)]" />
              </motion.div>

              <div className="absolute inset-0 flex items-center justify-center z-50">
                <motion.div 
                  initial={{ scale: 0.9, opacity: 0 }}
                  animate={{ scale: 1, opacity: 1 }}
                  className="bg-black/40 backdrop-blur-xl px-8 py-4 rounded-full border border-white/20 flex items-center gap-4 text-white shadow-[0_0_40px_rgba(139,92,246,0.3)]"
                >
                  <Sparkles className="w-6 h-6 animate-pulse text-purple-400" />
                  <span className="font-medium tracking-tight text-lg">Analyzing your screen...</span>
                </motion.div>
              </div>
            </>
          )}

          {/* Result Modal */}
          {!isScanning && analysisResult && (
            <motion.div
              initial={{ opacity: 0, scale: 0.9, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.9, y: 20 }}
              className="pointer-events-auto w-full max-w-md bg-black/80 dark:bg-[#1c1c1e]/90 backdrop-blur-xl rounded-3xl border border-white/10 shadow-2xl overflow-hidden"
            >
              <div className="flex items-center justify-between px-5 py-4 border-b border-white/10 bg-white/5">
                <div className="flex items-center gap-2 text-white">
                  <Sparkles className="w-5 h-5 text-purple-400" />
                  <h3 className="font-semibold tracking-tight">Screen Analysis</h3>
                </div>
                <button 
                  onClick={onClose}
                  className="p-1.5 rounded-full hover:bg-white/10 text-white/70 hover:text-white transition-colors"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
              
              <div className="p-5">
                <p className="text-white/90 leading-relaxed text-sm">
                  {analysisResult}
                </p>
              </div>

              <div className="px-5 py-4 border-t border-white/10 bg-black/20 flex justify-end gap-2">
                <button 
                  onClick={handleCopy}
                  className="px-4 py-2 rounded-xl bg-white/10 hover:bg-white/20 text-white text-sm font-medium transition-colors flex items-center gap-2"
                >
                  {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
                  {copied ? 'Copied' : 'Copy'}
                </button>
                <button 
                  onClick={onClose}
                  className="px-4 py-2 rounded-xl bg-blue-500 hover:bg-blue-600 text-white text-sm font-medium transition-colors"
                >
                  Done
                </button>
              </div>
            </motion.div>
          )}
        </motion.div>
      )}
    </AnimatePresence>
  );
}
