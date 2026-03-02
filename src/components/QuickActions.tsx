import {
  Lightbulb,
  Thermometer,
  Lock,
  Camera,
  Music,
  Tv,
  Wifi,
  Shield,
} from "lucide-react";
import { motion } from "motion/react";
import { useState } from "react";

const ACTIONS = [
  {
    id: "lights",
    label: "Lights",
    icon: Lightbulb,
    activeColor: "text-amber-400",
    activeBg: "bg-amber-400/10",
  },
  {
    id: "climate",
    label: "Climate",
    icon: Thermometer,
    activeColor: "text-rose-400",
    activeBg: "bg-rose-400/10",
  },
  {
    id: "security",
    label: "Security",
    icon: Shield,
    activeColor: "text-emerald-400",
    activeBg: "bg-emerald-400/10",
  },
  {
    id: "cameras",
    label: "Cameras",
    icon: Camera,
    activeColor: "text-blue-400",
    activeBg: "bg-blue-400/10",
  },
  {
    id: "media",
    label: "Media",
    icon: Tv,
    activeColor: "text-purple-400",
    activeBg: "bg-purple-400/10",
  },
  {
    id: "audio",
    label: "Audio",
    icon: Music,
    activeColor: "text-pink-400",
    activeBg: "bg-pink-400/10",
  },
  {
    id: "network",
    label: "Network",
    icon: Wifi,
    activeColor: "text-cyan-400",
    activeBg: "bg-cyan-400/10",
  },
  {
    id: "locks",
    label: "Locks",
    icon: Lock,
    activeColor: "text-zinc-400",
    activeBg: "bg-zinc-400/10",
  },
];

export default function QuickActions() {
  const [activeActions, setActiveActions] = useState<Record<string, boolean>>({
    lights: true,
    security: true,
    network: true,
  });

  const toggleAction = (id: string) => {
    setActiveActions((prev) => ({ ...prev, [id]: !prev[id] }));
  };

  return (
    <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 h-full">
      {ACTIONS.map((action) => {
        const isActive = activeActions[action.id];
        const Icon = action.icon;

        return (
          <motion.button
            key={action.id}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => toggleAction(action.id)}
            className={`flex flex-col items-center justify-center p-6 rounded-3xl border transition-colors duration-300 ${
              isActive
                ? `border-aura-border ${action.activeBg}`
                : "border-aura-border bg-aura-card hover:bg-aura-card-hover"
            }`}
          >
            <Icon
              className={`w-8 h-8 mb-3 transition-colors duration-300 ${
                isActive ? action.activeColor : "text-aura-muted"
              }`}
              strokeWidth={1.5}
            />
            <span
              className={`text-xs font-medium uppercase tracking-wider transition-colors duration-300 ${
                isActive ? "text-aura-text" : "text-aura-muted"
              }`}
            >
              {action.label}
            </span>
            <span
              className={`text-[10px] mt-1 transition-colors duration-300 ${
                isActive ? "text-aura-muted" : "opacity-50 text-aura-muted"
              }`}
            >
              {isActive ? "ON" : "OFF"}
            </span>
          </motion.button>
        );
      })}
    </div>
  );
}
