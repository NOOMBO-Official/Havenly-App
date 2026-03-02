import { useState } from "react";
import { Settings as SettingsIcon, X, Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import WidgetLibrary from "./WidgetLibrary";
import LayoutLibrary from "./LayoutLibrary";

export default function SettingsPanel() {
  const [isOpen, setIsOpen] = useState(false);
  const [isWidgetLibraryOpen, setIsWidgetLibraryOpen] = useState(false);
  const [isLayoutLibraryOpen, setIsLayoutLibraryOpen] = useState(false);
  const { settings, updateSettings } = useSettings();
  const { signOut } = useAuth();

  const themes = [
    { id: "dark", icon: Moon, label: "Dark" },
    { id: "light", icon: Sun, label: "Light" },
    { id: "midnight", icon: Monitor, label: "Midnight" },
  ];

  return (
    <>
      <button
        onClick={() => setIsOpen(true)}
        className="p-3 rounded-full bg-aura-card hover:bg-aura-card-hover border border-aura-border text-aura-text transition-colors"
      >
        <SettingsIcon className="w-5 h-5" strokeWidth={1.5} />
      </button>

      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setIsOpen(false)}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40"
            />
            <motion.div
              initial={{ x: "100%" }}
              animate={{ x: 0 }}
              exit={{ x: "100%" }}
              transition={{ type: "spring", damping: 25, stiffness: 200 }}
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-aura-bg border-l border-aura-border z-50 p-6 overflow-y-auto"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-lg font-display font-medium text-aura-text">
                  Settings
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-aura-muted hover:text-aura-text"
                >
                  <X className="w-5 h-5" />
                </button>
              </div>

              <div className="space-y-8">
                {/* Theme */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-4">
                    Theme
                  </h3>
                  <div className="grid grid-cols-3 gap-3">
                    {themes.map((t) => {
                      const Icon = t.icon;
                      return (
                        <button
                          key={t.id}
                          onClick={() => updateSettings({ theme: t.id as any })}
                          className={`flex flex-col items-center p-4 rounded-2xl border transition-colors ${
                            settings.theme === t.id
                              ? "border-aura-text bg-aura-text text-aura-bg"
                              : "border-aura-border bg-aura-card text-aura-text hover:bg-aura-card-hover"
                          }`}
                        >
                          <Icon className="w-5 h-5 mb-2" strokeWidth={1.5} />
                          <span className="text-xs">{t.label}</span>
                        </button>
                      );
                    })}
                  </div>
                </section>

                {/* Weather Location */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-4">
                    Location
                  </h3>
                  <input
                    type="text"
                    value={settings.weatherLocation}
                    onChange={(e) =>
                      updateSettings({ weatherLocation: e.target.value })
                    }
                    className="w-full bg-aura-card border border-aura-border rounded-xl p-3 text-aura-text text-sm focus:outline-none focus:border-aura-text transition-colors"
                    placeholder="Enter city..."
                  />
                </section>

                {/* Libraries */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-4">
                    Libraries
                  </h3>
                  <div className="space-y-3">
                    <button 
                      onClick={() => setIsWidgetLibraryOpen(true)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-aura-border bg-aura-card hover:bg-aura-card-hover transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-blue-500/10 text-blue-400 rounded-lg">
                          <SettingsIcon className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm text-aura-text">Widget Library</div>
                          <div className="text-[10px] text-aura-muted">Millions of widgets available</div>
                        </div>
                      </div>
                    </button>
                    <button 
                      onClick={() => setIsLayoutLibraryOpen(true)}
                      className="w-full flex items-center justify-between p-4 rounded-xl border border-aura-border bg-aura-card hover:bg-aura-card-hover transition-colors"
                    >
                      <div className="flex items-center space-x-3">
                        <div className="p-2 bg-purple-500/10 text-purple-400 rounded-lg">
                          <Monitor className="w-4 h-4" />
                        </div>
                        <div className="text-left">
                          <div className="text-sm text-aura-text">Layout Library</div>
                          <div className="text-[10px] text-aura-muted">Unlimited community layouts</div>
                        </div>
                      </div>
                    </button>
                  </div>
                </section>

                {/* Integrations */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-4">
                    Integrations
                  </h3>
                  <div className="space-y-3">
                    {Object.entries(settings.integrations).map(
                      ([key, value]) => (
                        <div
                          key={key}
                          className="flex items-center justify-between p-4 rounded-xl border border-aura-border bg-aura-card"
                        >
                          <span className="text-sm text-aura-text capitalize">
                            {key}
                          </span>
                          <button
                            onClick={async () => {
                              if (key === "spotify" && value) {
                                try {
                                  await fetch("/api/spotify/disconnect", {
                                    method: "POST",
                                  });
                                } catch (e) {
                                  console.error(
                                    "Failed to disconnect Spotify",
                                    e,
                                  );
                                }
                              }
                              updateSettings({
                                integrations: {
                                  ...settings.integrations,
                                  [key]: !value,
                                },
                              });
                            }}
                            className={`w-10 h-6 rounded-full transition-colors relative ${value ? "bg-emerald-500" : "bg-aura-border"}`}
                          >
                            <div
                              className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${value ? "left-5" : "left-1"}`}
                            />
                          </button>
                        </div>
                      ),
                    )}
                  </div>
                </section>

                {/* Widgets */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-4">
                    Active Widgets
                  </h3>
                  <div className="space-y-2">
                    {[
                      "quickActions",
                      "smartHome",
                      "weather",
                      "media",
                      "integrations",
                      "calendar",
                      "notion",
                      "googleCalendar",
                    ].map((widget) => {
                      const isActive = settings.activeWidgets.includes(widget);
                      return (
                        <label
                          key={widget}
                          className="flex items-center space-x-3 p-2 cursor-pointer"
                        >
                          <input
                            type="checkbox"
                            checked={isActive}
                            onChange={() => {
                              const newWidgets = isActive
                                ? settings.activeWidgets.filter(
                                    (w) => w !== widget,
                                  )
                                : [...settings.activeWidgets, widget];
                              
                              // Also update layout if adding
                              let newLayout = [...settings.layout];
                              if (!isActive && !newLayout.find(l => l.id === widget)) {
                                newLayout.push({ id: widget, column: 2, order: newLayout.length });
                              }

                              updateSettings({ activeWidgets: newWidgets, layout: newLayout });
                            }}
                            className="rounded border-aura-border bg-aura-card text-aura-text focus:ring-0"
                          />
                          <span className="text-sm text-aura-text capitalize">
                            {widget.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        </label>
                      );
                    })}
                  </div>
                </section>

                {/* Account */}
                <section className="pt-6 border-t border-aura-border">
                  <button
                    onClick={async () => {
                      await signOut();
                      setIsOpen(false);
                    }}
                    className="w-full flex items-center justify-center space-x-2 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors"
                  >
                    <LogOut className="w-5 h-5" />
                    <span className="font-medium">Sign Out</span>
                  </button>
                </section>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>

      <WidgetLibrary isOpen={isWidgetLibraryOpen} onClose={() => setIsWidgetLibraryOpen(false)} />
      <LayoutLibrary isOpen={isLayoutLibraryOpen} onClose={() => setIsLayoutLibraryOpen(false)} />
    </>
  );
}
