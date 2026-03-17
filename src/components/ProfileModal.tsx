import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { User, X, LogOut, Settings, Shield, CreditCard, Bell, ChevronRight, Camera } from 'lucide-react';
import { useAuth } from '../contexts/AuthContext';
import { useSettings } from '../contexts/SettingsContext';

interface ProfileModalProps {
  isOpen: boolean;
  onClose: () => void;
  onOpenSettings: () => void;
}

export default function ProfileModal({ isOpen, onClose, onOpenSettings }: ProfileModalProps) {
  const { user, signOut } = useAuth();
  const { settings } = useSettings();
  const [activeTab, setActiveTab] = useState('account');

  const handleSignOut = async () => {
    await signOut();
    onClose();
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
                <div className="p-2 bg-indigo-500/20 text-indigo-400 rounded-xl">
                  <User className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-semibold tracking-tight text-aura-text">
                  Profile
                </h2>
              </div>
              <button
                onClick={onClose}
                className="p-2 text-aura-muted hover:text-aura-text bg-black/5 dark:bg-white/5 rounded-full transition-colors"
              >
                <X className="w-5 h-5" />
              </button>
            </div>

            <div className="flex flex-col items-center mb-8">
              <div className="relative group cursor-pointer mb-4">
                <div className="w-24 h-24 rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-1 shadow-lg">
                  <div className="w-full h-full rounded-full bg-black/50 flex items-center justify-center overflow-hidden border-2 border-transparent">
                    {user?.user_metadata?.avatar_url ? (
                      <img src={user.user_metadata.avatar_url} alt="Profile" className="w-full h-full object-cover" />
                    ) : (
                      <User className="w-10 h-10 text-white/80" />
                    )}
                  </div>
                </div>
                <div className="absolute inset-0 bg-black/40 rounded-full opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center">
                  <Camera className="w-6 h-6 text-white" />
                </div>
              </div>
              <h3 className="text-xl font-semibold text-aura-text tracking-tight">{settings.userName || user?.user_metadata?.full_name || 'User'}</h3>
              <p className="text-sm text-aura-muted font-medium">{user?.email || 'user@example.com'}</p>
              <div className="mt-3 px-3 py-1 bg-emerald-500/20 text-emerald-400 text-xs font-semibold rounded-full border border-emerald-500/30">
                Pro Plan
              </div>
            </div>

            <div className="space-y-6 flex-1">
              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-aura-muted uppercase tracking-wider px-2">Account</h4>
                <div className="apple-glass-heavy rounded-2xl overflow-hidden border border-white/10">
                  <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-blue-500/20 text-blue-400 rounded-lg"><User className="w-4 h-4" /></div>
                      <span className="text-sm font-medium text-aura-text">Personal Information</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-aura-muted group-hover:text-aura-text transition-colors" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-purple-500/20 text-purple-400 rounded-lg"><Shield className="w-4 h-4" /></div>
                      <span className="text-sm font-medium text-aura-text">Security & Privacy</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-aura-muted group-hover:text-aura-text transition-colors" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-emerald-500/20 text-emerald-400 rounded-lg"><CreditCard className="w-4 h-4" /></div>
                      <span className="text-sm font-medium text-aura-text">Billing & Subscription</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-aura-muted group-hover:text-aura-text transition-colors" />
                  </button>
                </div>
              </div>

              <div className="space-y-2">
                <h4 className="text-xs font-semibold text-aura-muted uppercase tracking-wider px-2">Preferences</h4>
                <div className="apple-glass-heavy rounded-2xl overflow-hidden border border-white/10">
                  <button onClick={() => { onClose(); onOpenSettings(); }} className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors border-b border-white/5 group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-gray-500/20 text-gray-400 rounded-lg"><Settings className="w-4 h-4" /></div>
                      <span className="text-sm font-medium text-aura-text">App Settings</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-aura-muted group-hover:text-aura-text transition-colors" />
                  </button>
                  <button className="w-full flex items-center justify-between p-4 hover:bg-white/5 transition-colors group">
                    <div className="flex items-center gap-3">
                      <div className="p-2 bg-amber-500/20 text-amber-400 rounded-lg"><Bell className="w-4 h-4" /></div>
                      <span className="text-sm font-medium text-aura-text">Notification Preferences</span>
                    </div>
                    <ChevronRight className="w-4 h-4 text-aura-muted group-hover:text-aura-text transition-colors" />
                  </button>
                </div>
              </div>
            </div>

            <div className="mt-8 pt-6 border-t border-aura-border">
              <button
                onClick={handleSignOut}
                className="w-full flex items-center justify-center gap-2 p-4 rounded-xl border border-red-500/20 bg-red-500/10 text-red-400 hover:bg-red-500/20 transition-colors font-medium"
              >
                <LogOut className="w-5 h-5" />
                Sign Out
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
