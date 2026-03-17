import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Check, Search, LayoutGrid, Sparkles, Loader2 } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";

interface WidgetLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function WidgetLibrary({ isOpen, onClose }: WidgetLibraryProps) {
  const { settings, updateSettings } = useSettings();
  const [search, setSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingRef = useRef(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  const availableWidgets = [
    { id: "quickActions", name: "Quick Actions", description: "Control your most used smart home devices.", category: "Smart Home" },
    { id: "smartHome", name: "Smart Home", description: "Full control over all rooms and devices.", category: "Smart Home" },
    { id: "weather", name: "Weather", description: "Current weather and forecast for your location.", category: "Information" },
    { id: "threedweather", name: "3D Weather", description: "A fully polished minimalistic AI 3D weather app.", category: "Information" },
    { id: "media", name: "Media Player", description: "Control Spotify and other media playback.", category: "Entertainment" },
    { id: "integrations", name: "Integrations", description: "Manage connected apps and AI MCPs.", category: "System" },
    { id: "calendar", name: "Calendar", description: "View your upcoming events and schedule.", category: "Productivity" },
    { id: "notion", name: "Notion", description: "Quick access to your Notion workspace.", category: "Productivity" },
    { id: "googleCalendar", name: "Google Calendar", description: "Sync with your Google Calendar events.", category: "Productivity" },
    { id: "clock", name: "Clock", description: "A beautiful digital clock widget.", category: "Information" },
    { id: "finance", name: "Finance", description: "Track your spending and budgets.", category: "Finance" },
    { id: "threed", name: "3D Space", description: "Interactive 3D widget that reacts to your mouse.", category: "Entertainment" },
    { id: "webcam", name: "Live Webcam", description: "View your home security cameras.", category: "Smart Home" },
    { id: "notes", name: "Notes & Lists", description: "Jot down quick notes and to-dos.", category: "Productivity" },
    { id: "timers", name: "Timers & Alarms", description: "Set quick timers and alarms.", category: "Productivity" },
    { id: "todo", name: "To-Do List", description: "Manage your daily tasks and track progress.", category: "Productivity" },
    { id: "fitness", name: "Activity Rings", description: "Track your daily movement and exercise.", category: "Health" },
    { id: "devices", name: "Batteries", description: "Monitor battery levels for all your devices.", category: "System" },
    { id: "screenTime", name: "Screen Time", description: "View your daily screen time usage.", category: "System" },
    { id: "photos", name: "Photos", description: "Relive your favorite memories.", category: "Media" },
    { id: "smartStack", name: "Smart Stack", description: "Intelligently rotates through widgets based on time and context.", category: "Productivity" },
    { id: "imagePlayground", name: "Image Playground", description: "Generate images using AI.", category: "Entertainment" },
    ...(settings.aiWidgets || [])
  ];

  const filteredWidgets = availableWidgets.filter(w => 
    w.name.toLowerCase().includes(search.toLowerCase()) || 
    w.description.toLowerCase().includes(search.toLowerCase())
  );

  const handleScroll = () => {
    if (!scrollRef.current || generatingRef.current || search) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      generateMoreWidgets();
    }
  };

  const generateMoreWidgets = async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setIsGenerating(true);
    try {
      const response = await fetch('https://text.pollinations.ai/', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [
            { role: 'system', content: 'You are a JSON generator. Return ONLY a valid JSON array of objects. Do not include markdown formatting or any other text.' },
            { role: 'user', content: "Generate 2 unique, highly creative smart home or lifestyle widget concepts. Return JSON array of objects with keys: id (unique string), name (string), description (string), category (string), icon (a single emoji), color (hex color code like #3b82f6)." }
          ],
          jsonMode: true
        })
      });

      let text = await response.text();
      text = text.replace(/```json/g, '').replace(/```/g, '').trim();
      let newWidgets = [];
      
      try {
        newWidgets = JSON.parse(text);
      } catch (parseErr) {
        console.warn("JSON parse failed, attempting to repair...", parseErr);
        // Attempt to repair truncated JSON array
        const lastBrace = text.lastIndexOf('}');
        if (lastBrace !== -1) {
          try {
            const fixedText = text.substring(0, lastBrace + 1) + ']';
            newWidgets = JSON.parse(fixedText);
          } catch (e) {
            console.error("Could not repair JSON", e);
          }
        }
      }

      if (Array.isArray(newWidgets) && newWidgets.length > 0) {
        updateSettings({ aiWidgets: [...(settings.aiWidgets || []), ...newWidgets] });
      }
    } catch (err) {
      console.error("Failed to generate widgets", err);
    } finally {
      generatingRef.current = false;
      setIsGenerating(false);
    }
  };

  const toggleWidget = (id: string) => {
    const isActive = settings.activeWidgets.includes(id);
    const newWidgets = isActive
      ? settings.activeWidgets.filter((w) => w !== id)
      : [...settings.activeWidgets, id];
    
    let newLayout = [...settings.layout];
    if (!isActive && !newLayout.find(l => l.id === id)) {
      newLayout.push({ id, column: 2, order: newLayout.length });
    }

    updateSettings({ activeWidgets: newWidgets, layout: newLayout });
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-md z-[60]"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl apple-glass-heavy rounded-[32px] z-[70] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="p-6 md:p-8 border-b border-white/10 flex justify-between items-center bg-black/10 dark:bg-white/5">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 text-blue-500 rounded-xl">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-aura-text tracking-tight">Widget Library</h2>
                  <p className="text-sm text-aura-muted">Discover and add new capabilities to your dashboard</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-aura-muted hover:text-aura-text transition-colors rounded-full hover:bg-black/10 dark:hover:bg-white/10"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 border-b border-white/10 bg-black/5 dark:bg-white/5 shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aura-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search widgets..."
                  className="w-full bg-black/10 dark:bg-white/10 border border-white/10 rounded-2xl py-3 pl-12 pr-4 text-aura-text focus:outline-none focus:border-blue-500/50 transition-colors placeholder:text-aura-muted"
                />
              </div>
            </div>

            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 custom-scrollbar"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWidgets.map((widget) => {
                  const isActive = settings.activeWidgets.includes(widget.id);
                  const isAi = settings.aiWidgets?.some(w => w.id === widget.id);
                  
                  return (
                    <div 
                      key={widget.id}
                      className={`p-5 rounded-[24px] transition-all ${
                        isActive 
                          ? 'bg-blue-500/10 border border-blue-500/30 shadow-sm' 
                          : 'apple-glass-heavy border border-white/10 dark:border-white/5 hover:bg-black/10 dark:hover:bg-white/10'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-semibold tracking-tight text-aura-text">{widget.name}</h3>
                            {isAi && <Sparkles className="w-3 h-3 text-purple-500" />}
                          </div>
                          <span className="text-[10px] uppercase font-semibold tracking-wider text-aura-muted px-2 py-1 bg-black/5 dark:bg-white/5 rounded-md mt-1 inline-block">
                            {widget.category}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleWidget(widget.id)}
                          className={`p-2 rounded-full transition-colors ${
                            isActive 
                              ? 'bg-blue-500 text-white shadow-md' 
                              : 'bg-black/5 dark:bg-white/5 text-aura-text hover:bg-black/10 dark:hover:bg-white/10'
                          }`}
                        >
                          {isActive ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-sm font-medium text-aura-muted mt-3">{widget.description}</p>
                    </div>
                  );
                })}
              </div>
              
              {isGenerating && (
                <div className="flex flex-col items-center justify-center p-8 text-aura-muted mt-4 border border-dashed border-white/10 dark:border-white/5 rounded-2xl bg-black/5 dark:bg-white/5">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-500" />
                  <p className="text-sm font-medium">AI is generating new widgets...</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
