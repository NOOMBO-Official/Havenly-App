import { useCallback, useRef, useState } from 'react';
import { triggerHaptic } from '../utils/haptics';

export const useLongPress = (onLongPress: () => void, ms: number = 5000) => {
  const [isPressed, setIsPressed] = useState(false);
  const timerRef = useRef<NodeJS.Timeout | null>(null);

  const start = useCallback(() => {
    setIsPressed(true);
    timerRef.current = setTimeout(() => {
      triggerHaptic('heavy');
      onLongPress();
      setIsPressed(false);
    }, ms);
  }, [onLongPress, ms]);

  const stop = useCallback(() => {
    setIsPressed(false);
    if (timerRef.current) {
      clearTimeout(timerRef.current);
    }
  }, []);

  return {
    onMouseDown: start,
    onMouseUp: stop,
    onMouseLeave: stop,
    onTouchStart: start,
    onTouchEnd: stop,
  };
};
