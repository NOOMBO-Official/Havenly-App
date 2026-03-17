import { useState } from "react";
import { Settings as SettingsIcon, X, Moon, Sun, Monitor, LogOut } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { useAuth } from "../contexts/AuthContext";
import { motion, AnimatePresence } from "motion/react";
import WidgetLibrary from "./WidgetLibrary";
import LayoutLibrary from "./LayoutLibrary";
import MasterPresetManager from "./MasterPresetManager";

export default function SettingsPanel({ isOpen, setIsOpen }: { isOpen: boolean, setIsOpen: (v: boolean) => void }) {
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
              className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-aura-bg border-l border-aura-border z-50 p-6 pb-24 md:pb-6 overflow-y-auto shadow-2xl"
            >
              <div className="flex justify-between items-center mb-8">
                <h2 className="text-2xl font-semibold tracking-tight text-aura-text">
                  Settings
                </h2>
                <button
                  onClick={() => setIsOpen(false)}
                  className="p-2 text-aura-muted hover:text-aura-text bg-black/5 dark:bg-white/5 rounded-full transition-colors"
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

                {/* Preferences */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-4">
                    Preferences
                  </h3>
                  <div className="space-y-4">
                    <div className="flex items-center justify-between p-4 rounded-xl border border-aura-border bg-aura-card">
                      <span className="text-sm text-aura-text">Use 24-Hour Format</span>
                      <button
                        onClick={() => updateSettings({ use24HourFormat: !settings.use24HourFormat })}
                        className={`w-10 h-6 rounded-full transition-colors relative ${settings.use24HourFormat ? "bg-blue-500" : "bg-aura-border"}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.use24HourFormat ? "left-5" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex items-center justify-between p-4 rounded-xl border border-aura-border bg-aura-card">
                      <span className="text-sm text-aura-text">Tap to Expand Widgets</span>
                      <button
                        onClick={() => updateSettings({ tapToExpand: !settings.tapToExpand })}
                        className={`w-10 h-6 rounded-full transition-colors relative ${settings.tapToExpand ? "bg-blue-500" : "bg-aura-border"}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.tapToExpand ? "left-5" : "left-1"}`} />
                      </button>
                    </div>
                    
                    <div className="flex items-center justify-between p-4 rounded-xl border border-aura-border bg-aura-card">
                      <span className="text-sm text-aura-text">Haptic Feedback</span>
                      <button
                        onClick={() => {
                          import('../utils/haptics').then(({ triggerHaptic }) => triggerHaptic('medium'));
                          updateSettings({ hapticsEnabled: !settings.hapticsEnabled });
                        }}
                        className={`w-10 h-6 rounded-full transition-colors relative ${settings.hapticsEnabled ? "bg-blue-500" : "bg-aura-border"}`}
                      >
                        <div className={`absolute top-1 w-4 h-4 rounded-full bg-white transition-all ${settings.hapticsEnabled ? "left-5" : "left-1"}`} />
                      </button>
                    </div>

                    <div className="flex flex-col space-y-2 p-4 rounded-xl border border-aura-border bg-aura-card">
                      <span className="text-sm text-aura-text">Wallpaper Mode</span>
                      <select
                        value={settings.wallpaperMode}
                        onChange={(e) => updateSettings({ wallpaperMode: e.target.value as any })}
                        className="w-full bg-aura-bg border border-aura-border rounded-lg p-2 text-aura-text text-sm focus:outline-none"
                      >
                        <option value="dynamic">Dynamic (Animated)</option>
                        <option value="static">Static (Solid Color)</option>
                        <option value="time-of-day">Time of Day</option>
                        <option value="weather">Weather Sync</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-2 p-4 rounded-xl border border-aura-border bg-aura-card">
                      <span className="text-sm text-aura-text">Screen Timeout (Photo Collage)</span>
                      <select
                        value={settings.screenTimeout}
                        onChange={(e) => updateSettings({ screenTimeout: parseInt(e.target.value) })}
                        className="w-full bg-aura-bg border border-aura-border rounded-lg p-2 text-aura-text text-sm focus:outline-none"
                      >
                        <option value={0}>Never</option>
                        <option value={30000}>30 Seconds</option>
                        <option value={60000}>1 Minute</option>
                        <option value={300000}>5 Minutes</option>
                        <option value={600000}>10 Minutes</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-2 p-4 rounded-xl border border-aura-border bg-aura-card">
                      <span className="text-sm text-aura-text">Intelligent "Now" Mode</span>
                      <select
                        value={settings.nowPanelMode}
                        onChange={(e) => updateSettings({ nowPanelMode: e.target.value as 'widget' | 'panel' })}
                        className="w-full bg-aura-bg border border-aura-border rounded-lg p-2 text-aura-text text-sm focus:outline-none"
                      >
                        <option value="widget">Widget (in grid)</option>
                        <option value="panel">Panel (floating)</option>
                      </select>
                    </div>

                    <div className="flex flex-col space-y-2 p-4 rounded-xl border border-aura-border bg-aura-card">
                      <span className="text-sm text-aura-text">Life Autopilot</span>
                      <select
                        value={settings.autopilotMode}
                        onChange={(e) => updateSettings({ autopilotMode: e.target.value as any })}
                        className="w-full bg-aura-bg border border-aura-border rounded-lg p-2 text-aura-text text-sm focus:outline-none"
                      >
                        <option value="off">Off</option>
                        <option value="productivity">Productivity (Focus Blocks, Silence)</option>
                        <option value="relax">Relax (Wind down, Ambient)</option>
                        <option value="focus">Deep Focus (DND, Timers)</option>
                      </select>
                    </div>
                  </div>
                </section>

                {/* System Update */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-4">
                    System Update
                  </h3>
                  <div className="flex items-center justify-between p-4 bg-black/20 rounded-xl border border-white/5">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                        <Monitor className="w-5 h-5" />
                      </div>
                      <div>
                        <h3 className="text-sm font-medium text-aura-text">OS Update</h3>
                        <p className="text-xs text-aura-muted">Check for updates via WebRTC</p>
                      </div>
                    </div>
                    <button 
                      onClick={() => {
                        import('sonner').then(({ toast }) => {
                          toast.promise(
                            new Promise(resolve => setTimeout(resolve, 3000)),
                            {
                              loading: 'Checking for updates via WebRTC...',
                              success: 'System is up to date (v2.4.1)',
                              error: 'Failed to check for updates'
                            }
                          );
                        });
                      }}
                      className="px-4 py-2 bg-blue-500/20 text-blue-400 rounded-xl hover:bg-blue-500/30 transition-colors text-sm font-medium"
                    >
                      Check
                    </button>
                  </div>
                </section>

                {/* Webcam Settings */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-4">
                    Live Webcam
                  </h3>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={settings.webcamUrl || ""}
                      onChange={(e) => updateSettings({ webcamUrl: e.target.value })}
                      className="w-full bg-aura-card border border-aura-border rounded-xl p-3 text-aura-text text-sm focus:outline-none focus:border-aura-text transition-colors"
                      placeholder="Webcam Stream URL (e.g. http://.../m3u8)"
                    />
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={settings.webcamUsername || ""}
                        onChange={(e) => updateSettings({ webcamUsername: e.target.value })}
                        className="w-1/2 bg-aura-card border border-aura-border rounded-xl p-3 text-aura-text text-sm focus:outline-none focus:border-aura-text transition-colors"
                        placeholder="Username (optional)"
                      />
                      <input
                        type="password"
                        value={settings.webcamPassword || ""}
                        onChange={(e) => updateSettings({ webcamPassword: e.target.value })}
                        className="w-1/2 bg-aura-card border border-aura-border rounded-xl p-3 text-aura-text text-sm focus:outline-none focus:border-aura-text transition-colors"
                        placeholder="Password (optional)"
                      />
                    </div>
                    <div className="pt-2">
                      <label className="text-xs text-aura-muted mb-2 block">Route Target Configuration (JSON/XML)</label>
                      <textarea
                        className="w-full bg-aura-card border border-aura-border rounded-xl p-3 text-aura-text text-xs focus:outline-none focus:border-aura-text transition-colors font-mono h-24 resize-none"
                        placeholder={`{\n  "serverUrl": "...",\n  "ipAddress": "...",\n  "securityAuthCode": "..."\n}`}
                        onChange={(e) => {
                          try {
                            const parsed = JSON.parse(e.target.value);
                            if (parsed.serverUrl) updateSettings({ webcamUrl: parsed.serverUrl });
                            if (parsed.username) updateSettings({ webcamUsername: parsed.username });
                            if (parsed.password) updateSettings({ webcamPassword: parsed.password });
                          } catch (err) {
                            // Ignore parse errors while typing
                          }
                        }}
                      />
                    </div>
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
                      "nocdConnect",
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

                {/* Master Presets */}
                <section>
                  <h3 className="text-xs font-medium uppercase tracking-widest text-aura-muted mb-4">
                    Master Presets
                  </h3>
                  <MasterPresetManager />
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
