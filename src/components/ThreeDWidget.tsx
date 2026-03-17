import { useState, useEffect } from 'react';
import { motion } from 'motion/react';
import { Box, Sparkles } from 'lucide-react';

export default function ThreeDWidget() {
  const [rotation, setRotation] = useState({ x: 0, y: 0 });

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent) => {
      const x = (e.clientX / window.innerWidth - 0.5) * 40;
      const y = (e.clientY / window.innerHeight - 0.5) * 40;
      setRotation({ x: y, y: -x });
    };

    window.addEventListener('mousemove', handleMouseMove);
    return () => window.removeEventListener('mousemove', handleMouseMove);
  }, []);

  return (
    <div className="apple-glass-heavy rounded-[32px] p-6 h-full flex flex-col relative overflow-hidden group perspective-1000">
      <div className="flex items-center justify-between mb-4 relative z-10">
        <div className="flex items-center space-x-3">
          <div className="p-2 bg-purple-500/20 text-purple-400 rounded-xl">
            <Box className="w-5 h-5" />
          </div>
          <h3 className="text-lg font-semibold tracking-tight text-aura-text">3D Space</h3>
        </div>
        <Sparkles className="w-5 h-5 text-aura-muted" />
      </div>

      <div className="flex-1 flex items-center justify-center relative z-10 min-h-[200px] transform-style-3d">
        <motion.div
          animate={{ rotateX: rotation.x, rotateY: rotation.y }}
          transition={{ type: 'spring', stiffness: 100, damping: 30 }}
          className="w-32 h-32 relative transform-style-3d"
        >
          {/* 3D Cube Faces */}
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white font-semibold rounded-2xl shadow-lg" style={{ transform: 'translateZ(64px)' }}>Front</div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white font-semibold rounded-2xl shadow-lg" style={{ transform: 'rotateY(180deg) translateZ(64px)' }}>Back</div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white font-semibold rounded-2xl shadow-lg" style={{ transform: 'rotateY(90deg) translateZ(64px)' }}>Right</div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white font-semibold rounded-2xl shadow-lg" style={{ transform: 'rotateY(-90deg) translateZ(64px)' }}>Left</div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white font-semibold rounded-2xl shadow-lg" style={{ transform: 'rotateX(90deg) translateZ(64px)' }}>Top</div>
          <div className="absolute inset-0 bg-gradient-to-br from-purple-500/40 to-blue-500/40 border border-white/20 backdrop-blur-md flex items-center justify-center text-white font-semibold rounded-2xl shadow-lg" style={{ transform: 'rotateX(-90deg) translateZ(64px)' }}>Bottom</div>
        </motion.div>
      </div>

      {/* Background glow */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-48 h-48 bg-purple-500/20 blur-[60px] rounded-full pointer-events-none mix-blend-screen" />
    </div>
  );
}
