import { Sparkles, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

interface AiGeneratedWidgetProps {
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

export default function AiGeneratedWidget({ name, description, category, icon, color }: AiGeneratedWidgetProps) {
  return (
    <div className="apple-glass-heavy rounded-[32px] p-5 h-full flex flex-col relative overflow-hidden group cursor-pointer">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl flex items-center justify-center" style={{ backgroundColor: `${color}33`, color: color }}>
            <span className="text-xl leading-none">{icon}</span>
          </div>
          <h3 className="text-lg font-semibold text-aura-text tracking-tight">{name}</h3>
        </div>
        <ChevronRight className="w-5 h-5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 text-center">
        <p className="text-aura-muted text-sm mb-4 font-medium">{description}</p>
        <div className="w-full h-24 rounded-2xl border border-white/5 bg-black/10 dark:bg-white/5 flex items-center justify-center overflow-hidden relative shadow-inner">
          {/* Simulated AI Data Vis */}
          <motion.div 
            animate={{ backgroundPosition: ['0px 0px', '40px 40px'] }}
            transition={{ repeat: Infinity, duration: 2, ease: "linear" }}
            className="absolute inset-0 opacity-20" 
            style={{ background: `repeating-linear-gradient(45deg, ${color}, ${color} 10px, transparent 10px, transparent 20px)`, backgroundSize: '40px 40px' }} 
          />
          <span className="text-xs font-mono font-semibold z-10 bg-black/50 px-3 py-1.5 rounded-lg text-white/90 shadow-md backdrop-blur-md flex items-center gap-1.5">
            <Sparkles className="w-3.5 h-3.5" />
            AI Generated UI
          </span>
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[60px] rounded-full pointer-events-none opacity-30 mix-blend-screen" style={{ backgroundColor: color }} />
    </div>
  );
}
