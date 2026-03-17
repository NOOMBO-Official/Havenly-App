import { useState, useRef, useEffect } from 'react';
import { motion, AnimatePresence, useMotionValue, useSpring, useTransform } from 'motion/react';
import { Home, LayoutGrid, Settings, Bell, Search, User, MessageSquare, Sparkles, Coffee, Briefcase, Moon, Music, Image as ImageIcon, Calendar, Mail, Map as MapIcon, CloudSun, FileText, Calculator, Camera, Compass, TrendingUp, List, Users, Mic2 } from 'lucide-react';
import { useSettings } from '../contexts/SettingsContext';
import { useHaptics } from '../hooks/useHaptics';

interface DockProps {
  onOpenSearch: () => void;
  onOpenNotifications: () => void;
  onOpenProfile: () => void;
  onOpenSettings: () => void;
  onOpenChat: () => void;
  onOpenWidgets: () => void;
  onOpenScreenAnalysis: () => void;
  onOpenPhotos: () => void;
  onOpenMusic: () => void;
  onOpenCalendar: () => void;
  onOpenMail: () => void;
  onOpenMaps: () => void;
  onOpenWeather: () => void;
  onOpenNotes: () => void;
  onOpenCalculator: () => void;
  onOpenCamera: () => void;
  onOpenBrowser: () => void;
  onOpenStocks: () => void;
  onOpenReminders: () => void;
  onOpenContacts: () => void;
  onOpenPodcasts: () => void;
  activeApp: string | null;
  onGoHome: () => void;
}

function DockIcon({ 
  icon: Icon, 
  label, 
  mouseX, 
  onClick, 
  isActive,
  isSpecial = false
}: { 
  icon: any, 
  label: string, 
  mouseX: any, 
  onClick: () => void,
  isActive?: boolean,
  isSpecial?: boolean
}) {
  const ref = useRef<HTMLButtonElement>(null);
  const [isHovered, setIsHovered] = useState(false);
  const haptics = useHaptics();

  // Calculate distance from mouse to the center of this icon
  const distance = useTransform(mouseX, (val: number) => {
    const bounds = ref.current?.getBoundingClientRect() ?? { x: 0, width: 0 };
    return val - bounds.x - bounds.width / 2;
  });

  // Transform distance into a scale value
  const scaleSync = useTransform(distance, [-150, 0, 150], [1, 1.5, 1]);
  const scale = useSpring(scaleSync, { mass: 0.1, stiffness: 150, damping: 12 });

  const handleClick = () => {
    haptics.trigger('light');
    onClick();
  };

  return (
    <div className="relative group flex flex-col items-center shrink-0">
      <motion.button
        ref={ref}
        style={{ scale }}
        onClick={handleClick}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        className={`w-10 h-10 md:w-12 md:h-12 rounded-xl md:rounded-2xl flex items-center justify-center shadow-lg border backdrop-blur-md transition-colors origin-bottom ${
          isSpecial 
            ? 'bg-gradient-to-br from-purple-500/20 to-blue-500/20 hover:from-purple-500/30 hover:to-blue-500/30 border-purple-500/30 text-purple-400' 
            : 'bg-black/10 dark:bg-white/10 hover:bg-black/20 dark:hover:bg-white/20 border-white/10 text-aura-text'
        }`}
      >
        <Icon className="w-5 h-5 md:w-6 md:h-6" strokeWidth={1.5} />
        {isSpecial && (
          <div className="absolute inset-0 rounded-xl md:rounded-2xl bg-gradient-to-br from-purple-500/20 to-blue-500/20 blur-md -z-10 animate-pulse" />
        )}
      </motion.button>
      
      {/* Tooltip */}
      <AnimatePresence>
        {isHovered && (
          <motion.div
            initial={{ opacity: 0, y: 10, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: 5, scale: 0.9 }}
            className="absolute -top-12 px-3 py-1.5 bg-black/80 dark:bg-white/80 text-white dark:text-black text-xs font-semibold tracking-tight rounded-lg whitespace-nowrap backdrop-blur-md border border-white/10 shadow-lg z-50 pointer-events-none"
          >
            {label}
          </motion.div>
        )}
      </AnimatePresence>
      
      {/* Active dot indicator */}
      {isActive && (
        <div className="absolute -bottom-2 w-1 h-1 bg-aura-text/50 rounded-full" />
      )}
    </div>
  );
}

export default function Dock({
  onOpenSearch,
  onOpenNotifications,
  onOpenProfile,
  onOpenSettings,
  onOpenChat,
  onOpenWidgets,
  onOpenScreenAnalysis,
  onOpenPhotos,
  onOpenMusic,
  onOpenCalendar,
  onOpenMail,
  onOpenMaps,
  onOpenWeather,
  onOpenNotes,
  onOpenCalculator,
  onOpenCamera,
  onOpenBrowser,
  onOpenStocks,
  onOpenReminders,
  onOpenContacts,
  onOpenPodcasts,
  activeApp,
  onGoHome
}: DockProps) {
  const mouseX = useMotionValue(Infinity);
  const { settings, updateSettings } = useSettings();
  const [recentApps, setRecentApps] = useState<{icon: any, label: string}[]>([]);
  const [isVisible, setIsVisible] = useState(true);

  useEffect(() => {
    // Simulate dynamic recent apps based on time/context
    const hour = new Date().getHours();
    if (hour < 12) {
      setRecentApps([{ icon: Coffee, label: 'Morning Routine' }]);
    } else if (hour < 18) {
      setRecentApps([{ icon: Briefcase, label: 'Work Focus' }]);
    } else {
      setRecentApps([{ icon: Moon, label: 'Wind Down' }]);
    }
  }, []);

  const toggleFocusMode = () => {
    const modes = ['off', 'focus', 'relax'];
    const currentIndex = modes.indexOf(settings.autopilotMode);
    const nextMode = modes[(currentIndex + 1) % modes.length] as any;
    updateSettings({ autopilotMode: nextMode });
  };

  const icons = [
    { icon: Home, label: 'Home', action: () => { onGoHome(); window.scrollTo({ top: 0, behavior: 'smooth' }); }, active: activeApp === null },
    { icon: LayoutGrid, label: 'App Library', action: onOpenWidgets },
    { icon: Search, label: 'Spotlight', action: onOpenSearch },
    { icon: MessageSquare, label: 'AVA Chat', action: onOpenChat },
    { icon: Compass, label: 'Safari', action: onOpenBrowser, active: activeApp === 'browser' },
    { icon: Mail, label: 'Mail', action: onOpenMail, active: activeApp === 'mail' },
    { icon: Users, label: 'Contacts', action: onOpenContacts, active: activeApp === 'contacts' },
    { icon: ImageIcon, label: 'Photos', action: onOpenPhotos, active: activeApp === 'photos' },
    { icon: Camera, label: 'Camera', action: onOpenCamera, active: activeApp === 'camera' },
    { icon: Music, label: 'Music', action: onOpenMusic, active: activeApp === 'music' },
    { icon: Mic2, label: 'Podcasts', action: onOpenPodcasts, active: activeApp === 'podcasts' },
    { icon: Calendar, label: 'Calendar', action: onOpenCalendar, active: activeApp === 'calendar' },
    { icon: MapIcon, label: 'Maps', action: onOpenMaps, active: activeApp === 'maps' },
    { icon: CloudSun, label: 'Weather', action: onOpenWeather, active: activeApp === 'weather' },
    { icon: FileText, label: 'Notes', action: onOpenNotes, active: activeApp === 'notes' },
    { icon: Calculator, label: 'Calculator', action: onOpenCalculator, active: activeApp === 'calculator' },
    { icon: TrendingUp, label: 'Stocks', action: onOpenStocks, active: activeApp === 'stocks' },
    { icon: List, label: 'Reminders', action: onOpenReminders, active: activeApp === 'reminders' },
    { icon: Bell, label: 'Notifications', action: onOpenNotifications },
    { icon: User, label: 'Profile', action: onOpenProfile },
    { icon: Settings, label: 'Settings', action: onOpenSettings },
  ];

  return (
    <>
      {/* Invisible area to catch swipe up to reveal dock */}
      <motion.div 
        className="fixed bottom-0 left-0 right-0 h-8 z-[130] touch-none"
        style={{ pointerEvents: isVisible ? 'none' : 'auto' }}
        onPanEnd={(e, info) => {
          if (info.offset.y < -20) {
            setIsVisible(true);
          }
        }}
      />

      <motion.div 
        className="fixed bottom-2 md:bottom-6 left-0 right-0 z-[120] flex justify-center pointer-events-none"
        initial={false}
        animate={{ y: isVisible ? 0 : 150, opacity: isVisible ? 1 : 0 }}
        transition={{ type: "spring", damping: 25, stiffness: 300 }}
      >
        <div className="w-full overflow-x-auto no-scrollbar pointer-events-auto px-4 pt-20 -mt-20 pb-10 -mb-10 flex justify-start md:justify-center">
          <motion.div 
            onMouseMove={(e) => mouseX.set(e.pageX)}
            onMouseLeave={() => mouseX.set(Infinity)}
            onPanEnd={(e, info) => {
              if (info.offset.y > 30) {
                setIsVisible(false);
              }
            }}
            className="apple-glass-heavy rounded-[32px] px-3 md:px-4 py-2 md:py-3 flex items-end gap-2 md:gap-3 shadow-2xl border border-white/20 h-[64px] md:h-[72px] min-w-max mx-auto touch-pan-x"
          >
            {/* Main Apps */}
            {icons.map((item) => (
              <div key={item.label} className={item.hideOnMobile ? 'hidden md:block' : 'block'}>
                <DockIcon 
                  icon={item.icon} 
                  label={item.label} 
                  mouseX={mouseX} 
                  onClick={item.action}
                  isActive={item.active}
                />
              </div>
            ))}

            {/* Divider */}
            <div className="w-[1px] h-8 md:h-10 bg-white/20 mx-1 self-center rounded-full shrink-0" />

            {/* AI Magic Button */}
            <DockIcon 
              icon={Sparkles} 
              label="AI Magic" 
              mouseX={mouseX} 
              onClick={onOpenScreenAnalysis}
              isSpecial={true}
            />

            {/* Dynamic Recents / Contextual Suggestions */}
            {recentApps.map((item) => (
              <DockIcon 
                key={item.label} 
                icon={item.icon} 
                label={item.label} 
                mouseX={mouseX} 
                onClick={toggleFocusMode}
              />
            ))}
          </motion.div>
        </div>
      </motion.div>
    </>
  );
}
