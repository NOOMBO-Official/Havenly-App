import { useState, useEffect } from "react";
import { Wifi, WifiOff, Activity, Cpu } from "lucide-react";

export default function SystemStatus() {
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [ping, setPing] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);
    window.addEventListener("online", handleOnline);
    window.addEventListener("offline", handleOffline);

    const checkPing = async () => {
      try {
        const start = performance.now();
        await fetch('/api/health');
        const end = performance.now();
        setPing(Math.round(end - start));
      } catch (e) {
        setPing(0);
      }
    };

    checkPing();
    const interval = setInterval(checkPing, 10000);

    return () => {
      window.removeEventListener("online", handleOnline);
      window.removeEventListener("offline", handleOffline);
      clearInterval(interval);
    };
  }, []);

  return (
    <footer className="pt-12 border-t border-white/10 flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/50 uppercase tracking-widest font-medium">
      <div className="flex items-center space-x-6">
        <span>Havenly OS v1.1.0</span>
        <div className="flex items-center space-x-2">
          {isOnline ? (
            <Wifi className="w-3 h-3 text-emerald-400" />
          ) : (
            <WifiOff className="w-3 h-3 text-rose-400" />
          )}
          <span>{isOnline ? "Online" : "Offline"}</span>
        </div>
      </div>

      <div className="flex items-center space-x-6">
        <div className="flex items-center space-x-2">
          <Activity className="w-3 h-3" />
          <span>API: {ping}ms</span>
        </div>
        <div className="flex items-center space-x-2">
          <Cpu className="w-3 h-3" />
          <span>System Nominal</span>
        </div>
      </div>
    </footer>
  );
}
