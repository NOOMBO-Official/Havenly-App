import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Mic, Volume2, Sparkles, X } from 'lucide-react';
import { useAi } from '../contexts/AiContext';

export default function DynamicIsland() {
  const { status, transcript, startSession, stopSession } = useAi();
  const islandRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!islandRef.current || !contentRef.current || !orbRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.6 } });

    if (status === 'idle') {
      // Small pill state
      tl.to(islandRef.current, {
        width: 120,
        height: 40,
        borderRadius: 20,
        backgroundColor: 'rgba(0,0,0,0.8)',
        boxShadow: '0 4px 12px rgba(0,0,0,0.2)',
        rotationX: 0,
        rotationY: 0,
        z: 0,
        ease: 'elastic.out(1, 0.7)',
      })
      .to(contentRef.current, { opacity: 0, display: 'none' }, '<')
      .to(orbRef.current, { scale: 0.5, opacity: 0.5 }, '<');
    } else if (status === 'connecting') {
      // Expanding state
      tl.to(islandRef.current, {
        width: 200,
        height: 60,
        borderRadius: 30,
        backgroundColor: 'rgba(20,20,20,0.95)',
        boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
        rotationX: 10,
        z: 50,
        ease: 'power3.out',
      })
      .to(contentRef.current, { opacity: 1, display: 'flex' }, '<0.2')
      .to(orbRef.current, { scale: 0.8, opacity: 0.8 }, '<');
    } else if (status === 'listening' || status === 'speaking') {
      // Full expanded state
      tl.to(islandRef.current, {
        width: 350,
        height: 100,
        borderRadius: 32,
        backgroundColor: 'rgba(20,20,20,0.95)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(59, 130, 246, 0.2)',
        rotationX: 0,
        z: 100,
        ease: 'elastic.out(1, 0.8)',
      })
      .to(contentRef.current, { opacity: 1, display: 'flex' }, '<0.1')
      .to(orbRef.current, { scale: 1, opacity: 1 }, '<');
    } else if (status === 'error') {
      tl.to(islandRef.current, {
        width: 250,
        height: 60,
        backgroundColor: 'rgba(150,0,0,0.9)',
        rotationX: -10,
        z: 20,
        ease: 'bounce.out',
      });
    }

  }, [status]);

  // Orb animation loop
  useEffect(() => {
    if (!orbRef.current) return;
    
    if (status === 'listening') {
      gsap.to(orbRef.current, {
        scale: 1.2,
        opacity: 0.8,
        duration: 0.8,
        yoyo: true,
        repeat: -1,
        ease: 'sine.inOut'
      });
    } else if (status === 'speaking') {
      gsap.to(orbRef.current, {
        scale: 1.4,
        opacity: 1,
        duration: 0.3,
        yoyo: true,
        repeat: -1,
        ease: 'rough({ template: sine.out, strength: 1, points: 20, taper: none, randomize: true, clamp: false })'
      });
    } else {
      gsap.killTweensOf(orbRef.current);
      gsap.to(orbRef.current, { scale: 0.5, opacity: 0.5, duration: 0.5 });
    }
  }, [status]);

  return (
    <div className="fixed top-6 left-1/2 -translate-x-1/2 z-50 flex justify-center perspective-1000">
      <div 
        ref={islandRef}
        onClick={() => {
          if (status === 'idle') startSession();
        }}
        className={`bg-black/80 backdrop-blur-2xl border border-white/10 overflow-hidden flex items-center justify-between px-4 relative transform-style-3d shadow-2xl ${status === 'idle' ? 'cursor-pointer hover:bg-black/90' : ''}`}
        style={{ width: 120, height: 40, borderRadius: 20 }}
      >
        {/* Orb */}
        <div className="absolute left-4 top-1/2 -translate-y-1/2 flex items-center justify-center">
          <div 
            ref={orbRef}
            className="w-6 h-6 rounded-full bg-gradient-to-tr from-blue-500 to-purple-500 blur-sm"
          />
          <div className="absolute inset-0 flex items-center justify-center">
             {status === 'idle' ? <Sparkles className="w-3 h-3 text-white" /> : 
              status === 'speaking' ? <Volume2 className="w-3 h-3 text-white" /> : 
              <Mic className="w-3 h-3 text-white" />}
          </div>
        </div>

        {/* Content */}
        <div 
          ref={contentRef}
          className="ml-12 flex-1 flex items-center justify-between opacity-0 hidden"
        >
          <div className="flex flex-col justify-center overflow-hidden">
            <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
              {status === 'listening' ? 'Listening...' : status === 'speaking' ? 'AVA is speaking' : status}
            </span>
            <span className="text-sm text-white truncate max-w-[200px]">
              {transcript || 'Say "AVA" to wake'}
            </span>
          </div>
          
          {status !== 'idle' && (
            <button 
              onClick={stopSession}
              className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors"
            >
              <X className="w-4 h-4" />
            </button>
          )}
        </div>
      </div>
    </div>
  );
}
