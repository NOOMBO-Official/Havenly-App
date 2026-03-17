import { Smartphone, Watch, Headphones, Battery, BatteryMedium, BatteryFull, ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

export default function DevicesWidget() {
  const devices = [
    { name: 'iPhone 15 Pro', battery: 85, icon: Smartphone, color: 'bg-emerald-500' },
    { name: 'Apple Watch Ultra', battery: 62, icon: Watch, color: 'bg-emerald-500' },
    { name: 'AirPods Pro', battery: 100, icon: Headphones, color: 'bg-emerald-500' },
    { name: 'MacBook Pro', battery: 15, icon: Battery, color: 'bg-red-500' },
  ];

  return (
    <div className="apple-glass-heavy rounded-[32px] p-5 flex flex-col h-full relative overflow-hidden group cursor-pointer">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-2 text-emerald-500">
          <BatteryFull className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-aura-text tracking-tight">Batteries</h2>
        </div>
        <ChevronRight className="w-5 h-5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity" />
      </div>

      <div className="flex-1 flex flex-col justify-between gap-3">
        {devices.map((device, i) => (
          <motion.div 
            key={device.name}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.1, duration: 0.5 }}
            className="flex items-center gap-3"
          >
            <div className="w-10 h-10 rounded-full bg-black/5 dark:bg-white/5 flex items-center justify-center shrink-0 border border-white/5">
              <device.icon className="w-5 h-5 text-aura-text" />
            </div>
            
            <div className="flex-1 min-w-0">
              <div className="flex justify-between items-center mb-1.5">
                <span className="text-sm font-semibold text-aura-text truncate">{device.name}</span>
                <span className="text-xs font-semibold text-aura-muted">{device.battery}%</span>
              </div>
              <div className="h-1.5 w-full bg-black/5 dark:bg-white/5 rounded-full overflow-hidden">
                <motion.div 
                  initial={{ width: 0 }}
                  animate={{ width: `${device.battery}%` }}
                  transition={{ duration: 1, delay: 0.5 + i * 0.1, ease: "easeOut" }}
                  className={`h-full rounded-full ${device.color}`}
                />
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}
