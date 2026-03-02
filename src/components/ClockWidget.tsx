import { useState, useEffect } from "react";
import { Clock as ClockIcon } from "lucide-react";

export default function ClockWidget() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "numeric",
      minute: "2-digit",
      hour12: true,
    });
  };

  const formatDate = (date: Date) => {
    return date.toLocaleDateString("en-US", {
      weekday: "long",
      month: "long",
      day: "numeric",
    });
  };

  return (
    <div className="flex flex-col justify-between p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full relative overflow-hidden group">
      <div className="flex justify-between items-start relative z-10">
        <span className="text-xs font-medium uppercase tracking-widest text-aura-muted flex items-center gap-2">
          <ClockIcon className="w-3 h-3 text-blue-400" />
          Local Time
        </span>
      </div>

      <div className="flex flex-col items-center justify-center flex-1 relative z-10">
        <div className="text-5xl md:text-6xl font-display font-medium text-aura-text tracking-tighter mb-2">
          {formatTime(time)}
        </div>
        <div className="text-sm text-aura-muted font-medium uppercase tracking-widest">
          {formatDate(time)}
        </div>
      </div>

      {/* Decorative background element */}
      <div className="absolute -bottom-24 -right-24 w-64 h-64 bg-blue-500/10 rounded-full blur-3xl pointer-events-none group-hover:bg-blue-500/20 transition-colors duration-700" />
    </div>
  );
}
