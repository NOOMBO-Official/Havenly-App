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
  const [brightness, setBrightness] = useState(80);
  const [volume, setVolume] = useState(50);

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
            className="relative w-[90vw] max-w-md bg-aura-card/90 backdrop-blur-3xl border border-white/10 rounded-[3rem] p-8 shadow-[0_0_50px_rgba(0,0,0,0.5)] transform-style-3d"
          >
            {/* Header */}
            <div className="flex justify-between items-center mb-8 px-2">
              <h2 className="text-2xl font-display font-medium text-aura-text tracking-tight">
                Control Center
              </h2>
              <button
                onClick={closeControlCenter}
                className="p-2 bg-white/5 rounded-full text-aura-muted hover:text-white hover:bg-white/10 transition-all"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            {/* Toggles Grid */}
            <div className="grid grid-cols-2 gap-4 mb-8">
              {/* Connectivity Block */}
              <div className="bg-black/20 rounded-[2rem] p-5 space-y-5 border border-white/5 shadow-inner">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle("wifi")}
                  className="flex items-center space-x-4 w-full group"
                >
                  <motion.div
                    layout
                    className={`p-3 rounded-full transition-all duration-300 ${toggles.wifi ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-white/5 text-aura-muted"}`}
                  >
                    <Wifi className="w-5 h-5" />
                  </motion.div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-aura-text">
                      Wi-Fi
                    </div>
                    <motion.div layout className="text-xs text-aura-muted">
                      {toggles.wifi ? "Havenly_Net" : "Off"}
                    </motion.div>
                  </div>
                </motion.button>
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle("bluetooth")}
                  className="flex items-center space-x-4 w-full group"
                >
                  <motion.div
                    layout
                    className={`p-3 rounded-full transition-all duration-300 ${toggles.bluetooth ? "bg-blue-500 text-white shadow-[0_0_15px_rgba(59,130,246,0.5)]" : "bg-white/5 text-aura-muted"}`}
                  >
                    <Bluetooth className="w-5 h-5" />
                  </motion.div>
                  <div className="text-left">
                    <div className="text-sm font-medium text-aura-text">
                      Bluetooth
                    </div>
                    <motion.div layout className="text-xs text-aura-muted">
                      {toggles.bluetooth ? "On" : "Off"}
                    </motion.div>
                  </div>
                </motion.button>
              </div>

              {/* Quick Actions Block */}
              <div className="grid grid-cols-1 gap-4">
                <motion.button
                  whileTap={{ scale: 0.95 }}
                  onClick={() => handleToggle("dnd")}
                  className={`flex flex-col items-center justify-center space-y-3 p-4 rounded-[2rem] border transition-all duration-300 h-full ${
                    toggles.dnd
                      ? "bg-indigo-500/20 text-indigo-400 border-indigo-500/50 shadow-[0_0_20px_rgba(99,102,241,0.2)]"
                      : "bg-black/20 text-aura-text border-white/5 hover:bg-white/5"
                  }`}
                >
                  <motion.div
                    animate={{ rotate: toggles.dnd ? 360 : 0 }}
                    transition={{ duration: 0.5, type: "spring" }}
                  >
                    <Moon
                      className="w-8 h-8"
                      fill={toggles.dnd ? "currentColor" : "none"}
                    />
                  </motion.div>
                  <span className="text-sm font-medium">Do Not Disturb</span>
                </motion.button>
              </div>
            </div>

            {/* Sliders */}
            <div className="space-y-6 mb-8">
              {/* Brightness */}
              <div className="bg-black/20 rounded-full p-4 flex items-center space-x-4 border border-white/5 shadow-inner">
                <Sun className="w-5 h-5 text-aura-muted shrink-0 ml-2" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={brightness}
                  onChange={(e) => setBrightness(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, white ${brightness}%, rgba(255,255,255,0.1) ${brightness}%)`,
                  }}
                />
              </div>

              {/* Volume */}
              <div className="bg-black/20 rounded-full p-4 flex items-center space-x-4 border border-white/5 shadow-inner">
                <Volume2 className="w-5 h-5 text-aura-muted shrink-0 ml-2" />
                <input
                  type="range"
                  min="0"
                  max="100"
                  value={volume}
                  onChange={(e) => setVolume(Number(e.target.value))}
                  className="w-full h-2 bg-white/10 rounded-full appearance-none [&::-webkit-slider-thumb]:appearance-none [&::-webkit-slider-thumb]:w-5 [&::-webkit-slider-thumb]:h-5 [&::-webkit-slider-thumb]:bg-white [&::-webkit-slider-thumb]:rounded-full [&::-webkit-slider-thumb]:shadow-[0_0_10px_rgba(255,255,255,0.5)] cursor-pointer"
                  style={{
                    background: `linear-gradient(to right, white ${volume}%, rgba(255,255,255,0.1) ${volume}%)`,
                  }}
                />
              </div>
            </div>

            {/* Bottom Row */}
            <div className="flex justify-between items-center px-4 bg-black/20 rounded-[2rem] p-4 border border-white/5">
              <div className="flex items-center space-x-3 text-aura-text">
                <Battery className="w-6 h-6 text-emerald-400" />
                <span className="text-base font-medium">85%</span>
              </div>
              <div className="flex space-x-2">
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() =>
                    updateSettings({
                      theme: settings.theme === "dark" ? "light" : "dark",
                    })
                  }
                  className="p-3 bg-white/5 rounded-full text-aura-text hover:bg-white/10 transition-colors border border-white/5"
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
