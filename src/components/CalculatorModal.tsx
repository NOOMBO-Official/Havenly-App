import { useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { X, Calculator } from 'lucide-react';

interface CalculatorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

export default function CalculatorModal({ isOpen, onClose }: CalculatorModalProps) {
  const [display, setDisplay] = useState('0');
  const [equation, setEquation] = useState('');

  const handleNumber = (num: string) => {
    setDisplay(display === '0' ? num : display + num);
  };

  const handleOperator = (op: string) => {
    setEquation(display + ' ' + op + ' ');
    setDisplay('0');
  };

  const handleEqual = () => {
    try {
      // Safe eval for basic calculator
      const result = new Function('return ' + equation + display)();
      setDisplay(String(result));
      setEquation('');
    } catch (e) {
      setDisplay('Error');
    }
  };

  const handleClear = () => {
    setDisplay('0');
    setEquation('');
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
          <div className="fixed inset-0 z-[110] flex items-center justify-center p-4 md:p-8 pointer-events-none">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              transition={{ type: 'spring', damping: 25, stiffness: 300 }}
              className="w-full max-w-sm h-[80vh] md:h-auto apple-glass-heavy rounded-[32px] shadow-2xl border border-white/20 overflow-hidden pointer-events-auto flex flex-col relative bg-[#1c1c1e]"
            >
              {/* Header */}
              <div className="flex items-center justify-between px-4 py-3 border-b border-white/10">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full bg-orange-500/20 flex items-center justify-center">
                    <Calculator className="w-3 h-3 text-orange-500" />
                  </div>
                  <span className="text-sm font-medium text-white">Calculator</span>
                </div>
                <button onClick={onClose} className="p-1.5 text-white/70 hover:text-white hover:bg-white/10 rounded-full transition-colors">
                  <X className="w-4 h-4" />
                </button>
              </div>

              {/* Display */}
              <div className="p-6 flex flex-col items-end justify-end h-32 md:h-32 bg-black/20">
                <div className="text-white/50 text-sm h-5">{equation}</div>
                <div className="text-5xl font-light text-white tracking-tight truncate w-full text-right">{display}</div>
              </div>

              {/* Keypad */}
              <div className="p-4 grid grid-cols-4 gap-3 bg-[#1c1c1e] flex-1 pb-24 md:pb-4">
                <button onClick={handleClear} className="col-span-2 rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-xl transition-colors">AC</button>
                <button onClick={() => handleOperator('%')} className="rounded-2xl bg-white/10 hover:bg-white/20 text-white font-medium text-xl transition-colors">%</button>
                <button onClick={() => handleOperator('/')} className="rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-medium text-xl transition-colors">÷</button>

                <button onClick={() => handleNumber('7')} className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors">7</button>
                <button onClick={() => handleNumber('8')} className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors">8</button>
                <button onClick={() => handleNumber('9')} className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors">9</button>
                <button onClick={() => handleOperator('*')} className="rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-medium text-xl transition-colors">×</button>

                <button onClick={() => handleNumber('4')} className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors">4</button>
                <button onClick={() => handleNumber('5')} className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors">5</button>
                <button onClick={() => handleNumber('6')} className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors">6</button>
                <button onClick={() => handleOperator('-')} className="rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-medium text-xl transition-colors">−</button>

                <button onClick={() => handleNumber('1')} className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors">1</button>
                <button onClick={() => handleNumber('2')} className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors">2</button>
                <button onClick={() => handleNumber('3')} className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors">3</button>
                <button onClick={() => handleOperator('+')} className="rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-medium text-xl transition-colors">+</button>

                <button onClick={() => handleNumber('0')} className="col-span-2 rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors text-left pl-6">0</button>
                <button onClick={() => handleNumber('.')} className="rounded-2xl bg-white/5 hover:bg-white/10 text-white font-medium text-xl transition-colors">.</button>
                <button onClick={handleEqual} className="rounded-2xl bg-orange-500 hover:bg-orange-400 text-white font-medium text-xl transition-colors">=</button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
}
