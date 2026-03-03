import { useState, useRef, useEffect } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, Plus, Check, Search, LayoutGrid, Sparkles, Loader2 } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { GoogleGenAI, Type } from "@google/genai";

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
    { id: "media", name: "Media Player", description: "Control Spotify and other media playback.", category: "Entertainment" },
    { id: "integrations", name: "Integrations", description: "Manage connected apps and AI MCPs.", category: "System" },
    { id: "calendar", name: "Calendar", description: "View your upcoming events and schedule.", category: "Productivity" },
    { id: "notion", name: "Notion", description: "Quick access to your Notion workspace.", category: "Productivity" },
    { id: "googleCalendar", name: "Google Calendar", description: "Sync with your Google Calendar events.", category: "Productivity" },
    { id: "clock", name: "Clock", description: "A beautiful digital clock widget.", category: "Information" },
    { id: "tasks", name: "Tasks", description: "Manage your daily to-do list.", category: "Productivity" },
    { id: "finance", name: "Finance", description: "Track your spending and budgets.", category: "Finance" },
    { id: "health", name: "Health & Fitness", description: "Monitor your daily activity and goals.", category: "Health" },
    { id: "threed", name: "3D Space", description: "Interactive 3D widget that reacts to your mouse.", category: "Entertainment" },
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
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate 2 unique, highly creative smart home or lifestyle widget concepts. Return JSON array of objects with keys: id (unique string), name (string), description (string), category (string), icon (a single emoji), color (hex color code like #3b82f6).",
        config: {
          responseMimeType: "application/json",
          responseSchema: {
            type: Type.ARRAY,
            items: {
              type: Type.OBJECT,
              properties: {
                id: { type: Type.STRING },
                name: { type: Type.STRING },
                description: { type: Type.STRING },
                category: { type: Type.STRING },
                icon: { type: Type.STRING },
                color: { type: Type.STRING }
              }
            }
          }
        }
      });

      let text = response.text?.trim() || "[]";
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-3xl bg-aura-bg border border-aura-border rounded-[2rem] z-[70] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="p-6 md:p-8 border-b border-aura-border flex justify-between items-center bg-aura-card/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                  <LayoutGrid className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-medium text-aura-text">Widget Library</h2>
                  <p className="text-sm text-aura-muted">Discover and add new capabilities to your dashboard</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-aura-muted hover:text-aura-text transition-colors rounded-full hover:bg-aura-card"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div className="p-6 border-b border-aura-border bg-aura-bg shrink-0">
              <div className="relative">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-aura-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Search widgets..."
                  className="w-full bg-aura-card border border-aura-border rounded-2xl py-3 pl-12 pr-4 text-aura-text focus:outline-none focus:border-blue-500/50 transition-colors"
                />
              </div>
            </div>

            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 custom-scrollbar bg-aura-bg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {filteredWidgets.map((widget) => {
                  const isActive = settings.activeWidgets.includes(widget.id);
                  const isAi = settings.aiWidgets?.some(w => w.id === widget.id);
                  
                  return (
                    <div 
                      key={widget.id}
                      className={`p-5 rounded-2xl border transition-all ${
                        isActive 
                          ? 'bg-blue-500/5 border-blue-500/30' 
                          : 'bg-aura-card border-aura-border hover:border-aura-text/30'
                      }`}
                    >
                      <div className="flex justify-between items-start mb-2">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-lg font-medium text-aura-text">{widget.name}</h3>
                            {isAi && <Sparkles className="w-3 h-3 text-purple-400" />}
                          </div>
                          <span className="text-[10px] uppercase tracking-wider text-aura-muted px-2 py-1 bg-white/5 rounded-md mt-1 inline-block">
                            {widget.category}
                          </span>
                        </div>
                        <button
                          onClick={() => toggleWidget(widget.id)}
                          className={`p-2 rounded-full transition-colors ${
                            isActive 
                              ? 'bg-blue-500 text-white' 
                              : 'bg-aura-bg border border-aura-border text-aura-text hover:bg-aura-card-hover'
                          }`}
                        >
                          {isActive ? <Check className="w-4 h-4" /> : <Plus className="w-4 h-4" />}
                        </button>
                      </div>
                      <p className="text-sm text-aura-muted mt-3">{widget.description}</p>
                    </div>
                  );
                })}
              </div>
              
              {isGenerating && (
                <div className="flex flex-col items-center justify-center p-8 text-aura-muted mt-4 border border-dashed border-white/10 rounded-2xl bg-black/20">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-500" />
                  <p className="text-sm">AI is generating new widgets...</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
