import { motion } from 'motion/react';
import { CreditCard, ChevronRight } from 'lucide-react';

export default function WalletWidget() {
  return (
    <div className="apple-glass-heavy rounded-[32px] p-5 flex flex-col h-full relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-blue-500">
          <CreditCard className="w-5 h-5" />
          <h3 className="text-aura-text font-semibold text-lg tracking-tight">Wallet</h3>
        </div>
      </div>

      <div className="flex-1 flex flex-col justify-center relative z-10">
        {/* Apple Card Mockup */}
        <motion.div 
          className="w-full h-32 rounded-xl bg-gradient-to-br from-white via-gray-200 to-gray-300 shadow-xl relative overflow-hidden border border-white/50"
          whileHover={{ scale: 1.02, rotateX: 5, rotateY: -5 }}
          transition={{ type: "spring", stiffness: 400, damping: 30 }}
          style={{ transformPerspective: 1000 }}
        >
          {/* Titanium texture overlay */}
          <div className="absolute inset-0 opacity-20 mix-blend-overlay" style={{ backgroundImage: 'url("data:image/svg+xml,%3Csvg viewBox=%220 0 200 200%22 xmlns=%22http://www.w3.org/2000/svg%22%3E%3Cfilter id=%22noiseFilter%22%3E%3CfeTurbulence type=%22fractalNoise%22 baseFrequency=%220.65%22 numOctaves=%223%22 stitchTiles=%22stitch%22/%3E%3C/filter%3E%3Crect width=%22100%25%22 height=%22100%25%22 filter=%22url(%23noiseFilter)%22/%3E%3C/svg%3E")' }}></div>
          
          <div className="absolute top-3 left-4">
            <svg viewBox="0 0 384 512" className="w-4 h-4 text-gray-800 fill-current">
              <path d="M318.7 268.7c-.2-36.7 16.4-64.4 50-84.8-18.8-26.9-47.2-41.7-84.7-44.6-35.5-2.8-74.3 20.7-88.5 20.7-15 0-49.4-19.7-76.4-19.7C63.3 141.2 4 184.8 4 273.5q0 39.3 14.4 81.2c12.8 36.7 59 126.7 107.2 125.2 25.2-.6 43-17.9 75.8-17.9 31.8 0 48.3 17.9 76.4 17.9 48.6-.7 90.4-82.5 102.6-119.3-65.2-30.7-61.7-90-61.7-91.9zm-56.6-164.2c27.3-32.4 24.8-61.9 24-72.5-24.1 1.4-52 16.4-67.9 34.9-17.5 19.8-27.8 44.3-25.6 71.9 26.1 2 49.9-11.4 69.5-34.3z"/>
            </svg>
          </div>
          <div className="absolute bottom-3 left-4">
            <p className="text-gray-800 font-medium text-sm">Josh Hawkes</p>
          </div>
          <div className="absolute bottom-3 right-4">
            <p className="text-gray-800 font-medium text-sm tracking-widest">•••• 1304</p>
          </div>
        </motion.div>
      </div>

      <div className="mt-4 pt-4 border-t border-white/10 dark:border-white/5 flex items-center justify-between">
        <div>
          <p className="text-xs font-medium text-aura-muted">Latest Transaction</p>
          <p className="text-sm text-aura-text font-medium">Apple Store</p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm font-semibold text-aura-text">-$1,299.00</span>
          <ChevronRight className="w-4 h-4 text-aura-muted" />
        </div>
      </div>
    </div>
  );
}
