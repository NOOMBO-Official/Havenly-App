import Clock from "./components/Clock";
import AiInsight from "./components/AiInsight";
import SystemStatus from "./components/SystemStatus";
import SettingsPanel from "./components/SettingsPanel";
import DynamicIsland from "./components/DynamicIsland";
import ControlCenter from "./components/ControlCenter";
import AiChatModal from "./components/AiChatModal";
import WelcomeScreen from "./components/WelcomeScreen";
import Onboarding from "./components/Onboarding";
import WidgetGrid from "./components/WidgetGrid";
import AiWaveform from "./components/AiWaveform";
import PhotoCollage from "./components/PhotoCollage";
import SwipeWebcamScreen from "./components/SwipeWebcamScreen";
import DailyBrief from "./components/DailyBrief";
import LiveActivityCapsules from "./components/LiveActivityCapsules";
import IntelligentNow from "./components/IntelligentNow";
import AppIntro from "./components/AppIntro";
import Dock from "./components/Dock";
import AiSearchModal from "./components/AiSearchModal";
import NotificationsModal from "./components/NotificationsModal";
import ProfileModal from "./components/ProfileModal";
import AppLibraryModal from "./components/AppLibraryModal";
import DynamicWallpaper from "./components/DynamicWallpaper";
import ScreenAnalysisOverlay from "./components/ScreenAnalysisOverlay";
import PhotosModal from "./components/PhotosModal";
import MusicModal from "./components/MusicModal";
import CalendarModal from "./components/CalendarModal";
import MailModal from "./components/MailModal";
import MapsModal from "./components/MapsModal";
import WeatherModal from "./components/WeatherModal";
import NotesModal from "./components/NotesModal";
import CalculatorModal from "./components/CalculatorModal";
import CameraModal from "./components/CameraModal";
import BrowserModal from "./components/BrowserModal";
import StocksModal from "./components/StocksModal";
import RemindersModal from "./components/RemindersModal";
import ContactsModal from "./components/ContactsModal";
import PodcastsModal from "./components/PodcastsModal";
import { SettingsProvider, useSettings } from "./contexts/SettingsContext";
import { AuthProvider, useAuth } from "./contexts/AuthContext";
import { SmartHomeProvider } from "./contexts/SmartHomeContext";
import { AiProvider } from "./contexts/AiContext";
import { TimersProvider } from "./contexts/TimersContext";
import { SpotifyProvider } from "./contexts/SpotifyContext";
import { MessageSquare, Settings } from "lucide-react";
import { useState } from "react";
import { Toaster } from 'sonner';

function Dashboard() {
  const { settings } = useSettings();
  const { user, loading } = useAuth();
  const [isSettingsOpen, setIsSettingsOpen] = useState(false);
  const [isChatOpen, setIsChatOpen] = useState(false);
  const [isSearchOpen, setIsSearchOpen] = useState(false);
  const [isNotificationsOpen, setIsNotificationsOpen] = useState(false);
  const [isProfileOpen, setIsProfileOpen] = useState(false);
  const [isAppLibraryOpen, setIsAppLibraryOpen] = useState(false);
  const [isScreenAnalysisOpen, setIsScreenAnalysisOpen] = useState(false);

  type AppId = 'photos' | 'music' | 'calendar' | 'mail' | 'maps' | 'weather' | 'notes' | 'calculator' | 'camera' | 'browser' | 'stocks' | 'reminders' | 'contacts' | 'podcasts' | null;
  const [activeApp, setActiveApp] = useState<AppId>(null);

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
    <SwipeWebcamScreen>
      <DynamicWallpaper />
      <div className={`min-h-screen text-aura-text selection:bg-aura-border transition-colors duration-500 overflow-x-hidden relative ${activeApp ? 'fullscreen-app-mode' : 'p-6 md:p-12 lg:p-24'}`}>
        <Toaster theme={settings.theme === 'light' ? 'light' : 'dark'} position="top-right" />
        
        {/* Dashboard Content - Hidden when an app is active */}
        <div className={activeApp ? 'hidden' : 'block'}>
          <LiveActivityCapsules />
          {settings.nowPanelMode === 'panel' && <IntelligentNow />}
          
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
                  className="p-3 apple-glass-heavy hover:bg-black/20 dark:hover:bg-white/20 rounded-2xl backdrop-blur-xl transition-all hover:scale-105 active:scale-95 text-aura-text"
                >
                  <MessageSquare className="w-6 h-6" />
                </button>
                <ControlCenter />
                <button
                  onClick={() => setIsSettingsOpen(true)}
                  className="p-3 rounded-full apple-glass-heavy text-aura-text transition-colors hover:bg-black/20 dark:hover:bg-white/20"
                >
                  <Settings className="w-5 h-5" strokeWidth={1.5} />
                </button>
                <SettingsPanel isOpen={isSettingsOpen} setIsOpen={setIsSettingsOpen} />
              </div>
            </header>

            {/* Daily Brief */}
            <DailyBrief />

            {/* Main Grid Section */}
            <WidgetGrid />

            <SystemStatus />
          </div>
          <DynamicIsland />
          <AiWaveform />
        </div>
        
        {/* Modals & Overlays */}
        <AiChatModal isOpen={isChatOpen} onClose={() => setIsChatOpen(false)} />
        <AiSearchModal isOpen={isSearchOpen} onClose={() => setIsSearchOpen(false)} />
        <NotificationsModal isOpen={isNotificationsOpen} onClose={() => setIsNotificationsOpen(false)} />
        <ProfileModal isOpen={isProfileOpen} onClose={() => setIsProfileOpen(false)} onOpenSettings={() => setIsSettingsOpen(true)} />
        <AppLibraryModal isOpen={isAppLibraryOpen} onClose={() => setIsAppLibraryOpen(false)} />
        <ScreenAnalysisOverlay isOpen={isScreenAnalysisOpen} onClose={() => setIsScreenAnalysisOpen(false)} />
        
        {/* Fullscreen Apps */}
        <PhotosModal isOpen={activeApp === 'photos'} onClose={() => setActiveApp(null)} />
        <MusicModal isOpen={activeApp === 'music'} onClose={() => setActiveApp(null)} />
        <CalendarModal isOpen={activeApp === 'calendar'} onClose={() => setActiveApp(null)} />
        <MailModal isOpen={activeApp === 'mail'} onClose={() => setActiveApp(null)} />
        <MapsModal isOpen={activeApp === 'maps'} onClose={() => setActiveApp(null)} />
        <WeatherModal isOpen={activeApp === 'weather'} onClose={() => setActiveApp(null)} />
        <NotesModal isOpen={activeApp === 'notes'} onClose={() => setActiveApp(null)} />
        <CalculatorModal isOpen={activeApp === 'calculator'} onClose={() => setActiveApp(null)} />
        <CameraModal isOpen={activeApp === 'camera'} onClose={() => setActiveApp(null)} />
        <BrowserModal isOpen={activeApp === 'browser'} onClose={() => setActiveApp(null)} />
        <StocksModal isOpen={activeApp === 'stocks'} onClose={() => setActiveApp(null)} />
        <RemindersModal isOpen={activeApp === 'reminders'} onClose={() => setActiveApp(null)} />
        <ContactsModal isOpen={activeApp === 'contacts'} onClose={() => setActiveApp(null)} />
        <PodcastsModal isOpen={activeApp === 'podcasts'} onClose={() => setActiveApp(null)} />
        
        <PhotoCollage />
        <Dock 
          onOpenSearch={() => setIsSearchOpen(true)}
          onOpenNotifications={() => setIsNotificationsOpen(true)}
          onOpenProfile={() => setIsProfileOpen(true)}
          onOpenSettings={() => setIsSettingsOpen(true)}
          onOpenChat={() => setIsChatOpen(true)}
          onOpenWidgets={() => setIsAppLibraryOpen(true)}
          onOpenScreenAnalysis={() => setIsScreenAnalysisOpen(true)}
          onOpenPhotos={() => setActiveApp('photos')}
          onOpenMusic={() => setActiveApp('music')}
          onOpenCalendar={() => setActiveApp('calendar')}
          onOpenMail={() => setActiveApp('mail')}
          onOpenMaps={() => setActiveApp('maps')}
          onOpenWeather={() => setActiveApp('weather')}
          onOpenNotes={() => setActiveApp('notes')}
          onOpenCalculator={() => setActiveApp('calculator')}
          onOpenCamera={() => setActiveApp('camera')}
          onOpenBrowser={() => setActiveApp('browser')}
          onOpenStocks={() => setActiveApp('stocks')}
          onOpenReminders={() => setActiveApp('reminders')}
          onOpenContacts={() => setActiveApp('contacts')}
          onOpenPodcasts={() => setActiveApp('podcasts')}
          activeApp={activeApp}
          onGoHome={() => setActiveApp(null)}
        />
      </div>
    </SwipeWebcamScreen>
  );
}

export default function App() {
  const [showIntro, setShowIntro] = useState(true);

  return (
    <AuthProvider>
      <SettingsProvider>
        <SpotifyProvider>
          <SmartHomeProvider>
            <AiProvider>
              <TimersProvider>
                {showIntro && <AppIntro onComplete={() => setShowIntro(false)} />}
                <Dashboard />
              </TimersProvider>
            </AiProvider>
          </SmartHomeProvider>
        </SpotifyProvider>
      </SettingsProvider>
    </AuthProvider>
  );
}
