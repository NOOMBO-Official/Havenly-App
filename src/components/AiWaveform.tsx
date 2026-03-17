import { useEffect, useRef } from 'react';
import { useAi } from '../contexts/AiContext';
import gsap from 'gsap';
import { motion, AnimatePresence } from 'motion/react';

export default function AiWaveform() {
  const { status } = useAi();
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    if (!containerRef.current) return;
    
    if (status === 'listening' || status === 'speaking' || status === 'connecting') {
      gsap.to(containerRef.current, {
        y: 0,
        opacity: 1,
        duration: 0.8,
        ease: 'power3.out'
      });
    } else {
      gsap.to(containerRef.current, {
        y: 150,
        opacity: 0,
        duration: 0.6,
        ease: 'power3.in'
      });
    }
  }, [status]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    let animationFrameId: number;
    let time = 0;

    const render = () => {
      const width = canvas.width;
      const height = canvas.height;
      ctx.clearRect(0, 0, width, height);

      if (status === 'idle') {
        animationFrameId = requestAnimationFrame(render);
        return;
      }

      time += status === 'speaking' ? 0.1 : status === 'listening' ? 0.03 : 0.01;

      const amplitude = status === 'speaking' ? 50 : status === 'listening' ? 20 : 5;
      const frequency = 0.015;

      // Draw multiple waves
      const colors = [
        'rgba(59, 130, 246, 0.8)', // Blue
        'rgba(168, 85, 247, 0.8)', // Purple
        'rgba(236, 72, 153, 0.8)', // Pink
        'rgba(14, 165, 233, 0.8)'  // Sky
      ];

      ctx.globalCompositeOperation = 'screen';

      colors.forEach((color, i) => {
        ctx.beginPath();
        ctx.moveTo(0, height / 2);
        
        const offset = i * Math.PI * 2 / colors.length;
        const speedMultiplier = 1 + i * 0.2;
        
        for (let x = 0; x < width; x++) {
          // Envelope to make edges taper off (bell curve)
          const normalizedX = x / width;
          const envelope = Math.sin(normalizedX * Math.PI);
          const centerFocus = Math.pow(envelope, 2); // Sharper focus in center
          
          const y = height / 2 + 
            Math.sin(x * frequency + time * speedMultiplier + offset) * 
            amplitude * 
            centerFocus * 
            (1 + Math.sin(time * 0.5 + i) * 0.3); // Add some breathing
            
          ctx.lineTo(x, y);
        }
        
        ctx.strokeStyle = color;
        ctx.lineWidth = 4;
        ctx.stroke();
      });

      // Add a glow effect
      ctx.shadowBlur = 20;
      ctx.shadowColor = 'rgba(168, 85, 247, 0.5)';

      animationFrameId = requestAnimationFrame(render);
    };

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = 150;
    };
    window.addEventListener('resize', resize);
    resize();
    render();

    return () => {
      window.removeEventListener('resize', resize);
      cancelAnimationFrame(animationFrameId);
    };
  }, [status]);

  const isAiActive = status === 'listening' || status === 'speaking' || status === 'connecting';

  return (
    <>
      {/* Apple Intelligence Screen Edge Glow */}
      <AnimatePresence>
        {isAiActive && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 1, ease: "easeInOut" }}
            className="fixed inset-0 pointer-events-none z-[140] overflow-hidden"
          >
            <div className="absolute inset-0 border-[8px] border-transparent rounded-[48px]" style={{
              boxShadow: 'inset 0 0 100px rgba(168, 85, 247, 0.3), inset 0 0 40px rgba(59, 130, 246, 0.4)',
              animation: 'pulseGlow 4s infinite alternate ease-in-out'
            }} />
            <style>{`
              @keyframes pulseGlow {
                0% { box-shadow: inset 0 0 80px rgba(168, 85, 247, 0.2), inset 0 0 30px rgba(59, 130, 246, 0.3); }
                50% { box-shadow: inset 0 0 120px rgba(236, 72, 153, 0.4), inset 0 0 60px rgba(168, 85, 247, 0.5); }
                100% { box-shadow: inset 0 0 100px rgba(59, 130, 246, 0.3), inset 0 0 40px rgba(14, 165, 233, 0.4); }
              }
            `}</style>
          </motion.div>
        )}
      </AnimatePresence>

      <div 
        ref={containerRef}
        className="fixed bottom-0 left-0 w-full h-[150px] pointer-events-none z-[150] translate-y-full opacity-0"
      >
        <div className="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-transparent" />
        <canvas 
          ref={canvasRef}
          className="absolute inset-0 w-full h-full"
        />
      </div>
    </>
  );
}
