import { Activity, Cpu, HardDrive, Wifi } from "lucide-react";
import { useState, useEffect } from "react";

export default function SystemStatsWidget() {
  const [stats, setStats] = useState({ cpu: 45, ram: 60, storage: 80, network: 120 });

  useEffect(() => {
    // Mocking real-time system stats
    const interval = setInterval(() => {
      setStats(prev => ({
        cpu: Math.min(100, Math.max(0, prev.cpu + (Math.random() * 10 - 5))),
        ram: Math.min(100, Math.max(0, prev.ram + (Math.random() * 4 - 2))),
        storage: prev.storage, // Storage doesn't fluctuate much
        network: Math.max(0, prev.network + (Math.random() * 50 - 25))
      }));
    }, 2000);
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full">
      <div className="flex items-center space-x-2 mb-6">
        <Activity className="w-5 h-5 text-aura-muted" />
        <span className="text-sm font-medium uppercase tracking-widest text-aura-muted">
          System Overview
        </span>
      </div>

      <div className="grid grid-cols-2 gap-4 flex-1">
        {/* CPU */}
        <div className="flex flex-col p-4 rounded-2xl bg-aura-bg border border-aura-border/50">
          <div className="flex items-center justify-between mb-2">
            <Cpu className="w-4 h-4 text-blue-400" />
            <span className="text-xs font-mono text-aura-muted">{Math.round(stats.cpu)}%</span>
          </div>
          <div className="w-full h-1.5 bg-aura-border rounded-full overflow-hidden mt-auto">
            <div 
              className="h-full bg-blue-400 transition-all duration-500" 
              style={{ width: `${stats.cpu}%` }} 
            />
          </div>
        </div>

        {/* RAM */}
        <div className="flex flex-col p-4 rounded-2xl bg-aura-bg border border-aura-border/50">
          <div className="flex items-center justify-between mb-2">
            <Activity className="w-4 h-4 text-green-400" />
            <span className="text-xs font-mono text-aura-muted">{Math.round(stats.ram)}%</span>
          </div>
          <div className="w-full h-1.5 bg-aura-border rounded-full overflow-hidden mt-auto">
            <div 
              className="h-full bg-green-400 transition-all duration-500" 
              style={{ width: `${stats.ram}%` }} 
            />
          </div>
        </div>

        {/* Storage */}
        <div className="flex flex-col p-4 rounded-2xl bg-aura-bg border border-aura-border/50">
          <div className="flex items-center justify-between mb-2">
            <HardDrive className="w-4 h-4 text-purple-400" />
            <span className="text-xs font-mono text-aura-muted">{Math.round(stats.storage)}%</span>
          </div>
          <div className="w-full h-1.5 bg-aura-border rounded-full overflow-hidden mt-auto">
            <div 
              className="h-full bg-purple-400 transition-all duration-500" 
              style={{ width: `${stats.storage}%` }} 
            />
          </div>
        </div>

        {/* Network */}
        <div className="flex flex-col p-4 rounded-2xl bg-aura-bg border border-aura-border/50">
          <div className="flex items-center justify-between mb-2">
            <Wifi className="w-4 h-4 text-orange-400" />
            <span className="text-xs font-mono text-aura-muted">{Math.round(stats.network)} Mbps</span>
          </div>
          <div className="w-full h-1.5 bg-aura-border rounded-full overflow-hidden mt-auto">
            <div 
              className="h-full bg-orange-400 transition-all duration-500" 
              style={{ width: `${Math.min(100, stats.network / 5)}%` }} 
            />
          </div>
        </div>
      </div>
    </div>
  );
}
