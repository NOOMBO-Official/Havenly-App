import { motion } from 'framer-motion';
import { Activity, ChevronRight, Plus } from 'lucide-react';
import { useState, useEffect } from 'react';

const Ring = ({ radius, stroke, progress, color, delay }: { radius: number, stroke: number, progress: number, color: string, delay: number }) => {
  const circumference = radius * 2 * Math.PI;
  const offset = circumference - (progress / 100) * circumference;
  
  return (
    <g transform="rotate(-90 50 50)">
      <circle
        cx="50" cy="50" r={radius}
        fill="none" stroke={`${color}33`} strokeWidth={stroke}
      />
      <motion.circle
        cx="50" cy="50" r={radius}
        fill="none" stroke={color} strokeWidth={stroke}
        strokeDasharray={circumference}
        strokeLinecap="round"
        initial={{ strokeDashoffset: circumference }}
        animate={{ strokeDashoffset: offset }}
        transition={{ duration: 1.5, delay, ease: "easeOut" }}
      />
    </g>
  );
};

export default function FitnessWidget() {
  const [move, setMove] = useState(0);
  const [exercise, setExercise] = useState(0);
  const [stand, setStand] = useState(0);

  const moveGoal = 500;
  const exerciseGoal = 30;
  const standGoal = 12;

  useEffect(() => {
    const storedMove = localStorage.getItem('fitness-move');
    const storedExercise = localStorage.getItem('fitness-exercise');
    const storedStand = localStorage.getItem('fitness-stand');
    const lastUpdate = localStorage.getItem('fitness-last-update');

    if (lastUpdate) {
      const lastDate = new Date(lastUpdate).toDateString();
      const today = new Date().toDateString();
      if (lastDate !== today) {
        // Reset for new day
        localStorage.setItem('fitness-move', '0');
        localStorage.setItem('fitness-exercise', '0');
        localStorage.setItem('fitness-stand', '0');
        localStorage.setItem('fitness-last-update', new Date().toISOString());
        return;
      }
    }

    if (storedMove) setMove(parseInt(storedMove));
    if (storedExercise) setExercise(parseInt(storedExercise));
    if (storedStand) setStand(parseInt(storedStand));
  }, []);

  const updateStat = (type: 'move' | 'exercise' | 'stand', increment: number) => {
    let newValue = 0;
    if (type === 'move') {
      newValue = move + increment;
      setMove(newValue);
      localStorage.setItem('fitness-move', newValue.toString());
    } else if (type === 'exercise') {
      newValue = exercise + increment;
      setExercise(newValue);
      localStorage.setItem('fitness-exercise', newValue.toString());
    } else if (type === 'stand') {
      newValue = stand + increment;
      setStand(newValue);
      localStorage.setItem('fitness-stand', newValue.toString());
    }
    localStorage.setItem('fitness-last-update', new Date().toISOString());
  };

  const moveProgress = Math.min((move / moveGoal) * 100, 100);
  const exerciseProgress = Math.min((exercise / exerciseGoal) * 100, 100);
  const standProgress = Math.min((stand / standGoal) * 100, 100);

  return (
    <div className="apple-glass-heavy rounded-[32px] p-5 flex flex-col h-full relative overflow-hidden group">
      <div className="flex items-center justify-between mb-2">
        <div className="flex items-center gap-2 text-rose-500">
          <Activity className="w-5 h-5" />
          <h2 className="text-lg font-semibold text-aura-text tracking-tight">Activity</h2>
        </div>
        <ChevronRight className="w-5 h-5 text-aura-muted opacity-0 group-hover:opacity-100 transition-opacity cursor-pointer" />
      </div>

      <div className="flex-1 flex items-center justify-center relative my-2">
        <svg viewBox="0 0 100 100" className="w-full h-full max-w-[140px] drop-shadow-lg">
          <Ring radius={40} stroke={9} progress={moveProgress} color="#ff0055" delay={0.2} />
          <Ring radius={29} stroke={9} progress={exerciseProgress} color="#a4ff00" delay={0.4} />
          <Ring radius={18} stroke={9} progress={standProgress} color="#00f5ff" delay={0.6} />
        </svg>
      </div>

      <div className="mt-2 grid grid-cols-3 gap-2 text-center">
        <button 
          onClick={() => updateStat('move', 50)}
          className="flex flex-col items-center p-1 rounded-xl hover:bg-white/5 transition-colors group/btn"
        >
          <div className="text-rose-500 font-semibold text-xl tracking-tight flex items-center gap-1">
            {move} <Plus className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </div>
          <div className="text-[10px] text-aura-muted font-semibold uppercase tracking-wider">Move</div>
        </button>
        <button 
          onClick={() => updateStat('exercise', 5)}
          className="flex flex-col items-center p-1 rounded-xl hover:bg-white/5 transition-colors group/btn"
        >
          <div className="text-[#a4ff00] font-semibold text-xl tracking-tight flex items-center gap-1">
            {exercise} <Plus className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </div>
          <div className="text-[10px] text-aura-muted font-semibold uppercase tracking-wider">Exercise</div>
        </button>
        <button 
          onClick={() => updateStat('stand', 1)}
          className="flex flex-col items-center p-1 rounded-xl hover:bg-white/5 transition-colors group/btn"
        >
          <div className="text-[#00f5ff] font-semibold text-xl tracking-tight flex items-center gap-1">
            {stand} <Plus className="w-3 h-3 opacity-0 group-hover/btn:opacity-100 transition-opacity" />
          </div>
          <div className="text-[10px] text-aura-muted font-semibold uppercase tracking-wider">Stand</div>
        </button>
      </div>
    </div>
  );
}
