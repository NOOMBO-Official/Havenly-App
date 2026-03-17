import React, { createContext, useContext, useState, useEffect } from 'react';

export interface Timer {
  id: string;
  label: string;
  duration: number; // in seconds
  remaining: number;
  isRunning: boolean;
  type: 'timer' | 'alarm';
}

interface TimersContextType {
  timers: Timer[];
  addTimer: (timer: Omit<Timer, 'id'>) => void;
  removeTimer: (id: string) => void;
  toggleTimer: (id: string) => void;
  resetTimer: (id: string) => void;
  activeTimer: Timer | null;
}

const TimersContext = createContext<TimersContextType | undefined>(undefined);

export function TimersProvider({ children }: { children: React.ReactNode }) {
  const [timers, setTimers] = useState<Timer[]>(() => {
    const saved = localStorage.getItem('aura-timers');
    return saved ? JSON.parse(saved) : [];
  });

  useEffect(() => {
    localStorage.setItem('aura-timers', JSON.stringify(timers));
  }, [timers]);

  useEffect(() => {
    const interval = setInterval(() => {
      setTimers(prevTimers => 
        prevTimers.map(timer => {
          if (timer.isRunning && timer.remaining > 0) {
            return { ...timer, remaining: timer.remaining - 1 };
          } else if (timer.isRunning && timer.remaining === 0) {
            // Timer finished
            return { ...timer, isRunning: false };
          }
          return timer;
        })
      );
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  const addTimer = (timer: Omit<Timer, 'id'>) => {
    const newTimer = { ...timer, id: Date.now().toString() };
    setTimers(prev => [...prev, newTimer]);
  };

  const removeTimer = (id: string) => {
    setTimers(prev => prev.filter(t => t.id !== id));
  };

  const toggleTimer = (id: string) => {
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, isRunning: !t.isRunning } : t
    ));
  };

  const resetTimer = (id: string) => {
    setTimers(prev => prev.map(t => 
      t.id === id ? { ...t, remaining: t.duration, isRunning: false } : t
    ));
  };

  const activeTimer = timers.find(t => t.isRunning) || null;

  return (
    <TimersContext.Provider value={{ timers, addTimer, removeTimer, toggleTimer, resetTimer, activeTimer }}>
      {children}
    </TimersContext.Provider>
  );
}

export function useTimers() {
  const context = useContext(TimersContext);
  if (context === undefined) {
    throw new Error('useTimers must be used within a TimersProvider');
  }
  return context;
}
