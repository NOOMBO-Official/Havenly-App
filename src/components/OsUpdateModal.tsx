import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Download, CheckCircle, RefreshCcw, X, Server, ShieldCheck, Cpu, Terminal } from "lucide-react";

interface OsUpdateModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function OsUpdateModal({ isOpen, onClose }: OsUpdateModalProps) {
  const [updateState, setUpdateState] = useState<"checking" | "available" | "downloading" | "installing" | "complete">("checking");
  const [progress, setProgress] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);

  const addLog = (msg: string) => {
    setLogs(prev => [...prev, `[${new Date().toISOString().split('T')[1].split('.')[0]}] ${msg}`]);
  };

  useEffect(() => {
    if (!isOpen) {
      setUpdateState("checking");
      setProgress(0);
      setLogs([]);
      return;
    }

    let timeout: NodeJS.Timeout;
    
    if (updateState === "checking") {
      addLog("Initializing WebRTC peer connection...");
      timeout = setTimeout(() => {
        addLog("Gathering ICE candidates...");
        setTimeout(() => {
          addLog("Connected to update server via WebRTC DataChannel.");
          addLog("Checking for OS updates...");
          setTimeout(() => {
            setUpdateState("available");
            addLog("Update found: HavenOS v2.4.1-stable");
          }, 1500);
        }, 1000);
      }, 1000);
    }

    return () => clearTimeout(timeout);
  }, [isOpen, updateState]);

  const startUpdate = () => {
    setUpdateState("downloading");
    addLog("Requesting update chunks via WebRTC...");
    
    let currentProgress = 0;
    const interval = setInterval(() => {
      currentProgress += Math.random() * 5;
      if (currentProgress >= 100) {
        currentProgress = 100;
        clearInterval(interval);
        setUpdateState("installing");
        addLog("Download complete. Verifying checksums...");
        
        setTimeout(() => {
          addLog("Checksums verified. Applying update...");
          let installProgress = 0;
          const installInterval = setInterval(() => {
            installProgress += Math.random() * 10;
            setProgress(installProgress);
            if (installProgress >= 100) {
              clearInterval(installInterval);
              setUpdateState("complete");
              addLog("Update applied successfully. System is up to date.");
            }
          }, 500);
        }, 2000);
      }
      setProgress(currentProgress);
      if (currentProgress < 100 && Math.random() > 0.7) {
        addLog(`Received chunk ${Math.floor(currentProgress * 1024)} / 102400 KB`);
      }
    }, 200);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <div className="fixed inset-0 z-[200] flex items-center justify-center p-4">
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="absolute inset-0 bg-black/80 backdrop-blur-xl"
            onClick={onClose}
          />
          <motion.div
            initial={{ scale: 0.9, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 20 }}
            className="w-full max-w-2xl bg-aura-card border border-aura-border rounded-3xl shadow-2xl relative overflow-hidden flex flex-col"
          >
            {/* Header */}
            <div className="p-6 border-b border-aura-border flex justify-between items-center bg-black/20">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                  <RefreshCcw className="w-5 h-5" />
                </div>
                <div>
                  <h2 className="text-xl font-display text-aura-text">System Update</h2>
                  <p className="text-xs text-aura-muted">WebRTC OTA Distribution</p>
                </div>
              </div>
              <button 
                onClick={onClose}
                className="p-2 hover:bg-white/10 rounded-full transition-colors text-aura-muted hover:text-aura-text"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Content */}
            <div className="p-8 flex flex-col items-center justify-center min-h-[300px] relative">
              {updateState === "checking" && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <RefreshCcw className="w-12 h-12 text-blue-400 animate-spin" />
                  <h3 className="text-lg font-medium text-aura-text">Checking for updates...</h3>
                  <p className="text-aura-muted max-w-sm">Establishing secure WebRTC connection to distribution nodes.</p>
                </div>
              )}

              {updateState === "available" && (
                <div className="flex flex-col items-center text-center space-y-6 w-full">
                  <div className="w-20 h-20 rounded-full bg-blue-500/20 border border-blue-500/30 flex items-center justify-center">
                    <Download className="w-10 h-10 text-blue-400" />
                  </div>
                  <div>
                    <h3 className="text-2xl font-display text-aura-text mb-2">HavenOS v2.4.1-stable</h3>
                    <p className="text-aura-muted max-w-md mx-auto">
                      A new system update is available. This update includes performance improvements, security patches, and new WebRTC capabilities.
                    </p>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-4 w-full max-w-md text-left">
                    <div className="p-4 rounded-2xl bg-black/20 border border-aura-border/50">
                      <ShieldCheck className="w-5 h-5 text-green-400 mb-2" />
                      <span className="block text-sm font-medium text-aura-text">Security</span>
                      <span className="text-xs text-aura-muted">Latest patches applied</span>
                    </div>
                    <div className="p-4 rounded-2xl bg-black/20 border border-aura-border/50">
                      <Cpu className="w-5 h-5 text-purple-400 mb-2" />
                      <span className="block text-sm font-medium text-aura-text">Performance</span>
                      <span className="text-xs text-aura-muted">+15% efficiency</span>
                    </div>
                  </div>

                  <button 
                    onClick={startUpdate}
                    className="px-8 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-xl font-medium transition-colors shadow-lg shadow-blue-500/20"
                  >
                    Download & Install
                  </button>
                </div>
              )}

              {(updateState === "downloading" || updateState === "installing") && (
                <div className="flex flex-col items-center text-center w-full max-w-md space-y-6">
                  <div className="relative w-24 h-24 flex items-center justify-center">
                    <svg className="w-full h-full transform -rotate-90">
                      <circle cx="48" cy="48" r="45" className="stroke-current text-aura-border" strokeWidth="4" fill="none" />
                      <circle 
                        cx="48" cy="48" r="45" 
                        className="stroke-current text-blue-500 transition-all duration-300 ease-out" 
                        strokeWidth="4" fill="none" 
                        strokeDasharray="283" 
                        strokeDashoffset={283 - (283 * progress) / 100} 
                      />
                    </svg>
                    <span className="absolute text-xl font-mono text-aura-text">{Math.round(progress)}%</span>
                  </div>
                  
                  <div>
                    <h3 className="text-lg font-medium text-aura-text mb-1">
                      {updateState === "downloading" ? "Downloading Update..." : "Installing Update..."}
                    </h3>
                    <p className="text-sm text-aura-muted">
                      {updateState === "downloading" ? "Receiving chunks via WebRTC DataChannel" : "Applying system patches"}
                    </p>
                  </div>
                </div>
              )}

              {updateState === "complete" && (
                <div className="flex flex-col items-center text-center space-y-4">
                  <div className="w-20 h-20 rounded-full bg-green-500/20 border border-green-500/30 flex items-center justify-center">
                    <CheckCircle className="w-10 h-10 text-green-400" />
                  </div>
                  <h3 className="text-2xl font-display text-aura-text">System Up to Date</h3>
                  <p className="text-aura-muted max-w-sm">HavenOS v2.4.1-stable has been successfully installed.</p>
                  <button 
                    onClick={onClose}
                    className="mt-4 px-8 py-3 bg-white/10 hover:bg-white/20 text-white rounded-xl font-medium transition-colors"
                  >
                    Close
                  </button>
                </div>
              )}
            </div>

            {/* Terminal Logs */}
            <div className="h-48 bg-black/50 border-t border-aura-border p-4 font-mono text-xs overflow-y-auto custom-scrollbar flex flex-col">
              <div className="flex items-center gap-2 text-aura-muted mb-2 sticky top-0 bg-black/50 backdrop-blur-md py-1">
                <Terminal className="w-4 h-4" />
                <span>WebRTC Update Log</span>
              </div>
              <div className="space-y-1 mt-2">
                {logs.map((log, i) => (
                  <div key={i} className="text-green-400/80">{log}</div>
                ))}
                <div ref={(el) => el?.scrollIntoView()} />
              </div>
            </div>
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );
}
