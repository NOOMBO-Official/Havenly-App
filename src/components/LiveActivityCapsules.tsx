import { motion, AnimatePresence } from 'motion/react';
import { Pizza, Dumbbell, UploadCloud, Car, Music } from 'lucide-react';
import { useState, useEffect } from 'react';
import { useSpotify } from '../contexts/SpotifyContext';

export default function LiveActivityCapsules() {
  const { currentTrack, isPaused, isActive } = useSpotify();

  return (
    <div className="fixed top-24 left-1/2 -translate-x-1/2 z-40 flex flex-col gap-2 items-center pointer-events-none">
      <AnimatePresence>
        {isActive && currentTrack && !isPaused && (
          <motion.div
            initial={{ opacity: 0, y: -20, scale: 0.9 }}
            animate={{ opacity: 1, y: 0, scale: 1 }}
            exit={{ opacity: 0, y: -20, scale: 0.9, filter: 'blur(10px)' }}
            className="pointer-events-auto apple-glass-heavy rounded-full pl-2 pr-4 py-2 flex items-center gap-3 shadow-2xl border border-white/10"
          >
            <div className="w-8 h-8 rounded-full bg-white/10 flex items-center justify-center relative overflow-hidden">
              <div className="relative z-10">
                <Music className="w-4 h-4 text-green-400" />
              </div>
            </div>
            <div className="flex flex-col">
              <span className="text-xs font-medium text-white tracking-tight max-w-[120px] truncate">{currentTrack.name}</span>
              <span className="text-[10px] font-medium text-white/50 max-w-[120px] truncate">{currentTrack.artists?.[0]?.name}</span>
            </div>
            <div className="flex gap-0.5 items-center h-4 ml-2">
              <motion.div animate={{ height: [8, 16, 8] }} transition={{ repeat: Infinity, duration: 1 }} className="w-1 bg-green-500 rounded-full" />
              <motion.div animate={{ height: [12, 8, 12] }} transition={{ repeat: Infinity, duration: 0.8 }} className="w-1 bg-green-500 rounded-full" />
              <motion.div animate={{ height: [16, 12, 16] }} transition={{ repeat: Infinity, duration: 1.2 }} className="w-1 bg-green-500 rounded-full" />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
