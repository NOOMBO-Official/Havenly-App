import { useState, useRef } from "react";
import { motion, AnimatePresence } from "motion/react";
import { X, LayoutTemplate, Download, CheckCircle2, Sparkles, Loader2 } from "lucide-react";
import { useSettings } from "../contexts/SettingsContext";
import { GoogleGenAI, Type } from "@google/genai";

interface LayoutLibraryProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function LayoutLibrary({ isOpen, onClose }: LayoutLibraryProps) {
  const { updateSettings } = useSettings();
  const [appliedLayout, setAppliedLayout] = useState<string | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const generatingRef = useRef(false);
  const [aiLayouts, setAiLayouts] = useState<any[]>([]);
  const scrollRef = useRef<HTMLDivElement>(null);

  const defaultLayouts = [
    {
      id: "default",
      name: "Default Dashboard",
      description: "The classic Havenly experience with balanced widgets.",
      author: "Havenly Team",
      downloads: "1.2M",
      activeWidgets: ["quickActions", "smartHome", "weather", "media", "integrations", "calendar"],
      layout: [
        { id: "quickActions", column: 1, order: 0 },
        { id: "smartHome", column: 1, order: 1 },
        { id: "weather", column: 2, order: 0 },
        { id: "media", column: 2, order: 1 },
        { id: "integrations", column: 2, order: 2 },
        { id: "calendar", column: 2, order: 3 },
      ]
    },
    {
      id: "minimal",
      name: "Minimalist Focus",
      description: "Clean and distraction-free layout focusing on essentials.",
      author: "DesignStudio",
      downloads: "850K",
      activeWidgets: ["weather", "calendar", "quickActions"],
      layout: [
        { id: "weather", column: 1, order: 0 },
        { id: "calendar", column: 1, order: 1 },
        { id: "quickActions", column: 2, order: 0 },
      ]
    },
    {
      id: "productivity",
      name: "Productivity Master",
      description: "Optimized for deep work and task management.",
      author: "WorkFlow Pro",
      downloads: "420K",
      activeWidgets: ["notion", "calendar", "googleCalendar", "weather"],
      layout: [
        { id: "notion", column: 1, order: 0 },
        { id: "calendar", column: 2, order: 0 },
        { id: "googleCalendar", column: 2, order: 1 },
        { id: "weather", column: 2, order: 2 },
      ]
    },
    {
      id: "entertainment",
      name: "Media Center",
      description: "Put your music and smart home controls front and center.",
      author: "AudioPhile",
      downloads: "630K",
      activeWidgets: ["media", "smartHome", "quickActions"],
      layout: [
        { id: "media", column: 1, order: 0 },
        { id: "smartHome", column: 2, order: 0 },
        { id: "quickActions", column: 2, order: 1 },
      ]
    }
  ];

  const layouts = [...defaultLayouts, ...aiLayouts];

  const handleScroll = () => {
    if (!scrollRef.current || generatingRef.current) return;
    
    const { scrollTop, scrollHeight, clientHeight } = scrollRef.current;
    if (scrollHeight - scrollTop - clientHeight < 100) {
      generateMoreLayouts();
    }
  };

  const generateMoreLayouts = async () => {
    if (generatingRef.current) return;
    generatingRef.current = true;
    setIsGenerating(true);
    try {
      const apiKey = process.env.GEMINI_API_KEY;
      if (!apiKey) return;

      const ai = new GoogleGenAI({ apiKey });
      const response = await ai.models.generateContent({
        model: "gemini-2.5-flash",
        contents: "Generate 2 unique, highly creative dashboard layout concepts for a smart home/lifestyle app. Available widgets: quickActions, smartHome, weather, media, integrations, calendar, notion, googleCalendar, clock, tasks, finance, health, threed. Return JSON array of objects with keys: id (unique string), name (string), description (string), author (string, e.g. 'AI Architect'), downloads (string like '10K'), activeWidgets (array of strings from available widgets), layout (array of objects with id, column (1 or 2), order (number)).",
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
                author: { type: Type.STRING },
                downloads: { type: Type.STRING },
                activeWidgets: { type: Type.ARRAY, items: { type: Type.STRING } },
                layout: { 
                  type: Type.ARRAY, 
                  items: { 
                    type: Type.OBJECT, 
                    properties: { 
                      id: { type: Type.STRING }, 
                      column: { type: Type.NUMBER }, 
                      order: { type: Type.NUMBER } 
                    } 
                  } 
                }
              }
            }
          }
        }
      });

      let text = response.text?.trim() || "[]";
      let newLayouts = [];
      
      try {
        newLayouts = JSON.parse(text);
      } catch (parseErr) {
        console.warn("JSON parse failed, attempting to repair...", parseErr);
        // Attempt to repair truncated JSON array
        const lastBrace = text.lastIndexOf('}');
        if (lastBrace !== -1) {
          try {
            const fixedText = text.substring(0, lastBrace + 1) + ']';
            newLayouts = JSON.parse(fixedText);
          } catch (e) {
            console.error("Could not repair JSON", e);
          }
        }
      }

      if (Array.isArray(newLayouts) && newLayouts.length > 0) {
        setAiLayouts(prev => [...prev, ...newLayouts]);
      }
    } catch (err) {
      console.error("Failed to generate layouts", err);
    } finally {
      generatingRef.current = false;
      setIsGenerating(false);
    }
  };

  const applyLayout = (layoutConfig: any) => {
    updateSettings({
      activeWidgets: layoutConfig.activeWidgets,
      layout: layoutConfig.layout
    });
    setAppliedLayout(layoutConfig.id);
    setTimeout(() => {
      setAppliedLayout(null);
      onClose();
    }, 1500);
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
            className="fixed left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 w-full max-w-4xl bg-aura-bg border border-aura-border rounded-[2rem] z-[70] overflow-hidden shadow-2xl flex flex-col max-h-[85vh]"
          >
            <div className="p-6 md:p-8 border-b border-aura-border flex justify-between items-center bg-aura-card/50">
              <div className="flex items-center space-x-3">
                <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
                  <LayoutTemplate className="w-6 h-6" />
                </div>
                <div>
                  <h2 className="text-2xl font-display font-medium text-aura-text">Layout Library</h2>
                  <p className="text-sm text-aura-muted">Community-created dashboard configurations</p>
                </div>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-aura-muted hover:text-aura-text transition-colors rounded-full hover:bg-aura-card"
              >
                <X className="w-6 h-6" />
              </button>
            </div>

            <div 
              ref={scrollRef}
              onScroll={handleScroll}
              className="flex-1 overflow-y-auto p-6 md:p-8 custom-scrollbar bg-aura-bg"
            >
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {layouts.map((layout) => {
                  const isAi = layout.author === 'AI Architect' || !defaultLayouts.find(l => l.id === layout.id);
                  
                  return (
                    <div 
                      key={layout.id}
                      className="group flex flex-col p-6 rounded-3xl border border-aura-border bg-aura-card hover:border-purple-500/30 transition-all hover:shadow-lg hover:shadow-purple-500/5"
                    >
                      <div className="flex justify-between items-start mb-4">
                        <div>
                          <div className="flex items-center gap-2">
                            <h3 className="text-xl font-medium text-aura-text group-hover:text-purple-400 transition-colors">{layout.name}</h3>
                            {isAi && <Sparkles className="w-4 h-4 text-purple-400" />}
                          </div>
                          <p className="text-xs text-aura-muted mt-1">By {layout.author}</p>
                        </div>
                        <div className="flex items-center space-x-1 text-xs text-aura-muted bg-white/5 px-2 py-1 rounded-md">
                          <Download className="w-3 h-3" />
                          <span>{layout.downloads}</span>
                        </div>
                      </div>
                      
                      <p className="text-sm text-aura-muted mb-6 flex-1">{layout.description}</p>
                      
                      <div className="flex flex-wrap gap-2 mb-6">
                        {layout.activeWidgets.map((w: string) => (
                          <span key={w} className="text-[10px] uppercase tracking-wider text-aura-muted px-2 py-1 bg-white/5 border border-white/10 rounded-md">
                            {w.replace(/([A-Z])/g, " $1").trim()}
                          </span>
                        ))}
                      </div>

                      <button
                        onClick={() => applyLayout(layout)}
                        disabled={appliedLayout === layout.id}
                        className={`w-full py-3 rounded-xl font-medium flex items-center justify-center space-x-2 transition-all ${
                          appliedLayout === layout.id
                            ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                            : 'bg-purple-500 text-white hover:bg-purple-600'
                        }`}
                      >
                        {appliedLayout === layout.id ? (
                          <>
                            <CheckCircle2 className="w-5 h-5" />
                            <span>Applied!</span>
                          </>
                        ) : (
                          <span>Apply Layout</span>
                        )}
                      </button>
                    </div>
                  );
                })}
              </div>

              {isGenerating && (
                <div className="flex flex-col items-center justify-center p-8 text-aura-muted mt-6 border border-dashed border-white/10 rounded-3xl bg-black/20">
                  <Loader2 className="w-6 h-6 animate-spin mb-2 text-purple-500" />
                  <p className="text-sm">AI is designing new layouts...</p>
                </div>
              )}
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
