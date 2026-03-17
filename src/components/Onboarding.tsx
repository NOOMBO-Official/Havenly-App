import { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { useSettings } from "../contexts/SettingsContext";
import {
  ArrowRight,
  Check,
  Moon,
  Sun,
  Monitor,
  MapPin,
  User,
} from "lucide-react";

export default function Onboarding() {
  const { settings, updateSettings } = useSettings();
  const [step, setStep] = useState(1);
  const [name, setName] = useState(
    settings.userName === "Guest" ? "" : settings.userName,
  );
  const [location, setLocation] = useState(settings.weatherLocation);

  const nextStep = () => setStep((s) => s + 1);
  const prevStep = () => setStep((s) => s - 1);

  const finishOnboarding = () => {
    updateSettings({
      userName: name || "Guest",
      weatherLocation: location || "New York, NY",
      onboardingCompleted: true,
    });
  };

  const themes = [
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "light", icon: Sun, label: "Light" },
    { id: "midnight", icon: Monitor, label: "Midnight" },
  ];

  return (
    <div className="fixed inset-0 bg-aura-bg text-aura-text z-50 flex flex-col items-center justify-center p-6 overflow-hidden">
      <div className="absolute inset-0 bg-gradient-to-br from-green-500/5 to-purple-500/5 pointer-events-none" />

      <div className="w-full max-w-xl relative z-10">
        <AnimatePresence mode="wait">
          {step === 1 && (
            <motion.div
              key="step1"
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="text-center space-y-8"
            >
              <div className="w-24 h-24 mx-auto bg-aura-card border border-aura-border rounded-3xl flex items-center justify-center shadow-2xl">
                <div className="w-12 h-12 rounded-full bg-gradient-to-tr from-green-400 to-emerald-600 animate-pulse" />
              </div>
              <div className="space-y-4">
                <h1 className="text-4xl md:text-5xl font-semibold tracking-tight">
                  Welcome to Havenly
                </h1>
                <p className="text-aura-muted text-lg font-medium">
                  Your intelligent, connected home dashboard.
                </p>
              </div>
              <button
                onClick={nextStep}
                className="inline-flex items-center space-x-2 bg-aura-text text-aura-bg px-8 py-4 rounded-full font-medium hover:scale-105 transition-transform"
              >
                <span>Get Started</span>
                <ArrowRight className="w-5 h-5" />
              </button>
            </motion.div>
          )}

          {step === 2 && (
            <motion.div
              key="step2"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 w-full"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-display font-medium">
                  Let's get to know you
                </h2>
                <p className="text-aura-muted">What should Havenly call you?</p>
              </div>

              <div className="relative max-w-sm mx-auto">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aura-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  className="w-full bg-aura-card border border-aura-border rounded-2xl py-4 pl-12 pr-4 text-aura-text focus:outline-none focus:border-aura-text transition-colors text-lg"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && name && nextStep()}
                />
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 text-aura-muted hover:text-aura-text transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!name.trim()}
                  className="px-8 py-3 bg-aura-text text-aura-bg rounded-full font-medium disabled:opacity-50 transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 3 && (
            <motion.div
              key="step3"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 w-full"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-display font-medium">
                  Where are you?
                </h2>
                <p className="text-aura-muted">
                  We need this for accurate weather forecasts.
                </p>
              </div>

              <div className="relative max-w-sm mx-auto">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aura-muted" />
                <input
                  type="text"
                  value={location}
                  onChange={(e) => setLocation(e.target.value)}
                  placeholder="City, Country"
                  className="w-full bg-aura-card border border-aura-border rounded-2xl py-4 pl-12 pr-4 text-aura-text focus:outline-none focus:border-aura-text transition-colors text-lg"
                  autoFocus
                  onKeyDown={(e) => e.key === "Enter" && location && nextStep()}
                />
              </div>

              <div className="flex justify-center space-x-4">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 text-aura-muted hover:text-aura-text transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={nextStep}
                  disabled={!location.trim()}
                  className="px-8 py-3 bg-aura-text text-aura-bg rounded-full font-medium disabled:opacity-50 transition-all"
                >
                  Continue
                </button>
              </div>
            </motion.div>
          )}

          {step === 4 && (
            <motion.div
              key="step4"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              exit={{ opacity: 0, x: -20 }}
              className="space-y-8 w-full"
            >
              <div className="space-y-2 text-center">
                <h2 className="text-3xl font-display font-medium">
                  Choose your aesthetic
                </h2>
                <p className="text-aura-muted">
                  You can always change this later in settings.
                </p>
              </div>

              <div className="grid grid-cols-3 gap-4 max-w-lg mx-auto">
                {themes.map((t) => {
                  const Icon = t.icon;
                  return (
                    <button
                      key={t.id}
                      onClick={() => updateSettings({ theme: t.id as any })}
                      className={`flex flex-col items-center p-6 rounded-3xl border transition-all ${
                        settings.theme === t.id
                          ? "border-aura-text bg-aura-text text-aura-bg scale-105 shadow-xl"
                          : "border-aura-border bg-aura-card text-aura-text hover:bg-aura-card-hover hover:scale-105"
                      }`}
                    >
                      <Icon className="w-8 h-8 mb-4" strokeWidth={1.5} />
                      <span className="font-medium">{t.label}</span>
                    </button>
                  );
                })}
              </div>

              <div className="flex justify-center space-x-4 pt-4">
                <button
                  onClick={prevStep}
                  className="px-6 py-3 text-aura-muted hover:text-aura-text transition-colors"
                >
                  Back
                </button>
                <button
                  onClick={finishOnboarding}
                  className="inline-flex items-center space-x-2 px-8 py-3 bg-aura-text text-aura-bg rounded-full font-medium hover:scale-105 transition-all"
                >
                  <span>Enter Havenly</span>
                  <Check className="w-5 h-5" />
                </button>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Progress indicators */}
      <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex space-x-2">
        {[1, 2, 3, 4].map((i) => (
          <div
            key={i}
            className={`h-1.5 rounded-full transition-all duration-300 ${step === i ? "w-8 bg-aura-text" : "w-2 bg-aura-border"}`}
          />
        ))}
      </div>
    </div>
  );
}
