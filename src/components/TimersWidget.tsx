import { useState } from "react";
import { useSettings } from "../contexts/SettingsContext";
import { Timer, Play, Pause, RotateCcw, Plus, Trash2, X, Bell, Clock, Activity } from "lucide-react";
import { useTimers } from "../contexts/TimersContext";
import { motion, AnimatePresence } from "framer-motion";

export default function TimersWidget() {
  const { timers, addTimer, removeTimer, toggleTimer, resetTimer } = useTimers();
  const [newTimerMin, setNewTimerMin] = useState("5");
  const { settings } = useSettings();
  const [isExpanded, setIsExpanded] = useState(false);

  const handleAddTimer = (e: React.FormEvent) => {
    e.preventDefault();
    const mins = parseInt(newTimerMin);
    if (isNaN(mins) || mins <= 0) return;
    
    addTimer({
      duration: mins * 60,
      remaining: mins * 60,
      isRunning: false,
      label: `${mins} Min Timer`,
      type: 'timer'
    });
    setNewTimerMin("");
  };

  const formatTime = (seconds: number) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const formatTimeLarge = (seconds: number) => {
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    const s = seconds % 60;
    
    if (h > 0) {
      return `${h.toString().padStart(2, '0')}:${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
    }
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  return (
    <>
      <motion.div 
        layoutId="timers-widget"
        className="flex flex-col p-5 rounded-[32px] apple-glass-heavy h-full relative overflow-hidden group cursor-pointer"
        onClick={(e) => {
          // Prevent expansion if clicking on buttons or inputs
          if ((e.target as HTMLElement).closest('button') || (e.target as HTMLElement).closest('input')) return;
          if (settings.tapToExpand) setIsExpanded(true);
        }}
      >
        {/* Quick Action Overlay */}
        {settings.tapToExpand && (
          <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 z-30 flex items-center justify-center pointer-events-none">
            <span className="text-white font-medium bg-white/10 px-4 py-2 rounded-full backdrop-blur-md border border-white/20">
              Tap to Expand
            </span>
          </div>
        )}

        <div className="flex justify-between items-start mb-4 relative z-10">
          <div className="flex items-center gap-2 text-orange-500">
            <Timer className="w-5 h-5" />
            <h2 className="text-lg font-semibold text-aura-text tracking-tight">Timers</h2>
          </div>
        </div>

        <div className="flex-1 flex flex-col relative z-10 overflow-hidden">
          <div className="flex-1 overflow-y-auto custom-scrollbar space-y-2.5 pr-1">
            {timers.map(timer => (
              <div key={timer.id} className="flex flex-col p-3.5 apple-btn rounded-[20px] relative overflow-hidden">
                <div 
                  className="absolute bottom-0 left-0 h-1 bg-orange-500/50 transition-all duration-1000 linear"
                  style={{ width: `${(timer.remaining / timer.duration) * 100}%` }}
                />
                <div className="flex justify-between items-center mb-2">
                  <span className="text-[13px] font-semibold text-aura-text truncate mr-2">{timer.label}</span>
                  <span className={`text-xl font-mono font-medium tracking-tight ${timer.remaining === 0 ? 'text-red-400 animate-pulse' : 'text-aura-text'}`}>
                    {formatTime(timer.remaining)}
                  </span>
                </div>
                <div className="flex gap-1.5 justify-end relative z-10">
                  <button 
                    onClick={() => toggleTimer(timer.id)}
                    className={`p-1.5 rounded-full transition-colors ${timer.isRunning ? 'bg-orange-500 text-white shadow-sm' : 'bg-black/10 dark:bg-white/10 text-aura-text hover:bg-black/20 dark:hover:bg-white/20'}`}
                  >
                    {timer.isRunning ? <Pause className="w-3.5 h-3.5" /> : <Play className="w-3.5 h-3.5 ml-0.5" />}
                  </button>
                  <button 
                    onClick={() => resetTimer(timer.id)}
                    className="p-1.5 bg-black/10 dark:bg-white/10 text-aura-text rounded-full hover:bg-black/20 dark:hover:bg-white/20 transition-colors"
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                  </button>
                  <button 
                    onClick={() => removeTimer(timer.id)}
                    className="p-1.5 bg-red-500/10 text-red-500 rounded-full hover:bg-red-500/20 transition-colors ml-auto"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                  </button>
                </div>
              </div>
            ))}
            {timers.length === 0 && (
              <div className="text-center text-aura-muted text-[13px] mt-4 font-medium">No timers set.</div>
            )}
          </div>
          
          <form onSubmit={handleAddTimer} className="mt-3 flex gap-2 relative z-10">
            <input
              type="number"
              value={newTimerMin}
              onChange={(e) => setNewTimerMin(e.target.value)}
              placeholder="Min"
              className="flex-1 bg-black/5 dark:bg-white/5 border border-black/10 dark:border-white/10 rounded-full px-4 py-2 text-[13px] font-medium text-aura-text focus:outline-none focus:border-orange-500/50 focus:ring-1 focus:ring-orange-500/50 transition-all"
              min="1"
            />
            <button 
              type="submit"
              className="p-2 bg-orange-500 text-white rounded-full hover:bg-orange-600 transition-colors shadow-sm"
            >
              <Plus className="w-4 h-4" />
            </button>
          </form>
        </div>
      </motion.div>

      <AnimatePresence>
        {isExpanded && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 md:p-12">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="absolute inset-0 bg-black/60 backdrop-blur-xl"
              onClick={() => setIsExpanded(false)}
            />
            <motion.div
              layoutId="timers-widget"
              className="w-full max-w-4xl h-full max-h-[800px] rounded-[3rem] border border-white/10 dark:border-white/5 bg-black/5 dark:bg-white/5 backdrop-blur-3xl relative overflow-hidden shadow-2xl flex flex-col"
            >
              <div className="p-8 flex justify-between items-center border-b border-white/10 dark:border-white/5">
                <div className="flex items-center gap-4">
                  <div className="p-4 rounded-2xl bg-orange-500/20 border border-orange-500/30 text-orange-500">
                    <Timer className="w-8 h-8" />
                  </div>
                  <div>
                    <h2 className="text-3xl font-semibold tracking-tight text-aura-text">Time Management</h2>
                    <p className="text-aura-muted font-medium">Timers, Alarms, and Stopwatches</p>
                  </div>
                </div>
                <button 
                  onClick={() => setIsExpanded(false)}
                  className="p-4 bg-black/5 dark:bg-white/5 hover:bg-black/10 dark:hover:bg-white/10 rounded-full text-aura-text transition-colors"
                >
                  <X className="w-6 h-6" />
                </button>
              </div>

              <div className="flex-1 p-8 overflow-y-auto grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* Active Timers */}
                <div className="space-y-6">
                  <h3 className="text-xl font-semibold tracking-tight text-aura-text flex items-center gap-2">
                    <Clock className="w-5 h-5 text-orange-500" /> Active Timers
                  </h3>
                  
                  <div className="space-y-4">
                    {timers.map(timer => (
                      <div key={timer.id} className="p-6 rounded-3xl apple-glass-heavy border border-white/10 dark:border-white/5 relative overflow-hidden">
                        <div 
                          className="absolute bottom-0 left-0 h-1 bg-orange-500/50 transition-all duration-1000 linear"
                          style={{ width: `${(timer.remaining / timer.duration) * 100}%` }}
                        />
                        <div className="flex justify-between items-start mb-4">
                          <div>
                            <h4 className="text-lg font-medium text-aura-text">{timer.label}</h4>
                            <span className="text-sm font-medium text-aura-muted">Original: {formatTime(timer.duration)}</span>
                          </div>
                          <span className={`text-4xl font-mono font-light tracking-tighter ${timer.remaining === 0 ? 'text-red-500 animate-pulse' : 'text-aura-text'}`}>
                            {formatTimeLarge(timer.remaining)}
                          </span>
                        </div>
                        
                        <div className="flex gap-3 mt-6">
                          <button 
                            onClick={() => toggleTimer(timer.id)}
                            className={`flex-1 flex items-center justify-center gap-2 py-3 rounded-xl font-medium transition-colors ${timer.isRunning ? 'bg-orange-500/20 text-orange-500' : 'bg-black/5 dark:bg-white/5 text-aura-text hover:bg-black/10 dark:hover:bg-white/10'}`}
                          >
                            {timer.isRunning ? <><Pause className="w-5 h-5" /> Pause</> : <><Play className="w-5 h-5" /> Start</>}
                          </button>
                          <button 
                            onClick={() => resetTimer(timer.id)}
                            className="p-3 bg-black/5 dark:bg-white/5 text-aura-text rounded-xl hover:bg-black/10 dark:hover:bg-white/10 transition-colors"
                          >
                            <RotateCcw className="w-5 h-5" />
                          </button>
                          <button 
                            onClick={() => removeTimer(timer.id)}
                            className="p-3 bg-red-500/10 text-red-500 rounded-xl hover:bg-red-500/20 transition-colors"
                          >
                            <Trash2 className="w-5 h-5" />
                          </button>
                        </div>
                      </div>
                    ))}
                    
                    {timers.length === 0 && (
                      <div className="p-12 rounded-3xl border border-dashed border-white/10 dark:border-white/5 flex flex-col items-center justify-center text-center">
                        <Timer className="w-12 h-12 text-aura-muted mb-4 opacity-50" />
                        <p className="text-aura-text font-medium">No active timers</p>
                        <p className="text-aura-muted text-sm mt-1 font-medium">Create one to get started</p>
                      </div>
                    )}
                  </div>
                </div>

                {/* Create New & Presets */}
                <div className="space-y-8">
                  <div className="p-6 rounded-3xl apple-glass-heavy border border-white/10 dark:border-white/5">
                    <h3 className="text-lg font-semibold tracking-tight text-aura-text mb-4">Create Custom Timer</h3>
                    <form onSubmit={handleAddTimer} className="flex gap-3">
                      <div className="flex-1 relative">
                        <input
                          type="number"
                          value={newTimerMin}
                          onChange={(e) => setNewTimerMin(e.target.value)}
                          placeholder="Minutes"
                          className="w-full bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 rounded-xl pl-4 pr-12 py-3 text-lg font-medium text-aura-text focus:outline-none focus:border-orange-500/50"
                          min="1"
                        />
                        <span className="absolute right-4 top-1/2 -translate-y-1/2 text-aura-muted font-medium">min</span>
                      </div>
                      <button 
                        type="submit"
                        className="px-6 bg-orange-500 text-white rounded-xl hover:bg-orange-600 transition-colors font-medium flex items-center gap-2 shadow-sm"
                      >
                        <Plus className="w-5 h-5" /> Add
                      </button>
                    </form>
                  </div>

                  <div>
                    <h3 className="text-lg font-semibold tracking-tight text-aura-text mb-4">Quick Presets</h3>
                    <div className="grid grid-cols-2 gap-4">
                      {[
                        { label: 'Pomodoro', mins: 25, icon: Timer },
                        { label: 'Short Break', mins: 5, icon: Clock },
                        { label: 'Long Break', mins: 15, icon: Clock },
                        { label: 'Tea Steeping', mins: 3, icon: Bell },
                        { label: 'Laundry', mins: 45, icon: Bell },
                        { label: 'Workout', mins: 60, icon: Activity },
                      ].map((preset) => (
                        <button
                          key={preset.label}
                          onClick={() => {
                            addTimer({
                              duration: preset.mins * 60,
                              remaining: preset.mins * 60,
                              isRunning: false,
                              label: preset.label,
                              type: 'timer'
                            });
                          }}
                          className="p-4 rounded-2xl bg-black/5 dark:bg-white/5 border border-white/10 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10 transition-colors flex items-center gap-3 text-left"
                        >
                          <div className="p-2 bg-orange-500/20 text-orange-500 rounded-lg">
                            <preset.icon className="w-5 h-5" />
                          </div>
                          <div>
                            <span className="block text-aura-text font-medium">{preset.label}</span>
                            <span className="block text-aura-muted text-sm font-medium">{preset.mins} min</span>
                          </div>
                        </button>
                      ))}
                    </div>
                  </div>
                </div>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </>
  );
}
