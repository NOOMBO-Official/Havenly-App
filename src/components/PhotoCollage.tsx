import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useSettings } from '../contexts/SettingsContext';
import Clock from './Clock';

export default function PhotoCollage() {
  const { settings } = useSettings();
  const [isActive, setIsActive] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [currentImageIndex, setCurrentImageIndex] = useState(0);

  useEffect(() => {
    // Generate some random aesthetic images from unsplash or pollinations
    const newImages = Array.from({ length: 10 }).map((_, i) => 
      `https://picsum.photos/seed/${Math.random()}/1920/1080?blur=2`
    );
    setImages(newImages);
  }, []);

  useEffect(() => {
    if (settings.screenTimeout === 0) {
      setIsActive(false);
      return;
    }

    let timeoutId: NodeJS.Timeout;
    let intervalId: NodeJS.Timeout;

    const resetTimer = () => {
      setIsActive(false);
      clearTimeout(timeoutId);
      timeoutId = setTimeout(() => {
        setIsActive(true);
      }, settings.screenTimeout);
    };

    // Initial setup
    resetTimer();

    // Event listeners for user activity
    const events = ['mousedown', 'mousemove', 'keypress', 'scroll', 'touchstart'];
    events.forEach(event => {
      document.addEventListener(event, resetTimer);
    });

    // Slideshow interval
    if (isActive) {
      intervalId = setInterval(() => {
        setCurrentImageIndex(prev => (prev + 1) % images.length);
      }, 10000); // Change image every 10 seconds
    }

    return () => {
      clearTimeout(timeoutId);
      clearInterval(intervalId);
      events.forEach(event => {
        document.removeEventListener(event, resetTimer);
      });
    };
  }, [settings.screenTimeout, isActive, images.length]);

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 1 }}
          className="fixed inset-0 z-[100] bg-black flex flex-col items-center justify-center cursor-none"
          onClick={() => setIsActive(false)}
        >
          {images.map((img, index) => (
            <motion.img
              key={img}
              src={img}
              alt="Collage"
              className="absolute inset-0 w-full h-full object-cover"
              initial={{ opacity: 0, scale: 1.05 }}
              animate={{ 
                opacity: index === currentImageIndex ? 1 : 0,
                scale: index === currentImageIndex ? 1 : 1.05
              }}
              transition={{ duration: 2 }}
              referrerPolicy="no-referrer"
            />
          ))}
          <div className="absolute inset-0 bg-black/30" />
          <div className="relative z-10 scale-150 pointer-events-none">
            <Clock />
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
