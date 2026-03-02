import { useState, useEffect } from "react";

export default function Clock() {
  const [time, setTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: false,
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
    <div className="flex flex-col items-start space-y-1">
      <h1 className="text-6xl md:text-8xl font-display font-light tracking-tighter text-aura-text">
        {formatTime(time)}
      </h1>
      <p className="text-sm md:text-base font-medium text-aura-muted uppercase tracking-widest">
        {formatDate(time)}
      </p>
    </div>
  );
}
