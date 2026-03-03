import Clock from "./components/Clock";
import AiInsight from "./components/AiInsight";
import SystemStatus from "./components/SystemStatus";
import SettingsPanel from "./components/SettingsPanel";
import DynamicIsland from "./components/DynamicIsland";
import ControlCenter from "./components/ControlCenter";
import AppStore from "./components/AppStore";
import AiChatModal from "./components/AiChatModal";
import WelcomeScreen from "./components/WelcomeScreen";
import Onboarding from "./components/Onboarding";
import WidgetGrid from "./components/WidgetGrid";
import AiWaveform from "./components/AiWaveform";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SmartHomeProvider } from "./contexts/SmartHomeContext";
import { AiProvider } from "./contexts/AiContext";
import { MessageSquare } from "lucide-react";
import { useState } from "react";

function Dashboard() {
  const { settings } = useSettings();
  const { user, loading } = useAuth();
  const [isChatOpen, setIsChatOpen] = useState(false);

  if (loading) {
    return <div className="min-h-screen bg-aura-bg flex items-center justify-center text-aura-text">Loading...</div>;
  }

  if (!user) {
    return <WelcomeScreen />;
  }

  if (!settings.onboardingCompleted) {
    return <Onboarding />;
  }

  return (
    <div className="min-h-screen bg-aura-bg text-aura-text p-6 md:p-12 lg:p-24 selection:bg-aura-border transition-colors duration-500 overflow-x-hidden">
      <div className="max-w-7xl mx-auto space-y-12 md:space-y-24 pb-24">
        {/* Header Section */}
        <header className="flex flex-col md:flex-row md:items-end justify-between gap-8">
          <Clock />
          <div className="flex items-center gap-4 md:w-1/2 justify-end">
            <div className="flex-1 max-w-md">
              <AiInsight />
            </div>
            <button
              onClick={() => setIsChatOpen(true)}
              className="p-3 bg-white/5 hover:bg-white/10 border border-white/10 rounded-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 text-white/70 hover:text-white"
            >
              <MessageSquare className="w-6 h-6" />
            </button>
            <AppStore />
            <ControlCenter />
            <SettingsPanel />
          </div>
        </header>

        {/* Main Grid Section */}
        <WidgetGrid />

        <SystemStatus />
      </div>
      <DynamicIsland />
      <AiWaveform />
      <AiChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
    </div>
  );
}

export default function App() {
  return (
    <AuthProvider>
      <SettingsProvider>
        <SmartHomeProvider>
          <AiProvider>
            <Dashboard />
          </AiProvider>
        </SmartHomeProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
