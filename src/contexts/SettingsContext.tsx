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
  use24HourFormat: boolean;
  screenTimeout: number; // in milliseconds, 0 for never
  webcamUrl: string;
  webcamUsername?: string;
  webcamPassword?: string;
  nowPanelMode: 'widget' | 'panel';
  autopilotMode: 'off' | 'productivity' | 'relax' | 'focus';
  tapToExpand: boolean;
  hapticsEnabled: boolean;
  wallpaperMode: 'dynamic' | 'static' | 'time-of-day' | 'weather';
}

interface SettingsContextType {
  settings: Settings;
  updateSettings: (newSettings: Partial<Settings>) => void;
  exportPreset: (password: string) => Promise<void>;
  importPreset: (file: File, password: string) => Promise<void>;
}

const defaultSettings: Settings = {
  theme: "dark",
  userName: "Guest",
  onboardingCompleted: false,
  weatherLocation: "New York, NY",
  activeWidgets: [
    "quickActions",
    "smartHome",
    "smartStack",
    "weather",
    "media",
    "integrations",
    "calendar",
    "clock",
    "news",
    "intelligentNow",
    "nocdConnect",
    "todo",
    "fitness",
    "devices",
    "screenTime",
    "photos",
    "music",
    "imagePlayground"
  ],
  layout: [
    { id: "intelligentNow", column: 1, order: 0 },
    { id: "quickActions", column: 1, order: 1 },
    { id: "smartHome", column: 1, order: 2 },
    { id: "nocdConnect", column: 1, order: 3 },
    { id: "todo", column: 1, order: 4 },
    { id: "fitness", column: 1, order: 5 },
    { id: "devices", column: 1, order: 6 },
    { id: "smartStack", column: 2, order: 0 },
    { id: "weather", column: 2, order: 1 },
    { id: "photos", column: 2, order: 2 },
    { id: "music", column: 2, order: 3 },
    { id: "imagePlayground", column: 2, order: 4 },
    { id: "screenTime", column: 2, order: 5 },
    { id: "media", column: 2, order: 6 },
    { id: "integrations", column: 2, order: 7 },
    { id: "calendar", column: 2, order: 8 },
    { id: "news", column: 2, order: 9 },
    { id: "notion", column: 2, order: 10 },
    { id: "clock", column: 2, order: 11 },
  ],
  integrations: {
    spotify: false,
    pinterest: false,
    hue: false,
  },
  aiWidgets: [],
  use24HourFormat: false,
  screenTimeout: 0,
  webcamUrl: "",
  nowPanelMode: 'widget',
  autopilotMode: 'off',
  tapToExpand: true,
  hapticsEnabled: true,
  wallpaperMode: 'time-of-day',
};

const SettingsContext = createContext<SettingsContextType | undefined>(
  undefined,
);

export function SettingsProvider({ children }: { children: ReactNode }) {
  const { user, loading: authLoading } = useAuth();
  const [settings, setSettings] = useState<Settings>(() => {
    const saved = localStorage.getItem("havenly_settings");
    if (saved) {
      try {
        return { ...defaultSettings, ...JSON.parse(saved) };
      } catch (e) {
        console.error("Failed to parse settings from localStorage:", e);
        return defaultSettings;
      }
    }
    return defaultSettings;
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

  const exportPreset = async (password: string) => {
    try {
      const dataToExport = JSON.stringify(settings);
      
      // Simple encryption using Web Crypto API
      const enc = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
      );
      const salt = window.crypto.getRandomValues(new Uint8Array(16));
      const key = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );
      
      const iv = window.crypto.getRandomValues(new Uint8Array(12));
      const encryptedContent = await window.crypto.subtle.encrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        enc.encode(dataToExport)
      );

      const exportedData = {
        salt: Array.from(salt),
        iv: Array.from(iv),
        data: Array.from(new Uint8Array(encryptedContent))
      };

      const blob = new Blob([JSON.stringify(exportedData)], { type: "application/json" });
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = "havenly-preset.json";
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    } catch (error) {
      console.error("Failed to export preset:", error);
      alert("Failed to export preset. Please try again.");
    }
  };

  const importPreset = async (file: File, password: string) => {
    try {
      const text = await file.text();
      const importedData = JSON.parse(text);
      
      const salt = new Uint8Array(importedData.salt);
      const iv = new Uint8Array(importedData.iv);
      const data = new Uint8Array(importedData.data);

      const enc = new TextEncoder();
      const keyMaterial = await window.crypto.subtle.importKey(
        "raw",
        enc.encode(password),
        { name: "PBKDF2" },
        false,
        ["deriveBits", "deriveKey"]
      );
      
      const key = await window.crypto.subtle.deriveKey(
        {
          name: "PBKDF2",
          salt: salt,
          iterations: 100000,
          hash: "SHA-256"
        },
        keyMaterial,
        { name: "AES-GCM", length: 256 },
        true,
        ["encrypt", "decrypt"]
      );

      const decryptedContent = await window.crypto.subtle.decrypt(
        {
          name: "AES-GCM",
          iv: iv
        },
        key,
        data
      );

      const dec = new TextDecoder();
      const decryptedString = dec.decode(decryptedContent);
      const newSettings = JSON.parse(decryptedString);
      
      updateSettings(newSettings);
      alert("Preset imported successfully!");
    } catch (error) {
      console.error("Failed to import preset:", error);
      alert("Failed to import preset. Incorrect password or invalid file.");
    }
  };

  if (loading) {
    return null; // Or a loading spinner
  }

  return (
    <SettingsContext.Provider value={{ settings, updateSettings, exportPreset, importPreset }}>
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
