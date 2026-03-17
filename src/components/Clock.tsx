import { useState, useEffect } from "react";
import { useSettings } from "../contexts/SettingsContext";

export default function Clock() {
  const [time, setTime] = useState(new Date());
  const { settings } = useSettings();

  useEffect(() => {
    const timer = setInterval(() => setTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (date: Date) => {
    return date.toLocaleTimeString("en-US", {
      hour: "2-digit",
      minute: "2-digit",
      hour12: !settings.use24HourFormat,
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
      <h1 className="text-6xl md:text-8xl font-medium tracking-tight text-white drop-shadow-sm">
        {formatTime(time)}
      </h1>
      <p className="text-sm md:text-base font-medium text-white/70 uppercase tracking-widest pl-1">
        {formatDate(time)}
      </p>
    </div>
  );
}
