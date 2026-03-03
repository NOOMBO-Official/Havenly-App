import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import { supabase } from "../lib/supabase";
import { useAuth } from "./AuthContext";

type Theme = "dark" | "light" | "midnight";

interface AiWidget {
  id: string;
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

interface Settings {
  theme: Theme;
  userName: string;
  onboardingCompleted: boolean;
  weatherLocation: string;
  activeWidgets: string[];
  layout: { id: string; column: number; order: number }[];
  integrations: Record<string, boolean>;
  aiWidgets: AiWidget[];
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
}

const defaultSettings: Settings = {
  theme: "dark",
  userName: "Guest",
  onboardingCompleted: false,
  weatherLocation: "New York, NY",
  activeWidgets: [
    "quickActions",
    "smartHome",
    "weather",
    "media",
    "integrations",
    "calendar",
    "clock",
  ],
  layout: [
    { id: "quickActions", column: 1, order: 0 },
    { id: "smartHome", column: 1, order: 1 },
    { id: "weather", column: 2, order: 0 },
    { id: "media", column: 2, order: 1 },
    { id: "integrations", column: 2, order: 2 },
    { id: "calendar", column: 2, order: 3 },
    { id: "notion", column: 2, order: 4 },
    { id: "clock", column: 2, order: 5 },
  ],
  integrations: {
    spotify: false,
    pinterest: false,
    hue: false,
  },
  aiWidgets: [],
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("havenly_settings");
    return saved ? { ...defaultSettings, ...JSON.parse(saved) } : defaultSettings;
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    localStorage.setItem("havenly_settings", JSON.stringify(settings));
  }, [settings]);

  useEffect(() => {
    if (authLoading) return;
    
    if (user) {
      fetchSettings();
    } else {
      setLoading(false);
    }
  }, [user, authLoading]);

  const fetchSettings = async () => {
    try {
      const { data, error } = await supabase
        .from("user_settings")
        .select("*")
        .eq("id", user?.id)
        .single();

      if (error) throw error;

      if (data) {
        setSettings((prev) => ({
          ...prev,
          theme: data.theme || prev.theme,
          userName: data.user_name || prev.userName,
          onboardingCompleted: data.onboarding_completed ?? prev.onboardingCompleted,
        }));
      }
    } catch (error) {
      console.error("Error fetching settings:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", settings.theme);
  }, [settings.theme]);

  const updateSettings = async (newSettings: Partial<Settings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    if (user) {
      try {
        const updates: any = {};
        if (newSettings.theme !== undefined) updates.theme = newSettings.theme;
        if (newSettings.userName !== undefined) updates.user_name = newSettings.userName;
        if (newSettings.onboardingCompleted !== undefined) updates.onboarding_completed = newSettings.onboardingCompleted;
        // In a real app, we'd add layout column to user_settings table, but for now we'll just use local state for layout if it's not in DB
        // Or we can just store it in local storage as a fallback for now.

        if (Object.keys(updates).length > 0) {
          const { error } = await supabase
            .from("user_settings")
            .update(updates)
            .eq("id", user.id);

          if (error) throw error;
        }
      } catch (error) {
        console.error("Error updating settings:", error);
      }
    }
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings }}>
      {children}
    </SettingsContext.Provider>
  );
}

export function useSettings() {
  const context = useContext(SettingsContext);
  if (!context)
    throw new Error("useSettings must be used within SettingsProvider");
  return context;
}
