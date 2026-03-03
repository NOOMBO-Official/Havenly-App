import { Sparkles } from 'lucide-react';

interface AiGeneratedWidgetProps {
  name: string;
  description: string;
  category: string;
  icon: string;
  color: string;
}

export default function AiGeneratedWidget({ name, description, category, icon, color }: AiGeneratedWidgetProps) {
  return (
    <div className="bg-aura-card border border-aura-border rounded-[2.5rem] p-6 h-full flex flex-col relative overflow-hidden group">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 rounded-xl" style={{ backgroundColor: `${color}33`, color: color }}>
            <span className="text-xl">{icon}</span>
          </div>
          <h3 className="text-lg font-medium text-aura-text">{name}</h3>
        </div>
        <Sparkles className="w-5 h-5 text-aura-muted" />
      </div>

      <div className="flex-1 flex flex-col items-center justify-center relative z-10 min-h-[150px] text-center">
        <p className="text-aura-muted text-sm mb-4">{description}</p>
        <div className="w-full h-24 rounded-2xl border border-white/10 bg-black/20 flex items-center justify-center overflow-hidden relative">
          {/* Simulated AI Data Vis */}
          <div className="absolute inset-0 opacity-20" style={{ background: `repeating-linear-gradient(45deg, ${color}, ${color} 10px, transparent 10px, transparent 20px)` }} />
          <span className="text-xs font-mono font-medium z-10 bg-black/50 px-2 py-1 rounded-md text-white/80">AI Generated UI</span>
        </div>
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 blur-[50px] rounded-full pointer-events-none opacity-20" style={{ backgroundColor: color }} />
    </div>
  );
}
