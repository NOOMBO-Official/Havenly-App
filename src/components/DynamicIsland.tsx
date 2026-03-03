import { useEffect, useRef, useState } from 'react';
import gsap from 'gsap';
import { Mic, Volume2, Sparkles, X, Video, Camera } from 'lucide-react';
import { useAi } from '../contexts/AiContext';

export default function DynamicIsland() {
  const { status, transcript, isVideoCall, videoStream, startSession, stopSession } = useAi();
  const islandRef = useRef<HTMLDivElement>(null);
  const contentRef = useRef<HTMLDivElement>(null);
  const orbRef = useRef<HTMLDivElement>(null);
  const videoContainerRef = useRef<HTMLDivElement>(null);
  const [isHovered, setIsHovered] = useState(false);

  useEffect(() => {
    if (!islandRef.current || !contentRef.current || !orbRef.current) return;

    const tl = gsap.timeline({ defaults: { ease: 'power4.out', duration: 0.6 } });

    if (status === 'idle') {
      if (isHovered) {
        // Expanded idle state
        tl.to(islandRef.current, {
          width: 280,
          height: 60,
          borderRadius: 30,
          backgroundColor: 'rgba(20,20,20,0.95)',
          boxShadow: '0 10px 30px rgba(0,0,0,0.5)',
          ease: 'power3.out',
        })
        .to(contentRef.current, { opacity: 1, display: 'flex' }, '<0.1')
        .to(orbRef.current, { scale: 0.8, opacity: 0.8 }, '<');
      } else {
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
      }
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
        width: isVideoCall ? 400 : 350,
        height: isVideoCall ? 300 : 100,
        borderRadius: 32,
        backgroundColor: 'rgba(20,20,20,0.95)',
        boxShadow: '0 30px 60px rgba(0,0,0,0.8), 0 0 40px rgba(59, 130, 246, 0.2)',
        rotationX: 0,
        z: 100,
        ease: 'elastic.out(1, 0.8)',
      })
      .to(contentRef.current, { opacity: 1, display: 'flex' }, '<0.1')
      .to(orbRef.current, { scale: 1, opacity: 1 }, '<');
      
      if (isVideoCall && videoContainerRef.current) {
        gsap.to(videoContainerRef.current, { opacity: 1, display: 'block', duration: 0.4, delay: 0.2 });
      }
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

  }, [status, isHovered, isVideoCall]);

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
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
        onClick={() => {
          if (status === 'idle') {
            setIsHovered(!isHovered);
          }
        }}
        className={`bg-black/80 backdrop-blur-2xl border border-white/10 overflow-hidden flex flex-col relative transform-style-3d shadow-2xl transition-colors ${status === 'idle' ? 'cursor-pointer hover:bg-black/90' : ''}`}
        style={{ width: 120, height: 40, borderRadius: 20, touchAction: 'manipulation' }}
      >
        <div className="flex items-center justify-between px-4 h-full min-h-[40px] w-full">
          {/* Orb */}
          <div className="absolute left-4 top-5 -translate-y-1/2 flex items-center justify-center z-10">
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
            className="ml-12 flex-1 flex items-center justify-between opacity-0 hidden z-10"
          >
            {status === 'idle' ? (
              <div className="flex items-center justify-between w-full pr-2">
                <span className="text-sm font-medium text-white/80">Start Session</span>
                <div className="flex items-center gap-2">
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); startSession(false); }}
                    className="p-2 bg-white/10 hover:bg-white/20 rounded-full text-white transition-colors"
                  >
                    <Mic className="w-4 h-4" />
                  </button>
                  <button 
                    onClick={(e) => { e.preventDefault(); e.stopPropagation(); startSession(true); }}
                    className="p-2 bg-blue-500/20 hover:bg-blue-500/40 rounded-full text-blue-400 transition-colors"
                  >
                    <Video className="w-4 h-4" />
                  </button>
                </div>
              </div>
            ) : (
              <>
                <div className="flex flex-col justify-center overflow-hidden">
                  <span className="text-xs font-medium text-white/50 uppercase tracking-wider">
                    {status === 'listening' ? 'Listening...' : status === 'speaking' ? 'AVA is speaking' : status}
                  </span>
                  <span className="text-sm text-white truncate max-w-[200px]">
                    {transcript || 'Say "AVA" to wake'}
                  </span>
                </div>
                
                <button 
                  onClick={(e) => { e.preventDefault(); e.stopPropagation(); stopSession(); }}
                  className="p-2 rounded-full hover:bg-white/10 text-white/50 hover:text-white transition-colors ml-2"
                >
                  <X className="w-4 h-4" />
                </button>
              </>
            )}
          </div>
        </div>

        {/* Video Container */}
        <div 
          ref={videoContainerRef}
          className="absolute bottom-4 left-4 right-4 top-20 bg-black/50 rounded-2xl overflow-hidden hidden opacity-0 border border-white/10"
        >
          {isVideoCall && (
            <div className="w-full h-full flex items-center justify-center bg-black/80 relative">
              <Camera className="w-8 h-8 text-white/20 absolute z-0" />
              <video 
                autoPlay 
                playsInline 
                muted 
                className="w-full h-full object-cover relative z-10"
                ref={(el) => {
                  if (el && videoStream && el.srcObject !== videoStream) {
                    el.srcObject = videoStream;
                  }
                }}
              />
              <div className="absolute top-3 right-3 z-20 flex gap-2">
                <div className="px-2 py-1 rounded-md bg-black/50 backdrop-blur-md text-[10px] text-white font-mono border border-white/10 flex items-center gap-1">
                  <div className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
                  LIVE
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
