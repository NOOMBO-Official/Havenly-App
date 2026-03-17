import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Bell, X, CheckCircle2, MessageSquare, AlertTriangle, Info, Sparkles } from 'lucide-react';

interface NotificationsModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function NotificationsModal({ isOpen, onClose }: NotificationsModalProps) {
  const [notifications, setNotifications] = useState([
    { id: 1, type: 'alert', title: 'Front Door Unlocked', message: 'The front door has been unlocked for 10 minutes.', time: '2m ago', icon: AlertTriangle, color: 'text-amber-500', bg: 'bg-amber-500/20' },
    { id: 2, type: 'message', title: 'New Message from Sarah', message: 'Hey, are we still on for dinner tonight?', time: '15m ago', icon: MessageSquare, color: 'text-blue-500', bg: 'bg-blue-500/20' },
    { id: 3, type: 'system', title: 'System Update Available', message: 'Havenly OS v1.1.1 is ready to install.', time: '1h ago', icon: Info, color: 'text-purple-500', bg: 'bg-purple-500/20' },
    { id: 4, type: 'success', title: 'Laundry Finished', message: 'Your laundry cycle is complete.', time: '2h ago', icon: CheckCircle2, color: 'text-emerald-500', bg: 'bg-emerald-500/20' },
  ]);

  const [aiSummary, setAiSummary] = useState<string | null>(null);
  const [isSummarizing, setIsSummarizing] = useState(false);

  useEffect(() => {
    if (isOpen && notifications.length > 0 && !aiSummary) {
      setIsSummarizing(true);
      // Mock AI summary generation
      setTimeout(() => {
        setAiSummary("You have a security alert regarding the front door, a message from Sarah, and a system update pending.");
        setIsSummarizing(false);
      }, 1500);
    }
  }, [isOpen, notifications.length, aiSummary]);

  const clearNotification = (id: number) => {
    setNotifications(prev => prev.filter(n => n.id !== id));
  };

  const clearAll = () => {
    setNotifications([]);
    setAiSummary(null);
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
            className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[100]"
          />
          <motion.div
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 25, stiffness: 200 }}
            className="fixed right-0 top-0 bottom-0 w-full max-w-md bg-aura-bg border-l border-aura-border z-[115] p-6 pb-24 md:pb-6 overflow-y-auto shadow-2xl flex flex-col"
          >
            <div className="flex justify-between items-center mb-8">
              <div className="flex items-center gap-3">
                <div className="p-2 bg-blue-500/20 text-blue-400 rounded-xl">
                  <Bell className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-aura-text">
                  Notifications
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-aura-muted hover:text-aura-text bg-black/5 dark:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            {notifications.length > 0 ? (
              <>
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-3">
                    <h3 className="text-xs font-semibold text-aura-muted uppercase tracking-wider">AI Summary</h3>
                  </div>
                  <div className="p-4 rounded-2xl apple-glass-heavy border border-purple-500/30 relative overflow-hidden group">
                    <div className="absolute inset-0 bg-gradient-to-br from-purple-500/10 to-transparent opacity-50" />
                    <div className="relative z-10 flex gap-3">
                      <Sparkles className={`w-5 h-5 text-purple-400 shrink-0 mt-0.5 ${isSummarizing ? 'animate-pulse' : ''}`} />
                      <p className="text-sm text-aura-text leading-relaxed">
                        {isSummarizing ? "AVA is summarizing your notifications..." : aiSummary}
                      </p>
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-between mb-4">
                  <h3 className="text-xs font-semibold text-aura-muted uppercase tracking-wider">Recent</h3>
                  <button onClick={clearAll} className="text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors">
                    Clear All
                  </button>
                </div>

                <div className="space-y-3 flex-1">
                  <AnimatePresence>
                    {notifications.map((notif) => (
                      <motion.div
                        key={notif.id}
                        initial={{ opacity: 0, y: 20, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, scale: 0.95, x: 100 }}
                        layout
                        className="p-4 rounded-2xl apple-glass-heavy border border-white/10 relative group"
                      >
                        <div className="flex gap-4">
                          <div className={`p-2.5 rounded-xl ${notif.bg} ${notif.color} shrink-0 h-fit`}>
                            <notif.icon className="w-5 h-5" />
                          </div>
                          <div className="flex-1 min-w-0">
                            <div className="flex justify-between items-start mb-1">
                              <h4 className="text-sm font-semibold text-aura-text truncate pr-4">{notif.title}</h4>
                              <span className="text-[10px] font-medium text-aura-muted whitespace-nowrap">{notif.time}</span>
                            </div>
                            <p className="text-xs text-aura-muted leading-relaxed line-clamp-2">{notif.message}</p>
                          </div>
                        </div>
                        <button
                          onClick={() => clearNotification(notif.id)}
                          className="absolute top-2 right-2 p-1.5 text-aura-muted hover:text-white bg-black/20 hover:bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-all"
                        >
                          <X className="w-3 h-3" />
                        </button>
                      </motion.div>
                    ))}
                  </AnimatePresence>
                </div>
              </>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-aura-muted">
                <Bell className="w-12 h-12 mb-4 opacity-20" />
                <p className="text-sm font-medium">No new notifications</p>
                <p className="text-xs mt-1 opacity-60">You're all caught up!</p>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
