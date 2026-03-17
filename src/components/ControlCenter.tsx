import { useState, useEffect, useRef } from "react";
import gsap from "gsap";
import { motion } from "motion/react";
import {
  Wifi,
  Bluetooth,
  Moon,
  Sun,
  Volume2,
  Monitor,
  Battery,
  Settings2,
  X,
} from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

export default function ControlCenter() {
  const { settings, updateSettings } = useSettings();
  const [isOpen, setIsOpen] = useState(false);
  const [brightness, setBrightness] = useState(100);
  const [volume, setVolume] = useState(50);

  useEffect(() => {
    document.documentElement.style.filter = `brightness(${brightness}%)`;
  }, [brightness]);

  useEffect(() => {
    const mediaElements = document.querySelectorAll('audio, video');
    mediaElements.forEach((el) => {
      (el as HTMLMediaElement).volume = volume / 100;
    });
  }, [volume]);

  const modalRef = useRef<HTMLDivElement>(null);
  const overlayRef = useRef<HTMLDivElement>(null);

  const [toggles, setToggles] = useState({
    wifi: true,
    bluetooth: true,
    dnd: false,
    airplane: false,
  });

  const handleToggle = (key: keyof typeof toggles) => {
    setToggles((prev) => ({ ...prev, [key]: !prev[key] }));
  };

  useEffect(() => {
    if (isOpen) {
      gsap.fromTo(overlayRef.current, 
        { opacity: 0 }, 
        { opacity: 1, duration: 0.4, ease: "power2.out" }
      );
      
      gsap.fromTo(modalRef.current,
        { 
          opacity: 0, 
          scale: 0.8, 
          rotationX: -45, 
          y: -100,
          z: -200
        },
        { 
          opacity: 1, 
          scale: 1, 
          rotationX: 0, 
          y: 0,
          z: 0,
          duration: 0.8, 
          ease: "elastic.out(1, 0.7)",
          transformPerspective: 1000,
          transformOrigin: "top center"
        }
      );
    }
  }, [isOpen]);

  const closeControlCenter = () => {
    gsap.to(modalRef.current, {
      opacity: 0,
      scale: 0.8,
      rotationX: 45,
      y: 100,
      z: -200,
      duration: 0.4,
      ease: "power2.in"
    });
    
    gsap.to(overlayRef.current, {
      opacity: 0,
      duration: 0.4,
      ease: "power2.in",
      onComplete: () => setIsOpen(false)
    });
  };

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 rounded-full bg-aura-card hover:bg-aura-card-hover border border-aura-border text-aura-text transition-colors"
      >
        <Settings2 className="w-5 h-5" strokeWidth={1.5} />
      </button>

      {isOpen && (
        <div className="fixed inset-0 z-50 flex items-center justify-center perspective-1000">
          <div
            ref={overlayRef}
            onClick={closeControlCenter}
            className="absolute inset-0 bg-black/60 backdrop-blur-md"
          />
          
          <div
            ref={modalRef}
            className="relative w-[90vw] max-w-sm apple-glass-heavy rounded-[40px] p-6 shadow-2xl transform-style-3d"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-6 px-2">
              <h2 className="text-xl font-semibold text-aura-text tracking-tight">
                Control Center
              </h2>
              <button
                onClick={closeControlCenter}
                className="p-1.5 apple-btn rounded-full text-aura-muted hover:text-white transition-all"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {/* Toggles Grid */}
            <div className="grid grid-cols-2 gap-4 mb-4">
              {/* Connectivity Block */}
              <div className="apple-btn rounded-[28px] p-4 space-y-4 shadow-inner flex flex-col justify-between">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle("wifi")}
                  className="flex items-center space-x-3 w-full group"
                >
                  <motion.div
                    layout
                    className={`p-2.5 rounded-full transition-all duration-300 ${toggles.wifi ? "bg-blue-500 text-white" : "bg-black/20 text-aura-muted"}`}
                  >
                    <Wifi className="w-5 h-5" />
                  </motion.div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-sm font-semibold text-aura-text truncate">
                      Wi-Fi
                    </div>
                    <motion.div layout className="text-[10px] text-aura-muted truncate">
                      {toggles.wifi ? "Havenly_Net" : "Off"}
                    </motion.div>
                  </div>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle("bluetooth")}
                  className="flex items-center space-x-3 w-full group"
                >
                  <motion.div
                    layout
                    className={`p-2.5 rounded-full transition-all duration-300 ${toggles.bluetooth ? "bg-blue-500 text-white" : "bg-black/20 text-aura-muted"}`}
                  >
                    <Bluetooth className="w-5 h-5" />
                  </motion.div>
                  <div className="text-left flex-1 min-w-0">
                    <div className="text-sm font-semibold text-aura-text truncate">
                      Bluetooth
                    </div>
                    <motion.div layout className="text-[10px] text-aura-muted truncate">
                      {toggles.bluetooth ? "On" : "Off"}
                    </motion.div>
                  </div>
                </motion.button>
              </div>

              {/* Quick Actions Block */}
              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => {
                    const modes: ('off' | 'productivity' | 'relax' | 'focus')[] = ['off', 'productivity', 'relax', 'focus'];
                    const currentIndex = modes.indexOf(settings.autopilotMode);
                    const nextMode = modes[(currentIndex + 1) % modes.length];
                    updateSettings({ autopilotMode: nextMode });
                  }}
                  className={`flex flex-col items-center justify-center space-y-2 p-4 rounded-[28px] transition-all duration-300 h-full ${
                    settings.autopilotMode !== 'off'
                      ? "bg-indigo-500 text-white shadow-[0_0_20px_rgba(99,102,241,0.4)]"
                      : "apple-btn text-aura-text"
                  }`}
                >
                  <motion.div
                    animate={{ rotate: settings.autopilotMode !== 'off' ? 360 : 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <Moon
                      className="w-7 h-7"
                      fill={settings.autopilotMode !== 'off' ? "currentColor" : "none"}
                    />
                  </motion.div>
                  <div className="flex flex-col items-center">
                    <span className="text-xs font-semibold">Focus Mode</span>
                    <span className="text-[10px] opacity-80 capitalize">{settings.autopilotMode}</span>
                  </div>
                </motion.button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-4 mb-4">
              {/* Brightness */}
              <div className="apple-btn rounded-3xl p-3 flex items-center space-x-4 shadow-inner">
                <Sun className="w-5 h-5 text-aura-text shrink-0 ml-2" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-6 bg-black/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, white ${brightness}%, rgba(0,0,0,0.2) ${brightness}%)`,
                  }}
                />
              </div>

              {/* Volume */}
              <div className="apple-btn rounded-3xl p-3 flex items-center space-x-4 shadow-inner">
                <Volume2 className="w-5 h-5 text-aura-text shrink-0 ml-2" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-6 bg-black/20 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-6 [&::-webkit-slider-thumb]:h-6 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-md cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, white ${volume}%, rgba(0,0,0,0.2) ${volume}%)`,
                  }}
                />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex justify-between items-center px-4 apple-btn rounded-[28px] p-4">
              <div className="flex items-center space-x-3 text-aura-text">
                <Battery className="w-6 h-6 text-emerald-400" />
                <span className="text-sm font-semibold">85%</span>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    updateSettings({
                      theme: settings.theme === "dark" ? "light" : "dark",
                    })
                  }
                  className="p-2.5 bg-black/20 rounded-full text-aura-text hover:bg-black/40 transition-colors"
                >
                  <motion.div
                    initial={false}
                    animate={{ rotate: settings.theme === "dark" ? 0 : 180 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    {settings.theme === "dark" ? (
                      <Sun className="w-5 h-5" />
                    ) : (
                      <Moon className="w-5 h-5" />
                    )}
                  </motion.div>
                </motion.button>
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
