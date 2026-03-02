import { CloudRain, Droplets, Wind } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

export default function WeatherWidget() {
  const { settings } = useSettings();

  return (
    <div className="flex flex-col justify-between p-6 rounded-3xl border border-aura-border bg-aura-card backdrop-blur-md h-full">
      <div className="flex justify-between items-start">
        <div className="flex flex-col">
          <span className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-1">
            {settings.weatherLocation}
          </span>
          <span className="text-4xl font-display font-light text-aura-text">
            68°
          </span>
          <span className="text-sm text-aura-muted mt-1">Light Rain</span>
        </div>
        <div className="p-3 rounded-full bg-aura-bg border border-aura-border text-aura-text">
          <CloudRain className="w-6 h-6" strokeWidth={1.5} />
        </div>
      </div>

      <div className="flex items-center space-x-6 mt-6 pt-6 border-t border-aura-border">
        <div className="flex items-center space-x-2">
          <Droplets className="w-4 h-4 text-aura-muted" strokeWidth={1.5} />
          <span className="text-xs text-aura-text">82%</span>
        </div>
        <div className="flex items-center space-x-2">
          <Wind className="w-4 h-4 text-aura-muted" strokeWidth={1.5} />
          <span className="text-xs text-aura-text">12 mph</span>
        </div>
      </div>
    </div>
  );
}
